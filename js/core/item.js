// Разбор готового примера: сколько пропусков, верен ли ответ, как его записать строкой.
import {seqValid} from './seq.js';
import {clockText} from './clock.js';

// Проверка ответа: typed — введённые значения для пропусков по порядку.
// Числа приходят строками цифр, выбор из вариантов — ключом варианта.
function isRight(it,typed){
  if(it.choices) return typed[0]===it.ans;
  if(it.view==='clock') return Number(typed[0])===it.h && Number(typed[1])===it.m;
  if(it.view==='seq'){
    const full=[...it.nums];
    (it.bis||[it.bi]).forEach((p,k)=>{full[p]=Number(typed[k]);});
    return seqValid(it,full);
  }
  if(!it.blanks) return Number(typed[0])===it[it.blank];
  const slots=[...it.nums,it.res];
  it.blanks.forEach((p,k)=>{slots[p]=Number(typed[k]);});
  let cur=slots[0];
  for(let k=0;k<it.ops.length;k++) cur=it.ops[k]==='+'?cur+slots[k+1]:cur-slots[k+1];
  return cur===slots[it.nums.length];
}
const blankCount=it=>it.choices?1:it.view==='clock'?2:it.blanks?it.blanks.length:it.bis?it.bis.length:1;
const exprText=it=>it.nums.map((v,i)=>i===0?String(v):`${it.ops[i-1]} ${v}`).join(' ')+` = ${it.res}`;
// сколько клеток занимает запись примера (нужно, чтобы уменьшить клетку на узком экране)
const cellsN=it=>it.view==='expr'?[...it.nums,it.res].reduce((s,v)=>s+String(v).length,0)+it.ops.length+1:0;

// Короткая запись примера для списка ошибок. Фигуры сюда не попадают: их подпись
// зависит от языка и собирается на экране итога.
function itemText(it){
  if(it.view==='expr') return exprText(it);
  if(it.view==='seq') return it.nums.join(', ');
  if(it.view==='units') return String(it.n);
  if(it.view==='clock') return clockText(it);
  if(it.view==='roman') return `${it.roman} = ${it.n}`;
  // у фигур подпись техническая: названия фигур переводятся на экране, а не здесь
  if(it.view==='shape') return it.task==='odd'
    ? `odd:${it.row.join('/')}→${it.row[Number(it.ans)]}`
    : `${it.fig}:${it.task}=${it.x!==undefined?it.x:it.ans}`;
  if(it.view) return `${it.c} = ${it.a} ${it.op} ${it.b}`;
  return `${it.a} ${it.op} ${it.b} = ${it.c}`;
}

const itemKey=it=>[it.a,it.op,it.b,it.c,it.blank,it.view||'',(it.nums||[]).join(','),it.bi,(it.bis||[]).join(','),(it.ops||[]).join(''),(it.blanks||[]).join(','),it.h,it.m,it.n,it.task,it.fig,(it.row||[]).join(','),it.ans].join('|');

export {isRight,blankCount,exprText,cellsN,itemText,itemKey};
