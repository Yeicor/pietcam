<!-- A camera component that can be used to display a camera stream and take pictures. -->

<template>
  <div class="camera">
    <video ref="video" class="camera-video"/>
    <canvas ref="canvas" class="camera-canvas"/>
    <div class="buttons-panel">
      <button @click="loadFile">📁</button>
      <button @click="takePicture">📷</button>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';

@Options({events: ['picture']})
export default class Camera extends Vue {
  loadFile() {
    // Ask the user to select a file, which will be read and loaded as an image
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    document.body.appendChild(input);
    input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener('load', (e) => {
        if (!e.target) return;
        const img = new Image();
        img.src = e.target.result as string;
        this.onPicture(img);
      });
      reader.readAsDataURL(file);
    });
    input.click();
    document.body.removeChild(input); // Remove the input element from the DOM
  }

  takePicture() {
    // If this is the first time, request permissions and start the video preview from the camera
    const video = this.$refs['video'] as HTMLVideoElement;
    if (video.paused) {
      console.log("Starting video preview")
      video.parentElement.style.minHeight = '400px'
      navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function (stream) {
          video.srcObject = stream;
          video.play();
        })
        .catch(function (err) {
          console.log('An error occurred: ' + err);
        });
    } else {
      console.log("Capturing video frame")
      // Otherwise, take a picture from the stream and process it
      const canvas = this.$refs['canvas'] as HTMLCanvasElement
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const img = new Image();
      img.src = canvas.toDataURL('image/png');
      this.onPicture(img);
    }
  }

  onPicture(img: HTMLImageElement) {
    console.log("Picture!")
    // console.log(img);
    this.$emit('picture', img)
  }
}
</script>

<style lang="scss">
.camera {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: black;

  .camera-video {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 0;
    transform: translate(-50%, -50%);
  }

  .camera-canvas {
    display: none;
  }

  .buttons-panel {
    position: relative;
    margin: 20px;
    z-index: 10;

    button {
      padding: 5px;
      background-color: #363;
      color: white;
      border: none;
      font-size: 1.5em;
    }
  }
}
</style>
