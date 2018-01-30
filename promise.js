(function(window, undefined) {

    const PENDING = undefined; // Promise 的 初始状态
    const FULFILLED = 'FULFILLED'; // Promise 成功返回后的状态
    const REJECTED = 'REJECTED'; // Promise 失败后的状态


    const util = {
        //判断是否为一个thenable 对象
        isThenable(obj) {
            return obj && typeof obj['then'] == 'function';
        },
        //是否为function
        isFunction(obj) {
            return 'function' === typeof obj;
        },

        //是否为promise
        isPromise() {
            return obj && typeof obj['then'] == 'function' && typeof obj['catch'] == 'function';
        }
    };

    /**
     * 空函数
     */
    const noop = () => {}

    /**
     * 数组展开成数组
     */
    const range = n => n === 0 ? [] : [n, ...range(n - 1)]

    /**
     * 回调函数
     *
     */
    const statusProvider = (promise, status) => data => {
        if (promise.status !== PENDING) return false; //promise规范中，已经确定状态的promise对象无法再改变
        promise.status = status;
        promise.result = data;
        //处理回调
        setTimeout(() => {
            promise.listeners[status].forEach(fn => fn(data));
        });
    }

    /**
     *   构造函数
     *
     */
    class myPromise {
        //构造器
        constructor(executor) {
            if (typeof executor !== 'function') {
                throw new TypeError(`Promise resolver ${executor.toString()} is not a function`)
            }
            this.stutas = PENDING; //初始化的状态为pending
            this.result = undefined; //result属性用来缓存promise的返回结果，可以是成功的返回结果，或失败的返回结果
            this.successListener = []; // 缓存成功的处理函数
            this.failureListener = []; // 缓存失败的处理函数

            this.listeners = {
                FULFILLED: [], // 缓存成功的处理函数
                REJECTED: [] // 缓存失败的处理函数
            }
            try {
                executor(statusProvider(this, FULFILLED), statusProvider(this, REJECTED))
            } catch (e) {
                statusProvider(this, REJECTED)(e)
            }
        }

        //我们可以通过promise原型上面的then方法为promise添加成功处理函数和失败处理函数，可以通过catch方法为promise添加失败处理函数。
        /**
         * Promise原型上面的 then方法，根据不同的状态，来执行
         */
        then(...args) {
            const child = new this.constructor(noop)

            const handler = fn => data => {
                if (typeof fn === 'function') {
                    try {
                        const result = fn(data) //执行resolve 或者  reject 回调得到结果

                        if (util.isThenable(result)) {
                            const successHandler = child.listeners.FULFILLED[0]
                            const errorHandler = child.listeners.REJECTED[0]
                            if (util.isPromise(result)) { //如果结果的是个promise对象，直接执行其then方法
                                result.then(successHandler, errorHandler)
                            } else {
                                //如果结果的是个类promise对象，实例化一个promise，执行其then方法
                                new this.constructor(result.then)
                                    .then(successHandler, errorHandler)
                            }
                        } else {
                            statusProvider(child, FULFILLED)(result)
                        }
                    } catch (e) {
                        statusProvider(child, REJECTED)(e)
                    }
                } else if (!fn) {
                    statusProvider(child, this.status)(data)
                }
            }

            switch (this.status) {
                case PENDING:
                    {
                        this.listeners[FULFILLED].push(handler(args[0]))
                        this.listeners[REJECTED].push(handler(args[1]))
                        break
                    }
                case FULFILLED:
                    {
                        handler(args[0])(this.result)
                        break
                    }
                case REJECTED:
                    {
                        handler(args[1])(this.result)
                        break
                    }
            }

            return child;
        }
        /**
         * Promise原型上面的 cache方法
         */
        catch (arg) {
            return this.then(undefined, arg)
        }
    };

    /**
     * Promise静态方法resolve
     */
    myPromise.resolve = value => {

        if (util.isThenable(value)) {
            return value;
        }

        return new myPromise((resolve, reject) => {
            resolve(value);
        });
    };

    /**
     * Promise静态方法reject
     */
    myPromise.reject = reason => {
        return new myPromise((resolve, reject) => {
            reject(reason);
        });
    };

    /**
     * Promise静态方法all
     */
    myPromise.all = promises => {
        const length = promises.length
        const result = new Promise(noop)
        let count = 0
        const values = range(length)

        promises.forEach((p, i) => {
            p.then(data => {
                values[i] = data
                count++
                if (count === length) statusProvider(result, FULFILLED)(values)
            }, statusProvider(result, REJECTED))
        })
        return result
    }

    /**
     * Promise静态方法race
     */
    myPromise.race = promises => {
        const result = new APromise(noop)
        promises.forEach((p, i) => {
            p.then(statusProvider(result, FULFILLED), statusProvider(result, REJECTED))
        })
        return result
    }

    window.Promise = Promise || myPromise;


})(window)
