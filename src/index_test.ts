import {addTest, assert, runTests} from "./utils/tests";
import addCreateTests, {addTestdataTests} from "./create_test"
import addLocateTests from "./locate_test"
import addInterpreterTests from "./interpreter_test"
import {MyImageData} from "./utils/image";
import {detectAndExecute} from "./index";

(async () => {

    addTest("test", () => {
        assert(true, "true is true")
    })

    addCreateTests()
    addLocateTests()
    addInterpreterTests()

    addTestdataTests("e2e", (f: string) => f.indexOf("_out_create.png") !== -1, (img: MyImageData) => {
        const result = detectAndExecute(img, () => {
            assert(false, "No input required")
            return 0
        })
        assert(result.length >= 1, "Expected at least one result")
        assert(result[0].outputString === "Hello world!", "Expected output to be 'Hello world!'")
        return null
    }, "_out_extract")

    await runTests()
})()
