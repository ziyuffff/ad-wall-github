import React from 'react';
import styles from './AdCard.module.css';

const AdCard = ({ ad, onOpenVideoModal, onOpenEditModal, onOpenCopyModal, onConfirmDelete, operateMenuVisible, setOperateMenuVisible }) => {
  const toggleOperateMenu = (e) => {
    e.stopPropagation();
    setOperateMenuVisible(ad.id, !operateMenuVisible[ad.id]);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onOpenEditModal(ad);
    setOperateMenuVisible(ad.id, false);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    onOpenCopyModal(ad);
    setOperateMenuVisible(ad.id, false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onConfirmDelete(ad.id);
    setOperateMenuVisible(ad.id, false);
  };

  return (
    <div className={styles.card} onClick={() => onOpenVideoModal(ad)}>
      <div className={styles.header}>
        <h3 className={styles.title} title={ad.title}>{ad.title}</h3>
        <button 
          className={styles.operateBtn} 
          onClick={toggleOperateMenu}
          data-ad-id={ad.id}
        >
          操作
        </button>
      </div>

      {operateMenuVisible[ad.id] && (
        <div className={styles.operateMenu} data-ad-id={ad.id}>
          <button className={`${styles.operateMenuItem} ${styles.edit}`} onClick={handleEdit}>编辑</button>
          <button className={`${styles.operateMenuItem} ${styles.copy}`} onClick={handleCopy}>复制</button>
          <button className={`${styles.operateMenuItem} ${styles.delete}`} onClick={handleDelete}>删除</button>
        </div>
      )}

      <p className={styles.author}>发布者信息：{ad.author}</p>
      
      <p className={styles.content}>
        广告内容文案：{ad.content || '暂无内容'}
      </p>

      <div className={styles.stats}>
        <div className={styles.statsLeft}>
          <span className={styles.statItem}>热度：{ad.clicked}</span>
          <span className={styles.statItem}>视频：{ad.videos ? ad.videos.length : 0}/3</span>
        </div>
        <span className={styles.pricing}>出价：{parseFloat(ad.pricing).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default AdCard;