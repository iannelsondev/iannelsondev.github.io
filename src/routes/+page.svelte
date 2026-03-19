<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import About from '$lib/components/About.svelte';
  import Experience from '$lib/components/Experience.svelte';
  import Skills from '$lib/components/Skills.svelte';
  import Projects from '$lib/components/Projects.svelte';
  import Blog from '$lib/components/Blog.svelte';
  import Education from '$lib/components/Education.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<div class="section fp-auto-height-responsive"><Hero /></div>
<div class="section"><About /></div>
<div class="section"><Experience /></div>
<div class="section"><Skills /></div>
<div class="section"><Projects /></div>
<div class="section"><Education /></div>
<div class="section fp-auto-height">
  <Blog />
  <Footer />
</div>
