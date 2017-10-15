'use strict';

const doodleFetcher = require('./doodle-fetcher');

const form = `
    <form method="POST" target="/">
        <div>
            <label for"start">Start:</label> <input type="text" id="start" name="start" value="2016-12-01"/>
            &nbsp;<label for"end">End:</label> <input type="text" id="end" name="end" value="2017-01-15"/>
            &nbsp;<input type="submit" value="OK" />
        </div>
    </form>
`;

function render (response, details) {
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
                // console.log('doodles:', doodles)
            render(response, renderDetails(doodles));
        });
}

module.exports = {
    getHandler,
    postHandler
};
