import { defineConfig } from 'vite'

// https://vite.dev/guide/static-deploy#github-pages
export default defineConfig({
    base: '/mediawiki-category-builder/',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        assetsDir: 'assets',
    }
})