import React, { useRef, useEffect } from 'react';
import styles from './VideoModal.module.css';

const VideoModal = ({ 
  visible, 
  videoUrl, 
  landingUrl, 
  adId, 
  playTip, 
  onClose, 
  onGotoLandingPage,
  onVideoEnd
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (visible && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('视频自动播放失败:', err);
      });
    }
  }, [visible, videoUrl]);

  const handleVideoEnd = () => {
    onVideoEnd();
  };

  if (!visible) return null;

  return (
    <div className={styles.modalBg}>
      <div className={styles.modalContent}>
        <div className={styles.videoContainer}>
          <video 
            ref={videoRef}
            src={videoUrl} 
            autoPlay 
            playsInline 
            className={styles.video}
            onEnded={handleVideoEnd}
          >
            您的浏览器不支持HTML5视频播放，请升级浏览器后重试
          </video>
        </div>

        <p className={styles.tip}>{playTip}</p>

        <div className={styles.buttons}>
          <button 
            className={`${styles.button} ${styles.cancelBtn}`}
            onClick={onClose}
          >
            取消跳转
          </button>
          <button 
            className={`${styles.button} ${styles.jumpBtn}`}
            onClick={onGotoLandingPage}
          >
            立即跳转落地页
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;