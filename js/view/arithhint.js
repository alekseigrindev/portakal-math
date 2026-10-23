// Рисунки к подсказкам по арифметике: учебный пример и под ним — как его решают.
// Пример всегда один и тот же для своего случая, а не текущий: подсказка
// показывает приём, а не ответ. Найденное число в рамке и зелёное — так же
// выглядит верный ответ на листе, и глаз сразу находит, что искали.
import {buildEq} from './equation.js';
import {buildExpr} from './expression.js';
import {buildBond} from './bond.js';

// Строки рисунка. x — какое число в рамке: a, b или c.
// task — сама задача, рамка пустая (ширина рамки — по задуманному числу);
// step — промежуточный шаг без рамки; done — найденное число в зелёной рамке.
const task=(a,op,b,c,x)=>()=>buildEq({a,op,b,c,blank:x},{});
// без рамки: такого места в записи нет, и все четыре числа пишутся как есть
const step=(a,op,b,c)=>()=>buildEq({a,op,b,c,blank:'none'},{});
const done=(a,op,b,c,x)=>()=>buildEq({a,op,b,c,blank:x},{reveal:true,state:'ok'});

// Первая строка — задача, дальше — решение.
const LINES={
  'add.res':[task(8,'+',5,13,'c'), step(8,'+',2,10), done(10,'+',3,13,'c')],
  'sub.res':[task(13,'−',5,8,'c'), step(13,'−',3,10), done(10,'−',2,8,'c')],
  'add.x':  [task(7,'+',5,12,'a'), done(12,'−',5,7,'c')],
  'sub.a':  [task(12,'−',5,7,'a'), done(7,'+',5,12,'c')],
  'sub.b':  [task(12,'−',5,7,'b'), done(12,'−',7,5,'c')],
  'mul.res':[task(6,'×',4,24,'c'),
    ()=>buildExpr({view:'expr',nums:[6,6,6,6],ops:['+','+','+'],res:24,blanks:[4],vals:[24]},
      {reveal:true,state:'ok'})],
  'mul.x':  [task(6,'×',4,24,'a'), done(24,'÷',4,6,'c')],
  'div.res':[task(24,'÷',4,6,'c'), done(4,'×',6,24,'b')],
  'div.a':  [task(24,'÷',4,6,'a'), done(6,'×',4,24,'c')],
  'div.b':  [task(24,'÷',4,6,'b'), done(24,'÷',6,4,'c')],
  // состав числа решают по схеме, поэтому и задача — схема, а не строка
  'bond':   [()=>buildBond({a:4,op:'+',b:5,c:9,blank:'b',view:'bond'},{}), done(9,'−',4,5,'c')]
};

function buildArithHint(kind){
  const lines=LINES[kind];
  if(!lines) return null;
  const wrap=document.createElement('div');
  wrap.className='ahint';
  lines.forEach((draw,i)=>{
    if(i===1){
      const arrow=document.createElement('div');
      arrow.className='ahint-arrow';
      arrow.setAttribute('aria-hidden','true');
      arrow.textContent='↓';
      wrap.append(arrow);
    }
    wrap.append(draw());
  });
  return wrap;
}

export {buildArithHint};
