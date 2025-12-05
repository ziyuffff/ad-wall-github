import React from 'react';
import styles from './DeleteModal.module.css';

const DeleteModal = ({ visible, onClose, onConfirm }) => {
  if (!visible) return null;

  return (
    <div className={styles.modalBg}>
      <div className={styles.modalContent}>
        <h3 className={styles.title}>确认删除？</h3>
        <p className={styles.message}>删除后广告数据将无法恢复，是否继续？</p>
        <div className={styles.buttons}>
          <button 
            className={`${styles.button} ${styles.cancelBtn}`}
            onClick={onClose}
          >
            取消
          </button>
          <button 
            className={`${styles.button} ${styles.deleteBtn}`}
            onClick={onConfirm}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;