import {addTest} from "./utils/tests";
import {create} from "./create";
import {MyImageData} from "./utils/image";

function processImgFs(path: string, handler: (MyImageData) => MyImageData) {
    const fs = require("fs"), PNG = require("pngjs").PNG;
    let config = {inputHasAlpha: false};
    fs.createReadStream(path)
        .pipe(new PNG(config))
        .on("parsed", function () {
            const outputImg = handler(new MyImageData(this.width, this.height, this.data))
            // Write the output image to a png file.
            let outPng = new PNG(config);
            outPng.width = outputImg.width
            outPng.height = outputImg.height
            outPng.data = outputImg.data
            outPng.pack().pipe(fs.createWriteStream(path.replace(".png", "_out.png")));
        });
}

export default () => {
    let file = "testdata/hello_world.png"
    addTest(`create(${file})`, () => {
        processImgFs(file, (img: MyImageData) => create(img))
    })
}