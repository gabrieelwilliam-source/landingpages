import type {MetadataRoute} from 'next';
import {projects} from '@/data/site';
import deployment from '@/config/deployment.json';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{const base=deployment.origin+(process.env.NEXT_PUBLIC_BASE_PATH||deployment.basePath);return [{url:base+'/'},...projects.map(p=>({url:`${base}/projetos/${p.slug}/`}))]}
