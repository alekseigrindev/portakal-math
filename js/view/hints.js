// Что показать в окне подсказки для каждого вида примера.
// Подсказка объясняет способ, а не ответ: рисунок всегда учебный, а не текущий
// пример, иначе кнопка «?» превратилась бы в кнопку «решить за меня».
// Новый вид добавляется записью в HINTS: картинка и шаги к ней.
import {buildClockHint} from './clock.js';
import {buildRomanHint} from './roman.js';

// mark — класс образца рядом с шагом: ребёнок младше читаемого текста, и
// цветная полоска связывает шаг с нужной стрелкой быстрее, чем слово.
const HINTS={
  clock:{art:buildClockHint,steps:[{n:1,mark:'hh'},{n:2,mark:'mh'},{n:3,mark:''}]},
  roman:{art:buildRomanHint,steps:[{n:1,mark:''},{n:2,mark:''},{n:3,mark:''}]}
};

const hasHint=it=>!!(it&&HINTS[it.view]);
// Шаги подписываются ключами hint.<вид>.s1, s2… — их число у видов разное.
const hintSteps=view=>(HINTS[view]?HINTS[view].steps:[])
  .map(s=>({key:`hint.${view}.s${s.n}`,mark:s.mark}));
// cfg — настройки текущего режима: у римских цифр от них зависит, какие буквы
// показывать. Виды, которым настройки не нужны, аргумент просто игнорируют.
const hintArt=(view,cfg)=>HINTS[view]?HINTS[view].art(cfg):null;

export {hasHint,hintSteps,hintArt};
