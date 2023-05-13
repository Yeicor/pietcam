// Configure Vue Router
import * as VueRouter from 'vue-router'

const Detect = { template: '<div>Detect</div>' }
const Create = { template: '<div>Create</div>' }
export default VueRouter.createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: VueRouter.createWebHashHistory(),
  routes: [
    { path: '/', component: Detect, meta: { title: 'Detect', icon: 'mdi-camera' } },
    { path: '/create', component: Create, meta: { title: 'Create', icon: 'mdi-image-plus' } }
  ]
})
