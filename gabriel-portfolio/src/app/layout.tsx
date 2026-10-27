import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Gabriel — Desenvolvimento web | by zAIon',description:'Portfólio interativo de Gabriel: sites, landing pages, experiências digitais e soluções web.',icons:{icon:`${process.env.NEXT_PUBLIC_BASE_PATH||''}/favicon.svg`},openGraph:{title:'Gabriel — Web & Digital',description:'Sites com intenção. Experiências com personalidade.',locale:'pt_BR',type:'website'},robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
