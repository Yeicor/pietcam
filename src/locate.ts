import {MyImageData} from "./utils/image";
import {binarize as jsQRBinarize} from "./jsQR/src/binarizer";
import {locate as jsQRLocate, QRLocation} from "./jsQR/src/locator";
import {extract as jsQRExtract} from "./jsQR/src/extractor";
import {BitMatrix} from "./jsQR/src/BitMatrix";

type Detection = {
    location: QRLocation,
    binaryImage: BitMatrix
}

/**
 * Locates a pietcam image in a given photo and returns the coordinates of the corners.
 *
 * This is an intermediate step in the process of decoding a pietcam image, but it is useful for diagnostics.
 */
export function locate(img: MyImageData): Detection[] {
    // Convert the input image to a binary image for easier processing.
    const alphaImg = img.toImageWithAlpha();
    const binImg = jsQRBinarize(alphaImg.data, alphaImg.width, alphaImg.height, false)
    // Locate the QR code in the binary image.
    const qrLocs = jsQRLocate(binImg.binarized)
    console.debug("QR code locations:", qrLocs)
    // Convert the QR code's coordinates to the original image's coordinate system.
    return qrLocs.map((loc) => ({location: loc, binaryImage: binImg.binarized}))
}

/**
 * Given a pietcam image and the coordinates of its corners, returns the extracted Piet program, ready for execution.
 */
export function extract(detection: Detection): MyImageData {
    let {matrix, /*mappingFunction*/} = jsQRExtract(detection.binaryImage, detection.location);
    console.debug("Extracted matrix:", matrix)

    // HACK: Use the BitMatrix to extract encoded information like the relative size of the piet program wrt locators.


    return new MyImageData(0, 0)
}
