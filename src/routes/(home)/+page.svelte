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

<!--
  WCAG 1.3.1 — Each fullPage.js section is a <section> landmark with an
  aria-labelledby pointing at the visible heading inside it, giving screen
  reader users a navigable list of page regions.
-->
<section class="section fp-auto-height-responsive" aria-label="Home — Introduction">
  <Hero />
</section>

<section class="section" aria-labelledby="heading-about">
  <About headingId="heading-about" />
</section>

<section class="section" aria-labelledby="heading-experience">
  <Experience headingId="heading-experience" />
</section>

<section class="section" aria-labelledby="heading-skills">
  <Skills headingId="heading-skills" />
</section>

<section class="section" aria-labelledby="heading-projects">
  <Projects headingId="heading-projects" />
</section>

<section class="section" aria-labelledby="heading-education">
  <Education headingId="heading-education" />
</section>

<section class="section" aria-labelledby="heading-blog">
  <Blog headingId="heading-blog" />
  <Footer />
</section>
