import {useEffect,useReducer,useState} from 'react';
import {Eye,EyeOff,Map as MapIcon,Maximize,Minus,Plus,X,Images,Check} from 'lucide-react';
import {stations,features,notes} from './geometry';
import metadata from './photos.json';
import {photoName,photoURL} from './photos';
import {Rectified} from './Rectified';
import {PlanDrawing} from './PlanDrawing';
import {PhotoViewer} from './PhotoViewer';
import {useCamera} from './useCamera';
import {initialSelection,selectionReducer} from './viewer-state';
const U=32,X0=100,Y=280;
export default function App(){
 const [selection,dispatch]=useReducer(selectionReducer,initialSelection);
 const [showPhotos,setShowPhotos]=useState(false),[opacity,setOpacity]=useState(.7);
 const map=useCamera({x:0,y:0,scale:1});
 function fit(){const el=map.ref.current;if(!el)return;const available=el.clientWidth-(selection.open&&el.clientWidth>760?Math.min(el.clientWidth*.49,680):0);const scale=Math.max(.15,Math.min((available-50)/1550,(el.clientHeight-140)/450,1.8));map.setCamera({scale,x:(available-1680*scale)/2,y:(el.clientHeight-560*scale)/2});}
 useEffect(()=>{const el=map.ref.current;if(!el)return;const scale=Math.max(.15,Math.min((el.clientWidth-50)/1550,(el.clientHeight-140)/450,1.8));map.setCamera({scale,x:(el.clientWidth-1680*scale)/2,y:(el.clientHeight-560*scale)/2});},[]);
 useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape')dispatch({type:'close'});};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);
 function select(index:number,additive=false){dispatch({type:'select',photo:index,additive});}
 function selectFeature(f:typeof features[number]){dispatch({type:'feature',id:f.id,photos:f.photos,reference:f.referencePhoto??f.photos[0]});}
 const transform=`translate(${map.camera.x}px,${map.camera.y}px) scale(${map.camera.scale})`;
 return <main className="app">
  <header className="app-header"><div className="brand"><MapIcon size={25}/><div><h1>Le trottoir</h1><span>Relevé photographique · 10 septembre 2026</span></div></div><span className="status"><i/> Plan interprété</span></header>
  <div className="workspace">
   <aside className="photo-sidebar" aria-label="Liste des photos"><div className="sidebar-heading"><h2>Photos <span>19</span></h2><p>Clic pour ouvrir · Maj + clic pour combiner</p></div>
    <div className="photo-list">{metadata.map((p,i)=><button key={p.name} className={`photo-row ${selection.photos.includes(i)?'selected':''} ${selection.active===i?'current':''}`} aria-label={`Sélectionner ${photoName(i)}`} aria-pressed={selection.photos.includes(i)} onClick={e=>select(i,e.shiftKey)}><img src={photoURL(i)} alt="" loading="lazy"/><span className="row-copy"><strong><span>{String(i+1).padStart(2,'0')}</span> {p.name}</strong><small>{notes[i]}</small></span>{selection.photos.includes(i)&&<Check size={16}/>}</button>)}</div>
    <div className="sidebar-footer"><span>{selection.photos.length} photo{selection.photos.length>1?'s':''} sélectionnée{selection.photos.length>1?'s':''}</span><details><summary>Précision du plan</summary><p>Tracé et dimensions estimés. Les projections ne constituent pas une orthomosaïque calibrée. A2 est recalé sur la photo 10.</p></details></div>
   </aside>
   <section className="plan-panel" aria-label="Plan interactif">
    <div className="toolbar"><strong>Vue de dessus</strong><div className="layer-controls"><button className={`layer-toggle ${showPhotos?'enabled':''}`} aria-pressed={showPhotos} onClick={()=>setShowPhotos(v=>!v)}>{showPhotos?<Eye size={17}/>:<EyeOff size={17}/>}<span>{showPhotos?'Masquer les photos':'Afficher les photos'}</span></button><label className="opacity-control"><span>Opacité</span><input aria-label="Opacité de toutes les photos" type="range" min="0" max="100" value={Math.round(opacity*100)} onChange={e=>setOpacity(Number(e.target.value)/100)}/><output>{Math.round(opacity*100)} %</output></label></div></div>
    <div className="plan-stage">
     <div className="map-viewport" ref={map.ref} tabIndex={0} aria-label="Plan : molette pour zoomer, glisser pour déplacer" onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='+'||e.key==='=')map.zoom(1.25);if(e.key==='-')map.zoom(.8);if(e.key==='0')fit();const moves:Record<string,number[]>={ArrowLeft:[60,0],ArrowRight:[-60,0],ArrowUp:[0,60],ArrowDown:[0,-60]};const d=moves[e.key];if(d){e.preventDefault();map.setCamera(c=>({...c,x:c.x+d[0],y:c.y+d[1]}));}}}>
      <div className="map-world" style={{transform}}><PlanDrawing showPhotos={showPhotos}/>
       {stations.map((s,i)=><div key={i} className={`photo-footprint ${selection.photos.includes(i)?'selected':''} ${selection.active===i?'active':''}`} style={{left:X0+s*U,top:Y-60,width:176,height:160}}><div className="projection-texture" style={{opacity,display:showPhotos?'block':'none'}}>{showPhotos&&<Rectified index={i}/>}</div><button className="frame-outline" aria-label={`Sélectionner la photo ${i+1}`} aria-pressed={selection.photos.includes(i)} onClick={e=>select(i,e.shiftKey)}/></div>)}
      </div>
      <svg className="number-connectors" aria-hidden="true">{stations.map((s,i)=>{const x=map.camera.x+(X0+s*U)*map.camera.scale;return <line key={i} x1={x} x2={x} y1={map.camera.y+380*map.camera.scale} y2={map.camera.y+380*map.camera.scale+20+(i%3)*36} stroke="#7897af" strokeOpacity=".5"/>})}</svg>
      {stations.map((s,i)=><button key={i} className={`photo-number ${selection.photos.includes(i)?'selected':''} ${selection.active===i?'active':''}`} style={{left:map.camera.x+(X0+s*U)*map.camera.scale-14,top:map.camera.y+380*map.camera.scale+18+(i%3)*36}} aria-label={`Photo ${i+1} : ${photoName(i)}`} aria-pressed={selection.photos.includes(i)} onClick={e=>select(i,e.shiftKey)} title={`${photoName(i)} · Maj + clic : ajouter / retirer`}>{String(i+1).padStart(2,'0')}</button>)}
      {features.map(f=><div className={`feature-marker ${selection.feature===f.id?'active':''}`} key={f.id} style={{left:map.camera.x+(X0+f.x*U)*map.camera.scale,top:map.camera.y+(Y+f.y*U)*map.camera.scale-33}}><button aria-label={`${f.id} : ${f.label}`} aria-expanded={selection.feature===f.id} aria-describedby={selection.feature===f.id?`tooltip-${f.id}`:undefined} onClick={()=>selectFeature(f)}>{f.id}</button>{selection.feature===f.id&&<div role="tooltip" id={`tooltip-${f.id}`} className="feature-tooltip"><strong>{f.label}</strong><span>{f.photos.length} photo{f.photos.length>1?'s':''} associée{f.photos.length>1?'s':''}</span></div>}</div>)}
     </div>
     <div className="map-navigation"><button aria-label="Dézoomer le plan" onClick={()=>map.zoom(.8)}><Minus size={17}/></button><output>{Math.round(map.camera.scale*100)} %</output><button aria-label="Zoomer le plan" onClick={()=>map.zoom(1.25)}><Plus size={17}/></button><button aria-label="Voir tout le tracé" title="Voir tout le tracé" onClick={fit}><Maximize size={17}/></button></div>
     <div className="plan-hint">Molette : zoom · Glisser : déplacer · Maj + clic : sélection multiple</div>
     {selection.open&&selection.active!==null&&<aside className="photo-drawer" aria-label="Photos sélectionnées"><div className="drawer-header"><div><span className="eyebrow">{selection.feature?features.find(f=>f.id===selection.feature)?.label:'PHOTO SÉLECTIONNÉE'}</span><h2>{photoName(selection.active)} <small>{selection.active+1} / 19</small></h2></div><button aria-label="Fermer le panneau photo" title="Fermer · Échap" onClick={()=>dispatch({type:'close'})}><X size={20}/></button></div>
      <div className="drawer-image-area"><PhotoViewer key={selection.active} index={selection.active}/>{selection.photos.length>1&&<nav className="selected-thumbnails" aria-label="Photos de la sélection"><span><Images size={15}/>{selection.photos.length}</span>{selection.photos.map(i=><button key={i} className={selection.active===i?'active':''} onClick={()=>dispatch({type:'activate',photo:i})} aria-label={`Afficher la photo ${i+1} de la sélection`} aria-current={selection.active===i?'true':undefined}><img src={photoURL(i)} alt=""/><span>{String(i+1).padStart(2,'0')}</span></button>)}</nav>}</div>
      <div className="drawer-caption"><p>{notes[selection.active]}</p><small>{metadata[selection.active].time.slice(11)} · Photo sans redressement</small></div>
     </aside>}
    </div>
   </section>
  </div>
 </main>
}
