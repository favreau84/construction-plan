export type Camera={x:number;y:number;scale:number};
export function zoomAt(camera:Camera,point:{x:number;y:number},factor:number,min=.15,max=8):Camera{
 const scale=Math.max(min,Math.min(max,camera.scale*factor)),ratio=scale/camera.scale;
 return {scale,x:point.x-(point.x-camera.x)*ratio,y:point.y-(point.y-camera.y)*ratio};
}
export type Selection={photos:number[];active:number|null;feature:string|null;open:boolean};
export const initialSelection:Selection={photos:[],active:null,feature:null,open:false};
export type SelectionAction={type:'select';photo:number;additive:boolean}|{type:'feature';id:string;photos:number[];reference:number}|{type:'activate';photo:number}|{type:'close'};
export function selectionReducer(s:Selection,a:SelectionAction):Selection{
 if(a.type==='close')return {...s,open:false,feature:null};
 if(a.type==='activate')return s.photos.includes(a.photo)?{...s,active:a.photo,open:true}:s;
 if(a.type==='feature')return {photos:[...a.photos],active:a.reference,feature:a.id,open:true};
 const photos=a.additive?(s.photos.includes(a.photo)?s.photos.filter(i=>i!==a.photo):[...s.photos,a.photo]):[a.photo];
 const active=photos.includes(a.photo)?a.photo:s.active!==null&&photos.includes(s.active)?s.active:photos.at(-1)??null;
 return {photos,active,feature:null,open:photos.length>0};
}
