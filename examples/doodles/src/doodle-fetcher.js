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

function getMonth (month) {
    //add is mutable, so construct new moment from string format.
    return moment(month.format()).add(1, 'month');
}

function doHttpQuery (month) {
    const url = `https://www.google.com/doodles/json/${month.year()}/${month.month() + 1}?hl=en`;
    console.log(`Starting HTTP request to [${url}].`);
    return request(url)
        .then(x => {
            return Promise.resolve(x);
        });
}

module.exports = function fetch (start, end) {
    const startDate = moment(start);
    const endDate = moment(end);
    const monthIterator = funky
        .startingWith(moment(start).date(1))
        .repeat(getMonth)
        .while(monthStart => monthStart.isSameOrBefore(endDate))
        .resolve(doHttpQuery);

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
