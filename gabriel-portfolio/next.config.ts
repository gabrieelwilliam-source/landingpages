import type {NextConfig} from 'next';
import deployment from './src/config/deployment.json';
const pages=process.env.GITHUB_PAGES==='true';
const basePath=process.env.NEXT_PUBLIC_BASE_PATH||deployment.basePath;
const config:NextConfig=pages?{
 output:'export',
 basePath,
 env:{NEXT_PUBLIC_BASE_PATH:basePath},
 trailingSlash:true,
 distDir:'.next-pages',
}:{};
export default config;
