import {BLACK, MyImageData, WHITE} from "./utils/image";
import {assert} from "./utils/tests";


/**
 * Converts a Piet program (recommended codel size of 1) into an image that can be found and decoded from a camera.
 * It relies on QR locators to be detected.
 *
 * The returned image can be scaled to any size, but use nearest neighbor interpolation.
 */
export function create(program: MyImageData, locatorsScale: number = 1): MyImageData {

    // First, estimate the locator size to add to the original image.
    const contentsSideLength = Math.max(program.width, program.height) + 1 // Avoid collisions with alignment pattern
    const defaultLocatorSize = 0.1 * contentsSideLength
    let locatorsSize = Math.ceil(locatorsScale * defaultLocatorSize)
    const locatorMultipleOf = LOCATOR_POSITION_MATRIX.length + 2 // 2 for white border
    locatorsSize = Math.ceil(locatorsSize / locatorMultipleOf) * locatorMultipleOf
    const locatorScale = locatorsSize / locatorMultipleOf
    assert(locatorsSize % locatorMultipleOf == 0, "Locator size (" + locatorsSize + ") must be a multiple of " + locatorMultipleOf)
    assert(locatorScale == Math.ceil(locatorScale), "Locator scale (" + locatorScale + ") must be an integer")
    console.debug("Locator size:", locatorsSize, "scale:", locatorScale)

    // Create the new image, with enough space for the locators and the original image.
    const img = new MyImageData(contentsSideLength + 2 * locatorsSize, contentsSideLength + 2 * locatorsSize)

    // Fill the image with white, and the contents with black.
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            if (x >= locatorsSize && x < img.width - locatorsSize - 1 && y >= locatorsSize && y < img.height - locatorsSize - 1) {
                img.setPixel(x, y, BLACK)
            } else img.setPixel(x, y, WHITE)
        }
    }

    // // Draw the timing pattern.
    // for (let x = 0; x < img.width; x++) {
    //     if (x % 2 == 0) img.setPixel(x, locatorsSize - 1, BLACK)
    // }
    // for (let y = 0; y < img.height; y++) {
    //     if (y % 2 == 0) img.setPixel(locatorsSize - 1, y, BLACK)
    // }

    // // Draw version information (version 7).
    // for (let x = img.width - locatorsSize - QR_VERSION_7_MATRIX.length; x < img.width - locatorsSize; x++) {
    //     let relX = x - (img.width - locatorsSize - QR_VERSION_7_MATRIX.length)
    //     for (let y = 0; y < QR_VERSION_7_MATRIX[0].length; y++) {
    //         if (QR_VERSION_7_MATRIX[relX][y] == 1) {
    //             img.setPixel(x, locatorsSize + y, BLACK)
    //         }
    //     }
    // }
    // for (let y = img.height - locatorsSize - QR_VERSION_7_MATRIX.length; y < img.height - locatorsSize; y++) {
    //     let relY = y - (img.height - locatorsSize - QR_VERSION_7_MATRIX.length)
    //     for (let x = 0; x < QR_VERSION_7_MATRIX.length; x++) {
    //         if (QR_VERSION_7_MATRIX[x][relY] == 1) {
    //             img.setPixel(locatorsSize + x, y, BLACK)
    //         }
    //     }
    // }

    // Draw the QR position and alignment locators.
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            // The alignment locators are not drawn at the top or left.
            const isAlignment = i > 0 && j > 0;
            // Start copying the locator at baseX, baseY.
            const baseX = i * (img.width - locatorsSize)
            const baseY = j * (img.height - locatorsSize)
            // Copy the locator, using the locatorScale.
            for (let x = 0; x < locatorsSize; x++) {
                const unscaledX = Math.floor(x / locatorScale)
                for (let y = 0; y < locatorsSize; y++) {
                    const unscaledY = Math.floor(y / locatorScale)
                    const matrix = isAlignment ? LOCATOR_ALIGNMENT_MATRIX : LOCATOR_POSITION_MATRIX
                    const matrixOffset = isAlignment ? 0 : -1
                    const matrixPosX = unscaledX + matrixOffset
                    const matrixPosY = unscaledY + matrixOffset
                    if (matrixPosX >= 0 && matrixPosX < matrix.length && matrixPosY >= 0 && matrixPosY < matrix[0].length) {
                        if (matrix[matrixPosX][matrixPosY] == 1) {
                            img.setPixel(baseX + x, baseY + y, BLACK)
                        }
                    }
                }
            }
        }
    }

    // Draw the original image in the center.
    for (let x = 0; x < program.width; x++) {
        for (let y = 0; y < program.height; y++) {
            img.setPixel(x + locatorsSize, y + locatorsSize, program.getPixel(x, y))
        }
    }

    // Return the image.
    return img;
}

const LOCATOR_POSITION_MATRIX = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
];

const LOCATOR_ALIGNMENT_MATRIX = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
];

// const QR_VERSION_7_MATRIX = [
//     [0, 0, 1],
//     [0, 1, 0],
//     [0, 1, 0],
//     [0, 1, 1],
//     [1, 1, 1],
//     [0, 0, 0],
// ];
