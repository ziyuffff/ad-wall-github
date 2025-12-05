import React, { useState, useEffect, useRef } from 'react';
import styles from './AdForm.module.css';
import api from '../../api';

const AdForm = ({ visible, modalType, initialData, formConfig, onClose, onSubmitSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    author: '',
    content: '',
    url: '',
    pricing: 0,
    videos: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      if (modalType === 'edit' && initialData) {
        setForm({ ...initialData });
        setSelectedVideos(
          (initialData.videos || []).map(url => ({ name: url.split('/').pop() }))
        );
      } else if (modalType === 'copy' && initialData) {
        const copied = { ...initialData };
        delete copied.id;
        copied.title = `副本-${copied.title || ''}`;
        setForm(copied);
        setSelectedVideos(
          (initialData.videos || []).map(url => ({ name: url.split('/').pop() }))
        );
      } else {
        setForm({
          title: '',
          author: '',
          content: '',
          url: '',
          pricing: 0,
          videos: []
        });
        setSelectedVideos([]);
      }
      setFormErrors({});
    }
  }, [visible, modalType, initialData]);

  const validateForm = () => {
    const errors = {};
    
    if (formConfig && formConfig.length) {
      formConfig.forEach(item => {
        const value = form[item.field];
        const validator = item.validator;

        if (validator?.required && (!value || (Array.isArray(value) && value.length === 0))) {
          errors[item.field] = `${item.name}不能为空`;
          return;
        }

        if (validator?.maxLength && value?.length > validator.maxLength) {
          errors[item.field] = `${item.name}最多${validator.maxLength}个字符`;
          return;
        }

        if (validator?.min !== undefined && value < validator.min) {
          errors[item.field] = `${item.name}不能小于${validator.min}`;
          return;
        }

        if (validator?.isUrl && value && !/^https:\/\//.test(value)) {
          errors[item.field] = `${item.name}必须是https开头`;
          return;
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'pricing' ? parseFloat(value) : value }));
    
    // 清除对应字段的错误
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingCount = 3 - selectedVideos.length;
    if (files.length > remainingCount) {
      alert(`最多只能上传3个视频，当前还能上传${remainingCount}个！`);
      return;
    }

    // 显示选中的文件名
    const newFiles = Array.from(files).map(file => ({ name: file.name }));
    setSelectedVideos(prev => [...prev, ...newFiles]);

    // 上传文件
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('videos', files[i]);
    }

    try {
      const response = await api.uploadApi.uploadVideos(formData);
      setForm(prev => ({
        ...prev,
        videos: [...prev.videos, ...response.data.data]
      }));
      alert(`成功上传${files.length}个视频！`);
    } catch (error) {
      // 上传失败，移除已添加的文件显示
      setSelectedVideos(prev => prev.slice(0, prev.length - files.length));
      alert('视频上传失败：' + (error.response?.data?.message || '文件格式错误'));
    }

    // 重置input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = (index) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
    setForm(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
    alert('已删除该视频！');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      let response;

      if (modalType === 'create' || modalType === 'copy') {
        const formData = { ...form };
        if (modalType === 'copy') {
          delete formData.id;
        }
        response = await api.adApi.createAd(formData);
        alert(modalType === 'create' ? '广告创建成功！' : '广告复制成功！');
      } else if (modalType === 'edit') {
        response = await api.adApi.updateAd(initialData.id, form);
        alert('广告编辑成功！');
      }

      onSubmitSuccess();
      onClose();
    } catch (error) {
      alert('操作失败：' + (error.response?.data?.message || '网络错误'));
    } finally {
      setFormLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.modalBg}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>
          {modalType === 'create' ? '新增广告' : modalType === 'edit' ? '编辑广告' : '复制广告'}
        </h2>

        {formLoading ? (
          <div className={styles.loading}>表单加载中...</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {formConfig && formConfig.map((item, index) => (
              <div key={index} className={styles.formItem}>
                <label className={styles.label}>
                  {item.name}
                  {item.validator?.required && <span className={styles.required}>*</span>}
                </label>

                {item.field === 'title' && (
                  <input
                    type="text"
                    name={item.field}
                    value={form[item.field] || ''}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder={`请输入广告标题（最长${item.validator?.maxLength}字符）`}
                    maxLength={item.validator?.maxLength}
                  />
                )}

                {item.field === 'author' && (
                  <input
                    type="text"
                    name={item.field}
                    value={form[item.field] || ''}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder={`请输入发布者信息（最长${item.validator?.maxLength}字符）`}
                    maxLength={item.validator?.maxLength}
                  />
                )}

                {item.field === 'content' && (
                  <textarea
                    name={item.field}
                    value={form[item.field] || ''}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder={`请输入广告内容文案（最长${item.validator?.maxLength}字符）`}
                    maxLength={item.validator?.maxLength}
                    rows="3"
                  />
                )}

                {item.field === 'url' && (
                  <input
                    type="text"
                    name={item.field}
                    value={form[item.field] || ''}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="请输入落地页URL（需以https开头）"
                    maxLength={item.validator?.maxLength}
                  />
                )}

                {item.field === 'pricing' && (
                  <input
                    type="number"
                    name={item.field}
                    value={form[item.field] || 0}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="请输入出价（如：100.00）"
                    step="0.01"
                    min={item.validator?.min}
                  />
                )}

                {item.field === 'videos' && (
                  <div>
                    <div 
                      className={styles.uploadArea}
                      onClick={() => fileInputRef.current.click()}
                    >
                      点击上传视频（最多3个）
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        multiple
                        className={styles.uploadInput}
                        onChange={handleFileChange}
                      />
                    </div>
                    <p className={styles.uploadTips}>支持常见视频格式，单个视频不超过100MB</p>
                    
                    {selectedVideos.length > 0 && (
                      <div className={styles.videoList}>
                        {selectedVideos.map((video, idx) => (
                          <div key={idx} className={styles.videoItem}>
                            {video.name}
                            <span 
                              className={styles.removeVideo}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveVideo(idx);
                              }}
                            >
                              ×
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {formErrors[item.field] && (
                  <p className={styles.error}>{formErrors[item.field]}</p>
                )}
              </div>
            ))}

            <div className={styles.buttons}>
              <button 
                type="button"
                className={`${styles.button} ${styles.cancelBtn}`}
                onClick={onClose}
              >
                取消
              </button>
              <button 
                type="submit"
                className={`${styles.button} ${styles.submitBtn}`}
              >
                {modalType === 'create' ? '创建' : '保存'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdForm;