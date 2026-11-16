import { fileURLToPath } from 'node:url';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) } })],
      adapter: adapter(),
      alias: { '#lib': 'src/lib' },
      inlineStyleThreshold: Infinity,
      prerender: { entries: ['/kb', '/kb/incidents/4471', '/kb/incidents/4471/problems', '/kb/triage/dedupe', '/kb/decisions/0001-dedupe-by-subject'] },
    }),
  ],
});
