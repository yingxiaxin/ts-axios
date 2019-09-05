import { AxiosRequestConfig } from './types/index';

export default function xhr(config: AxiosRequestConfig) {
    const { data = null, url, method = 'get', headers } = config;
    const request = new XMLHttpRequest();

    request.open(method.toUpperCase(), url, true);

    // 设置请求头headers
    Object.keys(headers).forEach(name => {
        if (data === null && name.toLocaleLowerCase() === 'content-type') {
            delete headers[name];
        } else {
            request.setRequestHeader(name, headers[name]);
        }
    });

    request.send(data);
}