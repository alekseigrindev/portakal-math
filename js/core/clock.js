// Часы: показываем циферблат со стрелками, ответ — часы и минуты (два пропуска).
import {rnd} from './shared.js';

const clockText=it=>it.h+':'+String(it.m).padStart(2,'0');

function genClock(o){
  const s=o.step;
  return {view:'clock',h:rnd(1,12),m:rnd(0,Math.floor(59/s))*s,numerals:o.numerals};
}

export {genClock,clockText};
