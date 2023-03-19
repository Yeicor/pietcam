import {createApp} from 'vue';
import App from './app.vue';
import store from './store';
import Camera from "./camera.vue";

const app = createApp(App);
app.use(store);
app.provide('camera', Camera);

app.mount('#app');
