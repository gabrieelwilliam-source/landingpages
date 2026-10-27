import type {MetadataRoute} from 'next';
import {projects} from '@/data/site';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{const base='https://gabrieelwilliam-source.github.io/landingpages/gabriel';return [{url:base+'/'},...projects.map(p=>({url:`${base}/projetos/${p.slug}/`}))]}
