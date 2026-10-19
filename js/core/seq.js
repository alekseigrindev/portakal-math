// Ритмический счёт: ряды с постоянным шагом или множителем.
import {rnd,pick,shuffle} from './shared.js';

// Ритмический счёт: ряд из L чисел с шагом s (вперёд или назад), одно число пропущено.
// Ответ хранится в it.x (blank:'x'), bi — номер пропущенного числа в ряду.
function genSeqAdd(o){
  const lim=o.limit;
  const fit=o.steps.filter(s=>s*3<=lim);
  const s=pick(fit.length?fit:[2]);
  const L=Math.min(6,Math.floor(lim/s)+1);
  const start=o.start==='zero'?s*rnd(0,Math.floor(lim/s)-(L-1)):rnd(0,lim-s*(L-1));
  const nums=Array.from({length:L},(_,i)=>start+s*i);
  const down=o.dir==='down'||(o.dir==='mix'&&Math.random()<0.5);
  if(down) nums.reverse();
  const bis=seqBlanks(L,o), bi=bis[0];
  return {view:'seq',nums,step:down?-s:s,sym:down?'−':'+',amt:s,blank:'x',x:nums[bi],bi,bis,xs:bis.map(p=>nums[p]),hint:o.hint!=='hide'};
}
// Ряд с умножением (1, 2, 4, 8…) или делением (64, 32, 16…): каждое число в f раз больше (меньше) предыдущего
function genSeqGeo(o,down){
  const lim=o.limit;
  const fit=o.factors.filter(f=>f**3<=lim);
  const f=pick(fit.length?fit:[2]);
  const base=rnd(1,Math.max(1,Math.floor(lim/f**3)));
  const nums=[base];
  while(nums.length<6&&nums[nums.length-1]*f<=lim) nums.push(nums[nums.length-1]*f);
  if(down) nums.reverse();
  const bis=seqBlanks(nums.length,o), bi=bis[0];
  return {view:'seq',nums,sym:down?'÷':'×',amt:f,blank:'x',x:nums[bi],bi,bis,xs:bis.map(p=>nums[p]),hint:o.hint!=='hide'};
}
// Есть ли другой правильный ряд (арифметический или геометрический) с теми же видимыми числами, но иными ответами?
function seqAmbiguous(it,limit){
  const v=it.nums, L=v.length, bis=it.bis||[it.bi];
  const vis=v.map((x,i)=>bis.includes(i)?null:x);
  const fits=q=>q.every((x,i)=>Number.isInteger(x)&&x>=0&&x<=limit&&(vis[i]===null||vis[i]===x));
  const diff=q=>bis.some(i=>q[i]!==v[i]);
  const i0=vis.findIndex(x=>x!==null), v0=vis[i0];
  for(let d=-limit;d<=limit;d++){
    if(!d) continue;
    const q=Array.from({length:L},(_,i)=>v0+d*(i-i0));
    if(fits(q)&&diff(q)) return true;
  }
  for(let r=2;r<=limit;r++){
    const up=Array.from({length:L},(_,i)=>v0*r**(i-i0));   // дробные значения отсекает fits
    if(fits(up)&&diff(up)) return true;
    const dn=Array.from({length:L},(_,i)=>v0*r**(i0-i));
    if(fits(dn)&&diff(dn)) return true;
  }
  return false;
}
function genSeq(o){
  const kind=o.kind==='mix'?pick(['add','mul','div']):o.kind;
  const it=kind==='add'?genSeqAdd(o):genSeqGeo(o,kind==='div');
  it.fams=['add','geo'];   // если шаг не показан, подойдёт любой правильный ряд
  // без подсказки стараемся брать ряды, которые восстанавливаются однозначно (2, 4, □ — это и +2, и ×2)
  if(!it.hint && seqAmbiguous(it,o.limit)){
    for(let k=0;k<60;k++){
      const t=kind==='add'?genSeqAdd(o):genSeqGeo(o,kind==='div');
      t.fams=it.fams;
      if(!seqAmbiguous(t,o.limit)) return t;
    }
  }
  return it;
}
// Какие места в ряду пропущены: g = 1 или 2. «Следующее число» — одно из пропусков стоит в конце ряда.
function seqBlanks(L,o){
  const g=o.gaps==='mix'?pick([1,2]):(o.gaps||1);
  const idx=Array.from({length:L},(_,i)=>i);
  const bis=o.blank==='last'?[L-1,...shuffle(idx.slice(0,L-1)).slice(0,g-1)]:shuffle(idx).slice(0,g);
  return bis.sort((x,y)=>x-y);
}
// Ряд с подставленными ответами правильный? Если шаг показан, он должен совпасть с подсказкой.
// Если не показан, подойдёт любой правильный ряд допустимого вида (сложение или умножение).
function seqValid(it,full){
  const L=full.length;
  if(full.some(v=>!Number.isInteger(v)||v<0)) return false;
  if(it.hint){
    if(it.sym==='+'||it.sym==='−') return full.every((v,k)=>k===0||v-full[k-1]===it.step);
    const up=it.sym==='×';
    return full.every((v,k)=>k===0||(up?v===full[k-1]*it.amt:full[k-1]===v*it.amt));
  }
  const arith=()=>{const d=full[1]-full[0]; return d!==0&&full.every((v,k)=>k===0||v-full[k-1]===d);};
  const geo=()=>{
    if(full.some(v=>v<=0)||full[1]===full[0]) return false;
    for(let k=1;k<L-1;k++) if(full[k]*full[k]!==full[k-1]*full[k+1]) return false;
    return true;
  };
  return arith()||geo();
}
// есть ли выбранные шаги или множители, которые не помещаются в предел
const seqUnfit=c=>((c.kind==='add'||c.kind==='mix')&&c.steps.some(s=>s*3>c.limit))||(c.kind!=='add'&&c.factors.some(f=>f**3>c.limit));

export {genSeq,seqValid,seqUnfit};
