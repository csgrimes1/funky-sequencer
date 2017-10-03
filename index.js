'use strict';

function seedCallback (callback, startValue) {
    if (!startValue)
        return callback;
    //Set up initial callback for initial value
    const innerCallbacks = [
        () => startValue,
        callback
    ];
    let index = 0;
    return (currentValue) => {
        const result = innerCallbacks[index](currentValue);
        index = index || 1;
        return result;
    };
}

function createInfiniteIterator (startValue, callback) {
    const finalCallback = seedCallback(callback, startValue);
    let currentValue = startValue;
    return {
        next: () => {
            currentValue = finalCallback(currentValue);
            return {
                value: currentValue
            };
        }
    };
}

function createBooleanIterator (startValue) {
    const values = startValue !== undefined ? [startValue] : [];
    let index = -1;
    return {
        next: () => {
            const currentValue = values[++index];
            return {
                value: currentValue,
                done: index >= values.length
            };
        }
    };
}

function createFiniteIterator (startValue, callback, predicate) {
    const finalCallback = seedCallback(callback, startValue);
    let currentValue;
    return {
        next: () => {
            currentValue = finalCallback(currentValue);
            if (!predicate(currentValue)) {
                return {done: true};
            }
            return {
                value: currentValue
            };
        }
    };
}

function wrapValue (value) {
    return {value};
}

function createWhen () {
    return (condition, resolver = () => true) => entryPoint({}, wrapValue(0))
        .repeat((i) => i + 1)
        .while((i) => condition && i < 1)
        .resolve(resolver);
}


function selectIterator (options) {
    if (options.predicate) {
        return createFiniteIterator(options.startValue, options.callback, options.predicate);
    }
    if (options.callback) {
        return createInfiniteIterator(options.startValue, options.callback);
    }

    return createBooleanIterator(options.startValue);

    return function *() {
        if (options.startValue)
            yield options.startValue;
    }
}

/**
 * The high order function for the API.
 * @param options Object with properties predicate, callback, startValue
 * @param mergeApi  Object in which the values are functions with signature
 *  (options, ...) => (() => iterable)
 * @returns A function returning a function returning an iterable. The
 * function's properties are each function in mergeApi with the leftmost
 * parameter is curried away.
 */
function createFuncReturningIterable (options, mergeApi = {}) {
    const doCreateIterator = () => selectIterator(options);

    //Final result. A function that is iterable when called.
    const ifunc = () => ({
        [Symbol.iterator]: doCreateIterator
    });

    //Merge properties onto the function for when it's not called.
    //Note: calling anything in the API fluently would require (...)().
    //The final () is used later.
    const extra = Object.getOwnPropertyNames(mergeApi)
        .map(k => [k, mergeApi[k]])
        .map(pair => {
            const func = pair[1];
            return {
                [pair[0]]: function () {
                    const finalArgs = [options].concat(Array.from(arguments));
                    return func.apply(ifunc, finalArgs);
                }
            }
        });
    return Object.assign.apply(null, [ifunc].concat(extra));
}


function merge (first, second) {
    return Object.assign({}, first, second);
}

function resolver () {
    return function (options, mapper) {
        const self = this;
        return function *(options) {
            for (const x of self()) {
                yield mapper(x);
            }
        };
    };

    return (options, mapper) => createFuncReturningIterable(options, {});
}

function whiler () {
    return (options, predicate) => createFuncReturningIterable(merge(options, {predicate}), {
        resolve: resolver()
    });
}

function repeater () {
    return (options, callback) =>
        createFuncReturningIterable(merge(options, {callback}), {
            while: whiler(),
            resolve: resolver()
        });
}

function entryPoint () {
    return createFuncReturningIterable({}, {
        startingWith: (options, value) =>
            createFuncReturningIterable(merge(options, {startValue: value}), {repeat: repeater()}),
        repeat: repeater()
    });
}

module.exports = Object.assign(entryPoint(), {
    when: createWhen()
});
