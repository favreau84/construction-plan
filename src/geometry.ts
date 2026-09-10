export type Point = [number, number];
// Homography from four destination points to four source points, solved with pivoting.
export function homography(from: Point[], to: Point[]) {
 const a:number[][]=[];
 for(let i=0;i<4;i++){const [x,y]=from[i], [u,v]=to[i]; a.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);}
 for(let c=0;c<8;c++){let p=c;for(let r=c+1;r<8;r++)if(Math.abs(a[r][c])>Math.abs(a[p][c]))p=r;
 [a[p],a[c]]=[a[c],a[p]];const d=a[c][c];if(Math.abs(d)<1e-10)throw Error('Repères géométriques dégénérés');for(let j=c;j<9;j++)a[c][j]/=d;
 for(let r=0;r<8;r++)if(r!==c){const f=a[r][c];for(let j=c;j<9;j++)a[r][j]-=f*a[c][j];}}
 return [...a.map(r=>r[8]),1];
}
export function project(h:number[],x:number,y:number):Point{const d=h[6]*x+h[7]*y+1;return [(h[0]*x+h[1]*y+h[2])/d,(h[3]*x+h[4]*y+h[5])/d]}
export const stations=[0,3,6,7,8.5,10.3,12.6,14.3,17,19,21.5,24.2,26,28.4,30.2,33,35,37.8,39];
// Manually interpreted inner curb edge: near x,y; far x,y, in upright source coordinates.
export const edges=[
 [.13,.92,.32,.24],[.15,.93,.32,.25],[.19,.93,.45,.25],[.22,.93,.46,.25],
 [.12,.92,.37,.25],[.14,.93,.35,.25],[.13,.93,.34,.25],[.12,.93,.35,.25],
 [.16,.93,.32,.25],[.17,.93,.31,.25],[.13,.93,.26,.25],[.09,.93,.29,.25],
 [.10,.93,.27,.25],[.12,.93,.28,.25],[.14,.93,.29,.25],[.14,.93,.27,.25],
 [.08,.93,.22,.25],[.05,.91,.29,.30],[.23,.86,.30,.44]
];
export function projectionBands(index:number):{a:number;b:number;pts:Point[]}[]{
 const [nx,ny,fx,fy]=edges[index];const farWidth=index===0?.42:index>=17?.48:.36;const nearWidth=index>=17?.85:1.03;
 return [
 {a:0,b:300,pts:[[nx+nearWidth,ny],[fx+farWidth,fy],[fx,fy],[nx,ny]]},
 {a:300,b:319,pts:[[nx,ny],[fx,fy],[fx-.023,fy],[nx-.065,ny]]},
 {a:319,b:480,pts:[[nx-.085,ny],[fx-.032,fy],[fx-.30,fy],[nx-.80,ny]]}
 ];
}
// Convert an observed upright source point into the same plan coordinates as its texture.
export function sourceToPlan(index:number,band:number,point:Point):Point{
 const b=projectionBands(index)[band];
 const h=homography(b.pts,[[0,b.a],[528,b.a],[528,b.b],[0,b.b]]);
 const [x,y]=project(h,...point);
 return [stations[index]+x/96,(300-y)/96];
}
// Clip observed contours to each visible source plane. The omitted vertical face
// must not create invented texture or geometry between the curb and the road.
function clipPolygon(subject:Point[],boundary:Point[]):Point[]{
 const area=boundary.reduce((a,p,i)=>{const q=boundary[(i+1)%boundary.length];return a+p[0]*q[1]-q[0]*p[1]},0);
 const sign=Math.sign(area);
 for(let i=0;i<boundary.length;i++){
  const a=boundary[i],b=boundary[(i+1)%boundary.length];
  const side=(p:Point)=>sign*((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]));
  const input=subject;subject=[];
  for(let j=0;j<input.length;j++){
   const p=input[j],q=input[(j+1)%input.length],sp=side(p),sq=side(q);
   if(sp>=0)subject.push(p);
   if((sp>=0)!==(sq>=0)){const t=sp/(sp-sq);subject.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}
  }
 }
 return subject;
}
function sourceContour(points:Point[]):Point[][]{
 const source=points.map(([x,y])=>[x/750,y/1000] as Point);
 return projectionBands(9).flatMap((b,band)=>{
  const clipped=clipPolygon(source,b.pts);
  return clipped.length>=3?[clipped.map(p=>sourceToPlan(9,band,p))]:[];
 });
}
// IMG_6596: manually picked corners in the 750 × 1000 upright preview.
export const a2Contours={
 grate:sourceContour([[111,299],[190,291],[176,371],[84,379]]),
 cover:sourceContour([[200,260],[241,257],[232,336],[178,344]]),
};
const a2Points=[...a2Contours.grate.flat(),...a2Contours.cover.flat()];
const a2Center=a2Points.reduce((a,p)=>[a[0]+p[0]/a2Points.length,a[1]+p[1]/a2Points.length] as Point,[0,0] as Point);
export const notes=[
 'Deux regards circulaires. Position de départ incertaine : GPS aberrant.',
 'Marquages du passage piéton et regard circulaire en limite de champ.',
 'Passage piéton ; premier avaloir visible en avant.',
 'Premier avaloir : grille en chaussée et tampon sur trottoir.',
 'Premier avaloir au premier plan : repère commun avec 6589–6590.',
 'Joint transversal du revêtement.',
 'Poteau en rive engazonnée et marquage directionnel.',
 'Flèche routière ; deuxième avaloir visible au loin.',
 'Approche du deuxième avaloir.',
 'Deuxième avaloir et joint transversal.',
 'Bordure rectiligne et joints entre éléments.',
 'Joint transversal marqué.',
 'Bordure et rive engazonnée.',
 'Regard rectangulaire sur le trottoir.',
 'Même regard rectangulaire au premier plan.',
 'Raccordement avec une surface revêtue à droite.',
 'Troisième avaloir ; chaussée de part et d’autre de l’extrémité.',
 'Extrémité arrondie et poteau.',
 'Détail du retour de bordure et du pied de poteau. Projection moins fiable.'
];
// Local coordinates: x follows the walk; positive y is on the walker’s right.
export const features=[
 {id:'R1',label:'Regards circulaires',x:2,y:2.05,kind:'round',photos:[0,1]},
 {id:'P1',label:'Passage piéton',x:5,y:-1.2,kind:'crossing',photos:[1,2,3]},
 {id:'A1',label:'Avaloir 01',x:9.3,y:-.1,kind:'drain',photos:[2,3,4]},
 {id:'S1',label:'Poteau en rive',x:16.2,y:3,kind:'pole',photos:[6]},
 {id:'M1',label:'Flèche routière',x:17,y:-1.4,kind:'arrow',photos:[6,7]},
 {id:'A2',label:'Avaloir 02',x:a2Center[0],y:a2Center[1],kind:'drain',photos:[7,8,9],referencePhoto:9},
 {id:'R2',label:'Regard rectangulaire',x:32,y:1.8,kind:'cover',photos:[13,14]},
 {id:'A3',label:'Avaloir 03',x:38.5,y:-.1,kind:'drain',photos:[16]},
 {id:'S2',label:'Poteau à l’extrémité',x:42,y:1.85,kind:'pole',photos:[17,18]},
];
