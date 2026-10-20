// Фигуры: рисунок, вопрос и поле ответа.
// Ответ либо число (углы, периметр, площадь), либо выбранный вариант (название, лишняя).
import {blankBox} from './blank.js';
import {mk,poly,pts} from './svg.js';
import {t} from '../i18n/index.js';

const SIDES={triangle:3,square:4,rect:4,pentagon:5,hexagon:6};

// Прямоугольник и квадрат рисуются по сторонам, чтобы 3 × 8 и было видно как 3 × 8.
function boxDims(a,b){
  const s=Math.min(130/a,100/b);
  return {w:a*s,h:b*s,s};
}
function drawFigure(svg,it,cx,cy,r){
  if(it.fig==='circle'){
    mk('circle',{class:'fg',cx,cy,r},svg);
    return;
  }
  if(it.fig==='square'||it.fig==='rect'){
    const {w,h}=boxDims(it.a,it.b);
    const k=r/65;
    const x=cx-w*k/2, y=cy-h*k/2;
    mk('rect',{class:'fg',x,y,width:w*k,height:h*k},svg);
    if(it.grid){
      const cw=w*k/it.a, ch=h*k/it.b;
      for(let i=1;i<it.a;i++) mk('line',{class:'gl',x1:x+cw*i,y1:y,x2:x+cw*i,y2:y+h*k},svg);
      for(let j=1;j<it.b;j++) mk('line',{class:'gl',x1:x,y1:y+ch*j,x2:x+w*k,y2:y+ch*j},svg);
    }
    if(it.labels){
      const bx=mk('text',{class:'fl',x:cx,y:y+h*k+18},svg); bx.textContent=String(it.a);
      const by=mk('text',{class:'fl',x:x+w*k+14,y:cy+5},svg); by.textContent=String(it.b);
    }
    return;
  }
  const v=poly(SIDES[it.fig],cx,cy,r);
  mk('polygon',{class:'fg',points:pts(v)},svg);
  if(it.labels){
    // равносторонний треугольник: подписываем каждую сторону
    v.forEach(([x1,y1],i)=>{
      const [x2,y2]=v[(i+1)%v.length];
      const mx=(x1+x2)/2, my=(y1+y2)/2;
      const dx=mx-cx, dy=my-cy, len=Math.hypot(dx,dy)||1;
      const node=mk('text',{class:'fl',x:mx+dx/len*16,y:my+dy/len*16+5},svg);
      node.textContent=String(it.a);
    });
  }
}

function picture(it){
  if(it.task==='odd'){
    const svg=mk('svg',{viewBox:'0 0 240 92','aria-hidden':'true'});
    it.row.forEach((fig,i)=>{
      const cx=30+i*60;
      drawFigure(svg,{fig,a:5,b:3},cx,38,24);
      const n=mk('text',{class:'fn',x:cx,y:84},svg);
      n.textContent=String(i+1);
    });
    return svg;
  }
  const svg=mk('svg',{viewBox:'0 0 240 170','aria-hidden':'true'});
  drawFigure(svg,it,120,80,65);
  return svg;
}

function buildShape(it,opt={}){
  const {typed='',state='',reveal=false,cursor=false}=opt;
  const wrap=document.createElement('div');
  wrap.className='shape'+(state?' '+state:'');
  wrap.append(picture(it));

  const q=document.createElement('p');
  q.className='q';
  q.textContent=t('q.'+it.task);
  wrap.append(q);

  if(it.choices){
    const box=document.createElement('div');
    box.className='box word';
    const chosen=reveal?it.ans:typed;
    box.textContent=chosen?t(it.lk+chosen):'';
    if(!chosen) box.classList.add('empty');
    wrap.append(box);
  }else{
    wrap.append(blankBox(it.x,reveal?String(it.x):typed,{cursor:cursor&&!reveal,minCells:2}));
  }

  // В заданиях на название, лишнюю и углы фигуру вслух не называем — это и есть ответ.
  const said=it.labels
    ? t('say.shape',{f:t('f.'+it.fig)+' '+it.a+'×'+it.b})+'. '
    : '';
  wrap.setAttribute('role','img');
  wrap.setAttribute('aria-label',said+t('q.'+it.task));
  return wrap;
}

export {buildShape};
