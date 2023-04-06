import * as tf from '@tensorflow/tfjs';
import {createApp} from 'vue';
import App from './app.vue';
import store from './store';
import Camera from "./camera.vue";

tf.setBackend('webgl');
console.log(tf.getBackend());

const app = createApp(App);
app.use(store);
app.provide('camera', Camera);

app.mount('#app');
