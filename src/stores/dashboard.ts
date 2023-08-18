import { defineStore } from "pinia";
import { ref } from "vue";
import { useDB } from "../composables/db";

export const useDashboardStore = defineStore("dashboard", () => {
  const allPokemon = ref([]);
  const selectedPokemon = ref();

  function getCount(): Promise<number> {
    let recordCount = 0;
    return new Promise((resolve, reject) => {
      const { db } = useDB();
      const transaction = db.transaction("pokemon", "readwrite");

      transaction.oncomplete = () => {
        console.warn("Hey, the getCount transaction completed: ", transaction);
      }

      const store = transaction.objectStore("pokemon");
      const count = store.count();

      count.onsuccess = () => {
        recordCount = count.result;
      }

      count.onerror = () => reject(0);

      transaction.oncomplete = () => resolve(recordCount);
    });
  }

  async function getAllPokemon() {
    const { getAll, putAll } = useDB();
    const count = await getCount();

    if (count === undefined) {
      return undefined;
    }

    if (count < 151) {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
      const data = await response.json();

      allPokemon.value = data.results;
      putAll("pokemon", data.results);
      return allPokemon.value;
    }

    const allRequest = await getAll("pokemon").catch((err) => {
      console.error(err);
      return undefined;
    });

    if (allRequest) {
      allPokemon.value = allRequest;
    }
  }

  async function getPokemonDetails(name: string) {
    const { getOne, putOne } = useDB();

    // Do we have this pokemon's details in the db?
    const details = await getOne("pokemonDetails", name, "name");
    if (details) {
      selectedPokemon.value = details;
      return details;
    }

    // We do not have the details in the db. Get the URL, then 
    // get the details from the API and save them in the db.
    const pokemon = await getOne("pokemon", name).catch((err) => {
      console.error("No pokemon found for: ", name);
      return undefined;
    });

    if (pokemon) {
      if (!navigator.onLine) {
        return undefined;
      }

      const response = await fetch(pokemon.url);
      if (!response.ok) {
        return undefined;
      }

      const data = await response.json();
      selectedPokemon.value = data;
      const cache = await caches.open("pokemon-sprites");
      if (!cache.match(data.sprites.front_default)) {
        await cache.add(data.sprites.front_default);
      }
      await putOne("pokemonDetails", data);
    }
  }

  return { allPokemon, getAllPokemon, selectedPokemon, getPokemonDetails };
});
