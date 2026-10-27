'use client';
import {useEffect,useState} from 'react';
import Journey from './Journey';
import ContactForm from './ContactForm';
import Link from 'next/link';
import {chapters,projects,services} from '@/data/site';

type Mode='explorar'|'leitura';
export default function Experience(){
 const [mode,setMode]=useState<Mode>('leitura');
 const [idx,setIdx]=useState(0);
 const current=chapters[idx];
 const [checkpoint,setCheckpoint]=useState(0);
 function navigate(n:number){const target=Math.max(0,Math.min(chapters.length-1,n));setIdx(target);setCheckpoint(target)}
 function switchMode(next:Mode){setMode(next);if(next==='leitura')requestAnimationFrame(()=>document.getElementById(chapters[idx].id)?.scrollIntoView());else setCheckpoint(idx)}
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{if(mode==='leitura')for(const entry of entries)if(entry.isIntersecting){const i=chapters.findIndex(c=>c.id===entry.target.id);if(i>=0)setIdx(i)}},{rootMargin:'-10% 0px -55% 0px'});document.querySelectorAll('.content-section').forEach(s=>observer.observe(s));return()=>observer.disconnect()},[mode]);
 const chapterContent=(id:string)=>{
  if(id==='servicos')return <div className="cards">{services.map(x=><article className="mini-card" key={x.name}><h3>{x.name}</h3><p>{x.detail}</p></article>)}</div>;
  if(id==='projetos')return <div className="cards">{projects.map(x=><article className="mini-card" key={x.slug}><small>{x.category}</small><h3>{x.title}</h3><p>{x.description}</p><Link className="case-link" href={`/projetos/${x.slug}`}>Ver conceito ↗</Link></article>)}</div>;
  if(id==='processo')return <div className="steps">{['Descoberta','Direção','Design','Desenvolvimento','Revisão e entrega'].map((s,i)=><span key={s}>{String(i+1).padStart(2,'0')} / {s}</span>)}</div>;
  if(id==='contato')return <ContactForm/>;
  if(id==='zaion')return <p className="subtle">Sites que comunicam com clareza, conectados às possibilidades de IA e automação do ecossistema zAIon.</p>;
  return <p className="subtle">De Joinville/SC, com possibilidade de trabalho remoto. Uma abordagem que combina clareza visual, programação e atenção à experiência de quem usa.</p>;
 };
 return <main><a className="skip-link" href="#sobre">Pular para o conteúdo</a>
 <header className="topbar"><a className="signature" href="#inicio" onClick={()=>setMode('leitura')}>Gabriel<span className="dot">.</span><small>by zAIon</small></a><nav aria-label="Navegação principal"><a href="#sobre" onClick={()=>setMode('leitura')}>Sobre</a><a href="#projetos" onClick={()=>setMode('leitura')}>Projetos</a><a href="#contato" onClick={()=>setMode('leitura')}>Contato</a></nav></header>
 <section className="hero" id="inicio"><div className="eyebrow"><span className="gold-line"/>PORTFÓLIO / DESENVOLVIMENTO WEB</div><h1>Sites com<br/><em>intenção.</em><br/>Experiências com<br/>personalidade.</h1><p>Sou Gabriel. Crio interfaces, sites e experiências digitais. Esta é minha frente de desenvolvimento web dentro do universo zAIon.</p><div className="hero-actions"><button className="primary" onClick={()=>{setMode('explorar');navigate(0);document.getElementById('experiencia')?.scrollIntoView({behavior:'smooth'})}}>Explorar interativamente <span aria-hidden="true">↗</span></button><button className="outline" onClick={()=>{setMode('leitura');document.getElementById('projetos')?.scrollIntoView({behavior:'smooth'})}}>Ver trabalhos</button><a className="outline" href="#contato">Solicitar um projeto</a></div><div className="hero-bottom"><span>JOINVILLE / SC</span><span>DESENVOLVIMENTO · WEB · AUTOMAÇÃO</span><span>01 — 06</span></div></section>
 <section className="experience-wrap" id="experiencia" aria-label="Experiência interativa"><div className="section-head"><div><span className="overline">NAVEGUE NO SEU RITMO</span><h2>Uma jornada. Dois caminhos.</h2></div><div className="mode-tabs" role="group" aria-label="Modo de navegação"><button aria-pressed={mode==='explorar'} className={mode==='explorar'?'active':''} onClick={()=>switchMode('explorar')}>◈ Explorar</button><button aria-pressed={mode==='leitura'} className={mode==='leitura'?'active':''} onClick={()=>switchMode('leitura')}>☷ Leitura</button></div></div>
 {mode==='explorar'?<div className="game-area"><Journey index={checkpoint} onChapter={setIdx}/><nav className="checkpoint-links" aria-label="Checkpoints">{chapters.map((c,i)=><button key={c.id} aria-current={i===idx?'step':undefined} onClick={()=>navigate(i)}>{c.index} {c.nav}</button>)}</nav><div className="game-detail"><h3>Dentro desta fase</h3>{chapterContent(current.id)}<a href={`#${current.id}`} onClick={()=>switchMode('leitura')}>Abrir seção completa ↗</a></div></div>:<div className="read-mode"><p className="read-intro">Todo o conteúdo também está disponível abaixo, sem exigir que você jogue.</p><div className="chapter-links">{chapters.map(c=><a key={c.id} href={`#${c.id}`}>{c.index} / {c.nav} ↗</a>)}</div></div>}
 </section>
 <div className="content-sections">{chapters.map(c=><section key={c.id} className="content-section" id={c.id}><div className="number">{c.index} / 06</div><div className="section-content"><span className="overline">{c.nav.toUpperCase()}</span><h2>{c.headline}</h2><p className="description">{c.description}</p>{chapterContent(c.id)}</div></section>)}</div>
 <footer><strong>Gabriel<span className="dot">.</span></strong><span>Desenvolvimento web · by zAIon</span><a href="#inicio">Voltar ao início ↑</a></footer>
 </main>
}
