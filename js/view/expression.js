// Пример из нескольких действий и/или с двумя пропусками: каждая рамка — отдельное число.
// it.rev переворачивает запись (347 = 300 + 40 + □) — так пишут разрядный состав.
import {cell} from './dom.js';
import {blankBox} from './blank.js';
import {t,sayOp} from '../i18n/index.js';

// Порядок знаков и чисел на листе: числа названы номером места в it.nums + it.res.
function layout(it){
  const last=it.nums.length, row=[];
  const left=[{slot:0}];
  for(let p=1;p<last;p++) left.push({sign:it.ops[p-1]},{slot:p});
  if(it.rev) row.push({slot:last},{sign:'='},...left);
  else row.push(...left,{sign:'='},{slot:last});
  return row;
}

function buildExpr(it,opt={}){
  const {vals=[],active=0,state='',reveal=false,cursor=false,onSelect=null}=opt;
  const wrap=document.createElement('div');
  wrap.className='eq'+(state?' '+state:'');
  const slots=[...it.nums,it.res], multi=it.blanks.length>1, say=[];

  for(const part of layout(it)){
    if(part.sign!==undefined){
      wrap.append(cell(part.sign,'sign'));
      say.push(part.sign==='='?t('say.eq'):sayOp(part.sign));
      continue;
    }
    const bi=it.blanks.indexOf(part.slot);
    if(bi>=0){
      const sol=String(it.vals[bi]);
      wrap.append(blankBox(sol,reveal?sol:(vals[bi]||''),
        {cursor:cursor&&!reveal,active:bi===active,multi,onSelect,index:bi}));
      say.push(t('say.blank'));
    }else{
      for(const ch of String(slots[part.slot])) wrap.append(cell(ch));
      say.push(String(slots[part.slot]));
    }
  }

  wrap.setAttribute('role','img');
  wrap.setAttribute('aria-label',say.join(' '));
  return wrap;
}

export {buildExpr};
