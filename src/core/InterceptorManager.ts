import { ResolveFn, RejectFn } from '../types/index';

interface Interceptor<T> {
    resolve: ResolveFn<T>;
    reject?: RejectFn;
}

export default class InterceptorManager<T> {
    private interceptors: Array<Interceptor<T> | null>;

    constructor() {
        this.interceptors = [];
    }

    use(resolve: ResolveFn<T>, reject?: RejectFn): number {
        this.interceptors.push({
            resolve,
            reject,
        });
        return this.interceptors.length - 1;
    }

    eject(id: number): void {
        if (this.interceptors[id]) {
            this.interceptors[id] = null;
        }
    }

    forEach(fn: (interceptor: Interceptor<T>) => void): void {
        this.interceptors.forEach(interceptor => {
            if (interceptor) {
                fn(interceptor);
            }
        });
    }
}