import {addTest} from "./utils/tests";
import {MyImageData} from "./utils/image";
import {create} from "./create";

async function processImgFs(path: string, handler: (MyImageData) => Promise<MyImageData | null>, suffix = "_out") {
    const fs = require("fs"), PNG = require("pngjs").PNG;
    const pngImg = PNG.sync.read(fs.readFileSync(path));
    const inputImg = MyImageData.fromImageWithAlpha(pngImg.width, pngImg.height, pngImg.data);
    let outputImgRaw = await handler(inputImg);
    if (outputImgRaw === null) {
        console.log("No output image returned, skipping.")
        return
    }
    const outputImg = outputImgRaw.toImageWithAlpha()
    // Write the output image to a png file.
    pngImg.width = outputImg.width
    pngImg.height = outputImg.height
    pngImg.data = outputImg.data
    const buffer = PNG.sync.write(pngImg);
    fs.writeFileSync(path.replace(".png", suffix + ".png"), buffer);
}

export function addTestdataTests(name: string, isInput: (string) => boolean, handler: (MyImageData) => Promise<MyImageData | null>, suffix = "_out") {
    const fs = require("fs");
    addTest(name, async () => {
        return await Promise.all(fs.readdirSync("testdata").flatMap(async (file) => {
            if (!isInput(file) || !file.endsWith(".png")) return []
            addTest(`${name} > ${file}`, async () => processImgFs("testdata/" + file, handler, suffix), 0)
        }))
    })
}

export default () => {
    addTestdataTests("create",(f: string) => f.indexOf("_out") === -1,
        async (img: MyImageData) => create(img, 1), "_out_create")
}