declare let process: { env: { NODE_ENV: string } }
declare module '*.vue';
declare module 'vue-router' {
  interface RouteMeta {
    title: string
    icon: string
  }
}
