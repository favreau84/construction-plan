import {useEffect,useRef,useState} from 'react';
import {zoomAt,type Camera} from './viewer-state';
export function useCamera(initial:Camera,min=.15,max=8){
 const ref=useRef<HTMLDivElement>(null),[camera,setCamera]=useState(initial);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  let drag:{id:number;x:number;y:number}|null=null;let moved=false;
  const wheel=(e:WheelEvent)=>{if((e.target as HTMLElement).closest('input'))return;e.preventDefault();const r=el.getBoundingClientRect();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?el.clientHeight:1);setCamera(c=>zoomAt(c,{x:e.clientX-r.left,y:e.clientY-r.top},Math.exp(-Math.max(-300,Math.min(300,delta))*.002),min,max));};
  const down=(e:PointerEvent)=>{if(e.button!==0||((e.target as HTMLElement).closest('button,input,a')&&!(e.target as HTMLElement).closest('.frame-outline')))return;moved=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY};};
  const move=(e:PointerEvent)=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<4)return;moved=true;el.setPointerCapture(e.pointerId);el.classList.add('dragging');drag={...drag,x:e.clientX,y:e.clientY};setCamera(c=>({...c,x:c.x+dx,y:c.y+dy}));};
  const click=(e:MouseEvent)=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}};
  const end=()=>{drag=null;el.classList.remove('dragging');};
  el.addEventListener('click',click,true);el.addEventListener('wheel',wheel,{passive:false});el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end);
  return()=>{el.removeEventListener('click',click,true);el.removeEventListener('wheel',wheel);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',end);el.removeEventListener('pointercancel',end);el.removeEventListener('lostpointercapture',end)};
 },[min,max]);
 function zoom(factor:number){const el=ref.current;if(el)setCamera(c=>zoomAt(c,{x:el.clientWidth/2,y:el.clientHeight/2},factor,min,max));}
 return {ref,camera,setCamera,zoom};
}
