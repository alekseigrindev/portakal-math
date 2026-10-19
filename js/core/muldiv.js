// Таблица умножения и деления.
import {rnd,pick,chooseBlank} from './shared.js';

// Число из таблицы и второй множитель так, чтобы все числа в примере не превышали o.limit
function pickPair(o){
  const lim=o.limit||100;
  const fit=o.tables.filter(t=>t*2<=lim);
  const t=pick(fit.length?fit:o.tables);
  return [t,Math.max(2,Math.min(10,Math.floor(lim/t)))];
}
function genMul(o){
  const [t,maxN]=pickPair(o), n=rnd(2,maxN);
  const swap=Math.random()<0.5;
  const a=swap?n:t, b=swap?t:n;
  return {a,op:'×',b,c:a*b,blank:chooseBlank(o.blank)};
}
function genDiv(o){
  const [t,maxN]=pickPair(o), q=rnd(2,maxN);
  const divisor=Math.random()<0.5?t:q;
  const quotient=divisor===t?q:t;
  return {a:t*q,op:'÷',b:divisor,c:quotient,blank:chooseBlank(o.blank)};
}

export {genMul,genDiv};
