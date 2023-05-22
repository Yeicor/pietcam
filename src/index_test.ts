import {addTest, assert, runTests} from "./utils/tests";
import addCreateTests from "./create_test"
import addLocateTests from "./locate_test"

(async () => {

    addTest("test", () => {
        assert(true, "true is true")
    })

    addCreateTests()
    addLocateTests()

    await runTests()
})()
