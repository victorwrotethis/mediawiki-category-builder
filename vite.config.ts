import { defineConfig } from 'vite'

// https://vite.dev/guide/static-deploy#github-pages
export default defineConfig({
    base: '/mediawiki-category-builder/',
    build: {
        emptyOutDir: true,
        assetsDir: 'assets',
    }
})