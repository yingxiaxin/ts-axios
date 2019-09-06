import { AxiosInstance } from "./types";
import Axios from "./core/Axios";
import { extend } from "./helpers/util";

function createInstance(): AxiosInstance {
    const context = new Axios();
    const instance = Axios.prototype.request.bind(context);

    extend(instance, context);
    return instance as AxiosInstance;
}

// 此时的axios，是一个方法，同时也有其他get、post、delete等方法挂载其上
// 既可以用axios()的方式调用，也可以axios.get()的方式调用
const axios = createInstance();

export default axios;