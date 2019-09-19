export type Method = 'get' | 'GET'
    | 'delete' | 'DELETE'
    | 'post' | 'POST'
    | 'head' | 'HEAD'
    | 'options' | 'OPTIONS'
    | 'put' | 'PUT'
    | 'patch' | 'PATCH';

export interface AxiosRequestConfig {
    url?: string;                                                           // url地址
    method?: Method;                                                        // 请求方式
    data?: any;                                                             // 请求数据
    params?: any;                                                           // 请求参数
    headers?: any;                                                          // 请求头设置
    responseType?: XMLHttpRequestResponseType;                              // 接收的返回数据类型
    timeout?: number;                                                       // 超时时间设置
    transformRequest?: AxiosTransformer | AxiosTransformer[];               // 请求之前进行转换的转换函数或转换函数数组
    transformResponse?: AxiosTransformer | AxiosTransformer[];              // 响应给出去之前进行结果转换的转换函数或转换函数数组
    cancelToken?: CancelToken;                                              // 取消请求
    withCredentials?: boolean;                                              // 是否自动携带cookie
    xsrfCookieName?: string;                                                // 服务端生成的token在cookie中的名字
    xsrfHeaderName?: string;                                                // 服务端token在请求时携带在header里的哪个属性下
    onDownloadProgress?: (event: ProgressEvent) => void;                    // 文件下载处理函数
    onUploadProgress?: (event: ProgressEvent) => void;                      // 文件上传处理函数
    auth?: AxiosBasicCredentials;                                           // HTTP授权 auth: {username: 'xxx', password: 'xxxx'}
    validateStatus?: (status: number) => boolean;                           // 自定义合法状态码，是一个函数，表示哪些状态码视为合法不抛错
    paramsSerializer?: (params: any) => string;                             // 自定义的参数序列化函数
    baseURL?: string;                                                       // 基础URL
    [propName: string]: any;
}

export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request: any;
}

export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {

}

export interface AxiosError extends Error {
    isAxiosError: boolean;
    config: AxiosRequestConfig;
    code?: string | null;
    request?: any;
    response?: AxiosResponse;
}

export interface Axios {
    defaults: AxiosRequestConfig;

    interceptors: {
        request: AxiosInterceptorManager<AxiosRequestConfig>,
        response: AxiosInterceptorManager<AxiosResponse>
    };

    request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>;

    get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;

    delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;

    head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;

    options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>;

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>;

    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>;

    getUri(config?: AxiosRequestConfig): string;
}

export interface AxiosInstance extends Axios {
    <T = any>(config: AxiosRequestConfig): AxiosPromise<T>;

    <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
}

export interface AxiosClassStatic {
    new(config: AxiosRequestConfig): Axios;
}

export interface AxiosStatic extends AxiosInstance {
    create(config?: AxiosRequestConfig): AxiosInstance;
    CancelToken: CancelTokenStatic;
    Cancel: CancelStatic;
    isCancel: (value: any) => boolean;
    all<T>(promises: Array<T | Promise<T>>): Promise<T[]>;
    spread<T, R>(callback: (...args: T[]) => R): (arr: T[]) => R;
    Axios: AxiosClassStatic;
}

export interface AxiosInterceptorManager<T> {
    use(resolve: ResolveFn<T>, reject?: RejectFn): number;

    eject(id: number): void;
}

export interface ResolveFn<T> {
    (val: T): T | Promise<T>;
}

export interface RejectFn {
    (error: any): any;
}

export interface AxiosTransformer {
    (data: any, headers?: any): any;
}

export interface CancelToken {
    promise: Promise<Cancel>;
    reason?: Cancel;
    throwIfRequested(): void;
}

export interface Canceler {
    (message?: string): void;
}

export interface CancelExecutor {
    (cancel: Canceler): void;
}

export interface CancelTokenSource {
    token: CancelToken;
    cancel: Canceler;
}

export interface CancelTokenStatic {
    new(executor: CancelExecutor): CancelToken;
    source(): CancelTokenSource;
}

export interface Cancel {
    message?: string;
}

export interface CancelStatic {
    new(message?: string): Cancel;
}

export interface AxiosBasicCredentials {
    username: string;
    password: string;
}