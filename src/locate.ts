import {MyImageData} from "./utils/image";
import jsQR from "jsqr/dist/jsQR";

type Point = { x: number, y: number }


type Detection = {
    topLeft: Point,
    topRight: Point,
    bottomLeft: Point,
    bottomRight: Point,
}

/**
 * Locates a pietcam image in a given photo.w
 */
export function locate(img: MyImageData): Detection[] {
    // Convert the input image to a binary image for easier processing.
    const alphaImg = img.toImageWithAlpha();
    console.debug(jsQR)
    const binImg = (jsQR as any).binarize(alphaImg.data, alphaImg.width, alphaImg.height, false)
    // Locate the QR code in the binary image.
    const qrLocs = (jsQR as any).locate(binImg.binarized)
    // TODO: Convert the QR code's coordinates to the original image's coordinate system.
    return qrLocs.map((loc) => ({
        topLeft: loc.topLeft,
        topRight: loc.topRight,
        bottomLeft: loc.bottomLeft,
        bottomRight: loc.alignmentPattern,
    }))
}