<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useDashboardStore } from "../stores/dashboard.ts";
import { onBeforeRouteLeave } from "vue-router";

const props = defineProps<{ name: string }>();
const store = useDashboardStore();
const offline = ref(false);

onMounted(async () => {
  await store.getPokemonDetails(props.name);
  if (!store.selectedPokemon && !navigator.onLine) {
    offline.value = true;
  }
});

onBeforeRouteLeave(() => {
  store.selectedPokemon = undefined;
});
</script>

<template>
  <div>
    <template v-if="offline">
      <h1>We can't load the details for this pokemon.</h1>
      <p>Please connect to the internet and try loading this pokemon again. After that, you can view this pokemon any time you like!</p>
    </template>
    <template v-else>
      <div class="pokemon-title">
        <img v-if="store.selectedPokemon" :src="store.selectedPokemon.sprites.front_default" />
        <h1>{{ store.selectedPokemon ? store.selectedPokemon.name : "Pokemon details" }}</h1>
      </div>
      <div class="pokemon-types">
        <h3>Type:</h3>
        <ul v-if="store.selectedPokemon">
          <li v-for="type in store.selectedPokemon.types" :key="type.slot">{{ type.type.name }}</li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pokemon-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
}
</style>
