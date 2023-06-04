import {ImageSource, OpenImageSource} from "./imageSource";
import {Detection, extract, locate, MyImageData, newInterpreter, runInterpreter} from "pietcam/src";

export default async function detectAndExecutePietProgram(imageSourceProvider: ImageSource, exeOverlay: HTMLCanvasElement, exeBtnRun: HTMLButtonElement, exeBtnCancel: HTMLButtonElement, exeInterpreter: HTMLElement, interpreterOutput: HTMLPreElement, interpreterInput: HTMLInputElement, exeInterpreterStatus: HTMLSpanElement, exeInterpreterBackButton: HTMLButtonElement) {
    // Add a listener to the stop button
    let cancelListener;
    let exeListener;
    let interval: number | null = null;
    const imageSource = await imageSourceProvider.start()
    cancelListener = async () => {
        await imageSource.stop();
        exeBtnRun.removeEventListener("click", exeListener);
        exeBtnCancel.removeEventListener("click", cancelListener);
        if (interval) clearInterval(interval);
    };
    exeBtnCancel.addEventListener("click", cancelListener);

    // Make sure run is not enabled until we have a valid program detected
    exeBtnRun.setAttribute("disabled", "true");
    interpreterInput.setAttribute("disabled", "true");
    exeListener = async () => {
        exeBtnRun.setAttribute("disabled", "true");
        exeBtnCancel.setAttribute("disabled", "true");
        if (interval != null) clearInterval(interval);

        exeInterpreter.style.display = "flex";
        let backListener;
        backListener = async () => {
            exeInterpreter.style.display = "none";
            exeInterpreterBackButton.removeEventListener("click", backListener);
            exeInterpreterStatus.innerText = "stopped";
            // Recursively call this function to start over
            exeBtnCancel.removeAttribute("disabled");
            await imageSource.stop();
            await detectAndExecutePietProgram(imageSourceProvider, exeOverlay, exeBtnRun, exeBtnCancel, exeInterpreter, interpreterOutput, interpreterInput, exeInterpreterStatus, exeInterpreterBackButton);
        }
        exeInterpreterBackButton.addEventListener("click", backListener);

        exeInterpreterStatus.innerText = "running";
        interpreterOutput.innerText = "";
        interpreterInput.removeAttribute("disabled");
        await executePietProgram(interpreterOutput, interpreterInput);
        exeInterpreterStatus.innerText = "completed";
        interpreterInput.setAttribute("disabled", "true");
    }
    exeBtnRun.addEventListener("click", exeListener);

    // TODO: Add video element behind canvas overlay instead of redrawing the image every frame

    await detectionLoopContents(imageSource, exeOverlay, exeBtnRun);
}

let lastImageData: MyImageData | null = null;
let lastDetection: Detection | null = null;

async function detectionLoopContents(imageSource: OpenImageSource, exeCanvas: HTMLCanvasElement, exeBtnRun: HTMLButtonElement) {
    // Get and draw a frame to the canvas
    let frame = await imageSource.getFrame();
    exeCanvas.width = frame.width;
    exeCanvas.height = frame.height;
    let context = exeCanvas.getContext("2d");
    context.putImageData(frame, 0, 0);

    // Detect the program in the initial frame
    lastDetection = await detectPietProgram(frame);
    if (lastDetection) {
        // Draw a quad around the program
        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(lastDetection.location.topLeft.x, lastDetection.location.topLeft.y);
        context.lineTo(lastDetection.location.topRight.x, lastDetection.location.topRight.y);
        context.lineTo(lastDetection.location.alignmentPattern.x, lastDetection.location.alignmentPattern.y);
        context.lineTo(lastDetection.location.bottomLeft.x, lastDetection.location.bottomLeft.y);
        context.lineTo(lastDetection.location.topLeft.x, lastDetection.location.topLeft.y);
        context.stroke();

        // Enable the run button
        exeBtnRun.removeAttribute("disabled");
    } else {
        // Disable the run button
        exeBtnRun.setAttribute("disabled", "true");
    }

    // If we are processing a video, loop
    if (imageSource.isVideo && imageSource.isOpen()) {
        const loopTimeout = lastDetection ? 1000 : 100;
        setTimeout(async () => await detectionLoopContents(imageSource, exeCanvas, exeBtnRun), loopTimeout);
    }
}

async function detectPietProgram(imageData: ImageData): Promise<Detection | null> {
    let img = MyImageData.fromImageWithAlpha(imageData.width, imageData.height, imageData.data);
    lastImageData = img;
    let maybeOkErr = new Error("Program may be OK, as it is asking for input");
    // Locate the program(s) in the camera image
    let detections = await filterAsync(locate(img), async detection => {
        let result: { steps: number } = {steps: 0};
        try {
            let possibleProgram = extract(img, detection)
            let interpreter = newInterpreter(possibleProgram)
            let maxSteps = 1000;
            result = await runInterpreter(interpreter, () => {
                throw maybeOkErr
            }, (_) => {
            }, maxSteps);
            if (result.steps < maxSteps) {
                return true // We successfully executed the program!
            }
        } catch (e) {
            if (e === maybeOkErr) {
                if (result.steps > 5) // Reduce false positives a bit (at the cost of false negatives)
                    return true // We successfully executed the program! (but it is asking for input)
                else
                    e = new Error("Program is asking for input in less than 5 steps, which is suspicious")
            }
            console.info("Ignoring possible program detection due to error:", e)
        }
        return false
    });
    if (detections.length === 0) {
        return null
    } else {
        console.warn("VALID PROGRAM DETECTED!")
        return detections[0]
    }
}

async function filterAsync(arr: Array<any>, callback: (item: any) => Promise<boolean>): Promise<Array<any>> {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
}

async function executePietProgram(interpreterOutput: HTMLPreElement, interpreterInput: HTMLInputElement) {
    let img = lastImageData;
    let detection = lastDetection;
    if (!img || !detection) {
        return;
    }
    let possibleProgram = extract(img, detection);
    let interpreter = newInterpreter(possibleProgram);
    let maxSteps = 10000;
    let result = await runInterpreter(interpreter, () => {
        function pollInputChar() {
            let nextChar = interpreterInput.value[0];
            interpreterInput.value = interpreterInput.value.slice(1);
            return nextChar.charCodeAt(0);
        }

        // Retrieve cached input from the user
        if (interpreterInput.value.length > 0) {
            return Promise.resolve(pollInputChar());
        }
        // Wait for input from the user
        return new Promise((resolve) => {
            let msg = "<waiting for input...>";
            interpreterOutput.innerText += msg;
            let inputListener;
            inputListener = () => {
                interpreterInput.removeEventListener("input", inputListener);
                interpreterOutput.innerText = interpreterOutput.innerText.substring(0, interpreterOutput.innerText.length - msg.length);
                resolve(pollInputChar());
            }
            interpreterInput.addEventListener("input", inputListener);
        })
    }, (output) => {
        if (typeof output === "number") {
            interpreterOutput.innerText += "0x" + output.toString(16) + " "; // Somewhat usable hex output
        } else {
            interpreterOutput.innerText += output;
        }
    }, maxSteps);
    console.log(result);
    if (result.steps < maxSteps) {
        console.log("Program executed successfully");
    } else {
        console.log("Program did not terminate");
    }
}
