import type {NextConfig} from 'next';
const pages=process.env.GITHUB_PAGES==='true';
const config:NextConfig=pages?{
 output:'export',
 basePath:process.env.NEXT_PUBLIC_BASE_PATH||'/Site-zAIon/gabriel',
 trailingSlash:true,
 distDir:'.next-pages',
}:{};
export default config;
