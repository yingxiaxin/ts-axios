import { AxiosRequestConfig, AxiosResponse } from '../types/index';

class AxiosError extends Error {
    isAxiosError: boolean;
    config: AxiosRequestConfig;
    code?: string | null;
    request?: any;
    response?: AxiosResponse;

    constructor(message: string, config: AxiosRequestConfig, code?: string | null, request?: any, response?: AxiosResponse) {
        super(message);

        this.config = config;
        this.code = code;
        this.request = request;
        this.response = response;
        this.isAxiosError = true;

        // 根据ts的文档，当继承一些内置对象如Error、Map类的时候，继承后的类的实例，可能无法访问自身的方法
        // 同时，instanceof此类的实例，也不等于此类。解决办法就是在调用父类构造函数后，立即手动改变原型指向
        Object.setPrototypeOf(this, AxiosError.prototype);
    }
}

export function createError(message: string, config: AxiosRequestConfig, code?: string | null, request?: any, response?: AxiosResponse) {
    const error = new AxiosError(message, config, code, request, response);
    return error;
}