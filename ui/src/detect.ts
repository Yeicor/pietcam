import {ImageSource} from "./imageSource";
import {Detection, extract, locate, MyImageData, newInterpreter, runInterpreter} from "pietcam/src";

export default function detectAndExecutePietProgram(imageSource: ImageSource, exeCanvas: HTMLCanvasElement, exeBtnRun: HTMLButtonElement, exeBtnCancel: HTMLButtonElement, interpreterOutput: HTMLPreElement, interpreterInput: HTMLInputElement) {
    // Add a listener to the stop button
    let cancelListener;
    let exeListener;
    cancelListener = () => {
        imageSource.stop();
        exeBtnCancel.removeEventListener("click", cancelListener);
        exeBtnCancel.removeEventListener("click", exeListener);
    };
    exeBtnCancel.addEventListener("click", cancelListener);

    // Make sure run is not enabled until we have a valid program detected
    exeBtnRun.setAttribute("disabled", "true");
    exeListener = () => executePietProgram(interpreterOutput, interpreterInput);
    exeBtnRun.addEventListener("click", exeListener);

    if (imageSource.isVideo) {
        setInterval(() => {
            detectionLoopContents(imageSource, exeCanvas, exeBtnRun);
        }, 1000 / 30); // Will actually be much slower: lots of work to do
    } else {
        detectionLoopContents(imageSource, exeCanvas, exeBtnRun);
    }

    // TODO: Start a loop to detect the program if the image source is a video


}

let lastImageData: MyImageData | null = null;
let lastDetection: Detection | null = null;

function detectionLoopContents(imageSource: ImageSource, exeCanvas: HTMLCanvasElement, exeBtnRun: HTMLButtonElement) {
    // Get and draw the initial frame to the canvas
    let frame = imageSource.getFrame();
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
            }, maxSteps);
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
    let result = runInterpreter(interpreter, () => 0, maxSteps);
    console.log(result);
    if (result.steps < maxSteps) {
        console.log("Program executed successfully");
    } else {
        console.log("Program did not terminate");
    }
}
