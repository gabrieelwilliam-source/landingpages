export const scenarios={
 clinic:{title:'Clínica',stages:['Solicitação recebida','Disponibilidade verificada','Confirmação preparada'],choices:['Consulta inicial','Retorno']},
 property:{title:'Imobiliária',stages:['Interesse registrado','Preferências organizadas','Visita sugerida'],choices:['Apartamento','Casa']},
 salon:{title:'Salão',stages:['Serviço selecionado','Horário simulado','Lembrete preparado'],choices:['Corte','Tratamento']},
 marketing:{title:'Marketing',stages:['Briefing organizado','Rascunho de pauta','Revisão pendente'],choices:['Campanha','Conteúdo orgânico']}
};
/** @typedef {{kind:keyof typeof scenarios,step:number,choice:string,history:string[]}} SimulationState */
/** @param {keyof typeof scenarios} kind @returns {SimulationState} */
export function initialSimulation(kind='clinic'){return {kind,step:0,choice:scenarios[kind].choices[0],history:[]};}
/** @param {SimulationState} state @param {{type:string,kind?:keyof typeof scenarios,value?:string}} action @returns {SimulationState} */
export function simulationStep(state,action){
 if(action.type==='reset')return initialSimulation(state.kind);
 if(action.type==='scenario')return scenarios[action.kind]?initialSimulation(action.kind):state;
 if(action.type==='choice')return state.step===0&&scenarios[state.kind].choices.includes(action.value)?{...state,choice:action.value}:state;
 if(action.type==='next'&&state.step<3)return {...state,step:state.step+1,history:[...state.history,scenarios[state.kind].stages[state.step]]};
 return state;
}
