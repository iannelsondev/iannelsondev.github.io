import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import obfuscator from 'rollup-plugin-obfuscator';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	],
	build: {
		rollupOptions: {
			plugins: [
				obfuscator({
					compact: true,
					controlFlowFlattening: true,
					deadCodeInjection: false,
					debugProtection: false,
					selfDefending: false,
					stringArray: true,
					stringArrayThreshold: 0.75
				})
			]
		}
	}
});
