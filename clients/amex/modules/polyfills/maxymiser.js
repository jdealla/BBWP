import {
    setInterval
} from "timers";

var actions = {
    send: function (name, value = 'no value', attr = 'no attribute') {
        console.log(`Action Fired: ${name}, ${value}, ${attr}`)
    },
    set: function (name, value = 'no value', attr = 'no attribute') {
        console.log(`Action Set: ${name}, ${value}, ${attr}`)
    }
};

var dom = {
    addCss: function (msg) {
        console.log('Added ', msg);
    }
}

Promise.prototype.done = Promise.prototype.then;
Promise.prototype.always = Promise.prototype.finally;
Promise.prototype.fail = Promise.prototype.then;

var when = function (cb) {
    return new Promise((res, rej) => {
        setInterval(() => {
            try {
                let bool = cb();
                if (bool === true) {
                    res(true);
                }
            }
            catch(e){
                console.log(e);
            }
        }, 200)
    });
}

var devPolyFills = {
    when: when,
    actions: actions,
    dom: dom
}

export {
    devPolyFills
};