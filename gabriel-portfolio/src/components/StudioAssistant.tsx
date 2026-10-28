"use client";
import actors from '@/data/studio-actors.json';
import ProjectGallery from './ProjectGallery';
import AutomationDemo from './AutomationDemo';
import ContactForm from './ContactForm';
import BriefingAssistant from './BriefingAssistant';
export default function StudioAssistant({actor,onGuided,onFree,onClassic,onProjects,compact=false}:{actor:typeof actors[number];onGuided?:()=>void;onFree?:()=>void;onClassic?:()=>void;onProjects?:()=>void;compact?:boolean}){
 return <section className="studio-assistant" aria-label={`Orientação de ${actor.name}`}>
 <p className="demo-label">PERSONAGEM FICTÍCIO · ORIENTAÇÃO ROTEIRIZADA LOCAL</p>
 <p>{actor.intro}</p><p>{actor.detail}</p>
 {actor.target==='welcome'&&<div className="studio-actions">{onGuided&&<button className="primary" type="button" onClick={onGuided}>Visita guiada</button>}{onFree&&<button className="outline" type="button" onClick={onFree}>Exploração livre</button>}{onClassic&&<button className="outline" type="button" onClick={onClassic}>Conhecer no modo clássico</button>}{onProjects?<button type="button" className="outline" onClick={onProjects}>Conhecer projetos</button>:<a href="#studio-projects">Projetos no modo clássico</a>}</div>}
 {actor.target==='projects'&&(compact?<a className="outline" href="#projetos">Ver projetos conceituais</a>:<ProjectGallery/>)}
 {actor.target==='automation'&&(compact?<a className="outline" href="#zaion">Executar simulação local</a>:<AutomationDemo/>)}
 {actor.target==='briefing'&&(compact?<a className="outline" href="#contato">Preparar briefing local</a>:<><BriefingAssistant/><ContactForm/></>)}
 {actor.target==='approach'&&<ol><li>Definir o objetivo e o público.</li><li>Organizar conteúdo e referências.</li><li>Validar design, navegação e acessibilidade.</li><li>Testar antes de entregar.</li></ol>}
 </section>;
}
