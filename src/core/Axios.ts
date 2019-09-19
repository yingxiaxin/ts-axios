import { AxiosRequestConfig, AxiosPromise, Method, AxiosResponse, ResolveFn, RejectFn } from "../types";
import dispatchRequest, { transformURL } from './dispatchRequest';
import InterceptorManager from './InterceptorManager';
import mergeConfig from "./mergeConfig";

interface Interceptors {
    request: InterceptorManager<AxiosRequestConfig>;
    response: InterceptorManager<AxiosResponse>;
}

interface PromiseChain<T> {
    resolve: ResolveFn<T> | ((config: AxiosRequestConfig) => AxiosPromise);
    reject?: RejectFn;
}

export default class Axios {

    defaults: AxiosRequestConfig;

    interceptors: Interceptors;

    constructor(initConfig: AxiosRequestConfig) {
        this.defaults = initConfig;
        this.interceptors = {
            request: new InterceptorManager<AxiosRequestConfig>(),
            response: new InterceptorManager<AxiosResponse>(),
        }
    }

    // request支持两种传参方式，一种传config对象，一种传url和config对象
    // 因此，两个参数的类型需要为any，在代码中进一步判断
    request(url: any, config?: any): AxiosPromise {
        if (typeof url === 'string') {
            if (!config) {
                config = {};
            }
            config.url = url;
        } else {
            config = url;
        }

        // 合并传入的配置和默认配置
        config = mergeConfig(this.defaults, config);

        // 定义拦截器调用链的初始值，初始的时候没有拦截器，里面只有默认要做的事情，就是dispatchRequest
        const chain: PromiseChain<any>[] = [
            {
                resolve: dispatchRequest,
                reject: undefined,
            }
        ];

        /** 循环request和response拦截器管理实例，分别将拦截器添加到初始值的两边 */
        this.interceptors.request.forEach(interceptor => {
            chain.unshift(interceptor);
        });

        this.interceptors.response.forEach(interceptor => {
            chain.push(interceptor);
        });

        let promise = Promise.resolve(config);
        while (chain.length) {
            const { resolve, reject } = chain.shift()!;
            promise = promise.then(resolve, reject);
        }

        return promise;
    }

    get(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('get', url, config);
    }

    delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('delete', url, config);
    }

    head(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('head', url, config);
    }

    options(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('options', url, config);
    }

    post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithData('post', url, data, config);
    }

    put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithData('put', url, data, config);
    }

    patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithData('patch', url, data, config);
    }

    getUri(config?: AxiosRequestConfig): string {
        config = mergeConfig(this.defaults, config);
        return transformURL(config);
    }

    _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this.request(Object.assign(config || {}, {
            method: method,
            url: url,
        }));
    }

    _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this.request(Object.assign(config || {}, {
            method: method,
            url,
            data,
        }));
    }
}