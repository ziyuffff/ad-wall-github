import axios from 'axios';

// 替换为后端实际部署的公网域名（去掉localhost，使用部署后的地址）
const api = axios.create({
  baseURL: 'https://ad-wall-back.vercel.app/api',
  timeout: 5000,
  // 允许跨域请求携带凭证（如果后端开启了credentials）
  withCredentials: true
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
