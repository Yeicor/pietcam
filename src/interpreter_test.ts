import {assert} from "./utils/tests";
import {MyImageData} from "./utils/image";
import {addTestdataTests} from "./create_test";
import {newInterpreter, runInterpreter} from "./interpreter";

function runInterpreterHelloWorld(img: MyImageData) {
    let interpretation = runInterpreter(newInterpreter(img), () => {
        assert(false, "No input required")
        return 0
    })
    console.debug("Interpretation", interpretation)
    assert(interpretation.outputString() === "Hello world!", "Output should be 'Hello world!'")
    return null;
}

export default () => {
    addTestdataTests("interpret", (f: string) => f.indexOf("_out") === -1, (img: MyImageData) => {
        return runInterpreterHelloWorld(img)
    }, "_out_extract")
    addTestdataTests("interpret-e2e", (f: string) => f.indexOf("_out_extract.png") !== -1, (img: MyImageData) => {
        return runInterpreterHelloWorld(img)
    }, "_out_extract")
}