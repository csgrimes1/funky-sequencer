'use strict';

const chaining = require('./src/chaining');

const definitions = {
    root: {
        transformer: (x) => x,
        children: ['startingWith', 'repeat']
    },

    startingWith: {
        transformer: (_, startingValue) => {
            return [startingValue]
        },
        children: ['repeat']
    },

    repeat: {
        children: ['while', 'resolve'],
        transformer: (inputIterable, itemGenerator) => {
            const startValue = Array.from(inputIterable)[0];
            const iterator = () => {
                let value = startValue;
                return {
                    next: () => {
                        const retval = {value};
                        value = itemGenerator(value);
                        return retval;
                    }
                };
            };
            return {[Symbol.iterator]: iterator};
        }
    },

    while: {
        children: ['resolve'],
        transformer: function *(innerIterable, predicate) {
            let index = 0;
            for (const item of innerIterable) {
                if (!predicate(item, index++)) {
                    return;
                }
                yield item;
            }
        }
    },

    resolve: {
        children: [],
        transformer: function *(innerIterable, mapper) {
            for (const item of innerIterable) {
                yield mapper(item);
            }
        }
    }
};

function createWhen () {
    return (condition, resolver = () => true) => entryPoint()
        .startingWith(0)
        .repeat((i) => i + 1)
        .while((i) => condition && i < 1)
        .resolve(resolver);
}

const entryPoint = chaining.composeChain('root', definitions);

module.exports = Object.assign(entryPoint(), {
    when: createWhen()
});
