'use client';
import {useState} from 'react';
import {useContactDraft} from './ContactDraftContext';
export default function ContactForm(){
 const {draft,update,clear}=useContactDraft();
 const [summary,setSummary]=useState('');
 return <form className="contact-form" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);setSummary(`Nome: ${data.get('name')}\nE-mail: ${data.get('email')}\nProjeto: ${data.get('message')}`)}}>
  <p id="contact-note">O canal de envio ainda não está disponível. Prepare um resumo local para guardar: nada será enviado ou armazenado em servidor.</p>
  <p>O rascunho acompanha a troca de modos e o fechamento do painel nesta página. Recarregar ou sair da página apaga o rascunho.</p>
  <label>Seu nome<input name="name" value={draft.name} onChange={e=>{update('name',e.target.value);setSummary('')}} autoComplete="name" required minLength={2} maxLength={100}/></label>
  <label>E-mail<input name="email" value={draft.email} onChange={e=>{update('email',e.target.value);setSummary('')}} type="email" autoComplete="email" required maxLength={254}/></label>
  <label>O que você quer construir?<textarea name="message" value={draft.message} onChange={e=>{update('message',e.target.value);setSummary('')}} required minLength={20} maxLength={3000} rows={5}/></label>
  <button className="primary" aria-describedby="contact-note">Preparar resumo local</button>
  <button type="button" className="outline" onClick={()=>{clear();setSummary('')}}>Limpar rascunho</button>
  {summary&&<div role="status"><h3>Resumo preparado — não enviado</h3><p>Copie este texto e guarde até o canal oficial estar disponível.</p><textarea aria-label="Resumo do projeto" value={summary} readOnly rows={8}/></div>}
 </form>
}
