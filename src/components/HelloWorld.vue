<script setup lang="ts">
import { ref } from 'vue'
import { useDashboardStore } from '../stores/dashboard';
defineProps<{ msg: string }>()
const store = useDashboardStore();

</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <ol>
      <li v-for="pokemon in store.allPokemon" :key="pokemon.name"> 
        <router-link :to="{ name: 'details', params: { name: pokemon.name }}">{{ pokemon.name }}</router-link>
      </li>
    </ol>
    
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

.card ol {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.card ol li {
  border: 1px solid lightgray;
  border-radius: 8px;
}
</style>
