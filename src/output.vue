<!-- An output component that receives pictures and tries to decode and interpret them as Piet programs. -->

<template>
  <div class="output">
    <img ref="preview" class="output-preview" alt="Output preview"
         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="/>
    Working...
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';

@Options({})
export default class Output extends Vue {
  setImage(img: HTMLImageElement) {
    console.log("Processing image...");
    this.$refs['preview'].src = img.src;
  }

}
</script>

<style lang="scss">
.output-preview {
  max-width: 100%;
  max-height: 100px;
}
</style>
