'use strict';

//Sample doodles query:
//https://www.google.com/doodles/json/2016/12?hl=en
const request = require('request-promise');
const waveCollapse = require('wave-collapse').defaultApi;
const funky = require('funky-sequencer');
const moment = require('moment');

process.on('unhandledRejection', (reason) => {
    console.error('rejection:', reason);
});

function getMonth (monthInfo) {
    const url = `https://www.google.com/doodles/json/${monthInfo.monthCursor.year()}/${monthInfo.monthCursor.month() + 1}?hl=en`;
    const promisedResults = request(url)
        .then(x => {
            return Promise.resolve(x);
        });
    const month = moment(monthInfo.monthCursor.format());

    return {
        promisedResults,
        renderedMonth: moment(month),
        monthCursor: moment(month).add(1, 'month')
    };
}

module.exports = function fetch (start, end) {
    const startDate = moment(start);
    const endDate = moment(end);
    const monthIterator = funky
        .startingWith(getMonth({monthCursor: moment(start)}))
        .repeat(getMonth)
        .while(monthInfo => monthInfo.renderedMonth.isSameOrBefore(endDate))
        .resolve(monthInfo => monthInfo.promisedResults);

    return waveCollapse.iterateOver(monthIterator())
        .map(p => JSON.parse(p))
        .flatten()
        .map(doodle => ({
            title: doodle.title,
            url: doodle.url,
            date: moment(doodle.run_date_array.map((v, i) => i === 1 ? v -1 : v))
        }))
        .filter(doodle => doodle.date.isSameOrAfter(startDate))
        .filter(doodle => doodle.date.isSameOrBefore(endDate))
        .reduce(waveCollapse.toArray)
        .then(results => {
            return results
                .sort((a, b) => a.date.isBefore(b.date) ? -1 : 1);
        });
};
