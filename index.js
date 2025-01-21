const axios = require('axios');

const API_TOKEN = process.env.API_TOKEN;

async function updateTestRun(status) {
    const response = await axios.post(
        'https://codebeamer.ptc.sourceallies.com/api/v3/trackers/10067/testruns',
        {
            "status": status,
            "testCaseIds": [
                {
                    "id": 1657,
                    "name": "TJsTestCase",
                    "type": "TrackerItemReference"
                }
            ]
        },
        {
            headers: {
                Authorization: `Basic ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        },
    );
    console.log(response);
    return response;
}

updateTestRun();

module.exports = { updateTestRun };