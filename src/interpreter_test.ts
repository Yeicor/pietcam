import {assert} from "./utils/tests";
import {MyImageData} from "./utils/image";
import {addTestdataTests} from "./create_test";
import {newInterpreter, runInterpreter} from "./interpreter";

async function runInterpreterHelloWorld(img: MyImageData) {
    let curOutIndex = 0
    let interpretation = await runInterpreter(newInterpreter(img), async () => {
        assert(false, "No input required")
        return 0
    }, (output: string|number) => {
        assert(typeof output === "string", "Expected output to be a string")
        assert(output === "Hello world!"[curOutIndex++], "Expected output to be 'Hello world!'")
        console.log("Output", output)
    })
    console.debug("Interpretation", interpretation)
    assert(curOutIndex === "Hello world!".length, "Expected 12 outputs")
    return null;
}

export default () => {
    addTestdataTests("interpret", (f: string) => f.indexOf("_out") === -1, async (img: MyImageData) => {
        return await runInterpreterHelloWorld(img)
    }, "_out_extract")
    addTestdataTests("interpret-e2e", (f: string) => f.indexOf("_out_extract.png") !== -1, async (img: MyImageData) => {
        return await runInterpreterHelloWorld(img)
    }, "_out_extract")
}