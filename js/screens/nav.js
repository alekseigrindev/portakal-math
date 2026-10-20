// Переключение между экранами настроек, решения, итога и коллекции.
import {$} from '../view/dom.js';

function show(id){
  for(const s of ['setup','play','result','cats']) $('#'+s).hidden=(s!==id);
  document.body.classList.toggle('playing',id==='play');
  window.scrollTo(0,0);
}

export {show};
