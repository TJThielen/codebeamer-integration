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

async function generateTestFromTestSet(testSetId){
    const response = await axios.post(
        `https://codebeamer.ptc.sourceallies.com/api/v3/trackers/10065/testruns/generatefromtestset`,
        {
            "testSetId": testSetId
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

export {createTestCase, addTestCaseToTestSet, addTestRunForTestSet, updateTestRunForTestSet };
// const cases = {
//     1818: {"status": "Passed", "name": "test passes should pass"},
//     1819: {"status": "Failed", "name": "test passes should fail"}
// }
// const resp = await addTestRunForTestSet(1658);
// const res = await updateTestRunForTestSet(resp.id, cases);
// console.log(res);
