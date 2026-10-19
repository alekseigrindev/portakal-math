// Точка входа генератора: один пример по режиму и набор примеров без повторов.
import {genAddSub} from './addsub.js';
import {genMul,genDiv} from './muldiv.js';
import {genComp} from './comp.js';
import {genPlace} from './place.js';
import {genSeq} from './seq.js';
import {genClock} from './clock.js';
import {genRoman} from './roman.js';
import {genShapes} from './shapes.js';
import {itemKey} from './item.js';

const GEN={
  addsub:genAddSub, mul:genMul, div:genDiv, comp:genComp, place:genPlace,
  seq:genSeq, clock:genClock, roman:genRoman, shapes:genShapes
};

function gen(mode,cfg){
  return GEN[mode](cfg[mode]);
}
function makeItems(mode,cfg,n){
  const out=[],seen=new Set();
  let guard=0;
  while(out.length<n && guard++<600){
    const it=gen(mode,cfg), k=itemKey(it);
    if(seen.has(k) && guard<450) continue;
    seen.add(k); out.push(it);
  }
  return out;
}

export {gen,makeItems};
export {isRight,blankCount,exprText,cellsN,itemText,itemKey} from './item.js';
export {seqUnfit} from './seq.js';
export {clockText} from './clock.js';
