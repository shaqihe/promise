(function(window, undefined) {

    const PENDING = undefined; // Promise 的 初始状态
    const FULFILLED = 1; // Promise 成功返回后的状态
    const REJECTED = 2; // Promise 失败后的状态


    const util = {
        //判断是否为一个thenable 对象
        isThenable(obj) {
            return obj && typeof obj['then'] == 'function';
        },
        //是否为function
        isFunction(obj) {
            return 'function' === typeof obj;
        }
    };

    /**
     *   构造函数
     *
     */
    const statusProvider = (promise, status) => data => {
        if (promise.status !== PENDING) return false
        promise.status = status
        promise.result = data
    }

    /**
     *   构造函数
     *
     */
    class Promise {
        //构造器
        constructor(executor) {
            this.stutas = PENDING; //初始化的状态为pending
            this.result = undefined; //result属性用来缓存promise的返回结果，可以是成功的返回结果，或失败的返回结果
        };


    }




})(window)
