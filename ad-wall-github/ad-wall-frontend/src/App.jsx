import React, { useState, useEffect, useCallback } from 'react';
import AdCard from './components/AdCard/AdCard';
import AdForm from './components/AdForm/AdForm';
import './global.css';
import VideoModal from './components/VideoModal/VideoModal';
import DeleteModal from './components/DeleteModal/DeleteModal';
import styles from './App.module.css';
import api from './api';

const App = () => {
  // 状态管理
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formConfig, setFormConfig] = useState([]);
  
  // 弹窗状态
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentAd, setCurrentAd] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAdId, setCurrentAdId] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [currentLandingUrl, setCurrentLandingUrl] = useState('');
  const [videoPlayTip, setVideoPlayTip] = useState('视频播放中...');
  const [operateMenuVisible, setOperateMenuVisible] = useState({});

  // 获取广告列表
  const getAdList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.adApi.getAds();
      setAds(response.data.data || []);
    } catch (error) {
      alert('获取广告列表失败：' + (error.response?.data?.message || '网络错误'));
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取表单配置
  const getFormConfig = useCallback(async () => {
    try {
      const response = await api.formApi.getFormConfig();
      setFormConfig(response.data.data || []);
    } catch (error) {
      alert('获取表单配置失败：' + (error.response?.data?.message || '网络错误'));
    }
  }, []);

  // 初始化加载数据
  useEffect(() => {
    getAdList();
    getFormConfig();
  }, [getAdList, getFormConfig]);

  // 排序广告（按竞价逻辑得分）
  const sortedAds = [...ads]
    .map(ad => {
      const mysteryCoefficient = 0.42;
      ad.logicScore = ad.pricing + (ad.pricing * ad.clicked * mysteryCoefficient);
      return ad;
    })
    .sort((a, b) => b.logicScore - a.logicScore);

  // 打开表单弹窗
  const openModal = (type, ad = null) => {
    closeAllOperateMenu();
    setModalType(type);
    setCurrentAd(ad);
    setIsFormModalOpen(true);
  };

  // 关闭表单弹窗
  const closeModal = () => {
    setIsFormModalOpen(false);
    setCurrentAd(null);
  };

  // 处理表单提交成功
  const handleFormSubmitSuccess = () => {
    getAdList();
  };

  // 打开视频弹窗
  const openVideoModal = (ad) => {
    closeAllOperateMenu();
    
    if (!ad.url || ad.url.trim() === '') {
      alert('该广告未设置落地页URL！');
      return;
    }

    if (!ad.videos || ad.videos.length === 0) {
      gotoLandingPageDirect(ad.url, ad.id);
      return;
    }

    // 随机选择一个视频
    const randomIndex = Math.floor(Math.random() * ad.videos.length);
    setCurrentVideoUrl(ad.videos[randomIndex]);
    setCurrentLandingUrl(ad.url.trim());
    setCurrentAdId(ad.id);
    setVideoPlayTip('视频播放中...播放完后将自动跳转页面');
    setIsVideoModalOpen(true);
  };

  // 关闭视频弹窗
  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentVideoUrl('');
    setCurrentLandingUrl('');
    setCurrentAdId(null);
  };

  // 视频播放结束处理
  const handleVideoEnd = () => {
    setVideoPlayTip('视频播放完毕，正在自动跳转...');
    gotoLandingPage();
  };

  // 跳转落地页
  const gotoLandingPage = async () => {
    try {
      if (currentAdId) {
        await api.adApi.clickAd(currentAdId);
        const newWindow = window.open(currentLandingUrl, '_blank');
        if (!newWindow) {
          alert('跳转被浏览器拦截，请允许弹窗后重试！');
        }
        closeVideoModal();
        getAdList();
      }
    } catch (error) {
      alert('更新点击数失败：' + (error.response?.data?.message || '网络错误'));
      closeVideoModal();
    }
  };

  // 无视频直接跳转
  const gotoLandingPageDirect = async (url, adId) => {
    try {
      await api.adApi.clickAd(adId);
      window.open(url, '_blank');
      getAdList();
    } catch (error) {
      alert('更新点击数失败：' + (error.response?.data?.message || '网络错误'));
    }
  };

  // 确认删除
  const confirmDelete = (adId) => {
    closeAllOperateMenu();
    setCurrentAdId(adId);
    setIsDeleteModalOpen(true);
  };

  // 关闭删除弹窗
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentAdId(null);
  };

  // 执行删除
  const deleteAd = async () => {
    try {
      if (currentAdId) {
        await api.adApi.deleteAd(currentAdId);
        alert('广告删除成功！');
        closeDeleteModal();
        getAdList();
      }
    } catch (error) {
      alert('删除失败：' + (error.response?.data?.message || '网络错误'));
    }
  };

  // 更新操作菜单显示状态
  const updateOperateMenuVisible = (adId, visible) => {
    setOperateMenuVisible(prev => ({ ...prev, [adId]: visible }));
  };

  // 关闭所有操作菜单
  const closeAllOperateMenu = () => {
    setOperateMenuVisible({});
  };

  // 点击外部关闭操作菜单
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isOperateBtn = e.target.hasAttribute('data-ad-id');
      const isOperateMenu = e.target.closest(`.${styles.operateMenu}`);
      
      if (!isOperateBtn && !isOperateMenu) {
        closeAllOperateMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div>
      {/* 全屏背景层 */}
      <div className="fullscreen-bg"></div>
      
      {/* 内容容器 */}
      <div className="content-wrapper">
        {/* 标题 */}
        <h1 className={styles.title}>Mini 广告墙</h1>

        {/* 新增按钮 */}
        <button 
          className={styles.addButton}
          onClick={() => openModal('create')}
        >
          新增广告
        </button>

        <div className={styles.adGrid}>
          {loading ? (
            <div className={styles.loading}><span className="pulseLoader"></span> 加载中...</div>
          ) : ads.length === 0 ? (
            <div className={styles.emptyState}>
              暂无广告，点击"新增广告"创建第一条广告吧～
            </div>
          ) : (
            sortedAds.map(ad => (
              <AdCard 
                key={ad.id}
                ad={ad}
                onOpenVideoModal={openVideoModal}
                onOpenEditModal={(ad) => openModal('edit', ad)}
                onOpenCopyModal={(ad) => openModal('copy', ad)}
                onConfirmDelete={confirmDelete}
                operateMenuVisible={operateMenuVisible}
                setOperateMenuVisible={updateOperateMenuVisible}
              />
            ))
          )}
        </div>
      </div>

      {/* 视频弹窗 */}
      <VideoModal 
        visible={isVideoModalOpen}
        videoUrl={currentVideoUrl}
        landingUrl={currentLandingUrl}
        adId={currentAdId}
        playTip={videoPlayTip}
        onClose={closeVideoModal}
        onGotoLandingPage={gotoLandingPage}
        onVideoEnd={handleVideoEnd}
      />

      {/* 表单弹窗 */}
      <AdForm 
        visible={isFormModalOpen}
        modalType={modalType}
        initialData={currentAd}
        formConfig={formConfig}
        onClose={closeModal}
        onSubmitSuccess={handleFormSubmitSuccess}
      />

      {/* 删除确认弹窗 */}
      <DeleteModal 
        visible={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteAd}
      />
    </div>
  );
};

export default App;