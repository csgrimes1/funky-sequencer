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

function createIterator (startValue, callback, predicate) {
    //Limit the boolean branches to this one rather than checking for
    //a predicate on every iteration.
    const theIterator = predicate
        ? createFiniteIterator(startValue, callback, predicate)
        : createInfiniteIterator(startValue, callback);

    //An iterator is an object with a next method.
    return () => theIterator;
}

function createIterableFunction (doCreateIterator, extra) {
    const ifunc = () => ({
        [Symbol.iterator]: doCreateIterator()
    });

    return Object.assign(ifunc, extra);
}

function resolver (iteratorCtor, resolver) {
    function *_resolver() { //eslint-disable-line
        const iterable = createIterableFunction(iteratorCtor, {});
        for (const x of iterable()) {
            yield resolver(x);
        }
    }

    return () => ({
        [Symbol.iterator]: _resolver
    });
}

function createWhileLambda (startValue, callback) {
    return (predicate) => {
        const iteratorCtor = () => createIterator(startValue, callback, predicate);
        const iterable = createIterableFunction(iteratorCtor, {
            resolve: (mapper) => resolver(iteratorCtor, mapper)
        });

        return iterable;
    };
}

function createSequencer (extendedApi = {}, value = undefined) {
    return Object.assign({
        repeat: (callback) => {
            return createIterableFunction(createIterator(value, callback), {
                while: createWhileLambda(value, callback)
            });
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

