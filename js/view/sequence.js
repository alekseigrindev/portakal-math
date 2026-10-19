// Ряд чисел для ритмического счёта: числа в клетках, между ними дуга с шагом.
import {cell} from './dom.js';
import {t} from '../i18n/index.js';

/* ряд чисел для ритмического счёта: числа в клетках, между ними дуга с шагом */
function buildSeq(it,opt={}){
  const {typed='',state='',reveal=false,cursor=false,onSelect=null}=opt;
  const wrap=document.createElement('div');
  wrap.className='seq'+(state?' '+state:'');
  const bis=it.bis||[it.bi], vals=opt.vals||[], active=opt.active||0, say=[];
  it.nums.forEach((v,i)=>{
    const pair=document.createElement('div'); pair.className='pair';
    if(i>0){
      const hop=document.createElement('div'); hop.className='hop';
      if(it.hint){
        const s=document.createElement('span');
        s.textContent=it.sym+it.amt;
        hop.append(s);
      }else hop.classList.add('arrow');
      pair.append(hop);
    }
    const num=document.createElement('div'); num.className='num';
    const bk=bis.indexOf(i);
    if(bk>=0){
      const box=document.createElement('div'); box.className='box';
      const ans=String(it.xs?it.xs[bk]:it.x);
      const shown=reveal?ans:(vals[bk]||''), n=Math.max(ans.length,shown.length);
      if(bis.length>1){
        box.classList.add('multi');
        if(cursor && !reveal && bk===active) box.classList.add('act');
        if(onSelect) box.addEventListener('click',()=>onSelect(bk));
      }
      for(let k=0;k<n;k++){
        const c=cell(shown[k]||'');
        if(cursor && !reveal && bk===active && k===shown.length) c.classList.add('cur');
        box.append(c);
      }
      num.append(box); say.push(t('say.blank'));
    }else{
      for(const ch of String(v)) num.append(cell(ch));
      say.push(String(v));
    }
    pair.append(num); wrap.append(pair);
  });
  wrap.setAttribute('role','img');
  wrap.setAttribute('aria-label',t('say.seq',{v:say.join(', ')})+(it.hint?'. '+t('say.step',{s:it.sym+it.amt}):''));
  return wrap;
}

export {buildSeq};
