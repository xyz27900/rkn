import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import camelcaseKeys from 'camelcase-keys';

import { isArray, isObject } from '@/utils/is';

export type AxiosSucceedResponse<T> = AxiosResponse<T> & { __state: 'success' };
export type AxiosFailedResponse = Partial<AxiosResponse<''>> & { __state: 'failed' };
export type AxiosReply<T extends object | string> = Promise<AxiosSucceedResponse<T> | AxiosFailedResponse>;

export const get = async <T extends object | string> (path: string, config?: AxiosRequestConfig): AxiosReply<T> => {
  try {
    const response = transformResponse(await Axios.get(path, config));
    return {
      ...response,
      __state: 'success',
    };
  } catch (error) {
    return { __state: 'failed' };
  }
};

const transformResponse = (res: AxiosResponse): AxiosResponse => {
  const { data } = res;

  if (isObject(data) || isArray(data)) {
    return {
      ...res,
      data: camelcaseKeys(data, { deep: true }),
    };
  }

  return res;
};
