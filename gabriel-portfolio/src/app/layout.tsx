import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Site zAIon | Virtual Studio do Gabriel',description:'Portfólio interativo de Gabriel: sites, landing pages, experiências digitais e soluções web.',icons:{icon:`${process.env.NEXT_PUBLIC_BASE_PATH||''}/favicon.svg`},openGraph:{title:'Site zAIon — Virtual Studio do Gabriel',description:'Sites com intenção. Experiências com personalidade.',locale:'pt_BR',type:'website'},robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
