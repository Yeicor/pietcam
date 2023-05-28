import {create, MyImageData} from "pietcam/src";

export default function selectAndConvertPietProgram() {
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

            // Convert the image into a Piet program
            let imageData = context.getImageData(0, 0, image.width, image.height);
            let myImageData = MyImageData.fromImageWithAlpha(imageData.width, imageData.height, imageData.data)
            let program = create(myImageData);
            myImageData = program.toImageWithAlpha()
            imageData = new ImageData(myImageData.data, myImageData.width, myImageData.height)

            // Convert the raw image data into a downloadable image
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            context.putImageData(imageData, 0, 0);
            canvas.toBlob(imageDataBlob => {

                // Force the browser to download the program as an image
                let link = document.createElement("a");
                link.download = file.name.replace(/\.[^/.]+$/, "") + "_cam.png";
                link.href = URL.createObjectURL(new Blob([imageDataBlob], {type: "image/png"}));
                link.click();
                link.remove();
                canvas.remove();
            });
        }
        image.src = URL.createObjectURL(file);
        input.remove();
    }
    input.click();
}