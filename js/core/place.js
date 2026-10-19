// Разрядный состав: число раскладывается на сотни, десятки и единицы.
// Две записи: сумма разрядов (40 + 7 = 47) и счёт разрядами (4 дес. 7 ед. = 47).
import {rnd,pick} from './shared.js';

const UNITS=['ones','tens','hundreds'];   // индекс = степень десятки

// Цифры числа от старшего разряда к младшему вместе с названием разряда.
function split(n){
  const s=String(n);
  return [...s].map((ch,i)=>({d:Number(ch),u:UNITS[s.length-1-i]}));
}
function pickNumber(o){
  const d=o.digits==='mix'?pick([2,3]):o.digits;
  if(d===2) return rnd(1,9)*10+rnd(1,9);
  // трёхзначное: один нулевой разряд допустим, два сразу — нет
  for(;;){
    const h=rnd(1,9), t=rnd(0,9), u=rnd(0,9);
    if(t||u) return h*100+t*10+u;
  }
}
function genPlace(o){
  const n=pickNumber(o), parts=split(n);
  const view=o.view==='mix'?pick(['sum','units']):o.view;
  const whole=o.blank==='whole'||(o.blank==='any'&&Math.random()<0.4);
  if(view==='units'){
    const bi=whole?-1:rnd(0,parts.length-1);
    return {view:'units',parts,n,bi,blank:'x',x:whole?n:parts[bi].d};
  }
  // сумма разрядов: нулевые слагаемые не пишем, 305 = 300 + 5
  const terms=parts.filter(p=>p.d>0).map(p=>p.d*10**UNITS.indexOf(p.u));
  const slots=[...terms,n], at=whole?terms.length:rnd(0,terms.length-1);
  return {view:'expr',rev:Math.random()<0.5,nums:terms,ops:terms.slice(1).map(()=>'+'),
    res:n,blanks:[at],vals:[slots[at]]};
}

export {genPlace,split};
