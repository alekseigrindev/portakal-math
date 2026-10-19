// Фигуры. Два рода заданий:
//   название и «найди лишнюю» — ответ выбирают из вариантов (it.choices);
//   углы, периметр, площадь  — ответ набирают числом.
// Периметр и площадь считаются только на квадрате, прямоугольнике и равностороннем
// треугольнике и со сторонами до 10, чтобы всё решалось в уме, без черновика.
import {rnd,pick,shuffle} from './shared.js';

const SIDES={circle:0,triangle:3,square:4,rect:4,pentagon:5,hexagon:6};
const ALL=['circle','triangle','square','rect','pentagon','hexagon'];
const MEASURABLE=['square','rect','triangle'];

const only=(list,set)=>list.filter(f=>set.includes(f));

// Не всякое задание получается из любого набора фигур: «найди лишнюю» нужны две разные,
// периметр — многоугольник, площадь — прямоугольник. Невыполнимые просто не предлагаем.
function feasible(task,figs){
  if(task==='name'||task==='odd') return figs.length>=2;
  if(task==='corners') return figs.some(f=>f!=='circle');
  if(task==='perim') return figs.some(f=>MEASURABLE.includes(f));
  if(task==='area') return figs.some(f=>f==='square'||f==='rect');
  return false;
}
const TASKS=['name','odd','corners','perim','area'];

function genShapes(o){
  const avail=o.figs.length?o.figs:ALL;
  const wanted=(o.tasks.length?o.tasks:TASKS).filter(t=>feasible(t,avail));
  // выбраны только невыполнимые задания — берём любое, что получается из этих фигур
  const tasks=wanted.length?wanted:TASKS.filter(t=>feasible(t,avail));
  if(!tasks.length) return genShapes({tasks:o.tasks,figs:ALL});
  for(let i=0;i<80;i++){
    const task=pick(tasks);

    if(task==='name'){
      if(avail.length<2) continue;
      const fig=pick(avail);
      const rest=shuffle(avail.filter(f=>f!==fig)).slice(0,2);
      return {view:'shape',task:'name',fig,a:5,b:3,ans:fig,blank:'ans',
        choices:shuffle([fig,...rest]),lk:'f.'};
    }

    if(task==='odd'){
      // три фигуры одного вида и одна чужая: лишнюю выбирают из вариантов
      if(avail.length<2) continue;
      const odd=pick(avail), same=pick(avail.filter(f=>f!==odd));
      const at=rnd(0,3);
      const row=Array.from({length:4},(_,k)=>k===at?odd:same);
      return {view:'shape',task:'odd',row,a:5,b:3,ans:String(at),blank:'ans',
        choices:['0','1','2','3'],lk:'c.pos'};
    }

    if(task==='corners'){
      const list=avail.filter(f=>f!=='circle');
      if(!list.length) continue;
      const fig=pick(list);
      return {view:'shape',task:'corners',fig,a:5,b:3,blank:'x',x:SIDES[fig]};
    }

    if(task==='perim'){
      const list=only(avail,MEASURABLE);
      if(!list.length) continue;
      const fig=pick(list), a=rnd(2,10);
      if(fig==='rect'){
        const b=rnd(2,10);
        if(b===a) continue;
        return {view:'shape',task:'perim',fig,a,b,labels:true,blank:'x',x:2*(a+b)};
      }
      return {view:'shape',task:'perim',fig,a,b:a,labels:true,blank:'x',x:SIDES[fig]*a};
    }

    // площадь: только то, что ложится на клетки листа
    const list=only(avail,['square','rect']);
    if(!list.length) continue;
    const fig=pick(list), a=rnd(2,10);
    const b=fig==='rect'?rnd(2,10):a;
    if(fig==='rect'&&b===a) continue;
    return {view:'shape',task:'area',fig,a,b,labels:true,grid:true,blank:'x',x:a*b};
  }
  return {view:'shape',task:'corners',fig:'square',a:5,b:3,blank:'x',x:4};
}

export {genShapes,feasible,SIDES,ALL,TASKS,MEASURABLE};
