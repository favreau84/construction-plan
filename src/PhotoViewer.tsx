import {useState} from 'react';
import {Maximize,Minus,Plus} from 'lucide-react';
import {useCamera} from './useCamera';
import {photoURL,photoName} from './photos';
import {notes} from './geometry';
export function PhotoViewer({index}:{index:number}){
 const {ref,camera,setCamera,zoom}=useCamera({x:0,y:0,scale:1},.5,12);
 const [loaded,setLoaded]=useState(false),[failed,setFailed]=useState(false);
 return <div className="photo-viewer" ref={ref} tabIndex={0} aria-label={`Photo ${index+1}, molette pour zoomer et glisser pour déplacer`} onKeyDown={e=>{if(e.key==='+'||e.key==='=')zoom(1.25);if(e.key==='-')zoom(.8);if(e.key==='0')setCamera({x:0,y:0,scale:1});}}>
  <div className="photo-transform" style={{transform:`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`}}>
   <img className="large-photo" src={photoURL(index)} alt="" draggable={false}/>
   {!failed&&<img className="large-photo full-resolution" src={photoURL(index,false)} alt={`${photoName(index)}. ${notes[index]}`} draggable={false} onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)} style={{opacity:loaded?1:0}}/>}
  </div>
  <div className="photo-zoom"><button title="Dézoomer la photo" aria-label="Dézoomer la photo" onClick={()=>zoom(.8)}><Minus size={16}/></button><output>{Math.round(camera.scale*100)} %</output><button title="Zoomer la photo" aria-label="Zoomer la photo" onClick={()=>zoom(1.25)}><Plus size={16}/></button><button title="Ajuster la photo" aria-label="Ajuster la photo" onClick={()=>setCamera({x:0,y:0,scale:1})}><Maximize size={16}/></button></div>
  <div className="photo-hint">{failed?'Aperçu affiché · pleine résolution indisponible':!loaded?'Chargement de la pleine résolution…':'Molette pour zoomer · glisser pour déplacer'}</div>
 </div>
}
