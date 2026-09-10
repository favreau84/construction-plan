export const photoName=(i:number)=>`IMG_${6587+i}`;
export const photoURL=(i:number,preview=true)=>`${import.meta.env.BASE_URL}photos/${photoName(i)}${preview?'-preview':''}.jpg`;
