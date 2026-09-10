import {memo} from 'react';
import {features,a2Contours} from './geometry';
const U=32,X=100,Y=280;
export const PlanDrawing=memo(function PlanDrawing({showPhotos}:{showPhotos:boolean}){return <> <svg className="base-plan" width="1680" height="640" role="img" aria-label="Plan interprété : trottoir rectiligne terminé par un arrondi, trois avaloirs et plusieurs regards"><defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#dce4ec" strokeWidth=".7"/></pattern><pattern id="grass" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M2 8l3-4m1 5l3-4" stroke="#abc6bb" strokeWidth=".8"/></pattern></defs>
 <rect width="1680" height="640" fill="url(#grid)"/>
 <g transform="translate(0 560) scale(1 -1)">
 <path d="M80 110H1280V184H80Z" fill="url(#grass)"/>
 <path d="M80 286H1280V110H1550V422H80Z" fill="#e0e6ed"/>
 <path d="M80 184H1480Q1480 280 1370 280H80Z" fill="#f8fbfe" stroke="#acc0cd"/>
 <path d="M80 280H1370Q1480 280 1480 184H1280" fill="none" stroke="#087eae" strokeWidth="3"/>
 <path d="M80 287H1370Q1487 287 1487 184V177H1280" fill="none" stroke="#334a5c" strokeWidth="2"/>
 <path d="M80 276H1370Q1475 276 1475 188H1280" fill="none" stroke="#b8c9d4"/>
 {Array.from({length:40},(_,i)=><path key={i} d={`M${100+i*32} 280v7`} stroke="#536b7a"/>)}
 {[.15,.35,.55,.75,.9].map(t=>{const x=1370+110*(2*t-t*t),y=280-96*t*t;const outerX=1370+117*(2*t-t*t),outerY=287-103*t*t;return <path key={t} d={`M${x} ${y}L${outerX} ${outerY}`} stroke="#536b7a"/>})}
 <path d="M80 184H1270" stroke="#769c89" strokeWidth="2"/>
 {[3,10,17,24,30,35].map(x=><path key={x} d={`M${X+x*U} 184V276`} stroke="#b6c8d4" strokeDasharray="3 3"/>)}
 {[0,1,2].map(i=><rect key={i} x="225" y={300+i*36} width="96" height="18" fill="white" stroke="#aebcc7"/>)}
 <path d="M600 345h45m-13-12 13 12-13 12" fill="none" stroke="white" strokeWidth="7"/>
 <path d="M1328 310v65" stroke="white" strokeWidth="5"/>
 </g>
 <text x="1040" y="413" className="map-label">RIVE ENGAZONNÉE</text><text x="850" y="330" className="map-label">TROTTOIR · À DROITE</text><text x="1040" y="185" className="map-label">CHAUSSÉE · À GAUCHE</text><text x="1430" y="413" className="map-small">Retour arrondi</text><text x="1430" y="432" className="map-small">géométrie estimée</text>
 <text x="100" y="70" className="map-title">01 — 19</text><text x="225" y="70" className="map-small">Sens de la marche →</text>
 <path d="M100 596h160m-160-5v10m160-10v10" stroke="#41566b" strokeWidth="2"/><text x="100" y="623" className="map-small">≈ 5 m · échelle indicative</text>
 </svg><svg className="features-overlay" width="1680" height="640" aria-hidden="true">{features.map(f=>{const x=X+f.x*U,y=Y+f.y*U;return <g key={f.id}> {f.id==='A2'?<>{a2Contours.grate.map((polygon,k)=><polygon key={k} points={polygon.map(([x,y])=>`${X+x*U},${Y+y*U}`).join(' ')} fill="#dc8043" fillOpacity={showPhotos?.16:.7} stroke="#a34c13" strokeWidth="1.4"/>)}{a2Contours.cover.map((polygon,k)=><polygon key={k} points={polygon.map(([x,y])=>`${X+x*U},${Y+y*U}`).join(' ')} fill="#fae0be" fillOpacity={showPhotos?.12:.8} stroke="#a34c13" strokeWidth="1.4"/>)}</>:f.kind==='drain'?<><rect x={x-11} y={y-6} width="22" height="12" rx="1" fill="#dc8043" stroke="#a34c13"/>{[0,1,2,3].map(i=><path key={i} d={`M${x-8+i*5} ${y-5}v10`} stroke="#7b3e18"/>)}<rect x={x-11} y={y+6} width="22" height="14" fill="#fae0be" stroke="#a34c13"/></>:f.kind==='round'?<><circle cx={x} cy={y} r="10" fill="#fae0be" stroke="#b66c33"/><circle cx={x+29} cy={y} r="7" fill="#fae0be" stroke="#b66c33"/></>:f.kind==='cover'?<rect x={x-10} y={y-9} width="20" height="18" fill="#fae0be" stroke="#b66c33"/>:f.kind==='pole'?<circle cx={x} cy={y} r="5" fill="#dc8043" stroke="#a34c13"/>:null}</g>})}</svg></>});
