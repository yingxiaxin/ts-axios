import { AxiosRequestConfig, AxiosStatic } from "./types";
import Axios from "./core/Axios";
import { extend } from "./helpers/util";
import defaults from './defaults';
import mergeConfig from "./core/mergeConfig";

function createInstance(config: AxiosRequestConfig): AxiosStatic {
    const context = new Axios(config);
    const instance = Axios.prototype.request.bind(context);

    extend(instance, context);
    return instance as AxiosStatic;
}

// 此时的axios，是一个方法，同时也有其他get、post、delete等方法挂载其上
// 既可以用axios()的方式调用，也可以axios.get()的方式调用
const axios = createInstance(defaults);
axios.create = function create(config) {
    return createInstance(mergeConfig(defaults, config));
}

export default axios;