export type ImageSource = {
    srcObject: MediaProvider;
    isVideo: boolean,
    getFrame: () => ImageData,
    stop: () => void,
}

export const openCamera = async (): Promise<ImageSource> => {
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
        srcObject: mediaStream,
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

export const openImage = async (): Promise<ImageSource> => {
    return new Promise<ImageSource>(resolve => {
        // Open a file selector, accepting images
        let input = document.createElement("input");
        input.style.display = "none";
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {

            // Retrieve the selected file
            let file = input.files[0];
            if (!file) return;

            // Create a canvas element to capture the image
            let canvas = document.createElement("canvas");
            canvas.style.display = "none";
            let context = canvas.getContext("2d");

            // Load the image into the canvas
            let image = new Image();
            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);

                // Create a function to retrieve the image frame
                let imageData = context.getImageData(0, 0, image.width, image.height);
                let getFrame = () => imageData;

                // Create a function to stop the image source
                let stop = () => {
                    input.remove();
                    canvas.remove();
                }

                // Return the image source
                resolve({
                    srcObject: file,
                    isVideo: false,
                    getFrame,
                    stop,
                })
            }
            image.src = URL.createObjectURL(file);
        }
        input.click();
    });
}
