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

function addTest(name: string, fn: () => void, addIndex = testArray.length) {
    testArray.splice(addIndex, 0, {name: name, fn: fn});
}

async function runTests() {
    assert(typeof window == "undefined", "runTests() was not designed for the browser");
    while (testArray.length > 0) {
        const c = testArray.shift();
        try {
            console.log(grey + "running" + cancel + ": " + c.name);
            const start = performance.now()
            const res = c.fn();
            if (res && res.then instanceof Function) {
                await res;
            }
            console.log(green + "done in " + (performance.now() - start).toFixed(2) + "ms" + cancel + ": " + c.name);
        } catch (err) {
            console.log(red + "fail in " + (performance.now() - start).toFixed(2) + "ms" + cancel + ": " + grey + c.name + "\n\t" + yellow + err.toString() + cancel);
            console.log(err.stack);
            globalThis["process"] && globalThis["process"].exit(1)
        }
    }
}

export {addTest, runTests, assert};