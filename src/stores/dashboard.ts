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

  async function getAll() {
    const { db } = useDB();
    const count = await getCount();

    if (!count) {
      return undefined;
    }

    if (count < 151) {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
      const data = await response.json();
      const transaction = db.transaction("pokemon", "readwrite");
      const store = transaction.objectStore("pokemon");

      transaction.oncomplete = () => {
        console.warn("Hey, the allPokemons transaction completed: ", transaction);
      }

      allPokemon.value = data.results;
      data.results.forEach((pokemon) => {
        const existing = store.get(pokemon.name);
        existing.onerror = () => {
          console.error("NOOO")
        }
        existing.onsuccess = () => {
          if (existing.result) {
            return undefined;
          }
          store.add(pokemon);
        }
      });
      return allPokemon.value;
    }

    const transaction = db.transaction("pokemon", "readwrite");
    const store = transaction.objectStore("pokemon");
    const allRequest = store.getAll();
    allRequest.onsuccess = () => {
      allPokemon.value = allRequest.result;
    }
  }

  function getOne(name: string) {
    console.log("Loading ", name);
    const { db } = useDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("pokemon", "readonly");
      const store = transaction.objectStore("pokemon");
      const getCurrent = store.get(name);
      getCurrent.onsuccess = () => {
        resolve(getCurrent.result);
      }

      getCurrent.onerror = () => {
        reject(undefined);
      }
    })
  }

  function getPokemonUrl(name: string) {
    return new Promise((resolve, reject) => {
      const { db } = useDB();
      // Check that we have this pokemon in the DB
      const urlTransaction = db.transaction("pokemon", "readonly");
      const urlStore = urlTransaction.objectStore("pokemon");
      const getUrl = urlStore.get(name);

      getUrl.onsuccess = () => {
        if (!getUrl.result) {
          reject(new Error("Pokemon URL not found"));
        }
        resolve(getUrl.result.url);
      }
    })
  }

  function setPokemonDetails(pokemon: any) {
    return new Promise((resolve, reject) => {
      const { db } = useDB();
      const save = db.transaction("pokemonDetails", "readwrite");
      const saveStore = save.objectStore("pokemonDetails");
      const saveRequest = saveStore.put(pokemon);
      saveRequest.onsuccess = () => {
        resolve(saveRequest.result);
      }
      saveRequest.onerror = () => {
        reject(new Error("Couldn't save pokemon " + pokemon.id));
      }
    });
  }

  async function getPokemonDetails(name: string) {
    const pokemon = await getOne(name).catch((err) => {
      console.error("No pokemon found for: ", name);
      return undefined;
    });

    let url = "";
    if (pokemon) {
      const { db } = useDB();
      const transaction = db.transaction("pokemonDetails", "readonly");
      const store = transaction.objectStore("pokemonDetails");
      const getPokemon = store.index("name").get(name);

      getPokemon.onsuccess = async () => {
        if (getPokemon.result) {
          selectedPokemon.value = getPokemon.result;
          return Promise.resolve(getPokemon.result);
        }

        const response = await fetch(pokemon.url);
        if (!response.ok) {
          return undefined;
        }

        const data = await response.json();
        selectedPokemon.value = data;
        await setPokemonDetails(data);
        console.log(data);
      }

      getPokemon.onerror = (error) => console.error("Couldn't retrieve pokemon from pokemonDetails: ", error);
    }

  }

  return { allPokemon, getAll, getOne, selectedPokemon, getPokemonDetails };
});
