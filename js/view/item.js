// Выбор отрисовки по виду примера и подгонка размера клетки под длину записи.
import {cellsN} from '../core/item.js';
import {buildEq} from './equation.js';
import {buildBond} from './bond.js';
import {buildSeq} from './sequence.js';
import {buildExpr} from './expression.js';
import {buildUnits} from './units.js';
import {buildClock} from './clock.js';
import {buildRoman} from './roman.js';
import {buildShape} from './shape.js';

const VIEWS={expr:buildExpr,bond:buildBond,seq:buildSeq,units:buildUnits,
  clock:buildClock,roman:buildRoman,shape:buildShape};

// на длинных примерах клетка уменьшается, чтобы запись помещалась в строку
function fitSheet(host,it){
  const sh=host.closest('.sheet');
  if(sh) sh.style.setProperty('--n',String(Math.max(10,cellsN(it)+3)));
}

// Размер клетки и высота листа задаются один раз на весь раунд, а не на каждый
// пример. Иначе от шага к шагу цифры меняли размер, а лист — высоту, и
// клавиатура уезжала из-под пальца: в «составе числа» вперемешку на 165 пикселей.
function fitRound(sheet,items){
  if(!sheet||!items.length) return;
  const n=Math.max(10,...items.map(it=>cellsN(it)+3));
  sheet.style.setProperty('--n',String(n));
  sheet.style.removeProperty('--round-min-h');

  const probe=document.createElement('div');
  probe.className='sheet';
  probe.style.cssText='position:absolute;left:-10000px;top:0;visibility:hidden';
  probe.style.setProperty('--n',String(n));
  probe.style.width=sheet.getBoundingClientRect().width+'px';
  // Кладём рядом с настоящим листом, а не в body: на телефоне у листа внутри
  // игрового экрана своё правило --cell, и в body замер вышел бы от другого
  // размера клетки.
  sheet.parentElement.append(probe);

  let max=0;
  for(const it of items){
    probe.replaceChildren();
    const host=document.createElement('div');
    probe.append(host);
    host.append(buildItem(it,{vals:[],cursor:false}));
    max=Math.max(max,probe.getBoundingClientRect().height);
  }
  probe.remove();
  // Отдаём высоту переменной, а не свойством: на телефоне игровой экран —
  // сетка фиксированной высоты, лист там занимает остаток и так постоянен,
  // а жёсткий min-height мешал ему сжиматься и в режиме часов выталкивал
  // содержимое за край короткого экрана.
  sheet.style.setProperty('--round-min-h',Math.ceil(max)+'px');
}
const buildItem=(it,opt)=>(VIEWS[it.view]||buildEq)(it,opt);

export {fitSheet,fitRound,buildItem};
