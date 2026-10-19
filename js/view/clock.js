// Циферблат со стрелками и поле ответа «часы : минуты».
import {cell} from './dom.js';
import {blankBox} from './blank.js';
import {mk} from './svg.js';
import {t} from '../i18n/index.js';

const ROMAN12=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
const at=(deg,r)=>[120+Math.sin(deg*Math.PI/180)*r,120-Math.cos(deg*Math.PI/180)*r];

function face(it){
  const svg=mk('svg',{viewBox:'0 0 240 240','aria-hidden':'true'});
  mk('circle',{class:'cf',cx:120,cy:120,r:110},svg);
  // минутные штрихи
  for(let i=0;i<60;i++){
    if(i%5===0) continue;
    const [x1,y1]=at(i*6,104), [x2,y2]=at(i*6,110);
    mk('line',{class:'mt',x1,y1,x2,y2},svg);
  }
  for(let i=0;i<12;i++){
    const [x1,y1]=at(i*30,96), [x2,y2]=at(i*30,110);
    mk('line',{class:'ht',x1,y1,x2,y2},svg);
    if(it.numerals==='ticks') continue;
    const [tx,ty]=at(i*30,78);
    const node=mk('text',{class:'cn',x:tx,y:ty},svg);
    node.textContent=it.numerals==='roman'?ROMAN12[i]:String(i||12);
  }
  // часовая короче и толще минутной — так их различают
  const [hx,hy]=at((it.h%12)*30+it.m*0.5,56);
  const [mx,my]=at(it.m*6,86);
  mk('line',{class:'hh',x1:120,y1:120,x2:hx,y2:hy},svg);
  mk('line',{class:'mh',x1:120,y1:120,x2:mx,y2:my},svg);
  mk('circle',{class:'pin',cx:120,cy:120,r:6},svg);
  return svg;
}

function buildClock(it,opt={}){
  const {vals=[],active=0,state='',reveal=false,cursor=false,onSelect=null}=opt;
  const wrap=document.createElement('div');
  wrap.className='clock'+(state?' '+state:'');
  wrap.append(face(it));

  const row=document.createElement('div');
  row.className='time';
  const answer=k=>k===0?String(it.h):String(it.m).padStart(2,'0');
  for(const k of [0,1]){
    if(k) row.append(cell(':','sign'));
    row.append(blankBox(answer(k),reveal?answer(k):(vals[k]||''),
      {cursor:cursor&&!reveal,active:k===active,multi:true,onSelect,index:k}));
  }
  wrap.append(row);

  wrap.setAttribute('role','img');
  wrap.setAttribute('aria-label',t('say.clock'));
  return wrap;
}

export {buildClock};
