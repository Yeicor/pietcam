# Piet Cam

A [Piet](https://www.dangermouse.net/esoteric/piet.html) interpreter, capable of using your webcam as input.

The package of the root of the repository contains the library, published [here](https://www.npmjs.com/package/pietcam).
The [`ui`](ui) directory contains a simple browser UI for the library,
deployed [here](https://yeicor.github.io/pietcam).

The demo works for perfect images loaded from disk, but detecting and extracting Piet programs from a real camera is
hard. I'm not sure if it's possible to make it work reliably.