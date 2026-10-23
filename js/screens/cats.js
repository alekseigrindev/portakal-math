// Экран коллекции. Запертых котов показываем силуэтами с порогом:
// видно, что будет дальше и сколько до него осталось.
import {progress} from '../state.js';
import {CATS,earnedCount,nextCat} from '../cats.js';
import {buildCat} from '../view/cat.js';
import {t} from '../i18n/index.js';
import {$} from '../view/dom.js';
import {foodIcon,football} from './skin.js';

function renderCats(){
  const have=earnedCount(progress.food);

  $('#catsFood').textContent=foodIcon()+' '+progress.food;
  $('#catsFood').setAttribute('aria-label',t('food.total',{n:progress.food}));
  $('#catsCount').textContent=have+' / '+CATS.length;
  $('#catsCount').setAttribute('aria-label',t('cats.count',{a:have,n:CATS.length}));

  const grid=$('#catsGrid');
  grid.replaceChildren();
  CATS.forEach((cat,i)=>{
    const locked=i>=have;
    const cell=document.createElement('div');
    cell.className='cat-cell'+(locked?' locked':'');
    cell.append(buildCat(cat,{locked,kit:football()?i+1:0}));
    const cap=document.createElement('span');
    cap.className='cat-cap';
    cap.textContent=locked?foodIcon()+' '+cat.at:'';
    cell.append(cap);
    cell.setAttribute('role','img');
    cell.setAttribute('aria-label',locked?t('cats.locked',{n:cat.at}):t('cats.got',{i:i+1}));
    grid.append(cell);
  });

  const next=nextCat(progress.food);
  const hint=$('#catsNext');
  hint.textContent=next?t('cats.next',{n:next.left}):t('cats.all');
  hint.classList.toggle('done',!next);
}

export {renderCats};
