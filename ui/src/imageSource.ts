export type ImageSource = {
    start: () => Promise<OpenImageSource>,
}

export type OpenImageSource = {
    srcObject: MediaProvider;
    videoElement: HTMLVideoElement | HTMLImageElement,
    isOpen: () => boolean,
    isVideo: boolean,
    getFrame: () => Promise<ImageData>,
    stop: () => Promise<void>,
}

export const openCamera = (): ImageSource => {
    return {
        start: async () => {
            // Retrieve access to the camera // TODO: Select camera and resolution
            if (!navigator.mediaDevices) {
                alert("No media devices available (or this page is not served over HTTPS)");
                throw Error("No media devices available (or this page is not served over HTTPS)");
            }
            let mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {facingMode: "environment"/*, width: 320, height: 240*/},
            });
            console.log(`Using video device: ${mediaStream.getTracks().map(t => t.label).join(", ")}`);

            // Start the video stream by setting the source of the video element
            let video = document.createElement("video");
            video.style.display = "none";
            video.srcObject = mediaStream;
            document.body.appendChild(video);
            await video.play();

            // Create a canvas element to capture the video frame
            let canvas = document.createElement("canvas");
            canvas.style.display = "none";
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.setAttribute("willReadFrequently", "true");
            document.body.appendChild(canvas);

            // Start the loop to capture frames from the video stream and send them for processing
            let context = canvas.getContext("2d");
            let isOpen = true;
            return {
                srcObject: mediaStream,
                isVideo: true,
                videoElement: video,
                getFrame: async () => { // getFrame
                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    return context.getImageData(0, 0, video.videoWidth, video.videoHeight);
                },
                isOpen: () => isOpen,
                stop: () => { // stop
                    isOpen = false;
                    mediaStream.getTracks().forEach(track => track.stop());
                    video.remove();
                    canvas.remove();
                }
            } as OpenImageSource
        }
    }
}

export const openImage = (): ImageSource => {
    let cachedFile: File | undefined;
    return {
        start: () => new Promise((resolve) => {
            if (cachedFile) {
                openImageFileSelected(undefined, cachedFile);
                return;
            } else {
                // Open a file selector, accepting images
                let input = document.createElement("input");
                input.style.display = "none";
                input.type = "file";
                input.accept = "image/*";
                input.onchange = async () => {

                    // Retrieve the selected file
                    let file = input.files[0];
                    if (!file) return;
                    cachedFile = file; // Don't ask for the file again
                    openImageFileSelected(input, file);
                }
                input.click();
            }

            function openImageFileSelected(input: HTMLInputElement | undefined, file: File) {
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
                    let getFrame = async () => imageData;

                    // Create a function to stop the image source
                    let stop = async () => {
                        if (input) input.remove();
                        canvas.remove();
                    }

                    // Return the image source
                    resolve({
                        srcObject: file,
                        isOpen: () => false,
                        isVideo: false,
                        videoElement: image,
                        getFrame,
                        stop,
                    } as OpenImageSource)
                }
                image.src = URL.createObjectURL(file);
            }
        }),
    }
}
