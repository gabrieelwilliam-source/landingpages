import type {MetadataRoute} from 'next';
export const dynamic='force-static';
// Review version: unblock indexing only after domain/content approval.
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',disallow:'/'}}}
