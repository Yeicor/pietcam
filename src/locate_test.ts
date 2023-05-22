import {assert} from "./utils/tests";
import {MyImageData} from "./utils/image";
import {locate} from "./locate";
import {addTestdataTests} from "./create_test";

export default () => {
    addTestdataTests("locate", (f: string) => f.indexOf("_out_create.png") !== -1, (img: MyImageData) => {
        let detections = locate(img);
        assert(detections.length > 0, "Expected at least one QR code.")
        // Draw the detected QR code location on the image, as a red quadrilateral (4 straight lines).
        let loc = detections[0].location
        console.log("Drawing first loc", loc, ", of", detections.length, "detections.")
        for (let line of [[loc.topLeft, loc.topRight], [loc.topRight, loc.alignmentPattern], [loc.alignmentPattern, loc.bottomLeft], [loc.bottomLeft, loc.topLeft]]) {
            let from = line[0]
            let to = line[1]
            let dx = to.x - from.x
            let dy = to.y - from.y
            let steps = Math.sqrt(dx * dx + dy * dy)
            for (let i = 0; i < steps; i++) {
                let x = Math.floor(from.x + dx * i / steps)
                let y = Math.floor(from.y + dy * i / steps)
                img.setPixel(x, y, [255, 0, 0])
            }
        }
        //
        return img
    }, "_out_locate")
}