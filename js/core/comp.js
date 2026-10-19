// Состав числа.
import {rnd,pick,chooseBlank} from './shared.js';

// Состав числа: целое c разложено на части a и b (a + b = c). view: 'bond' (схема) или 'rev' (запись c = a + b)
function genComp(o){
  const c=pick(o.numbers), a=rnd(1,c-1);
  const view=o.view==='mix'?pick(['bond','rev']):(o.view==='eq'?'rev':'bond');
  return {a,op:'+',b:c-a,c,blank:chooseBlank(o.blank),view};
}

export {genComp};
