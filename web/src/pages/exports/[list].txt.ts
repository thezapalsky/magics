import { families, loadCache, loadDeck } from '../../lib/decks.ts';
import type { APIRoute } from 'astro';

export function getStaticPaths() {
  const cache = loadCache();
  return families.flatMap(family => family.versions.map(snapshot => ({
    params: { list: `${family.id}-${snapshot.version}` },
    props: { text: loadDeck(family, snapshot.version, cache).exportText },
  })));
}

export const GET: APIRoute = ({ props }) => new Response(props.text, {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});
