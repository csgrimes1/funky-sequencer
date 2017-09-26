'use strict';

const target = require('../index');
const sinon = require('sinon');

module.exports = {
    beforeTest: t => {
        return t.createContext('shortname', 'long description', null, 1000/*timeout/ms*/);
    },

    tests: {
        'creates an iterable': context => {
            const iterable = target
                .startingWith(2)
                .repeat((i) => i + 1)
                .while((i) => i < 10);

            let lastItem,
                firstItem;
            for (const x of iterable) {
                firstItem = firstItem || x;
                lastItem = x;
            }
            context.equal(firstItem, 2);
            context.equal(lastItem, 9);
        },

        'can stop without iterating startingWith value': context => {
            const iterable = target
                .startingWith(2)
                .repeat((i) => i + 1)
                .while((i) => i < 2);

            let count = 0;
            for (const x of iterable) { //eslint-disable-line
                count++;
            }
            context.equal(count, 0);
        },

        'supports resolving each item': context => {
            const iterable = target
                .startingWith({value: 1000})
                .repeat((v) => Object.assign({}, {value: v.value - 1}))//eslint-disable-line
                .while((v) => v.value >= 0)
                .resolve((item) => item.value);
            const result = Array.from(iterable);
            context.equal(result[0], 1000);
            context.equal(result[result.length - 1], 0);
        },

        'supports when resolver callback': context => {
            const plantedValue = 'do not read this';
            const spy = sinon.spy(() => plantedValue);
            const iterable = target.when(true, spy);
            const result = Array.from(iterable);
            context.equal(result.length, 1);
            context.equal(result[0], plantedValue);
            context.equal(spy.callCount, 1);
        },

        'when never invokes callback on false condition': context => {
            const spy = sinon.spy();
            const iterable = target.when(false, spy);
            const result = Array.from(iterable);
            context.equal(result.length, 0);
            context.equal(spy.callCount, 0);
        }
    }
};
