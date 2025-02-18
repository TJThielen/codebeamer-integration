import axios from 'axios';
import dotenv from 'dotenv';
import { parseStringPromise } from "xml2js";
import fs from "fs/promises";

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
            "runTime": parseInt(statuses[caseId].runTime),
        };
    
        const failed = {
            "testCaseReference": {
                "id": caseId,
                "name": name,
                "type": "TrackerItemReference"
            },
            "result": "FAILED",
            "conclusion": "Failed run",
            "runTime": parseInt(statuses[caseId].runTime),
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


async function createReport(){
    const report = {
        cbQl: 'project.id IN (7)',
        name: 'TJs Api Generated Report 2',
        addedPermissions: [
            {
                access: "READ",
                project: { id: 7, type: "ProjectReference" },
                role: { id: 1, name: 'Project Admin', type: 'RoleReference' },
            }
        ],
        columns: [
            {
              field: { id: 3, name: 'Summary', type: 'FieldReference' },
              columnIndex: 0
            },
            {
              field: { id: 7, name: 'Status', type: 'FieldReference' },
              columnIndex: 1
            },
            {
              field: { id: 2, name: 'Priority', type: 'FieldReference' },
              columnIndex: 2
            },
            {
              field: { id: 5, name: 'Assigned to', type: 'FieldReference' },
              columnIndex: 3
            },
            {
              field: { id: 75, name: 'Modified by', type: 'FieldReference' },
              columnIndex: 4
            },
            {
              field: { id: 74, name: 'Modified on/at', type: 'FieldReference' },
              columnIndex: 5
            },
            {
              field: { id: 6, name: 'Submitted by', type: 'FieldReference' },
              columnIndex: 6
            },
            {
              field: { id: 4, name: 'Submitted on/at', type: 'FieldReference' },
              columnIndex: 7
            }
        ],
        showAllChildren: false
    };

    const response = await axios.post(
        'https://codebeamer.ptc.sourceallies.com/api/v3/reports',
        report,
        {
            headers: {
                Authorization: `Basic ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        },
    );
    return response;
}

async function getReportResults(id){
    const response = await axios.get(
        `https://codebeamer.ptc.sourceallies.com/api/v3/reports/${id}/results`,
        {
            headers: {
                Authorization: `Basic ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        },
    );
    return response.data;
}

async function getReportItems(id){
    const response = await axios.get(
        `https://codebeamer.ptc.sourceallies.com/api/v3/reports/${id}/items`,
        {
            headers: {
                Authorization: `Basic ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        },
    );
    return response.data;
}

async function getRoles(){
    const response = await axios.get(
        `https://codebeamer.ptc.sourceallies.com/api/v3/roles`,
        {
            headers: {
                Authorization: `Basic ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        },
    );
    return response.data;
}

export async function readXML(filePath) {
  const data = await fs.readFile(filePath, "utf-8");
  return parseStringPromise(data);
}

async function integrateWithCodebeamer(){
    // afterAll(async () => {
        let testSetId = -1;
        const testCases = {};

        //read report
        const xml = await readXML("./reports/test-report.xml");
        const xmlTestCases = xml.testsuites.testsuite[0].testcase;

        xmlTestCases.forEach(async test => {
            //find set id
            const words = test.$.classname.split(' ');
            testSetId = parseInt(words[0].slice(1));
            const testName = words.slice(1).join(" ");

            //check if test set already contains test case
            const existingTestSet = await getItem(testSetId);
            const existingTestSetCustomIds = existingTestSet.customFields;
            const existingTestCases = existingTestSetCustomIds.find(item => item.name === "Test Cases");
            let createTestsFlag = true;
            let testCaseId = -1;

            if(existingTestCases){
                const existingTestCaseNames = existingTestCases.values.flat().map(item => item.values[0]);
                const existingTestCase = existingTestCaseNames.find(val => val.name === testName);
                if(existingTestCase != undefined){
                    createTestsFlag = false;
                    testCaseId = existingTestCase.id;
                    console.log(`Test Already Exists: "${testName}", not creating a new one`);
                }
            }

            if(createTestsFlag){
                //create test case
                const response = await createTestCase(testName);
                testCaseId = response.id;

                //add to test set
                await addTestCaseToTestSet(testSetId, testCaseId);
            }

            if(test.failure == undefined){
                testCases[testCaseId] = {"status": "Passed", "name": testName, "runTime": test.$.time};
            } else {
                testCases[testCaseId] = {"status": "Failed", "name": testName, "runTime": test.$.time};
            }
        })

        //create test run
        if(testSetId != -1){
            const response = await addTestRunForTestSet(testSetId);
            await new Promise(resolve => {setTimeout(resolve, 1000)});
            await updateTestRunForTestSet(response.id, testCases);
        }
    // });
}

export {integrateWithCodebeamer};


// console.log(await createReport());
// const res = await getReportResults(31033);
// const res = await getRoles();
// const res = await createReport();
// const res = await getItem(6845);

// console.log(res);

integrateWithCodebeamer();