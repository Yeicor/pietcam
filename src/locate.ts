import {MyImageData} from "./utils/image";
import {binarize as jsQRBinarize} from "./jsQR/src/binarizer";
import {locate as jsQRLocate, QRLocation} from "./jsQR/src/locator";
import {extract as jsQRExtract} from "./jsQR/src/extractor";
import {BitMatrix} from "./jsQR/src/BitMatrix";
import {LOCATOR_POSITION_MATRIX} from "./create";

export type Detection = {
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
    const qrLocs = jsQRLocate(binImg.binarized) || []
    console.debug("QR code locations:", JSON.stringify(qrLocs))
    // Convert the QR code's coordinates to the original image's coordinate system.
    return qrLocs.map((loc) => ({location: loc, binaryImage: binImg.binarized}))
}

/**
 * Given a pietcam image and the detection information, returns the extracted Piet program, ready for execution.
 */
export function extract(img: MyImageData, detection: Detection): MyImageData {
    let {matrix, mappingFunction} = jsQRExtract(detection.binaryImage, detection.location);
    // The returned matrix starts at the top left locator of the QR code.
    // console.debug("Extracted matrix:", matrix)+

    // Compute the size of the Piet program in QR-space pixels (excluding the white border)
    const locatorSize = LOCATOR_POSITION_MATRIX.length // 1 for locator white border

    // HACK: Use the BitMatrix to extract encoded information like the relative size of the piet program wrt locators.
    let programSidePixels = 0
    for (let bitIndex = 0; bitIndex < matrix.width - locatorSize * 2 - 2; bitIndex++) {
        let bitPresent = matrix.get(locatorSize + 2 + bitIndex, locatorSize - 1)
        programSidePixels |= (bitPresent ? 1 : 0) << bitIndex
        // console.debug("Bit", bitIndex, "is", bitPresent, "programSidePixels", programSidePixels.toString(2), programSidePixels)
    }
    console.debug("Decoded contents side length:", programSidePixels)

    // Extract the Piet program from the original image thanks to the mapping function.
    let pietProgramSidePixels = programSidePixels - 2; // We don't need the white border.
    let programSideVirtual = matrix.width - (locatorSize + 2) * 2 - 1; // 2 for internal white borders and 1 for alignment locator
    let virtualToPixels = programSideVirtual / pietProgramSidePixels;
    console.debug("Scaling out by", virtualToPixels, " -- ", programSideVirtual, pietProgramSidePixels)
    let pietProgram = new MyImageData(pietProgramSidePixels, pietProgramSidePixels)
    for (let outX = 0; outX < pietProgram.width; outX++) {
        for (let outY = 0; outY < pietProgram.height; outY++) {
            const inScaledX = outX * virtualToPixels
            const inScaledY = outY * virtualToPixels
            let inX = inScaledX + locatorSize + 2
            let inY = inScaledY + locatorSize + 2
            let mapped = mappingFunction(inX, inY)
            let mappedX = Math.floor(mapped.x)
            let mappedY = Math.floor(mapped.y)
            // console.debug("Mapped", inScaledX, inScaledY, "to", inX, inY, "to", mappedX, mappedY, "(", mapped.x, mapped.y, ")")
            let pietPixel = img.getPixel(mappedX, mappedY)
            pietProgram.setPixel(outX, outY, pietPixel)
        }
    }

    return pietProgram
}
