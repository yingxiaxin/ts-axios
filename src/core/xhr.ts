import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types/index';
import { parseHeaders } from '../helpers/headers';
import { createError } from '../helpers/error';
import { isURLSameOrigin } from '../helpers/url';
import cookie from '../helpers/cookie';
import { isFormData } from '../helpers/util';

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        const { data = null,
            url,
            method = 'get',
            headers,
            responseType,
            timeout,
            cancelToken,
            withCredentials,
            xsrfHeaderName,
            xsrfCookieName,
            onDownloadProgress,
            onUploadProgress,
            auth,
        } = config;

        const request = new XMLHttpRequest();

        request.open(method.toUpperCase(), url!, true);

        configureRequest();

        addEvents();

        processHeaders();

        processCancel();

        request.send(data);

        /**
         * 对request对象进行一些配置
         */
        function configureRequest(): void {
            // 设置返回类型
            if (responseType) {
                request.responseType = responseType;
            }

            // 设置timeout超时的时间，如果没有设置timeout，就不需要赋值，默认为0，即一直等待不超时。单位: 毫秒
            if (timeout) {
                request.timeout = timeout;
            }

            // 跨域请求时，通过设置这个属性，来使请求带上所要请求的域下的cookie
            if (withCredentials) {
                request.withCredentials = withCredentials;
            }
        }

        /**
         * 为request对象添加各类事件监听
         */
        function addEvents(): void {
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

            // 下载进度监控事件
            if (onDownloadProgress) {
                request.onprogress = onDownloadProgress;
            }

            // 上传进度监控事件
            if (onUploadProgress) {
                request.upload.onprogress = onUploadProgress;
            }
        }

        /**
         * 对请求头headers进行处理
         */
        function processHeaders(): void {
            // 如果数据是FormData的话，删除content-type的header，让浏览器自动添加
            if (isFormData(data)) {
                delete headers['Content-Type'];
            }

            // 如果携带cookie，或者是同源的，并且设置有xsrfCookieName；那么通过cookie读取，在header上设置它的值，作为后端需要的token传过去
            if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
                const xsrfValue = cookie.read(xsrfCookieName);
                if (xsrfValue && xsrfHeaderName) {
                    headers[xsrfHeaderName] = xsrfValue;
                }
            }

            // 基本验证 的请求头设置
            if (auth) {
                headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password);
            }

            // 设置请求头headers
            Object.keys(headers).forEach(name => {
                if (data === null && name.toLocaleLowerCase() === 'content-type') {
                    delete headers[name];
                } else {
                    request.setRequestHeader(name, headers[name]);
                }
            });
        }

        /**
         * 处理取消的逻辑
         */
        function processCancel(): void {
            if (cancelToken) {
                // tslint:disable-next-line: no-floating-promises
                cancelToken.promise.then(reason => {
                    request.abort();
                    reject(reason);
                });
            }
        }

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