<script setup lang="ts">
import { onMounted } from "vue";
import { useDashboardStore } from "../stores/dashboard.ts";

const props = defineProps<{ name: string }>();
const store = useDashboardStore();

onMounted(async () => {
  await store.getPokemonDetails(props.name);
});
</script>

<template>
  <div>
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
