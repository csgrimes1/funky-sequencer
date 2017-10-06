'use strict';

const funky = require('../../index');
const waveCollapse = require('wave-collapse').defaultApi;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function conditionalBlast(isBusinessHours, isWeekday, emailList) {
    console.log('Booleans:', isBusinessHours, isWeekday);
    return waveCollapse.combinations(emailList)
        .with(funky.when(isBusinessHours)())
        .with(funky.when(isWeekday)())
        .map(values => values[0])
        .filter(email => email.match(emailRegex));
}


const emailList = ['bad@...com', 'foo@bar.com', 'shakes@caffeine.com'];
const argPairs = [
    [true, true],
    [false, true],
    [true, false],
    [false, false]
];

argPairs.forEach(pair => {
    const result = Array.from(conditionalBlast(pair[0], pair[1], emailList).startSyncIterator())
        .map(item => item)

    console.log('\t==>', result);
    return true;
});
