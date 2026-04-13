import axios from 'axios';

const api = axios.create({
  baseURL: '',  // để trống vì dùng proxy của NextJS
  headers: { 'Content-Type': 'application/json' },
});

export default api;