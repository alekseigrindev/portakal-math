// Общее для рисованных видов: создание узлов SVG и вершины правильного многоугольника.
const NS='http://www.w3.org/2000/svg';

function mk(tag,attrs,parent){
  const e=document.createElementNS(NS,tag);
  for(const k in attrs) e.setAttribute(k,attrs[k]);
  if(parent) parent.append(e);
  return e;
}
// n вершин по кругу радиуса r, первая — сверху
function poly(n,cx,cy,r){
  return Array.from({length:n},(_,i)=>{
    const a=i*2*Math.PI/n;
    return [cx+Math.sin(a)*r,cy-Math.cos(a)*r];
  });
}
const pts=list=>list.map(([x,y])=>x.toFixed(1)+','+y.toFixed(1)).join(' ');

export {NS,mk,poly,pts};
