import {addTest} from "./utils/tests";
import {MyImageData} from "./utils/image";
import {create} from "./create";

function processImgFs(path: string, handler: (MyImageData) => MyImageData) {
    const fs = require("fs"), PNG = require("pngjs").PNG;
    fs.createReadStream(path)
        .pipe(new PNG({}))
        .on("parsed", function () {
            let inputImg = MyImageData.fromImageWithAlpha(this.width, this.height, this.data);
            const outputImg = handler(inputImg).toImageWithAlpha()
            // Write the output image to a png file.
            this.width = outputImg.width
            this.height = outputImg.height
            this.data = outputImg.data
            this.pack().pipe(fs.createWriteStream(path.replace(".png", "_out.png")));
        });
}

export default () => {
    let file = "testdata/hello_world.png"
    addTest(`create(${file})`, () => {
        processImgFs(file, (img: MyImageData) => {
            // TODO: console.log(locate(myLocatableImage))
            return create(img)
        })
    })
    // TODO: Test and fix scaling.
}