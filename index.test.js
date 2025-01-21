const { updateTestRun } = require(".");

describe('My Tests', () => {
    afterAll(async () => {
        console.log('All tests are finished.');
        for (const result of testResults) {
        const { status } = result;
        await updateTestRun(status); // Call your Codebeamer API update
        }
    });

    test('should return true', () => {
        expect(true).toBe(true);
    });
});
