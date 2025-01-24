import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_TOKEN = process.env.API_TOKEN;

async function addTestRunForTestCase(id) {
    const response = await axios.post(
        'https://codebeamer.ptc.sourceallies.com/api/v3/trackers/10067/testruns',
        {
            "testCaseIds": [
                {
                    "id": id,
                    "name": "TJs Test Set",
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
    return response.data;
}

async function addTestRunForTestSet(id) {
    const response = await axios.post(
        'https://codebeamer.ptc.sourceallies.com/api/v3/trackers/10067/testruns',
        {
            "testSetIds": [
                {
                    "id": id,
                    "name": "TJs Test Set",
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
    return response.data;
}

async function updateTestRunForTestSet(id, statuses) {
    const cases = [];
    for (let caseId in statuses) {
        const status = statuses[caseId].status;
        const name = statuses[caseId].name;
        const passed = {
            "testCaseReference": {
              "id": caseId,
              "name": name,
              "type": "TrackerItemReference"
            },
            "result": "PASSED",
            "conclusion": "Successful run",
            "runTime": 10
        };
    
        const failed = {
            "testCaseReference": {
                "id": caseId,
                "name": name,
                "type": "TrackerItemReference"
            },
            "result": "FAILED",
            "conclusion": "Failed run",
            "runTime": 10
        }
        const data = status == "Passed" ? passed : failed;
        cases.push(data);
    }

    const response = await axios.put(
        `https://codebeamer.ptc.sourceallies.com/api/v3/testruns/${id}`,
        {
            "updateRequestModels": cases,
            "parentResultPropagation": true
        },
        {
            headers: {
                Authorization: `Basic ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        },
    );
    return response;
}

async function createTestCase(name){
    const response = await axios.post(
        'https://codebeamer.ptc.sourceallies.com/api/v3/trackers/10064/items',
        {
            "name": name,
            "priority": {
              "id": 3,
              "name": "Normal",
              "type": "ChoiceOptionReference"
            },
            "status": {
              "id": 1,
              "name": "New",
              "type": "ChoiceOptionReference"
            },
            "customFields": [
              {
                "fieldId": 10003,
                "name": "Reusable",
                "value": false,
                "type": "BoolFieldValue"
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
    return response.data;
}

async function addTestCaseToTestSet(testSetId, testCaseId){
    let testSet = await getItem(testSetId);
    const testCase = [{
        "fieldId": 1000001, 
        "values": [
            {
                "id": testCaseId,
                "type": "TrackerItemReference"
            }
        ], 
        "type": 'ChoiceFieldValue'
    }]

    if(testSet.customFields[2] == undefined){
        testSet.customFields[2] = {
            "fieldId": 1000000,
            "name": "Test Cases",
            "values": [],
            "type": "TableFieldValue"
          };
    }
    testSet.customFields[2].values.push(testCase);

    const response = await axios.put(
        `https://codebeamer.ptc.sourceallies.com/api/v3/items/${testSetId}`,
        testSet
        ,
        {
            headers: {
                Authorization: `Basic ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        },
    );
    return response.data;
}

async function getTracker(trackerId){
    const response = await axios.get(
        `https://codebeamer.ptc.sourceallies.com/api/v3/trackers/${trackerId}/items`,
        {
            headers: {
                Authorization: `Basic ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        },
    );
    return response;
}

async function getItem(itemId){
    const response = await axios.get(
        `https://codebeamer.ptc.sourceallies.com/api/v3/items/${itemId}`,
        {
            headers: {
                Authorization: `Basic ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        },
    );
    return response.data;
}

// async function generateTestFromTestSet(testSetId){
//     const response = await axios.post(
//         `https://codebeamer.ptc.sourceallies.com/api/v3/trackers/10065/testruns/generatefromtestset`,
//         {
//             "testSetId": testSetId
//         },
//         {
//             headers: {
//                 Authorization: `Basic ${API_TOKEN}`,
//                 'Content-Type': 'application/json',
//             },
//         },
//     );
//     return response.data;
// }

function integrateWithCodebeamer(){
    let testSetId = -1;
    const testCases = {};
    afterEach(async () => {
        //find set id
        const testState = expect.getState();
        const words = testState.currentTestName.split(' ');
        testSetId = parseInt(words[0].slice(1));
        const testName = words.slice(1).join(" ");

        //create test case
        const response = await createTestCase(testName);
        const testCaseId = response.id;

        //add to test set
        await addTestCaseToTestSet(testSetId, testCaseId);

        //update test case status locally
        const status = testState.numPassingAsserts === testState.assertionCalls ? 'Passed' : 'Failed';
        testCases[testCaseId] = {"status": status, "name": testName};
    });

    afterAll(async () => {
        //create test run
        if(testSetId != -1){
            const response = await addTestRunForTestSet(testSetId);
            console.log(response);
            await new Promise(resolve => {setTimeout(resolve, 1000)});
            await updateTestRunForTestSet(response.id, testCases);
        }
    })
}
export {integrateWithCodebeamer};
// const cases = {
//     1818: {"status": "Passed", "name": "test passes should pass"},
//     1819: {"status": "Failed", "name": "test passes should fail"}
// }
// const resp = await addTestRunForTestSet(1658);
// const res = await updateTestRunForTestSet(resp.id, cases);
// console.log(res);

