'use client';
import {useEffect,useRef,useState} from 'react';
import Avatar from './Avatar';
import {chapters} from '@/data/site';
import {step,obstacles,chapterAt,WORLD_END} from '@/lib/physics.mjs';
export default function Journey({index,onChapter}:{index:number;onChapter:(i:number)=>void}){
 const player=useRef({x:index*600,y:0,vy:0});
 const [frame,setFrame]=useState(player.current);
 const keys=useRef(new Set<string>());
 const jumping=useRef(false);
 const [moving,setMoving]=useState(false);
 const [paused,setPaused]=useState(false);
 const [reduced,setReduced]=useState(false);
 const region=useRef<HTMLDivElement>(null);
 const callback=useRef(onChapter); callback.current=onChapter;
 useEffect(()=>{player.current={x:index*600,y:0,vy:0};setFrame(player.current)},[index]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(media.matches);sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync)},[]);
 useEffect(()=>{
  const clear=()=>{keys.current.clear();jumping.current=false;setMoving(false)};
  window.addEventListener('blur',clear);
  let previous=0,raf=0,lastChapter=index;
  const tick=(now:number)=>{
   const dt=previous?(now-previous)/1000:0;previous=now;
   const direction=Number(keys.current.has('right'))-Number(keys.current.has('left'));
   if(!paused){player.current=step(player.current,direction,jumping.current,dt);jumping.current=false;setFrame(old=>old.x===player.current.x&&old.y===player.current.y?old:{...player.current});setMoving(direction!==0);
    const chapter=chapterAt(player.current.x);if(chapter!==lastChapter){lastChapter=chapter;callback.current(chapter)}
   }
   raf=requestAnimationFrame(tick);
  };raf=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('blur',clear);clear()};
 },[paused]);
 function key(e:React.KeyboardEvent,down:boolean){
  if(e.target!==region.current)return;
  const k=e.key.toLowerCase();const dir=['arrowleft','a'].includes(k)?'left':['arrowright','d'].includes(k)?'right':null;
  if(dir){e.preventDefault();down?keys.current.add(dir):keys.current.delete(dir)}
  if(k===' '){e.preventDefault();if(down&&!e.repeat)jumping.current=true}
 }
 const currentChapter=chapterAt(frame.x);
 const camera=Math.max(0,Math.min(WORLD_END-160,frame.x-100));
 return <div className="journey" ref={region} tabIndex={0} role="region" aria-label="Percurso jogável" aria-describedby="game-help" onKeyDown={e=>key(e,true)} onKeyUp={e=>key(e,false)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))keys.current.clear()}}>
  <div className="game-top"><span>CAPÍTULO {chapters[currentChapter].index} / 06</span><button aria-pressed={paused} onClick={()=>{keys.current.clear();setPaused(!paused)}}>{paused?'Continuar':'Pausar'}</button></div>
  <p id="game-help" className="game-help">Toque no percurso ou use Tab para focar. ← → ou A/D para andar; espaço para saltar os blocos. Os atalhos abaixo também levam aos capítulos.</p>
  <div className="game-scene" onClick={()=>region.current?.focus()}>
   <div className="scene-number" aria-hidden="true">{chapters[currentChapter].index}</div>
   <div className="scene-copy"><p>{chapters[currentChapter].nav.toUpperCase()}</p><h3>{chapters[currentChapter].headline}</h3></div>
   <div className="world-window" aria-hidden="true"><div className="world" style={{transform:`translateX(${-camera}px)`}}>
    {chapters.map((c,i)=><div className="world-sign" key={c.id} style={{left:i*600+40}}>{c.index} / {c.nav}</div>)}
    {obstacles.map(o=><div className="obstacle" key={o.x} style={{left:o.x,width:o.width,height:o.height}}/>)}
    <div className="walker" style={{left:frame.x+40,bottom:frame.y}}><Avatar moving={moving&&!paused&&!reduced} jumping={frame.y>0}/></div>
   </div></div>
  </div>
  <div className="game-bottom"><div className="game-btns">{(['left','right'] as const).map(dir=><button key={dir} aria-label={dir==='left'?'Andar à esquerda':'Andar à direita'} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);keys.current.add(dir)}} onPointerUp={()=>keys.current.delete(dir)} onPointerCancel={()=>keys.current.delete(dir)} onLostPointerCapture={()=>keys.current.delete(dir)}>{dir==='left'?'←':'→'}</button>)}<button onClick={()=>jumping.current=true}>↑ Pular</button></div><span>{paused?'Percurso pausado':`${Math.round(frame.x/WORLD_END*100)}% do percurso`}</span></div>
 </div>
}
