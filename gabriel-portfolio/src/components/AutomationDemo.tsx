"use client";
import {useReducer} from 'react';
import {scenarios,initialSimulation,simulationStep} from '@/lib/office/simulation.mjs';
export default function AutomationDemo(){
 const [state,dispatch]=useReducer(simulationStep,undefined,()=>initialSimulation());
 return <section className="automation-demo" aria-label="Simulador local de automações">
 <h3>Simulador local</h3><p>Demonstração roteirizada. Sem IA ao vivo, integração, agendamento ou envio.</p>
 <label>Área da demonstração<select aria-label="Área da demonstração" value={state.kind} onChange={e=>dispatch({type:'scenario',kind:e.target.value as keyof typeof scenarios})}>{Object.entries(scenarios).map(([id,item])=><option key={id} value={id}>{item.title}</option>)}</select></label>
 <label>Exemplo<select aria-label="Exemplo" value={state.choice} disabled={state.step>0} onChange={e=>dispatch({type:'choice',value:e.target.value})}>{scenarios[state.kind].choices.map((choice:string)=><option key={choice}>{choice}</option>)}</select></label>
 <ol>{scenarios[state.kind].stages.map((label:string,index:number)=><li key={label} aria-current={state.step===index?'step':undefined}>{index<state.step?'✓ ':`${index+1}. `}{label}</li>)}</ol>
 <div role="status">{state.step===0?'Pronto para simular.':state.step===3?`Simulação concluída: ${state.choice}. Nenhum dado foi enviado.`:`Etapa ${state.step} concluída: ${state.history.at(-1)}.`}</div>
 <div className="studio-actions"><button className="primary" type="button" disabled={state.step===3} onClick={()=>dispatch({type:'next'})}>{state.step===0?'Iniciar simulação':'Avançar etapa'}</button><button className="outline" type="button" onClick={()=>dispatch({type:'reset'})}>Reiniciar simulação</button></div>
 </section>;
}
