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
const buildItem=(it,opt)=>(VIEWS[it.view]||buildEq)(it,opt);

export {fitSheet,buildItem};
