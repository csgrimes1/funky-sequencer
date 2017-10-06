'use strict';

const funky = require('../../index');
const waveCollapse = require('wave-collapse').defaultApi;

const sequence = funky
    .startingWith({a: 0, b: 1})
     .repeat(f => ({a: f.b, b: f.a + f.b}))
     .while(f => f.a < 1000)
     .resolve(f => f.a);

waveCollapse.iterateOver(sequence())
    .take(6)
    .reduce(waveCollapse.toArray)
    .then(result => {
        console.log('result:', result);
    });

waveCollapse.iterateOver(sequence())
    .skip(1)
    .take(10)
    .reduce(waveCollapse.toArray)
    .then(result => {
        console.log('result:', result);
    });
