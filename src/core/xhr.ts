import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types/index';
import { parseHeaders } from '../helpers/headers';
import { createError } from '../helpers/error';

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        const { data = null, url, method = 'get', headers, responseType, timeout, cancelToken } = config;

        const request = new XMLHttpRequest();
    
        // 设置返回类型
        if (responseType) {
            request.responseType = responseType;
        }

        // 设置timeout超时的时间，如果没有设置timeout，就不需要赋值，默认为0，即一直等待不超时。单位: 毫秒
        if (timeout) {
            request.timeout = timeout;
        }

        request.open(method.toUpperCase(), url!, true);
    
        /** 状态改变监听 */
        request.onreadystatechange = function handleLoad() {
            // 如果readyState不为4，表示请求未完成
            if (request.readyState !== 4) {
                return;
            }

            // 当发生网络错误、超时错误时，status也是0
            if (request.status === 0) {
                return;
            }

            // 请求完成，则执行以下代码
            const responseHeaders = parseHeaders(request.getAllResponseHeaders());
            const respnoseData = responseType !== 'text' ? request.response : request.responseText;
            const response: AxiosResponse = {
                data: respnoseData,
                status: request.status,
                statusText: request.statusText,
                headers: responseHeaders,
                config,
                request,
            };
            // 判断status状态码来决定是resolve或者reject
            handleResponse(response);
        }

        /** 网络错误监听 */
        request.onerror = function handleError() {
            reject(createError('Network Error', config, null, request));
        }

        /** 超时错误的处理 */
        request.ontimeout = function handleTimeout() {
            reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request));
        }

        // 设置请求头headers
        Object.keys(headers).forEach(name => {
            if (data === null && name.toLocaleLowerCase() === 'content-type') {
                delete headers[name];
            } else {
                request.setRequestHeader(name, headers[name]);
            }
        });
    
        if (cancelToken) {
            // tslint:disable-next-line: no-floating-promises
            cancelToken.promise.then(reason => {
                request.abort();
                reject(reason);
            });
        }

        request.send(data);

        /** 根据status状态码，决定是resolve或者reject */
        function handleResponse(response: AxiosResponse): void {
            if (response.status >= 200 && response.status < 300) {
                resolve(response);
            } else {
                reject(createError(`Request failed with status code ${response.status}`, config, null, request, response));
            }
        }
    });
}