import { createApp } from 'vue'
import App from './app.vue'
import store from './store'
import { createVuetify } from 'vuetify'
import 'vuetify/lib/styles/main.css'
import * as components from 'vuetify/lib/components'
import * as directives from 'vuetify/lib/directives'

import router from './router'

// Use node emulated globals from Parcel (https://parceljs.org/features/node-emulation/) to set Vue options
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode')
  globalThis.__VUE_OPTIONS_API__ = true
  globalThis.__VUE_PROD_DEVTOOLS__ = true
} else {
  globalThis.__VUE_OPTIONS_API__ = false
  globalThis.__VUE_PROD_DEVTOOLS__ = false
}

const app = createApp(App)
app.use(store)
app.use(router)
app.use(createVuetify({ components, directives }))
app.mount('#app')
