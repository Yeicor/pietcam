import {addTest} from "./utils/tests";
import {MyImageData} from "./utils/image";
import {create} from "./create";

function processImgFs(path: string, handler: (MyImageData) => MyImageData, suffix = "_out") {
    const fs = require("fs"), PNG = require("pngjs").PNG;
    const pngImg = PNG.sync.read(fs.readFileSync(path));
    const inputImg = MyImageData.fromImageWithAlpha(pngImg.width, pngImg.height, pngImg.data);
    const outputImg = handler(inputImg).toImageWithAlpha()
    // Write the output image to a png file.
    pngImg.width = outputImg.width
    pngImg.height = outputImg.height
    pngImg.data = outputImg.data
    const buffer = PNG.sync.write(pngImg);
    fs.writeFileSync(path.replace(".png", suffix + ".png"), buffer);
}

export function addTestdataTests(name: string, isInput: (string) => boolean, handler: (MyImageData) => MyImageData, suffix = "_out") {
    const fs = require("fs");
    addTest(name, () => {
        return fs.readdirSync("testdata").flatMap((file) => {
            if (!isInput(file) || !file.endsWith(".png")) return []
            addTest(`${name} > ${file}`, () => processImgFs("testdata/" + file, handler, suffix), 0)
        })
    })
}

export default () => {
    addTestdataTests("create", (f: string) => f.indexOf("_out") === -1, (img: MyImageData) => create(img), "_out_create")
}