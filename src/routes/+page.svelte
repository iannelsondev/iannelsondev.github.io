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

<div class="section" data-anchor="home"><Hero /></div>
<div class="section" data-anchor="about"><About /></div>
<div class="section" data-anchor="experience"><Experience /></div>
<div class="section" data-anchor="skills"><Skills /></div>
<div class="section" data-anchor="projects"><Projects /></div>
<div class="section" data-anchor="education"><Education /></div>
<div class="section" data-anchor="blog">
  <Blog />
  <Footer />
</div>
