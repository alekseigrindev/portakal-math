// Пример в одну строку: a op b = c, пропуск — рамка с клетками под цифры.
import {cell} from './dom.js';
import {t,sayOp} from '../i18n/index.js';

function buildEq(it,opt={}){
  const {typed='',state='',reveal=false,cursor=false}=opt;
  const wrap=document.createElement('div');
  wrap.className='eq'+(state?' '+state:'');
  const ans=String(it[it.blank]);
  const toks=it.view==='rev'
    ?[['c',it.c],['eq','='],['a',it.a],['op',it.op],['b',it.b]]
    :[['a',it.a],['op',it.op],['b',it.b],['eq','='],['c',it.c]];
  const say=[];
  for(const [k,v] of toks){
    if(k===it.blank){
      const box=document.createElement('div'); box.className='box';
      const shown=reveal?ans:typed;
      const n=Math.max(ans.length,shown.length);
      for(let i=0;i<n;i++){
        const c=cell(shown[i]||'');
        if(cursor && !reveal && i===shown.length) c.classList.add('cur');
        box.append(c);
      }
      wrap.append(box);
      say.push(t('say.blank'));
    }else{
      for(const ch of String(v)) wrap.append(cell(ch,(k==='op'||k==='eq')?'sign':''));
      say.push(k==='op'?sayOp(v):k==='eq'?t('say.eq'):String(v));
    }
  }
  wrap.setAttribute('role','img');
  wrap.setAttribute('aria-label',say.join(' '));
  return wrap;
}

export {buildEq};
