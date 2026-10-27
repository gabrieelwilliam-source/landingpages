import {notFound} from 'next/navigation';
import Link from 'next/link';
import {projects,concepts} from '@/data/site';
export function generateStaticParams(){return projects.map(p=>({slug:p.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=projects.find(p=>p.slug===slug);return {title:p?`${p.title} — Conceito | Gabriel`:'Projeto não encontrado'}}
export default async function Case({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const p=projects.find(p=>p.slug===slug);if(!p)notFound();const demo=concepts[slug];
 return <main className="case-page"><Link className="case-back" href="/#projetos">← Voltar aos projetos</Link><p className="overline">PROJETO CONCEITUAL / SEM CLIENTE REAL</p><h1>{p.title}</h1><p>{p.description}</p><p>Estudo autoral de interface para demonstrar possibilidades de organização e linguagem visual. Não representa um trabalho contratado nem resultados comerciais.</p><section className="concept-demo" aria-label="Demonstração visual do conceito"><span>{demo.brand} / DEMONSTRAÇÃO</span><h2>{demo.headline}</h2><p>{demo.description}</p><div className="demo-grid">{demo.items.map((item,i)=><article key={item}><small>0{i+1}</small><h3>{item}</h3></article>)}</div></section><h2>Intenção do estudo</h2><p>{demo.goal}</p><h2>Construção</h2><p>Next.js, TypeScript e CSS autoral. Hierarquia de conteúdo, layout responsivo e componentes HTML sem dependências de animação.</p><Link className="case-back" href="/#contato">Conversar sobre um projeto →</Link></main>
}
