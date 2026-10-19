// Мелкие помощники для DOM: поиск узла и одна клетка листа.
const $=s=>document.querySelector(s);

function cell(ch,cls){
  const s=document.createElement('span');
  s.className='c'+(cls?' '+cls:'');
  s.textContent=ch||'';
  return s;
}

export {$,cell};
