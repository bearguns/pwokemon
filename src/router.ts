import { createRouter, createWebHistory } from "vue-router";
import DashboardPage from "./components/HelloWorld.vue";
import DetailsPage from "./components/PokemonDetails.vue";

export const router = createRouter({
  routes: [
    { name: "dashboard", path: "/", component: DashboardPage },
    { name: "details", path: "/:name", component: DetailsPage, props: true },
  ],
  history: createWebHistory(),
});
