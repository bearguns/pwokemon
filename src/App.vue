<script setup lang="ts">
import { onMounted, ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue'
import { useDashboardStore } from "./stores/dashboard";
import { useDB } from "./composables/db";

const store = useDashboardStore();
const { createDB, db, ready } = useDB();


onMounted(async () => {
  await createDB().catch((e) => console.error("Unable to setup DB: ", e));
  await store.getAllPokemon();
});
</script>

<template>
  <div class="app-view">
    <router-view v-if="ready"/>
    <h2 v-else>Loading</h2>
  </div>
</template>

<style scoped>
.app-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
