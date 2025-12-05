import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000
});

// 广告相关接口
export const adApi = {
  getAds: () => api.get('/ads'),
  createAd: (data) => api.post('/ads', data),
  updateAd: (id, data) => api.put(`/ads/${id}`, data),
  deleteAd: (id) => api.delete(`/ads/${id}`),
  clickAd: (id) => api.patch(`/ads/${id}/click`)
};

// 表单配置接口
export const formApi = {
  getFormConfig: () => api.get('/form-config')
};

// 视频上传接口
export const uploadApi = {
  uploadVideos: (formData) => api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default { adApi, formApi, uploadApi };