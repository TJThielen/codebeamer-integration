const { createTestCase, addTestCaseToTestSet, updateTestRunForTestSet, addTestRunForTestSet } = require('.');

let testSetId = -1;
const testCases = {};

describe('#1658 test cases', () => {
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
            await updateTestRunForTestSet(response.id, testCases);
        }
    })

    test('should pass', () => {
        expect(false).toBe(false);
    });

    test('should fail', () => {
        expect(false).toBe(true);
    });
});
