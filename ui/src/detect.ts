import {ImageSource} from "./imageSource";
import {Detection, extract, locate, MyImageData, newInterpreter, runInterpreter} from "pietcam/src";

export default function detectAndExecutePietProgram(imageSource: ImageSource, exeOverlay: HTMLCanvasElement, exeBtnRun: HTMLButtonElement, exeBtnCancel: HTMLButtonElement, exeInterpreter: HTMLElement, interpreterOutput: HTMLPreElement, interpreterInput: HTMLInputElement, exeInterpreterBackButton: HTMLButtonElement) {
    // Add a listener to the stop button
    let cancelListener;
    let exeListener;
    let interval: number | null = null;
    cancelListener = () => {
        imageSource.stop();
        exeBtnRun.removeEventListener("click", exeListener);
        exeBtnCancel.removeEventListener("click", cancelListener);
        if (interval) clearInterval(interval);
    };
    exeBtnCancel.addEventListener("click", cancelListener);

    // Make sure run is not enabled until we have a valid program detected
    exeBtnRun.setAttribute("disabled", "true");
    exeListener = () => {
        exeBtnRun.setAttribute("disabled", "true");
        exeBtnCancel.setAttribute("disabled", "true");
        if (interval) clearInterval(interval);

        exeInterpreter.style.display = "flex";
        let backListener;
        backListener = () => {
            exeInterpreter.style.display = "none";
            exeInterpreterBackButton.removeEventListener("click", backListener);
        }
        exeInterpreterBackButton.addEventListener("click", backListener);

        executePietProgram(interpreterOutput, interpreterInput);
    }
    exeBtnRun.addEventListener("click", exeListener);

    // TODO: Add video element behind canvas overlay instead of redrawing the image every frame

    if (imageSource.isVideo) {
        interval = setInterval(() => {
            detectionLoopContents(imageSource, exeOverlay, exeBtnRun);
        }, 1000 / 30); // Will actually be much slower: lots of work to do
    } else {
        detectionLoopContents(imageSource, exeOverlay, exeBtnRun);
    }
}

let lastImageData: MyImageData | null = null;
let lastDetection: Detection | null = null;

function detectionLoopContents(imageSource: ImageSource, exeCanvas: HTMLCanvasElement, exeBtnRun: HTMLButtonElement) {
    // Get and draw the initial frame to the canvas
    let frame = imageSource.getFrameCPU();
    exeCanvas.width = frame.width;
    exeCanvas.height = frame.height;
    let context = exeCanvas.getContext("2d");
    context.putImageData(frame, 0, 0);

    // Detect the program in the initial frame
    lastDetection = detectPietProgram(frame);
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
}

function detectPietProgram(imageData: ImageData): Detection | null {
    let img = MyImageData.fromImageWithAlpha(imageData.width, imageData.height, imageData.data);
    lastImageData = img;
    let maybeOkErr = new Error("Program may be OK, as it is asking for input");
    // Locate the program(s) in the camera image
    let detections = locate(img).filter(detection => {
        try {
            let possibleProgram = extract(img, detection)
            let interpreter = newInterpreter(possibleProgram)
            let maxSteps = 10000;
            let result = runInterpreter(interpreter, () => {
                throw maybeOkErr
            }, (_) => {}, maxSteps);
            if (result.steps < maxSteps) {
                return true // We successfully executed the program!
            }
        } catch (e) {
            if (e === maybeOkErr) {
                return true // We successfully executed the program! (but it is asking for input)
            }
            console.error(e)
        }
        return false
    });
    if (detections.length === 0) {
        return null
    } else {
        return detections[0]
    }
}

function executePietProgram(interpreterOutput: HTMLPreElement, interpreterInput: HTMLInputElement) {
    let img = lastImageData;
    let detection = lastDetection;
    if (!img || !detection) {
        return;
    }
    let possibleProgram = extract(img, detection);
    let interpreter = newInterpreter(possibleProgram);
    let maxSteps = 10000;
    let result = runInterpreter(interpreter,  () => {
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
            let inputListener;
            inputListener = () => {
                interpreterInput.removeEventListener("input", inputListener);
                resolve(pollInputChar());
            }
            interpreterInput.addEventListener("input", inputListener);
        })
    }, (output) => {
        interpreterOutput.textContent += output + "\n";
    }, maxSteps);
    console.log(result);
    if (result.steps < maxSteps) {
        console.log("Program executed successfully");
    } else {
        console.log("Program did not terminate");
    }
}
