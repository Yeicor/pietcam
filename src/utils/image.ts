/**
 * ImageData represents a rectangular array of pixels, containing only RGB channels.
 */
class MyImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(width: number, height: number, data: Uint8ClampedArray = new Uint8ClampedArray(width * height * 3)) {
        this.width = width;
        this.height = height;
        this.data = data;
    }

    /**
     * Returns the index of the first byte of the pixel at (x, y).
     */
    private index(x: number, y: number): number {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            throw new Error(`(${x}, ${y}) is out of bounds, image is ${this.width}x${this.height}`);
        return 3 * (y * this.width + x);
    }

    /**
     * Returns the color of the pixel at (x, y).
     *
     * The color is returned as an array of three numbers (red, green, blue), each in the range [0, 255].
     */
    getPixel(x: number, y: number): [number, number, number] {
        const i = this.index(x, y);
        return [this.data[i], this.data[i + 1], this.data[i + 2]];
    }

    /**
     * Sets the color of the pixel at (x, y).
     *
     * The color is specified as an array of three numbers (red, green, blue), each in the range [0, 255].
     */
    setPixel(x: number, y: number, color: [number, number, number]): void {
        const i = this.index(x, y);
        this.data[i] = color[0];
        this.data[i + 1] = color[1];
        this.data[i + 2] = color[2];
    }
}

const BLACK: [number, number, number] = [0, 0, 0];
const WHITE: [number, number, number] = [255, 255, 255];

const QR_VERSION_7_MATRIX = [
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
    [1, 1, 1],
    [0, 0, 0],
];

export {MyImageData, BLACK, WHITE, QR_VERSION_7_MATRIX};
