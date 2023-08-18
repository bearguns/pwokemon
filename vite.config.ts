import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({ registerType: 'autoUpdate', devOptions: { enabled: true }, manifest: {
      display: "standalone",
      name: "PWokemon",
      
    } }),
  ],
})
