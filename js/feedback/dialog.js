// Окно отчёта об ошибке.
// Снимок делаем до открытия окна, иначе в кадр попадёт само окно.
import {t} from '../i18n/index.js';
import {buildReport} from './snapshot.js';
import {visibleSheet,offscreenSheet,release,markupOf,pngOf} from './capture.js';
import {getLog} from './log.js';
import {send} from './send.js';

let dlg=null, shot=null, note=null, withImg=null, status=null, sendBtn=null, preview=null;

function el(tag,cls,text){
  const e=document.createElement(tag);
  if(cls) e.className=cls;
  if(text!==undefined) e.textContent=text;
  return e;
}

function build(){
  dlg=el('dialog','fb');
  const form=el('form','fb-body');
  form.method='dialog';

  const h=el('h2','fb-title',t('fb.title'));
  const note1=el('p','fb-note',t('fb.note'));

  note=el('textarea','fb-text');
  note.rows=3;
  note.maxLength=2000;
  note.placeholder=t('fb.what');
  note.setAttribute('aria-label',t('fb.what'));

  const imgRow=el('label','fb-check');
  withImg=document.createElement('input');
  withImg.type='checkbox';
  withImg.checked=true;
  imgRow.append(withImg,el('span','',t('fb.withImage')));

  preview=el('div','fb-preview');
  preview.hidden=true;

  status=el('p','fb-status','');
  status.setAttribute('aria-live','polite');

  const row=el('div','fb-row');
  const cancel=el('button','btn link',t('fb.cancel'));
  cancel.type='button';
  cancel.addEventListener('click',()=>dlg.close());
  sendBtn=el('button','btn',t('fb.send'));
  sendBtn.type='button';
  sendBtn.addEventListener('click',submit);
  row.append(sendBtn,cancel);

  form.append(h,note1,note,imgRow,preview,status,row);
  dlg.append(form);
  document.body.append(dlg);
}

async function submit(){
  sendBtn.disabled=true;
  status.className='fb-status';
  status.textContent=t('fb.sending');
  // сбор отчёта тоже внутри try: иначе неожиданная ошибка оставит окно
  // висеть на «Отправляем…» без единого слова пользователю
  try{
    const report=buildReport(note.value);
    report.markup=shot.markup;
    report.markupRebuilt=shot.rebuilt;   // снимок не с экрана, а пересобран из истории
    await send(report,withImg.checked?shot.png:null);
    status.className='fb-status good';
    status.textContent=t('fb.thanks');
    setTimeout(()=>dlg.close(),1400);
  }catch(e){
    status.className='fb-status warn';
    status.textContent=t('fb.failed');
  }finally{
    sendBtn.disabled=false;
  }
}

async function openDialog(){
  if(!dlg) build();
  // подписи могли смениться вместе с языком
  dlg.querySelector('.fb-title').textContent=t('fb.title');
  dlg.querySelector('.fb-note').textContent=t('fb.note');
  note.placeholder=t('fb.what');
  note.setAttribute('aria-label',t('fb.what'));
  withImg.nextSibling.textContent=t('fb.withImage');
  sendBtn.textContent=t('fb.send');
  dlg.querySelector('.btn.link').textContent=t('fb.cancel');
  note.value='';
  status.textContent='';
  preview.hidden=true;
  preview.replaceChildren();

  // Что снимать: если раунд идёт — то, что на экране; если с него уже ушли —
  // пересобираем последний показанный пример, иначе в кадр попадёт не он.
  const playing=!document.querySelector('#play').hidden;
  const last=playing?null:[...getLog()].reverse().find(e=>e.type==='show'&&e.item);
  const node=last?offscreenSheet(last.item):visibleSheet();

  shot={markup:markupOf(node),png:null,rebuilt:!!last};
  dlg.showModal();

  // картинка собирается дольше разметки — показываем её, когда будет готова
  shot.png=await pngOf(node);
  if(last) release(node);
  if(shot.png){
    const img=new Image();
    img.src=URL.createObjectURL(shot.png);
    img.alt=t('fb.preview');
    preview.append(img);
    preview.hidden=false;
  }else{
    withImg.checked=false;
    withImg.disabled=true;
  }
}

export {openDialog};
