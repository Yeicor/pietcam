import selectAndConvertPietProgram from './create';
import detectAndExecutePietProgram from './detect';
import {ImageSource, openImage} from "./imageSource";


document.getElementById("create").addEventListener("click", selectAndConvertPietProgram);

let initialScreen = document.getElementById("initial-screen");
let exeScreen = document.getElementById("exe-screen");


let exeCanvas = document.getElementById("exe-overlay") as HTMLCanvasElement;
let exeBtnRun = document.getElementById("exe-run") as HTMLButtonElement;
let exeBtnCancel = document.getElementById("exe-cancel") as HTMLButtonElement;
let exeInterpreter = document.getElementById("exe-interpreter") as HTMLElement;
let exeInterpreterOutput = document.getElementById("exe-output") as HTMLPreElement;
let exeInterpreterInput = document.getElementById("exe-input") as HTMLInputElement;
let exeInterpreterStatus = document.getElementById("exe-interpreter-status") as HTMLSpanElement;
let exeInterpreterBackButton = document.getElementById("exe-back") as HTMLButtonElement;
exeBtnRun.setAttribute("disabled", "true")
exeBtnCancel.addEventListener("click", () => {
    exeScreen.style.display = "none";
    initialScreen.style.display = "flex";
})

async function enterExeScreen(imageSource: ImageSource) {
    initialScreen.style.display = "none";
    exeScreen.style.display = "flex";
    // exeVideo.src = URL.createObjectURL(imageSource.srcObject);
    // await exeVideo.play(); // Start local playback
    await detectAndExecutePietProgram(imageSource, exeCanvas, exeBtnRun, exeBtnCancel, exeInterpreter, exeInterpreterOutput, exeInterpreterInput, exeInterpreterStatus, exeInterpreterBackButton);
}

document.getElementById("exe-photo").addEventListener("click", async () => await enterExeScreen(await openImage()));
document.getElementById("start-video").addEventListener("click", async () => await enterExeScreen(await openImage()));
