import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteIsolation from 'vite-plugin-cross-origin-isolation';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteIsolation()],
  assetsInclude: ['**/*.tar.gz.load_by_url'],
  worker:{
    format: 'es'
  }
})
