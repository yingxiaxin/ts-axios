import { AxiosRequestConfig } from "../types";
import { isPlainObject, deepMerge } from "../helpers/util";

/**
 * 默认策略，如果用户有传入配置就用用户的，否则用默认配置
 * @param val1 默认配置
 * @param val2 用户传入的配置
 */
function defaultStrat(val1: any, val2: any): any {
    return typeof val2 !== 'undefined' ? val2 : val1;
}

/**
 * 只从用户传递的配置中读取设置
 * @param val1 默认配置
 * @param val2 用户传入的配置
 */
function fromVal2Strat(val1: any, val2: any): any {
    if (typeof val2 !== 'undefined') {
        return val2;
    }
}

/**
 * 深度合并复杂对象
 * 1、如果val2是普通对象，那么与val1合并
 * 2、如果val2不是undefined，并且不是对象，用val2的值
 * 3、如果val2是undefined，val1是普通对象，合并
 * 4、如果val2是undefined，并且val1不为undefined，用val1的值
 * @param val1 默认配置
 * @param val2 用户传入的配置
 */
function deepMergeStrat(val1: any, val2: any): any {
    if (isPlainObject(val2)) {
        return deepMerge(val1, val2);
    } else if (typeof val2 !== 'undefined') {
        return val2;
    } else if (isPlainObject(val1)) {
        return deepMerge(val1);
    } else if (typeof val1 !== 'undefined') {
        return val1;
    }
}

// 合并策略的函数的映射集合
const strats = Object.create(null);

// 只从用户配置中读取的属性
const stratKeysFromVal2 = ['url', 'params', 'data'];
stratKeysFromVal2.forEach(key => {
    strats[key] = fromVal2Strat;
});

// 需要深度拷贝的属性
const stratKeysDeepMerge = ['headers'];
stratKeysDeepMerge.forEach(key => {
    strats[key] = deepMergeStrat;
});

export default function mergeConfig(config1: AxiosRequestConfig, config2?: AxiosRequestConfig): AxiosRequestConfig {
    if (!config2) {
        config2 = {};
    }

    const config = Object.create(null);

    for(let key in config2) {
        mergeField(key);
    }

    for(let key in config1) {
        if (!config2[key]) {
            mergeField(key);
        }
    }

    function mergeField(key: string): void {
        const strat = strats[key] || defaultStrat;
        config[key] = strat(config1[key], config2![key]);
    }

    return config;
}