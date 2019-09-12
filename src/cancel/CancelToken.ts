import { CancelExecutor, CancelTokenSource, Canceler } from "../types";
// 注意，此处的Cancel不能从接口定义中去取，而要从类定义中拿。因为我们要使用Cancel
import Cancel from './Cancel';

interface ResolvePromise {
    (reason?: Cancel): void;
}

export default class CancelToken {
    promise: Promise<Cancel>;
    reason?: Cancel;

    constructor(executor: CancelExecutor) {
        let resolvePromise: ResolvePromise;
        this.promise = new Promise<Cancel>(resolve => {
            resolvePromise = resolve;
        });

        executor(message => {
            if (this.reason) {
                return;
            }
            this.reason = new Cancel(message);
            resolvePromise(this.reason);
        });
    }

    throwIfRequested() {
        if (this.reason) {
            throw this.reason;
        }
    }

    static source(): CancelTokenSource {
        let cancel!: Canceler;
        const token = new CancelToken(c => {
            cancel = c;
        });
        return { cancel, token };
    }
}