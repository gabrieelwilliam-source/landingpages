"use client";
import {useState} from 'react';
import {useContactDraft} from './ContactDraftContext';
export default function BriefingAssistant(){
 const {draft,update}=useContactDraft();
 const [kind,setKind]=useState('Landing page'),[goal,setGoal]=useState('Apresentar um serviço'),[saved,setSaved]=useState(false);
 return <section className="briefing-assistant" aria-label="Briefing guiado local"><h3>Organizar a ideia</h3><p>Escolha um ponto de partida. Você poderá editar o texto antes de guardar seu resumo.</p>
 <label>Tipo de projeto<select value={kind} onChange={e=>{setKind(e.target.value);setSaved(false)}}>{['Landing page','Site institucional','Portfólio','Automação'].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Objetivo principal<select value={goal} onChange={e=>{setGoal(e.target.value);setSaved(false)}}>{['Apresentar um serviço','Organizar informações','Mostrar trabalhos','Reduzir tarefas repetitivas'].map(x=><option key={x}>{x}</option>)}</select></label>
 <button type="button" className="outline" disabled={saved} onClick={()=>{const text=`Projeto: ${kind}. Objetivo: ${goal}. Público, conteúdo, prazo e critérios de revisão a definir.`;update('message',draft.message?`${draft.message}\n\n${text}`:text);setSaved(true)}}>Adicionar ao rascunho</button>
 {saved&&<p role="status">Ideia adicionada ao rascunho local. O texto anterior foi preservado.</p>}
 </section>;
}
