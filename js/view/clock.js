// Циферблат со стрелками и поле ответа «часы : минуты».
import {cell} from './dom.js';
import {blankBox} from './blank.js';
import {mk} from './svg.js';
import {t} from '../i18n/index.js';

const ROMAN12=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
const at=(deg,r)=>[120+Math.sin(deg*Math.PI/180)*r,120-Math.cos(deg*Math.PI/180)*r];

function face(it,opt={}){
  const {ring=false}=opt;
  const svg=mk('svg',{viewBox:ring?'-18 -18 276 276':'0 0 240 240','aria-hidden':'true'});
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

  // Минутное кольцо снаружи — это и есть приём, которым учат читать часы:
  // длинная стрелка смотрит на «3», а снаружи написано «15». Цифры, а не
  // слова, поэтому подсказка одинаково работает на всех семи языках.
  if(ring){
    for(let i=0;i<12;i++){
      const [x,y]=at(i*30,128);
      const node=mk('text',{class:'mr',x,y},svg);
      node.textContent=String(i*5);
    }
  }
  return svg;
}

// Циферблат для окна подсказки. Показываем не текущий пример, а один и тот же
// учебный: 2:35. Подсказка объясняет способ, а не выдаёт ответ, а 2:35 удобнее
// всего для объяснения. Минутная стрелка стоит ровно на «7», но это не 7 минут,
// а 35 — именно здесь дети и путаются. При этом стрелки смотрят в разные
// стороны: на 7:35 они почти совпадали, и разобрать, где какая, было нельзя.
const HINT_TIME={view:'clock',h:2,m:35,numerals:'arabic'};

function buildClockHint(){
  const wrap=document.createElement('div');
  wrap.className='clock hintface';
  wrap.append(face(HINT_TIME,{ring:true}));
  return wrap;
}

function buildClock(it,opt={}){
  const {vals=[],active=0,state='',reveal=false,cursor=false,onSelect=null}=opt;
  const wrap=document.createElement('div');
  wrap.className='clock'+(state?' '+state:'');
  wrap.append(face(it));

  const row=document.createElement('div');
  row.className='time';
  // Обе рамки всегда по две клетки: часы 1–12, минуты 0–59, больше не бывает.
  // Иначе при наборе второй цифры строка времени съезжает из-под пальца.
  const answer=k=>String(k===0?it.h:it.m).padStart(2,'0');
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

export {buildClock,buildClockHint};
