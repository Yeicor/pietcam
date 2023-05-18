/**
 * @file addTest.ts - A simple test framework without dependencies.
 */

function assert(condition: boolean, message: string) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

const green = "\x1b[32;1m",
    cancel = "\x1b[0m",
    yellow = "\x1b[33;1m",
    grey = "\x1b[37;0m",
    red = "\x1b[31;1m";

const testArray = [];

function addTest(name: string, fn: () => void) {
    testArray.push({name: name, fn: fn});
}


function runTests() {
    assert(typeof window == "undefined", "runTests() was not designed for the browser");
    for (const c of testArray) {
        try {
            console.log(grey + "running" + cancel + ": " + c.name);
            c.fn();
            console.log(green + "done" + cancel + ": " + c.name);
        } catch (err) {
            console.log(red + "fail" + cancel + ": " + grey + c.name + "\n\t" + yellow + err.toString() + cancel);
            require("process").exit(1)
        }
    }
}

export {addTest, runTests, assert};