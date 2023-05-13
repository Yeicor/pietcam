<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      clipped
    >
      <v-list
        class="py-1"
        dense
        flat
        nav
      >
        <v-list-item
          v-for="item in routes"
          :key="item.meta.title"
          dense
          router
          :to="item.path"
        >
          <v-icon>{{ item.meta.icon }}</v-icon>
          <v-list-item-title>{{ item.meta.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script lang="ts">
import router from './router'

export default {
  name: 'App',
  data () {
    return {
      drawer: true,
      routes: router.getRoutes()
    }
  }

}
</script>

<style lang="scss">
</style>
