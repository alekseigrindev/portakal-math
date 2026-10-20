// Окно подсказки: как решать такие примеры.
// Отдельное окно, а не подпись на поле задания: на поле ей негде встать, не
// сдвинув пример, а сдвигать его между шагами нельзя.
import {t} from '../i18n/index.js';
import {S} from '../state.js';
import {hintSteps,hintArt} from '../view/hints.js';
import {pauseRound,resumeRound,currentItem} from './round.js';
import {logEvent} from '../feedback/log.js';

let dlg=null, title=null, art=null, steps=null, okBtn=null;

function build(){
  dlg=document.createElement('dialog');
  dlg.className='hint-dlg';
  const body=document.createElement('div');
  body.className='hint-body';

  title=document.createElement('h2');
  title.className='hint-title';

  art=document.createElement('div');
  art.className='hint-art';

  steps=document.createElement('ol');
  steps.className='hint-steps';

  const row=document.createElement('div');
  row.className='fb-row';
  okBtn=document.createElement('button');
  okBtn.className='btn';
  okBtn.type='button';
  okBtn.addEventListener('click',()=>dlg.close());
  row.append(okBtn);

  body.append(title,art,steps,row);
  dlg.append(body);
  // Секундомер стоит, пока читают: время раунда не должно расти от того,
  // что ребёнок разбирается, как читать часы.
  dlg.addEventListener('close',resumeRound);
  document.body.append(dlg);
}

function openHint(){
  const it=currentItem();
  if(!it) return;
  if(!dlg) build();

  title.textContent=t('hint.'+it.view+'.title');
  okBtn.textContent=t('hint.close');

  art.replaceChildren();
  const pic=hintArt(it.view,S[S.mode]||{});
  if(pic) art.append(pic);

  steps.replaceChildren();
  for(const s of hintSteps(it.view)){
    const li=document.createElement('li');
    if(s.mark){
      const m=document.createElement('span');
      m.className='hint-mark '+s.mark;
      m.setAttribute('aria-hidden','true');
      li.append(m);
    }
    li.append(document.createTextNode(t(s.key)));
    steps.append(li);
  }

  logEvent('hint',{view:it.view});
  pauseRound();
  dlg.showModal();
}

export {openHint};
