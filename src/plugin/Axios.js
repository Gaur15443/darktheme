import * as KeyChain from 'react-native-keychain';
import {getDeviceInfo} from '../utils/format';
import axios from 'axios';
import authConfig, {authConfigProxy} from '../configs';
import config from 'react-native-config';

const requestInterceptor = async request => {
  const accessToken = await KeyChain.getGenericPassword({
    username: 'imuwAccessToken',
  });
  if (accessToken) {
    request.headers.Authorization = accessToken.password;
    request.headers['is-balkan'] = 'true';
  } else {
    request.headers.Authorization = '';
  }
  return request;
};

const logTimeOutError = async error => {
  try {
    const errorLog = {
      error: error?.response,
      deviceInfo: getDeviceInfo(),
    };
    await axios.post(`${authConfig.appBaseUrl}/log`, {log: errorLog});
  } catch (apiError) {}
};

const responseInterceptor = response => response;

const errorInterceptor = async error => {
  // Log detailed error information including URL and payload
  const request = error?.config;
  const errorDetails = {
    url: request?.url,
    baseURL: request?.baseURL,
    fullURL: request?.baseURL
      ? `${request.baseURL}${request.url}`
      : request?.url,
    method: request?.method?.toUpperCase(),
    payload: request?.data,
    headers: request?.headers,
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    responseData: error?.response?.data,
    errorMessage: error?.message,
    errorCode: error?.code,
  };

  if (config.ENV !== 'prod') {
    console.error(errorDetails);
  }

  const errorMessage = error?.message?.toLowerCase();
  const statusCode = error?.response?.status;
  if (error.code === 'ERR_CANCELED') {
    error.message = 'Network request cancelled';
    return Promise.reject(error);
  }

  if (errorMessage?.includes('timeout') || statusCode === 408) {
    await logTimeOutError(error);
  }

  if (
    error?.response?.data?.name === authConfig.webError ||
    error?.response?.data?.error?.name === 'TokenExpiredError'
  ) {
    error.message = 'Api cancelled';
    authConfigProxy.shouldForceLogout = true;
    return Promise.reject(error);
  }

  if (error?.response?.data?.message && statusCode !== 503) {
    error.message = error?.response?.data?.message;
  }

  if (statusCode === 503) {
    error.message = 'Oops! Something went wrong.';
  }

  if (error?.message === 'Network Error') {
    error.message = 'Uh-oh! No network found.';
  }

  if (statusCode == 511) {
    error.message =
      'The server is currently down for maintenance. Please try again later.';
  }

  return Promise.reject(error);
};

const Axios = axios.create({baseURL: config.APP_BASE_URL});
const AstroAxios = axios.create({baseURL: config.ASTRO_BASE_URL});
const ConsultationAxios = axios.create({
  baseURL: config.ASTRO_CONSULTATION_URL,
});
const TelephonyAxios = axios.create({baseURL: config.TELEPHONY_BASE_URL});

[Axios, AstroAxios, ConsultationAxios, TelephonyAxios].forEach(instance => {
  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
});

export {AstroAxios, ConsultationAxios, TelephonyAxios};
export default Axios;
