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

  function getAll(storeNames: string, mode: IDBTransactionMode = "readonly") {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, mode);
      const store = transaction.objectStore(storeNames);
      const request = store.getAll();

      transaction.onerror = (event) => reject(new Error(`getAll transaction on ${storeNames} failed: ${event}`));
      request.onerror = (event) => reject(new Error(`getAll on store ${storeNames} failed: ${event}`));
      request.onsuccess = () => resolve(request.result);
    });
  }

  function getOne(storeName: string, key: string | number, index?: string) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = index ?  store.index(index).get(key) : store.get(key);
      transaction.onerror = (event) => reject(new Error(`getAll transaction on ${storeName} failed: ${event}`));
      request.onerror = (event) => reject(new Error(`getAll on store ${storeName} failed: ${event}`));
      request.onsuccess = () => resolve(request.result);
    });
  }

  function putAll<T>(storeName: string, items: T[]) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const length = items.length;
      const errors: Error[] = [];

      for (let i = 0; i < length; i++) {
        const request = store.put(items[i]);
        request.onerror = (event) => errors.push(new Error(`put fail: ${items[i]}`));
      }

      transaction.onerror = (event) => reject(new Error(`putAll to ${storeName} failed: ${event}`));
      transaction.oncomplete = () => {
        resolve({ result: undefined, errors });
      }
    })
  }

  function putOne<T>(storeName: string, item: T) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onerror = (event) => reject(new Error(`Failed to put item to ${storeName}: ${item}`));
      request.onsuccess = () => resolve(request.result);
    });
  }

  return { createDB, db, ready, getAll, getOne, putAll, putOne };
}
