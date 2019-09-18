import { isDate, isPlainObject } from './util';

/** 判断是否是同域请求 */

interface URLOrigin {
    protocol: string;
    host: string;
}

/**
 * 判断是否同源请求
 * @param requestURL 请求的URL
 */
export function isURLSameOrigin(requestURL: string): boolean {
    const parsedOrigin = resolveURL(requestURL);
    return (parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host);
}

// 通过创建一个a标签，设置a标签的href属性为某个url，直接从a标签的protocol和host属性中读书协议、域名端口
// protocol表示协议如，'http:'
// host表示域名端口如，'127.0.0.1:8080'
const urlParsingNode = document.createElement('a');
const currentOrigin = resolveURL(window.location.href);

function resolveURL(url: string): URLOrigin {
    urlParsingNode.setAttribute('href', url);
    const { protocol, host } = urlParsingNode;
    return {
        protocol,
        host
    };
}

function encode(val: string): string {
    // 将URL内容进行编码，但是将以下符号转换回来不编码
    // 带字母的部分正则加i标记不区分大小写
    return encodeURIComponent(val)
        .replace(/%40/g, '@')
        .replace(/%3A/ig, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/ig, ',')
        .replace(/%20/g, '+')
        .replace(/%5B/ig, '[')
        .replace(/%5D/ig, ']');
}

/**
 * 构建get请求的url函数
 * 构建的规则：
 * 1、如果参数属性，对应的值是数组，如params:{foo: ['bar', 'baz']}，那么在url中的形式为：xxxx?foo[]=bar&foo[]=baz
 * 2、如果参数属性，对应的值是对象，则为stringify后的字符串，并且经过编码
 * 3、url中带有哈希值，即'#'符号，忽略url中'#'符号后面的内容
 * 4、url中若已有参数，则params中的参数跟在后面，否则url末尾加上'?'，并且跟上参数
 * 5、特殊的符号如'@'、':'、'$'、'['、']'、','转码回来，不显示编码后的代码，空格符用'+'号替代
 * 6、如果参数的属性，对应的值是日期对象，则值用toISOString()转换成字符串
 * 7、如果参数的属性，是null或者undefined，则url中不带上这个参数
 * @param url axios请求的url地址
 * @param params 请求的参数
 */
export function buildURL(url: string, params?: any): string {
    if (!params) {
        return url;
    }

    const parts: string[] = [];

    Object.keys(params).forEach(key => {
        const val = params[key];
        // 如果属性的值是null，或者undefined，url中不会带上这个参数，直接跳过
        if (val === null || typeof val === 'undefined') {
            return;
        }
        let values = [];
        // 如果属性的值是一个数组，那么url中key的后面要跟上'[]'
        if (Array.isArray(val)) {
            values = val;
            key += '[]';
        } else {
            // 如果属性值不是数组，那么将它变成数组，方便处理
            values = [val];
        }
        values.forEach((val) => {
            if (isDate(val)) {
                val = val.toISOString();
            } else if (isPlainObject(val)) {
                val = JSON.stringify(val);
            }
            parts.push(`${encode(key)}=${encode(val)}`)
        });
    });

    let serializedParams = parts.join('&');
    // 如果上面的处理结果是空数组，那么join后是空字符串，不处理
    // 同时如果url里有哈希值，即myUrl#hash形式，哈希后面的是页面内锚点或跳转，不需要在请求url中跟上
    if (serializedParams) {
        const markIndex = url.indexOf('#');
        if (markIndex !== -1) {
            url = url.slice(0, markIndex);
        }
        // 如果这个url已经带有参数，那么它本身带有'?'，后面加上'&'并拼接
        // 否则，先加上'?'，并拼接
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
}