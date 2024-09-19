import axios from 'axios';
// import Cookies from 'js-cookie';

const http = axios.create({
  baseURL: '',  // 你的API地址
  timeout: 10000,  // 请求超时时间
});

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么：例如添加token
    // config.headers['Authorization'] = '你的token';
    console.log(config,"config");
    // config.headers.authorization=`GRJWT ${Cookies.get('token')}`
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const res = response.data;
    // 根据你的业务处理回调
    if (response.status !== 200) {
      // 处理错误
      // ...
      return Promise.reject(new Error(res.message || 'Error'));
    } else {
      return res;
    }
  },
  error => {
    // 对响应错误做点什么
    console.log('err' + error);  // for debug
    return Promise.reject(error);
  }
);

export default http;
