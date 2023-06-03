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

    addTestdataTests("e2e", (f: string) => f.indexOf("_out_create.png") !== -1, async (img: MyImageData) => {
        let curOutIndex = 0
        const result = await detectAndExecute(img, async () => {
            assert(false, "No input required")
            return 0
        }, (output: string | number) => {
            assert(typeof output === "string", "Expected output to be a string")
            assert(output === "Hello world!"[curOutIndex++], "Expected output to be 'Hello world!'")
        })
        assert(result.length >= 1, "Expected at least one result")
        assert(curOutIndex === "Hello world!".length, "Expected 12 outputs")
        return null
    }, "_out_extract")

    await runTests()
})()
