import { ref } from "vue";

let db: IDBDatabase;

function createPokemonStore(db: IDBDatabase) {
  const pokemonStore = db.createObjectStore("pokemon", { keyPath: "name" });
  pokemonStore.createIndex("name", "name", { unique: true });
}

export function useDB() {
  const ready = ref(false);

  function createDB() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("PokemonPWA", 3);

      request.onsuccess = () => {
        db = request.result;
        ready.value = true;
        resolve(db);
      }

      request.onerror = (event) => {
        reject(event);
      }

      request.onupgradeneeded = (e) => {
        const DB = request.result;
        if (e.oldVersion < 1) {
          createPokemonStore(DB);
        }

        if (e.oldVersion < 3) {
          const pokemonDetailsStore = DB.createObjectStore("pokemonDetails", { keyPath: "id" });
          pokemonDetailsStore.createIndex("id", "id", { unique: true });
          pokemonDetailsStore.createIndex("name", "name", { unique: true });
        }

        db = DB;
        resolve(db);
      }
    })

  }

  return { createDB, db, ready };
}
