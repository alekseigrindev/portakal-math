// Состав числа схемой: целое сверху, две части снизу.
import {t} from '../i18n/index.js';

/* схема «домик»: целое сверху, две части снизу */
function buildBond(it,opt={}){
  const {typed='',state='',reveal=false,cursor=false}=opt;
  const NS='http://www.w3.org/2000/svg';
  const mk=(tag,attrs,parent)=>{
    const e=document.createElementNS(NS,tag);
    for(const k in attrs) e.setAttribute(k,attrs[k]);
    if(parent) parent.append(e);
    return e;
  };
  const wrap=document.createElement('div');
  wrap.className='bond'+(state?' '+state:'');
  const svg=mk('svg',{viewBox:'0 0 240 200','aria-hidden':'true'});
  mk('line',{class:'ln',x1:106,y1:63,x2:68,y2:122},svg);
  mk('line',{class:'ln',x1:134,y1:63,x2:172,y2:122},svg);
  const pos={c:[120,36],a:[56,152],b:[184,152]};
  const ans=String(it[it.blank]);
  const spoken={};
  for(const k of ['c','a','b']){
    const [x,y]=pos[k];
    const g=mk('g',{class:k===it.blank?'blank':''},svg);
    mk('circle',{class:'bc',cx:x,cy:y,r:32},g);
    const text=k===it.blank?(reveal?ans:typed):String(it[k]);
    spoken[k]=k===it.blank?t('say.blank'):String(it[k]);
    const tx=mk('text',{class:'bn',x,y:y+2},g);
    tx.textContent=text;
    if(k===it.blank && cursor && !reveal && text.length===0){
      mk('line',{class:'caret',x1:x,y1:y-14,x2:x,y2:y+16},g);
    }
  }
  wrap.append(svg);
  wrap.setAttribute('role','img');
  wrap.setAttribute('aria-label',t('say.bond',{w:spoken.c,a:spoken.a,b:spoken.b}));
  return wrap;
}

export {buildBond};
