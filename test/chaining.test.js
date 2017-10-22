'use strict';

const chaining = require('../src/chaining');

const registry = {
    selectSpecies: {
        transformer: (inputTaxonomy, species) => inputTaxonomy[species],
        children: ['habitat', 'classification']
    },

    habitat: {
        transformer: (inputSpecies, continent) => inputSpecies[continent]
    },

    classification: {
        transformer: (inputSpecies, type) => inputSpecies[type]
    }
};

const iterableReg = {
    seeder: {
        transformer: (iterable) => iterable,
        children: ['skipWhile', 'takeWhile']
    },

    skipWhile: {
        transformer: function *(iterable, predicate) {
            let skipping = true;
            for (const item of iterable) {
                skipping = skipping && predicate(item);
                if (!skipping) {
                    yield item;
                }
            }
        },
        children: ['takeWhile']
    },

    takeWhile: {
        transformer: function *(iterable, predicate) {
            for (const item of iterable) {
                if (predicate(item)) {
                    yield item;
                } else {
                    break;
                }
            }
        }
    }
};

const taxonomy = {
    dog: {
        type: 'animal',
        'North America': 'domesticated'
    },
    oak: {
        'North America': 'northern latitudes',
        'Africa': 'none',
        type: 'plant'
    }
};

function *minutesOfDay () {
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute++) {
            yield hour * 100 + minute; //eslint-disable-line no-mixed-operators
        }
    }
}

module.exports = {
    beforeTest: t => {
        return t.createContext('generator nesting', 'generator nesting', null, 1000/*timeout/ms*/);
    },

    tests: {
        'start of chain': context => {
            const ss = chaining.composeChain('selectSpecies', registry);
            const func = ss(() => taxonomy, 'dog');

            context.deepEqual(func(), taxonomy.dog);
            context.equal(typeof func.classification, 'function');
        },

        'down chain': context => {
            const ss = chaining.composeChain('selectSpecies', registry);
            const func = ss(() => taxonomy, 'oak')
                .habitat('Africa');

            context.deepEqual(func(), 'none');
        },

        'iterable, 1 level': context => {
            const api = chaining.composeChain('seeder', iterableReg);
            const takeWhile = api(minutesOfDay)
                .takeWhile(minute => minute <= 130);

            const ar = Array.from(takeWhile());
            context.equal(ar.length, 91);
            context.equal(ar[0], 0);
            context.equal(ar[ar.length - 1], 130);
        },

        'iterable, deep': context => {
            const api = chaining.composeChain('seeder', iterableReg);
            const takeWhile = api(minutesOfDay)
                .skipWhile(minute => minute <= 100)
                .takeWhile(minute => minute <= 130);

            const ar = Array.from(takeWhile());
            context.equal(ar.length, 30);
            context.equal(ar[0], 101);
            context.equal(ar[ar.length - 1], 130);
        }
    }
};
