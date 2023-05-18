import {addTest, assert, runTests} from "./utils/tests";
import addCreateTests from "./create_test"

addTest("test", () => {
    assert(true, "true is true")
})

addCreateTests()

runTests()
