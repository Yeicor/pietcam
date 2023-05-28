export type ImageSource = {
    isVideo: boolean,
    getFrame: () => ImageData,
    stop: () => void,
}
const openCamera = async (): Promise<ImageSource> => {
    // Retrieve access to the camera // TODO: Select camera
    let mediaDevices = new MediaDevices();
    let mediaStream = await mediaDevices.getUserMedia({
        audio: true,
        video: {facingMode: "environment"},
    });

    // Start the video stream by setting the source of the video element
    let video = document.createElement("video");
    video.style.display = "none";
    video.srcObject = mediaStream;
    document.body.appendChild(video);
    await video.play();

    // Create a canvas element to capture the video frame
    let canvas = document.createElement("canvas");
    video.style.display = "none";
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    document.body.appendChild(canvas);

    // Start the loop to capture frames from the video stream and send them for processing
    let context = canvas.getContext("2d");
    return {
        isVideo: true,
        getFrame: () => { // getFrame
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            return context.getImageData(0, 0, video.videoWidth, video.videoHeight);
        },
        stop: () => { // stop
            mediaStream.getTracks().forEach(track => track.stop());
            video.remove();
            canvas.remove();
        }
    }
}