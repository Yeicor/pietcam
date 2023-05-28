import selectAndConvertPietProgram from './create';
import detectAndExecutePietProgram from './detect';
import {ImageSource, openCamera, openImage} from "./imageSource";


document.getElementById("create").addEventListener("click", selectAndConvertPietProgram);

let initialScreen = document.getElementById("initial-screen");
let exeScreen = document.getElementById("exe-screen");


let exeVideo = document.getElementById("exe-video") as HTMLVideoElement;
let exeCanvas = document.getElementById("exe-canvas") as HTMLCanvasElement;
let exeBtnRun = document.getElementById("exe-run") as HTMLButtonElement;
let exeBtnCancel = document.getElementById("exe-cancel") as HTMLButtonElement;
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
    detectAndExecutePietProgram(imageSource, exeCanvas, exeBtnRun, exeBtnCancel);
}

document.getElementById("exe-photo").addEventListener("click", async () => enterExeScreen(await openImage()));
document.getElementById("exe-video").addEventListener("click", async () => enterExeScreen(await openImage()));
