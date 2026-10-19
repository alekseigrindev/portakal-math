// Общие помощники генерации: случайные числа, выбор из списка, выбор пропуска.
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=arr=>arr[rnd(0,arr.length-1)];
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);

// Пример: {a, op, b, c, blank}. Всегда выполняется a op b = c; blank — какое из чисел пропущено.
function chooseBlank(kind,items){
  if(kind==='result') return 'c';
  if(kind==='any') return pick(['a','b','c']);
  return pick(['a','b']);
}

export {rnd,pick,shuffle,range,chooseBlank};
