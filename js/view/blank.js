// Рамка пропуска: клетки под цифры ответа, курсор в текущей и показ решения.
// Одна и та же рамка нужна почти каждому виду, поэтому живёт отдельно.
import {cell} from './dom.js';

function blankBox(ans,shown,opt={}){
  const {cursor=false,active=true,multi=false,onSelect=null,index=0,minCells=0}=opt;
  const box=document.createElement('div');
  box.className='box';
  if(multi){
    box.classList.add('multi');
    if(cursor&&active) box.classList.add('act');
    if(onSelect) box.addEventListener('click',()=>onSelect(index));
  }
  // minCells резервирует клетки заранее: в видах, где поле стоит по центру,
  // рост рамки при наборе уводил цифры из-под пальца.
  const n=Math.max(String(ans).length,shown.length,minCells);
  for(let i=0;i<n;i++){
    const c=cell(shown[i]||'');
    if(cursor&&active&&i===shown.length) c.classList.add('cur');
    box.append(c);
  }
  return box;
}

export {blankBox};
