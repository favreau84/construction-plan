import {memo,useEffect,useRef,useState} from 'react';
import {homography,project,projectionBands} from './geometry';
import {photoName,photoURL} from './photos';
const cache=new Map<number,string>();
export const Rectified=memo(function Rectified({index}:{index:number}){
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
