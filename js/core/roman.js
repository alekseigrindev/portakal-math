// Римские цифры: показываем запись, ответ — обычное число.
// Только в эту сторону: ответ остаётся числом и цифровая клавиатура подходит без изменений.
import {rnd} from './shared.js';

const SYM=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];

function toRoman(n){
  let s='';
  for(const [v,r] of SYM) while(n>=v){ s+=r; n-=v; }
  return s;
}
function genRoman(o){
  const n=rnd(1,o.limit);
  return {view:'roman',n,roman:toRoman(n),blank:'n'};
}

export {toRoman,genRoman};
