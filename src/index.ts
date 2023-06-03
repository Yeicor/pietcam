import {extract, locate} from "./locate";
import {newInterpreter, PietResult, runInterpreter} from "./interpreter";
import {MyImageData} from "./utils/image";

export {create} from "./create";
export {locate, extract, Detection} from "./locate";
export {PietResult, newInterpreter, runInterpreter} from "./interpreter";
export {MyImageData} from "./utils/image";

/** Utility to detect and execute all Piet programs constructed by [create] located in the given image. */
export async function detectAndExecute(img: MyImageData, input: (isChar: boolean) => Promise<number>, output: (a: string|number) => void, maxSteps: number = 10000, maxPrograms: number = 1): Promise<Array<PietResult>> {
    // Locate the program(s) in the camera image
    let detections = locate(img);

    // Iterate over all possible detections, trying to extract and execute them (only the first valid one is returned)
    let allResults = []
    for (let i = 0; i < detections.length; i++) {
        try {
            let possibleProgram = extract(img, detections[i])
            let interpreter = newInterpreter(possibleProgram)
            let result = await runInterpreter(interpreter, input, output, maxSteps);
            allResults.push(result)
            if (allResults.length >= maxPrograms) {
                break
            }
        } catch (e) {
            console.log("Failed to execute program", e)
        }
    }

    return allResults
}