<script lang="ts">
  let { cost }: { cost: string } = $props();
  const names: Record<string, string> = { G: 'green', B: 'black', W: 'white', U: 'blue', R: 'red', C: 'colorless', T: 'tap', X: 'X' };
  let symbols = $derived(cost.match(/\{[^}]+\}/g)?.map(token => token.slice(1, -1)) ?? []);
</script>

<span class="mana" aria-label={symbols.map(symbol => names[symbol] ?? symbol).join(', ')}>
  {#each symbols as symbol}
    <span class="symbol" class:green={symbol === 'G'} class:black={symbol === 'B'} class:white={symbol === 'W'} class:blue={symbol === 'U'} class:red={symbol === 'R'} aria-hidden="true">{symbol}</span>
  {/each}
</span>

<style>
  .mana { display: inline-flex; gap: 3px; flex-wrap: wrap; }
  .symbol { display: inline-flex; align-items: center; justify-content: center; min-width: 1.2rem; height: 1.2rem; padding: 0 3px; border-radius: 50%; background: #c5c0ad; color: #292b27; font-size: .65rem; font-weight: 700; }
  .green { background: #91ad85; } .black { background: #b0a5b1; } .white { background: #e1d9b6; } .blue { background: #91beca; } .red { background: #d6987d; }
</style>
