'use strict';

const doodleFetcher = require('./doodle-fetcher');

function render (response, details, defaults = {start: '2016-12-25', end: '2017-01-16'}) {
const form = `
    <form method="POST" action="/">
        <div>
            <label for"start">Start:</label> <input type="text" id="start" name="start" value="${defaults.start}"/>
            &nbsp;<label for"end">End:</label> <input type="text" id="end" name="end" value="${defaults.end}"/>
            &nbsp;<input type="submit" value="OK" />
        </div>
    </form>
`;
    const text = `<html><head><title>Doodles!</title></head>\n\t<body> ${form}\n\t${details} \n\t</body>\n</html>`;
    response.send(text);
}


const table = `
    <table>
$rows
    </table>
`;
function renderDetails (doodles) {
    const trs = doodles.map(doodle => {
        return `\t<tr><th>${doodle.date}</th><th>${doodle.title}</th><td><img src="${doodle.url}"/></td></tr>`;
    });
    const rows = trs.join('\n');

    return table.replace(/\$rows/, rows);
}

function getHandler (request, response) {
    return render(response, '');
}

function postHandler (request, response) {
    const body = request.body;
    return doodleFetcher(body.start, body.end)
        .then(doodles => {
            render(response, renderDetails(doodles), body);
        })
        .catch(err => {
            response.status(500).send(err);
        });
}

module.exports = {
    getHandler,
    postHandler
};
