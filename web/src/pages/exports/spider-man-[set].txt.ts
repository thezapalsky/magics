import type { APIRoute } from 'astro';
import { missingBinderText } from '../../lib/binder.ts';

export function getStaticPaths() {
  return ['spm', 'spe'].map(set => ({ params: { set }, props: { set: set.toUpperCase() as 'SPM' | 'SPE' } }));
}
export const GET: APIRoute = ({ props }) => new Response(missingBinderText(props.set), {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});
