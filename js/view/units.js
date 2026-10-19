// Счёт разрядами: 4 дес. 7 ед. = □ (или с пропуском в одном из разрядов).
import {cell} from './dom.js';
import {blankBox} from './blank.js';
import {t} from '../i18n/index.js';

const WORD={hundreds:'u.h',tens:'u.t',ones:'u.o'};

function buildUnits(it,opt={}){
  const {typed='',state='',reveal=false,cursor=false}=opt;
  const wrap=document.createElement('div');
  wrap.className='eq units'+(state?' '+state:'');
  const shown=reveal?String(it.x):typed;
  const say=[];

  it.parts.forEach((p,i)=>{
    const g=document.createElement('span');
    g.className='unit';
    if(i===it.bi){
      g.append(blankBox(it.x,shown,{cursor:cursor&&!reveal}));
      say.push(t('say.blank'));
    }else{
      for(const ch of String(p.d)) g.append(cell(ch));
      say.push(String(p.d));
    }
    const w=document.createElement('span');
    w.className='uw';
    w.textContent=t(WORD[p.u]);
    g.append(w);
    say.push(t(WORD[p.u]));
    wrap.append(g);
  });

  wrap.append(cell('=','sign'));
  say.push(t('say.eq'));
  if(it.bi<0){
    wrap.append(blankBox(it.x,shown,{cursor:cursor&&!reveal}));
    say.push(t('say.blank'));
  }else{
    for(const ch of String(it.n)) wrap.append(cell(ch));
    say.push(String(it.n));
  }

  wrap.setAttribute('role','img');
  wrap.setAttribute('aria-label',say.join(' '));
  return wrap;
}

export {buildUnits};
