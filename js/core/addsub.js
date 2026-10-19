// Сложение и вычитание: один пример или цепочка действий с одним-двумя пропусками.
import {rnd,pick,shuffle,chooseBlank} from './shared.js';

// Переход через десяток: действие проходит сквозь круглое число (строго между началом и концом).
// 8 + 5 (8 → 13 проходит 10), 13 − 5 (13 → 8 проходит 10). Если ответ или начало ровно на круглом числе
// (8 + 2 = 10, 18 + 2 = 20, 10 − 3, 20 − 5), перехода нет.
const hasCarry=it=>{
  const lo=Math.min(it.a,it.c), hi=Math.max(it.a,it.c);
  return Math.floor((hi-1)/10)>Math.floor(lo/10);
};
function genAddSub1(o){
  const carry = o.range>=20 ? o.carry : 'any';
  let it=null;
  for(let i=0;i<300;i++){
    const plus = o.ops==='plus' ? true : o.ops==='minus' ? false : Math.random()<0.5;
    let a,b,c;
    if(plus){
      c=rnd(3,o.range); a=rnd(1,c-1); b=c-a;
      it={a,op:'+',b,c};
    }else{
      a=rnd(3,o.range); b=rnd(1,a-1); c=a-b;
      it={a,op:'−',b,c};
    }
    if(carry==='only' && !hasCarry(it)) continue;
    if(carry==='none' && hasCarry(it)) continue;
    break;
  }
  it.blank=chooseBlank(o.blank==='operand'?'other':o.blank);
  return it;
}

/* Пример из нескольких действий: nums[0] ops[0] nums[1] (ops[1] nums[2]) = res.
   blanks — номера пропущенных мест (0..n-1 — числа слева направо, n — результат),
   vals — задуманные значения. Ответ верен, если равенство выполняется (при двух пропусках пар может быть много). */
function genExpr(o,n,u){
  const lim=o.range, carry=lim>=20?o.carry:'any';
  let ex=null;
  for(let t=0;t<600&&!ex;t++){
    const nums=[rnd(1,Math.max(1,lim-1))], ops=[];
    let cur=nums[0], ok=true, anyCarry=false;
    for(let k=0;k<n-1&&ok;k++){
      let op=o.ops==='plus'?'+':o.ops==='minus'?'−':pick(['+','−']);
      if(o.ops==='both'){ if(op==='+'&&cur>=lim) op='−'; else if(op==='−'&&cur<=1) op='+'; }
      let b;
      if(op==='+'){ if(cur>=lim){ok=false;break;} b=rnd(1,lim-cur); }
      else{ if(cur<=1){ok=false;break;} b=rnd(1,cur-1); }
      const next=op==='+'?cur+b:cur-b;
      const hc=hasCarry({a:cur,op,b,c:next});
      if(hc) anyCarry=true;
      if(carry==='none'&&hc){ok=false;break;}
      ops.push(op); nums.push(b); cur=next;
    }
    if(!ok||(carry==='only'&&!anyCarry)) continue;
    ex={nums,ops,res:cur};
  }
  if(!ex) return genAddSub1(o);
  const slots=[...ex.nums,ex.res], last=ex.nums.length;
  const operands=Array.from({length:last},(_,i)=>i);
  let blanks;
  if(o.blank==='result') blanks=[last,...shuffle(operands).slice(0,u-1)];
  else if(o.blank==='operand') blanks=shuffle(operands).slice(0,u);
  else blanks=shuffle(u>1?operands:[...operands,last]).slice(0,u);   // два пропуска: только числа слева, чтобы пример не вырождался (□ + 1 = □)
  blanks.sort((x,y)=>x-y);
  return {view:'expr',nums:ex.nums,ops:ex.ops,res:ex.res,blanks,vals:blanks.map(p=>slots[p])};
}
function genAddSub(o){
  const two=o.actions==='two'||(o.actions==='mix'&&Math.random()<0.5);
  const u=o.unknown==='mix'?pick([1,2]):(o.unknown||1);
  if(!two&&u===1) return genAddSub1(o);
  return genExpr(o,two?3:2,u);
}

export {hasCarry,genAddSub};
