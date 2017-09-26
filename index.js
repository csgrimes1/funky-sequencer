'use strict';

function seedCallback (callback, startValue) {
    if (!startValue)
        return callback;
    //Set up initial callback for initial value
    const innerCallbacks = [
        () => startValue.value,
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

function createFiniteIterator (startValue, callback, predicate) {
    const finalCallback = seedCallback(callback, startValue);
    let currentValue = startValue;
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

function createIterable (startValue, callback, predicate) {
    //Limit the boolean branches to this one rather than checking for
    //a predicate on every iteration.
    const theIterator = predicate
        ? createFiniteIterator(startValue, callback, predicate)
        : createInfiniteIterator(startValue, callback);

    return () => theIterator;
}

function createSequencer (extendedApi = {}, value = undefined) {
    return Object.assign({
        repeat: (callback) => {
            const iterable = Object.assign({}, {
                [Symbol.iterator]: createIterable(value, callback),
                while: (predicate) => {
                    const iterable = {[Symbol.iterator]: createIterable(value, callback, predicate)};
                    return Object.assign({}, iterable, {
                        resolve: function *(resolver) {
                            for (const x of iterable) {
                                yield resolver(x);
                            }
                        }
                    });
                }
            });
            return iterable;
        }
    }, extendedApi);
}

function wrapValue (value) {
    return {value};
}

function createWhen () {
    return (condition, resolver = () => true) => createSequencer({}, wrapValue(0))
        .repeat((i) => i + 1)
        .while((i) => condition && i < 1)
        .resolve(resolver);
}

module.exports = createSequencer({
    startingWith: (value) => createSequencer({}, wrapValue(value)),
    when: createWhen()
});
