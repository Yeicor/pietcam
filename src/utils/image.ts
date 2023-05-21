import {assert} from "./tests";

/**
 * ImageData represents a rectangular array of pixels, containing only RGB channels.
 */
class MyImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(width: number, height: number, data: Uint8ClampedArray = new Uint8ClampedArray(width * height * 3), checkSize: Boolean = true) {
        this.width = width;
        this.height = height;
        if (checkSize) assert(data.length === width * height * 3, `data.length (${data.length}) != width * height * 3 (${width * height * 3})`);
        this.data = data;
    }

    static fromImageWithAlpha = (width: number, height: number, data: Uint8ClampedArray) => {
        assert(data.length === width * height * 4, `data.length (${data.length}) != width * height * 4 (${width * height * 4})`);
        const newData = new Uint8ClampedArray(width * height * 3);
        for (let i = 0; i < newData.length; i++) {
            newData[i * 3] = data[i * 4];
            newData[i * 3 + 1] = data[i * 4 + 1];
            newData[i * 3 + 2] = data[i * 4 + 2];
            // drop alpha channel
        }
        return new MyImageData(width, height, newData);
    }

    /**
     * Warning: this will return an invalid image, do not perform any operations on it (only read attributes).
     */
    toImageWithAlpha = () => {
        const newData = new Uint8ClampedArray(this.width * this.height * 4);
        for (let i = 0; i < newData.length; i++) {
            newData[i * 4] = this.data[i * 3];
            newData[i * 4 + 1] = this.data[i * 3 + 1];
            newData[i * 4 + 2] = this.data[i * 3 + 2];
            newData[i * 4 + 3] = 255; // Opaque alpha channel
        }
        return new MyImageData(this.width, this.height, newData, false);
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

export {MyImageData, BLACK, WHITE};
