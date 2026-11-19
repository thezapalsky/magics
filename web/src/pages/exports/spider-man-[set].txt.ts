import type { APIRoute } from 'astro';
import { missingBinderText, sceneProxyText } from '../../lib/binder.ts';

export function getStaticPaths() {
  return ['spm', 'spe', 'scenes'].map(set => ({ params: { set }, props: { set: set.toUpperCase() as 'SPM' | 'SPE' | 'SCENES' } }));
}
export const GET: APIRoute = ({ props }) => new Response(props.set === 'SCENES' ? sceneProxyText() : missingBinderText(props.set), {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});
