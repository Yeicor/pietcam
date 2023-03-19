<template>
  <div class="main">
    <h1>Piet Cam</h1>
    <h2>Camera</h2>
    <Camera @picture="onPicture"/>
    <h2>Output</h2>
    <Output ref="output"/>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import Camera from './camera.vue';
import Output from './output.vue';

@Options({
  components: {
    Camera,
    Output,
  }
})
export default class App extends Vue {
  onPicture(img: HTMLImageElement) {
    this.$refs['output'].setImage(img);
  }
}

</script>

<style lang="scss">

</style>
