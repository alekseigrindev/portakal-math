// Что показать в окне подсказки для каждого вида примера.
// Подсказка объясняет способ, а не ответ: рисунок всегда учебный, а не текущий
// пример, иначе кнопка «?» превратилась бы в кнопку «решить за меня».
// Новый вид добавляется записью в HINTS: картинка и шаги к ней.
import {buildClockHint} from './clock.js';
import {buildRomanHint} from './roman.js';
import {buildArithHint} from './arithhint.js';
import {hasCarry} from '../core/addsub.js';

// mark — класс образца рядом с шагом: ребёнок младше читаемого текста, и
// цветная полоска связывает шаг с нужной стрелкой быстрее, чем слово.
const THREE=[{n:1,mark:''},{n:2,mark:''},{n:3,mark:''}];
const arith=kind=>({art:()=>buildArithHint(kind),steps:THREE});
const HINTS={
  clock:{art:buildClockHint,steps:[{n:1,mark:'hh'},{n:2,mark:'mh'},{n:3,mark:''}]},
  roman:{art:buildRomanHint,steps:THREE},
  ...Object.fromEntries(['add.res','sub.res','add.x','sub.a','sub.b','mul.res','mul.x',
    'div.res','div.a','div.b','bond'].map(k=>[k,arith(k)]))
};

// Пример в одно действие (a op b = c): подсказка зависит от того, что пропущено.
// Неизвестное число находят обратным действием, но не всегда: вычитаемое и
// делитель ищут тем же действием (12 − □ = 7 → 12 − 7), поэтому случаев три.
// Ответ сложения и вычитания без перехода через десяток считают прямо, там
// объяснять нечего, и кнопки «?» нет.
function arithKind(it){
  if(!it.op||!['a','b','c'].includes(it.blank)) return null;
  const {op,blank}=it;
  if(it.view==='bond') return blank==='c'?null:'bond';
  if(op==='+') return blank==='c'?(hasCarry(it)?'add.res':null):'add.x';
  if(op==='−') return blank==='c'?(hasCarry(it)?'sub.res':null):blank==='a'?'sub.a':'sub.b';
  if(op==='×') return blank==='c'?'mul.res':'mul.x';
  if(op==='÷') return blank==='c'?'div.res':blank==='a'?'div.a':'div.b';
  return null;
}

// Вид подсказки для примера: часы и римские цифры — по виду записи, арифметика —
// по действию и пропуску. null — подсказки нет.
function hintKind(it){
  if(!it) return null;
  if(it.view==='clock'||it.view==='roman') return it.view;
  return arithKind(it);
}

const hasHint=it=>!!HINTS[hintKind(it)];
// Шаги подписываются ключами hint.<вид>.s1, s2… — их число у видов разное.
const hintSteps=kind=>(HINTS[kind]?HINTS[kind].steps:[])
  .map(s=>({key:`hint.${kind}.s${s.n}`,mark:s.mark}));
// cfg — настройки текущего режима: у римских цифр от них зависит, какие буквы
// показывать. Виды, которым настройки не нужны, аргумент просто игнорируют.
const hintArt=(kind,cfg)=>HINTS[kind]?HINTS[kind].art(cfg):null;

export {hintKind,hasHint,hintSteps,hintArt};
