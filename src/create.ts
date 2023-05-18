import {BLACK, MyImageData, QR_VERSION_7_MATRIX, WHITE} from "./utils/image";


/**
 * Converts a Piet program (recommended codel size of 1) into an image that can be found and decoded from a camera.
 * It relies on QR locators to be detected.
 *
 * The returned image can be scaled to any size, but use nearest neighbor interpolation.
 */
export function create(program: MyImageData, locatorsScale: number = 1): MyImageData {

    // First, estimate the locator size to add to the original image.
    const contentsSideLength = Math.max(program.width, program.height)
    const defaultLocatorSize = 0.1 * contentsSideLength
    let locatorsSize = Math.ceil(locatorsScale * defaultLocatorSize)
    const locatorMultipleOf = 1 + 1 + 1 + 2 + 1 + 1 + 1 // WBWBBWBW
    locatorsSize = Math.ceil(locatorsSize / locatorMultipleOf) * locatorMultipleOf
    const locatorScale = locatorsSize / defaultLocatorSize

    // Create the new image, with enough space for the locators and the original image.
    const img = new MyImageData(program.width + 2 * locatorsSize, program.height + 2 * locatorsSize)

    // Fill the image with white.
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            img.setPixel(x, y, WHITE)
        }
    }

    // Draw the timing pattern.
    for (let x = 0; x < img.width; x++) {
        if (x % 2 == 0) img.setPixel(x, locatorsSize - 1, BLACK)
    }
    for (let y = 0; y < img.height; y++) {
        if (y % 2 == 0) img.setPixel(locatorsSize - 1, y, BLACK)
    }

    // Draw version information (version 7).
    for (let x = img.width - locatorsSize - QR_VERSION_7_MATRIX.length; x < img.width - locatorsSize; x++) {
        let relX = x - (img.width - locatorsSize - QR_VERSION_7_MATRIX.length)
        for (let y = 0; y < QR_VERSION_7_MATRIX[0].length; y++) {
            if (QR_VERSION_7_MATRIX[relX][y] == 1) {
                img.setPixel(x, locatorsSize + y, BLACK)
            }
        }
    }
    for (let y = img.height - locatorsSize - QR_VERSION_7_MATRIX.length; y < img.height - locatorsSize; y++) {
        let relY = y - (img.height - locatorsSize - QR_VERSION_7_MATRIX.length)
        for (let x = 0; x < QR_VERSION_7_MATRIX.length; x++) {
            if (QR_VERSION_7_MATRIX[x][relY] == 1) {
                img.setPixel(locatorsSize + x, y, BLACK)
            }
        }
    }

    // Draw the QR position and alignment locators.
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            const isAlignment = i == 1 && j == 1;
            const baseX = i * (img.width - locatorsSize)
            const baseY = j * (img.height - locatorsSize)
            for (let x = 0; x < locatorsSize; x++) {
                const unscaledX = x / locatorScale
                for (let y = 0; y < locatorsSize; y++) {
                    const unscaledY = y / locatorScale
                    let isBlack = false;
                    if (!isAlignment) {
                        isBlack = unscaledX in [1, 3, 4, 6] || unscaledY in [1, 3, 4, 6];
                    } else {
                        isBlack = unscaledX in [0, 2, 4] || unscaledY in [0, 2, 4];
                    }
                    if (isBlack) img.setPixel(baseX + x, baseY + y, BLACK);
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