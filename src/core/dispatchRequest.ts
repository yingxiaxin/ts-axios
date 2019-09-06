import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types/index';
import xhr from './xhr';
import { buildURL } from '../helpers/url';
import { transformRequest, transformResponse } from '../helpers/data';
import { processHeaders } from '../helpers/headers';

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
    processConfig(config);
    return xhr(config).then(res => {
        return transformResponseData(res);
    });
}

function processConfig(config: AxiosRequestConfig): void {
    config.url = transformURL(config);
    config.headers = transformHeaders(config);
    // 注意！此步的逻辑放在最后执行，因为如果data是普通对象，会进行序列化
    config.data = transformRequestData(config);
}

function transformURL(config: AxiosRequestConfig): string {
    const { url, params } = config;
    return buildURL(url!, params);
}

function transformRequestData(config: AxiosRequestConfig): any {
    return transformRequest(config.data);
}

function transformHeaders(config: AxiosRequestConfig): any {
    const { headers = {}, data } = config;
    return processHeaders(headers, data);
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
    res.data = transformResponse(res.data);
    return res;
}