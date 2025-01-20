// index.test.js
const { returnTrue } = require('./index');

// Passing test: Should return true
test('returnTrue should return true', () => {
    expect(returnTrue()).toBe(true);
});

// Failing test: Should return false (example of a failing case)
test('returnTrue should return false', () => {
    expect(returnTrue()).toBe(false);
});
