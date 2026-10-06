<script lang="ts">
  import { onMount } from 'svelte';
  let { src, alt, eager = false, art = false }: { src?: string; alt: string; eager?: boolean; art?: boolean } = $props();
  let failed = $state(false);
  let loaded = $state(false);
  let element: HTMLImageElement | undefined = $state();
  $effect(() => { src; failed = false; loaded = false; });
  // Cached images can finish (or fail) before the island has hydrated.
  onMount(() => {
    if (element?.complete) {
      failed = element.naturalWidth === 0;
      loaded = !failed;
    }
  });
</script>

<span class:art class="image-frame" class:loaded>
  <span class="image-placeholder" aria-hidden="true"><span class="placeholder-mark">◇</span><span>{alt}</span></span>
  {#if src && !failed}
    <img bind:this={element} {src} {alt} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchpriority={eager ? 'high' : 'auto'}
      width={art ? 626 : 488} height={art ? 457 : 680} onload={() => loaded = true} onerror={() => failed = true} />
  {:else}
    <span class="sr-only">Artwork unavailable: {alt}</span>
  {/if}
</span>

<style>
  .image-frame { display: block; position: relative; width: 100%; aspect-ratio: 488 / 680; overflow: hidden; background: #232621; border-radius: 9px; }
  .image-frame.art { aspect-ratio: 626 / 457; }
  .image-placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1rem; padding: 1rem; color: #999e91; font-size: .8rem; background: radial-gradient(ellipse at 50% 10%, #343e32, transparent 75%); }
  .placeholder-mark { font-size: 2rem; color: #75886a; }
  img { position: relative; display: block; width: 100%; height: 100%; object-fit: cover; }
</style>
