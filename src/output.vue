<!-- An output component that receives pictures and tries to decode and interpret them as Piet programs. -->

<template>
  <div class="output">
    <canvas ref="work" class="output-work"></canvas>
    Working...
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import * as cv from "@techstark/opencv-js"

@Options({})
export default class Output extends Vue {
  setImage(img: HTMLImageElement) {
    console.log("Processing image...", img.width, img.height);
    if (img.width === 0 || img.height === 0) {
      console.warn("Image is empty, skipping");
      return;
    }

    // Copy image to canvas
    const canvas = this.$refs['work'] as HTMLCanvasElement;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Failed to get canvas context");
      return;
    }
    ctx.drawImage(img, 0, 0);

    // TODO: Calibrate camera from chessboard-like image, to undistort and unproject the Piet "code" rectangle
    console.log("Available OpenCV methods:", cv.findChessboardCorners, cv.calibrateCameraExtended, cv);
    const cvImg = cv.imread(canvas);

    // find contours to find 4 corners of the Piet code rectangle
    const imgGray = new cv.Mat();
    cv.cvtColor(cvImg, imgGray, cv.COLOR_BGR2GRAY)
    const imgCanny = new cv.Mat();
    cv.Canny(imgGray, imgCanny, 50, 100, 3, false);
    cv.imshow(canvas, imgCanny)

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(imgCanny, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE, new cv.Point(0, 0));
    console.log("Found", contours.size(), "contours:", Array.from({length: contours.size()}, (x, i) => contours.get(i).data32S))
    cv.drawContours(cvImg, contours, -1, new cv.Scalar(0, 128, 0, 255), 4, cv.LINE_8, hierarchy, 100);

    cv.imshow(canvas, cvImg)

    // need to release them manually
    cvImg.delete();
    imgGray.delete();
    imgCanny.delete();
    contours.delete();
    hierarchy.delete();
  }

}
</script>

<style lang="scss">
</style>
