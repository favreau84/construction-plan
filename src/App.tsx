'use client';
import {useEffect,useRef,useState,memo} from 'react';
import {Eye, Image as ImageIcon, Layers, Minus, Plus, Maximize, Map as MapIcon, ChevronRight} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {homography,project,stations,projectionBands,a2Contours,features,notes} from './geometry';
import metadata from './photos.json';

const U=32, X=100, Y=280, L=176, H=160;
const photoName=(i:number)=>`IMG_${6587+i}`;
const photoURL=(i:number,preview=true)=>`${import.meta.env.BASE_URL}photos/${photoName(i)}${preview?'-preview':''}.jpg`;
const cache=new Map<number,string>();
const Rectified=memo(function Rectified({index}:{index:number}){
 const ref=useRef<HTMLCanvasElement>(null);const [error,setError]=useState('');
 useEffect(()=>{let dead=false;const img=new window.Image();
 img.onload=()=>{if(dead||!ref.current)return;const canvas=ref.current;canvas.width=528;canvas.height=480;const ctx=canvas.getContext('2d')!;
 if(cache.has(index)){const cached=new window.Image();cached.onload=()=>{if(!dead)ctx.drawImage(cached,0,0)};cached.src=cache.get(index)!;return;}
 try{const src=document.createElement('canvas');src.width=img.width;src.height=img.height;const sc=src.getContext('2d')!;sc.drawImage(img,0,0);const pixels=sc.getImageData(0,0,img.width,img.height);const output=ctx.createImageData(528,480);
 const bands=projectionBands(index);
 for(const b of bands){const h=homography([[0,b.a],[528,b.a],[528,b.b],[0,b.b]],b.pts.map(([x,y])=>[x*img.width,y*img.height]));
 for(let y=b.a;y<b.b;y++)for(let x=0;x<528;x++){const [sx,sy]=project(h,x+.5,y+.5);const ix=Math.floor(sx),iy=Math.floor(sy);if(ix<0||iy<0||ix>=img.width-1||iy>=img.height-1)continue;const dx=sx-ix,dy=sy-iy,di=((479-y)*528+x)*4;for(let c=0;c<3;c++){const at=(xx:number,yy:number)=>pixels.data[(yy*img.width+xx)*4+c];output.data[di+c]=(1-dy)*((1-dx)*at(ix,iy)+dx*at(ix+1,iy))+dy*((1-dx)*at(ix,iy+1)+dx*at(ix+1,iy+1));}output.data[di+3]=255;}}
 ctx.putImageData(output,0,0);cache.set(index,canvas.toDataURL());}catch{setError('Projection indisponible');}};
 img.onerror=()=>setError('Image indisponible');img.src=photoURL(index);return()=>{dead=true};},[index]);
 return <><canvas ref={ref} style={{width:'100%',height:'100%'}} aria-label={`Projection estimée de ${photoName(index)}`}/>{error&&<span className="error">{error}</span>}</>;
});
export default function Home(){
 const [active,setActive]=useState(3),[visible,setVisible]=useState<number[]>([]),[original,setOriginal]=useState<number|null>(null),[zoom,setZoom]=useState(1),[selectedFeature,setSelectedFeature]=useState<string|null>(null);
 const viewport=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  type Tool={name:string;description:string;inputSchema:object;execute:(input:unknown)=>unknown;annotations:object};
  const context=(document as Document & {modelContext?:{registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
  if(!context)return;const life=new AbortController();
  try{Promise.resolve(context.registerTool({name:'show_photo_projection',description:'Afficher une projection photographique estimée sur le plan du trottoir.',inputSchema:{type:'object',properties:{photo:{type:'integer',minimum:6587,maximum:6605}},required:['photo'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){const photo=(input as {photo?:unknown})?.photo;if(typeof photo!=='number'||!Number.isInteger(photo)||photo<6587||photo>6605)throw Error('Photo attendue : entier de 6587 à 6605');const i=photo-6587;setActive(i);setVisible(v=>v.includes(i)?v:[...v,i]);return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve({photo,visible:true,precision:'estimée'}))));}},{signal:life.signal})).catch(()=>{});}catch{}return()=>life.abort();
 },[]);
 function toggle(i:number){setActive(i);setVisible(v=>v.includes(i)?v.filter(n=>n!==i):[...v,i]);}
 function focus(i:number){setActive(i);viewport.current?.scrollTo({left:Math.max(0,(X+stations[i]*U)*zoom-250),behavior:'smooth'});}
 function fit(){if(viewport.current){setZoom(Math.max(.4,Math.min(1,viewport.current.clientWidth/1680)));viewport.current.scrollTo({left:0,top:0});}}
 return <main>
 <header><div className="brand"><MapIcon size={25}/><div><h1>Le trottoir</h1><span>Relevé photographique · 10 septembre 2026</span></div></div><div className="status"><i/> Plan interprété <span>19 photos</span></div></header>
 <div className="workspace"><aside><div className="eyebrow">LECTURE DU SITE</div><h2>Bordure & environs</h2><p className="intro">Un tracé continu, les ruptures de niveau et les repères observés.</p>
 <div className="legend"><div><i className="line blue"/> Arête haute · trottoir</div><div><i className="line dark"/> Pied de bordure · chaussée</div><div><i className="line dotted"/> Emprise photo estimée</div><div><i className="dot"/> Point singulier</div></div>
 <div className="section-title">Points singuliers <span>{features.length}</span></div>
 <div className="feature-list">{features.map(f=><button key={f.id} className={selectedFeature===f.id?'selected':''} onClick={()=>{setSelectedFeature(f.id);focus(f.referencePhoto ?? f.photos[0]);}}><span className="feature-id">{f.id}</span><span>{f.label}<small>{f.photos.map(i=>6587+i).join(' · ')}</small></span><ChevronRight size={15}/></button>)}</div>
 <details className="method"><summary>Précision & méthode</summary><p>Tracé dessiné par interprétation des 19 photos. Stations estimées par la séquence et les repères communs. Les distances et la largeur ne sont pas mesurées.</p><p>Hypothèse : largeur du trottoir ≈ 3 m. La position GPS initiale est aberrante ; les suivantes ont une incertitude annoncée de 4 à 5 m.</p><p>Chaque image est projetée par homographies distinctes sur le trottoir, le dessus de bordure et la chaussée. La face verticale est représentée par ses arêtes, pas étalée sur le sol. Les poteaux, reliefs et parties hors champ ne sont pas reconstruits.</p><p>Les cadres couvrent une zone utile de sol, pas l’ensemble du champ photographique. Les derniers cadres sont moins fiables dans l’arrondi. Ce plan ne constitue pas un relevé topographique.</p></details>
 </aside><section className="plan-panel"><div className="toolbar"><div><span className="eyebrow">PLAN 2D</span><strong>Vue de dessus</strong></div><div className="tools"><button onClick={()=>setVisible([])} disabled={!visible.length}><Layers size={17}/><span>Masquer les photos</span></button><div className="zoom"><button aria-label="Dézoomer" onClick={()=>setZoom(z=>Math.max(.4,z-.15))}><Minus size={17}/></button><span>{Math.round(zoom*100)} %</span><button aria-label="Zoomer" onClick={()=>setZoom(z=>Math.min(2.5,z+.15))}><Plus size={17}/></button></div><button onClick={fit} title="Voir tout le tracé" aria-label="Voir tout le tracé"><Maximize size={17}/></button></div></div>
 <div className="map-viewport" ref={viewport} tabIndex={0} aria-label="Plan défilant du trottoir"><div className="map-sized" style={{width:1680*zoom,height:640*zoom}}><div className="map" style={{transform:`scale(${zoom})`}}>
 <svg className="base-plan" width="1680" height="640" role="img" aria-label="Plan interprété : trottoir rectiligne terminé par un arrondi, trois avaloirs et plusieurs regards"><defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#dce4ec" strokeWidth=".7"/></pattern><pattern id="grass" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M2 8l3-4m1 5l3-4" stroke="#abc6bb" strokeWidth=".8"/></pattern></defs>
 <rect width="1680" height="640" fill="url(#grid)"/>
 <g transform="translate(0 560) scale(1 -1)">
 <path d="M80 110H1280V184H80Z" fill="url(#grass)"/>
 <path d="M80 286H1450V422H80Z" fill="#e0e6ed"/>
 <path d="M80 184H1370Q1480 184 1480 280H80Z" fill="#f8fbfe" stroke="#acc0cd"/>
 <path d="M80 280H1480Q1480 184 1370 184" fill="none" stroke="#087eae" strokeWidth="3"/>
 <path d="M80 287H1487Q1487 177 1370 177" fill="none" stroke="#334a5c" strokeWidth="2"/>
 <path d="M80 276H1475" stroke="#b8c9d4"/>
 {Array.from({length:42},(_,i)=><path key={i} d={`M${100+i*32} 280v7`} stroke="#536b7a"/>)}
 <path d="M80 184H1270" stroke="#769c89" strokeWidth="2"/>
 {[3,10,17,24,30,35].map(x=><path key={x} d={`M${X+x*U} 184V276`} stroke="#b6c8d4" strokeDasharray="3 3"/>)}
 {[0,1,2].map(i=><rect key={i} x="225" y={300+i*36} width="96" height="18" fill="white" stroke="#aebcc7"/>)}
 <path d="M600 345h45m-13-12 13 12-13 12" fill="none" stroke="white" strokeWidth="7"/>
 <path d="M1328 310v65" stroke="white" strokeWidth="5"/>
 </g>
 <text x="1040" y="413" className="map-label">RIVE ENGAZONNÉE</text><text x="850" y="330" className="map-label">TROTTOIR · À DROITE</text><text x="1040" y="185" className="map-label">CHAUSSÉE · À GAUCHE</text><text x="1430" y="413" className="map-small">Retour arrondi</text><text x="1430" y="432" className="map-small">géométrie estimée</text>
 <text x="100" y="70" className="map-title">01 — 19</text><text x="225" y="70" className="map-small">Sens de la marche →</text>
 <path d="M100 596h160m-160-5v10m160-10v10" stroke="#41566b" strokeWidth="2"/><text x="100" y="623" className="map-small">≈ 5 m · échelle indicative</text>
 </svg>
 {stations.map((s,i)=><div key={i} className={`photo-footprint ${active===i?'active':''}`} style={{left:X+s*U,top:Y-60,width:L,height:H,zIndex:visible.includes(i)?4:2,pointerEvents:'none'}}>{visible.includes(i)&&<Rectified index={i}/>}<div className="frame-outline"/><span className="frame-number">{String(i+1).padStart(2,'0')}</span></div>)}
 <svg className="features-overlay" width="1680" height="640" aria-hidden="true">{features.map(f=>{const x=X+f.x*U,y=Y+f.y*U;return <g key={f.id} opacity={selectedFeature&&selectedFeature!==f.id?.6:1}>
 {f.id==='A2'?<>{a2Contours.grate.map((polygon,k)=><polygon key={k} points={polygon.map(([x,y])=>`${X+x*U},${Y+y*U}`).join(' ')} fill="#dc8043" fillOpacity={visible.includes(9)?.16:.7} stroke="#a34c13" strokeWidth="1.4"/>)}{a2Contours.cover.map((polygon,k)=><polygon key={k} points={polygon.map(([x,y])=>`${X+x*U},${Y+y*U}`).join(' ')} fill="#fae0be" fillOpacity={visible.includes(9)?.12:.8} stroke="#a34c13" strokeWidth="1.4"/>)}</>:f.kind==='drain'?<><rect x={x-11} y={y-6} width="22" height="12" rx="1" fill="#dc8043" stroke="#a34c13"/>{[0,1,2,3].map(i=><path key={i} d={`M${x-8+i*5} ${y-5}v10`} stroke="#7b3e18"/>)}<rect x={x-11} y={y+6} width="22" height="14" fill="#fae0be" stroke="#a34c13"/></>:f.kind==='round'?<><circle cx={x} cy={y} r="10" fill="#fae0be" stroke="#b66c33"/><circle cx={x+29} cy={y} r="7" fill="#fae0be" stroke="#b66c33"/></>:f.kind==='cover'?<rect x={x-10} y={y-9} width="20" height="18" fill="#fae0be" stroke="#b66c33"/>:f.kind==='pole'?<circle cx={x} cy={y} r="5" fill="#dc8043" stroke="#a34c13"/>:null}
 <line x1={x} y1={y-12} x2={x} y2={y-31} stroke="#b96d35"/><rect x={x-15} y={y-52} width="30" height="22" rx="5" fill={selectedFeature===f.id?'#a74f12':'#fff5e9'} stroke="#c17f4d"/><text x={x} y={y-37} textAnchor="middle" fill={selectedFeature===f.id?'white':'#914314'} fontSize="12" fontWeight="700">{f.id}</text></g>})}</svg>
 {stations.map((s,i)=><div key={i} className={`frame-controls ${active===i?'active':''}`} style={{left:X+s*U,top:426+(i%3)*48}}><span className="connector" style={{height:46+(i%3)*48,top:-(46+(i%3)*48)}}/><button className="number-button" onClick={()=>focus(i)} title={photoName(i)}>{String(i+1).padStart(2,'0')}</button><button onClick={()=>toggle(i)} aria-pressed={visible.includes(i)} title="Afficher / masquer la projection" aria-label={`Projection de ${photoName(i)}`}><Eye size={16}/></button><button onClick={()=>{setActive(i);setOriginal(i)}} title="Photo d’origine" aria-label={`Ouvrir ${photoName(i)}`}><ImageIcon size={16}/></button></div>)}
 </div></div></div>
 <div className="detail"><div className="detail-photo"><img src={photoURL(active)} alt={notes[active]}/><button onClick={()=>setOriginal(active)} aria-label="Agrandir la photo sélectionnée"><Maximize size={17}/></button></div><div className="detail-copy"><span className="eyebrow">PHOTO {String(active+1).padStart(2,'0')} / 19</span><h3>{photoName(active)}</h3><p>{notes[active]}</p><small>{metadata[active].time.slice(11)} · position relative ≈ {stations[active].toLocaleString('fr')} m</small></div><div className="detail-actions"><button className="primary" onClick={()=>toggle(active)}><Eye size={17}/>{visible.includes(active)?'Masquer':'Afficher'} la projection</button><button onClick={()=>setOriginal(active)}><ImageIcon size={17}/>Photo d’origine</button></div></div>
 <footer><span>Traits pointillés : emprises estimées · Œil : projection · Image : original</span><span>Dimensions à confirmer sur place</span></footer>
 </section></div>
 <Dialog open={original!==null} onOpenChange={open=>{if(!open)setOriginal(null)}}><DialogContent className="original-dialog"><DialogTitle>{original!==null?photoName(original):''} · Photo d’origine</DialogTitle><DialogDescription>Vue sans redressement · copie JPEG pour l’affichage. Le fichier PNG source est conservé dans votre dossier.</DialogDescription>{original!==null&&<img className="original-image" src={photoURL(original,false)} alt={notes[original]}/>}</DialogContent></Dialog>
 </main>;
}
