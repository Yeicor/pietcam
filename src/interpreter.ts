import interpreter from "piet-interpreter/dist/lib/interpreter.js";
const {create, next} = interpreter;
import {MyImageData} from "./utils/image";


/** Converts a hexadecimal color to an RGB color. */
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const allColorsByName = {
    lred: "#ffc0c0", // light red
    lyellow: "#ffffc0", // light yellow
    lgreen: "#c0ffc0", // light green
    lcyan: "#c0ffff", // light cyan
    lblue: "#c0c0ff", // light blue
    lmagenta: "#ffc0ff", // light magenta

    red: "#ff0000", // red
    yellow: "#ffff00", // yellow
    green: "#00ff00", // green
    cyan: "#00ffff", // cyan
    blue: "#0000ff", // blue
    magenta: "#ff00ff", // magenta

    dred: "#c00000", // dark red
    dyellow: "#c0c000", // dark yellow
    dgreen: "#00c000", // dark green
    dcyan: "#00c0c0", // dark cyan
    dblue: "#0000c0", // dark blue
    dmagenta: "#c000c0", // dark magenta

    white: "#ffffff", // white
    black: "#000000", // black
};

/** Creates a new converter (precomputes as much as possible) from RGB to color identifiers. */
function rgbToColorConverter(): (r: number, g: number, b: number) => string {
    // Convert the colors to RGB in order to compute the distance between colors later
    let rgbColors = Object.assign({},
        ...Object.keys(allColorsByName).map((k) => ({[k]: hexToRgb(allColorsByName[k])})))
    // Return the converter now
    return (r: number, g: number, b: number) => {
        // Compute the distance between the colors
        let distances = Object.keys(rgbColors).map((name) => {
            const rgb = rgbColors[name]
            return {name, dist: Math.sqrt((rgb.r - r) ** 2 + (rgb.g - g) ** 2 + (rgb.b - b) ** 2)}
        })
        // Get the closest color by distance
        const closestColor = distances.reduce((prev, curr) => {
            return prev.dist < curr.dist ? prev : curr
        })
        // Return the name of the closest color
        return closestColor.name
    }
}

/** Prepares the input image for the interpreter. */
function myImageDataToInterpreterInput(img: MyImageData): Array<Array<string>> {
    let colors: Array<Array<string>> = []
    let rgbToColor = rgbToColorConverter()
    for (let y = 0; y < img.height; y++) {
        colors.push([])
        for (let x = 0; x < img.width; x++) {
            let [r, g, b] = img.getPixel(x, y)
            // Figure out the closest color identifier for this pixel
            colors[y].push(rgbToColor(r, g, b))
        }
    }
    return colors
}

type Interpreter = any

/** Creates a Piet interpreter from a "perfect" piet program image. */
export function newInterpreter(img: MyImageData): Interpreter {
    let input = myImageDataToInterpreterInput(img);
    // console.debug("input", input)
    return create(input);
}

/** The result of running a Piet program. */
export class PietResult {
    /** The number of steps executed. */
    steps: number

    constructor(steps: number = 0) {
        this.steps = steps
    }
}

/**
 * Runs a Piet program from an interpreter, applying some defaults. The interpreter reads from the input function,
 * and writes to the output function. The output function is called with a number and a boolean, where the boolean
 * indicates whether the number is a character (true) or a number (false).
 */
export async function runInterpreter(interpreter: Interpreter, input: (asksForChar: boolean) => Promise<number>, output: (a: string|number) => void, maxSteps: number = 10000): Promise<PietResult> {
    let steps = 0

    // Setup input hack for dynamic input and output
    let needsInput : boolean | null = null
    interpreter.env.input = {shift: () => {
        needsInput = interpreter.env.cmd == 'in(c)'
        return "0" // Will be overwritten by actual input before next step
    }}

    // Run the program until it halts, or we reach the maximum number of steps
    while (!interpreter.halt && steps++ < maxSteps) {

        // Execute the next step of the program
        interpreter = next(interpreter)

        // HACK: If the program needs input, give await for input and insert it into the interpreter's stack
        if (needsInput != null) {
            let inputNumber = await input(needsInput)
            interpreter.env.stack.pop() // Remove the placeholder input
            interpreter.env.stack.push(inputNumber)
            needsInput = null
        }

        // Print and record the output when asked
        if (interpreter.env.output.length > 0) {
            // console.log("output: ", interpreter.env.output, typeof interpreter.env.output) // Always string
            let outputValue: string = interpreter.env.output
            if (interpreter.env.cmd == 'out(c)') { // Char
                output(outputValue[0])
            } else if (interpreter.env.cmd == 'out(n)') { // Number
                output(parseInt(outputValue))
            } else throw new Error("Unknown output type: " + interpreter.env.cmd)
            interpreter.env.output = "" // Reset internal buffer
        }
    }
    if (steps >= maxSteps) console.warn("Reached maximum number of steps")
    return new PietResult(steps)
}
