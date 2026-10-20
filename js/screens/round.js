// Экран решения: состояние раунда, ввод ответа, проверка, переход к итогу.
import {show} from './nav.js';
import {S,stats,save,progress,addProgress,solvedToday} from '../state.js';
import {t} from '../i18n/index.js';
import {makeItems,isRight,blankCount,itemText,clockText} from '../core/index.js';
import {$} from '../view/dom.js';
import {CATS,earnedCount} from '../cats.js';
import {buildCat} from '../view/cat.js';
import {fitSheet,buildItem} from '../view/item.js';
import {renderPad} from './pad.js';
import {logEvent} from '../feedback/log.js';

let R=null;
let clock=null;

const mmss=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');

// Секундомер идёт вверх и ничем не подгоняет: это отсчёт времени, а не таймер
// с дедлайном. Детям, которые боятся арифметики, обратный отсчёт только мешает.
function renderClock(){
  if(!R) return;
  $('#timer').textContent=mmss(Math.round((Date.now()-R.t0)/1000));
}
function startClock(){
  stopClock();
  renderClock();
  clock=setInterval(renderClock,1000);
}
function stopClock(){
  if(clock){ clearInterval(clock); clock=null; }
}

function startRound(items,mode){
  R={mode,items,i:0,vals:[''],active:0,tries:0,phase:'answer',res:[],t0:Date.now(),timer:null};
  resetInput(); show('play'); renderPlay(); startClock();
}
function renderProgress(){
  const pg=$('#pg'); pg.replaceChildren();
  R.items.forEach((_,i)=>{
    const s=document.createElement('span');
    const r=R.res[i];
    s.className=r?(r.first?'ok':(r.ok?'ok':'miss')):(i===R.i?'cur':'');
    pg.append(s);
  });
}
function resetInput(){ R.vals=Array(blankCount(R.items[R.i])).fill(''); R.active=0; }
function renderEq(state,reveal){
  const host=$('#eqHost'); host.replaceChildren();
  const it=R.items[R.i];
  fitSheet(host,it);
  host.append(buildItem(it,{typed:R.vals[0],vals:R.vals,active:R.active,state,reveal,cursor:R.phase==='answer',onSelect:selectBox}));
}
function updateGoLabel(){
  const b=$('#goKey');
  b.textContent=R&&R.phase==='next'?t('go.next'):(R&&R.vals.length>1&&R.active<R.vals.length-1?t('go.nextBox'):t('go.check'));
}
function selectBox(i){
  if(!R||R.phase!=='answer'||i===R.active) return;
  R.active=i; renderEq('',false); updateGoLabel();
}
function answerText(it){
  if(it.choices) return t('msg.ans1',{v:t(it.lk+it.ans)});
  if(it.view==='clock') return t('msg.ansClock',{v:clockText(it)});
  if(it.bis&&it.bis.length>1) return t('msg.ansSeq',{v:it.xs.join(t('conj'))});
  if(it.blanks&&it.blanks.length>1) return t('msg.ansPair',{v:it.vals.join(t('conj'))});
  return t('msg.ans1',{v:it.blanks?it.vals[0]:it[it.blank]});
}
// Подпись примера в списке ошибок: у фигур она зависит от языка.
function missText(it){
  if(it.view!=='shape') return itemText(it);
  if(it.task==='odd') return t('c.taskOdd')+': '+t('f.'+it.row[Number(it.ans)]);
  if(it.choices) return t('f.'+it.fig);
  return t('f.'+it.fig)+' — '+t('q.'+it.task)+' '+it.x;
}
function setMsg(text,cls){ const m=$('#msg'); m.textContent=text||''; m.className='msg'+(cls?' '+cls:''); }
function renderPlay(){
  logEvent('show',{mode:R.mode,i:R.i,item:R.items[R.i]});
  // «1 / 10» вместо «Пример 1 из 10»: слово лишнее, пример и так перед глазами.
  // Полную фразу оставляем для чтения с экрана.
  const c=$('#count');
  c.textContent=`${R.i+1} / ${R.items.length}`;
  c.setAttribute('aria-label',t('count',{i:R.i+1,n:R.items.length}));
  renderProgress(); renderPad(R.items[R.i],R.vals[0]); renderEq('',false); setMsg('');
  updateGoLabel();
}
function press(d){
  if(!R||R.phase!=='answer'||R.items[R.i].choices) return;
  if(R.vals[R.active].length>=3) return;
  R.vals[R.active]+=d; renderEq('',false); setMsg('');
}
function back(){
  if(!R||R.phase!=='answer') return;
  const it=R.items[R.i];
  if(it.choices){ choose(''); return; }
  if(R.vals[R.active]===''&&R.active>0) R.active--;
  else R.vals[R.active]=R.vals[R.active].slice(0,-1);
  renderEq('',false); updateGoLabel();
}
// Выбранный вариант — такой же ответ, как набранное число, только одним нажатием.
function choose(k){
  if(!R||R.phase!=='answer') return;
  R.vals[0]=k;
  renderPad(R.items[R.i],k); renderEq('',false); setMsg(''); updateGoLabel();
}
function go(){
  if(!R) return;
  if(R.phase==='next') return advance();
  if(R.phase!=='answer') return;
  const it=R.items[R.i];
  if(R.vals.length>1 && R.active<R.vals.length-1){
    if(R.vals[R.active]===''){ setMsg(t('msg.fill1'),'warn'); return; }
    R.active++; renderEq('',false); updateGoLabel(); setMsg('');
    return;
  }
  if(R.vals.some(v=>v==='')){
    setMsg(it.choices?t('msg.pick'):(R.vals.length>1?t('msg.fillAll'):t('msg.fill1')),'warn');
    return;
  }
  const right=isRight(it,R.vals);
  logEvent('answer',{i:R.i,vals:R.vals.slice(),right,tries:R.tries});
  if(right){
    R.res[R.i]={item:it,ok:true,first:R.tries===0};
    R.phase='wait'; renderProgress(); renderEq('ok',false);
    setMsg(R.tries===0?t('msg.right'):t('msg.right2'),'good');
    R.timer=setTimeout(advance,800);
  }else{
    R.tries++;
    if(R.tries<2){
      resetInput(); renderPad(it,''); renderEq('bad',false); updateGoLabel(); setMsg(t('msg.wrong'),'warn');
      setTimeout(()=>{ if(R&&R.phase==='answer'&&R.vals.every(v=>v==='')) renderEq('',false); },700);
    }else{
      R.res[R.i]={item:it,ok:false,first:false};
      R.phase='next'; renderProgress(); renderEq('reveal',true);
      setMsg(answerText(it),'warn');
      updateGoLabel();
    }
  }
}
function advance(){
  if(!R) return;
  clearTimeout(R.timer);
  R.i++; R.tries=0; R.phase='answer';
  if(R.i>=R.items.length) return finish();
  resetInput(); renderPlay();
}
const STAR='M12 2.4l2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 17.4 6.1 20.5l1.2-6.6L2.5 9.3l6.6-.9z';

function renderStars(earned){
  const host=$('#stars');
  host.replaceChildren();
  host.setAttribute('aria-label',t('res.stars',{a:earned}));
  for(let i=1;i<=3;i++){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('aria-hidden','true');
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',STAR);
    p.setAttribute('class',i<=earned?'on':'off');
    svg.append(p);
    host.append(svg);
  }
}

// Главная награда показывается сразу после раунда, а не ждёт, пока ребёнок
// сам зайдёт в коллекцию.
function showNewCat(before){
  const now=earnedCount(progress.food);
  const box=$('#newCat');
  box.hidden=now<=before;
  const art=$('#newCatArt');
  art.replaceChildren();
  if(!box.hidden) art.append(buildCat(CATS[now-1]));
}

function finish(){
  stopClock();
  const n=R.items.length;
  const first=R.res.filter(r=>r.first).length;
  const st=stats[R.mode];
  st.done+=n; st.first+=first; save();
  const secs=Math.round((Date.now()-R.t0)/1000);
  const pct=first/n;

  // Корм начисляется за каждый решённый пример, независимо от числа попыток:
  // награда за усилие, а не за точность.
  const catsBefore=earnedCount(progress.food);
  addProgress(n);
  showNewCat(catsBefore);

  // Одна звезда даётся за сам факт пройденного раунда — «провалить» тренировку
  // нельзя. Вторая и третья — за аккуратность.
  const earned=pct>=0.9?3:pct>=0.7?2:1;
  renderStars(earned);

  const rt=$('#resText'); rt.replaceChildren();
  const b=document.createElement('b'); b.textContent=t('res.try',{a:first,n});
  const p=document.createElement('span'); p.textContent=t('res.time',{t:Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0')});
  const food=document.createElement('span');
  food.className='food-gain';
  food.textContent='\u{1F408} +'+n;
  food.setAttribute('aria-label',t('res.food',{n}));
  rt.append(b,p,food);

  // addProgress уже отработал выше, поэтому счёт за день включает этот раунд
  const done=solvedToday(), need=S.goal;
  const day=document.createElement('span');
  const reached=done>=need;
  day.className='day-goal'+(reached?' done':'');
  day.textContent=reached?t('today.goalDone'):t('today.goal',{a:done,n:need});
  rt.append(day);
  const miss=R.res.filter(r=>!r.first).map(r=>r.item);
  R.miss=miss;
  const list=$('#missList'); list.replaceChildren();
  for(const it of miss){
    const li=document.createElement('li');
    li.textContent=missText(it);
    list.append(li);
  }
  $('#missBox').hidden=!miss.length;
  $('#redo').hidden=!miss.length;
  show('result');
}

// Кнопки «ещё раз», «повторить ошибки» и выход: раунд наружу не отдаём, только действия над ним.
function again(){ if(R) startRound(makeItems(R.mode,S,S.count),R.mode); }
function redo(){ if(R&&R.miss&&R.miss.length) startRound(R.miss.slice(),R.mode); }
function quit(){ stopClock(); if(R) clearTimeout(R.timer); R=null; }
const isPlaying=()=>!!R;

// Снимок раунда для отчёта об ошибке: только чтение, сам R наружу не отдаём.
function roundSnapshot(){
  if(!R) return null;
  // после finish() R.i стоит за концом списка — берём последний показанный пример
  const done=R.i>=R.items.length;
  const i=Math.min(R.i,R.items.length-1);
  const copy=v=>v===undefined?null:JSON.parse(JSON.stringify(v));
  return {
    mode:R.mode, i, total:R.items.length, finished:done,
    tries:R.tries, phase:R.phase,
    vals:R.vals.slice(), active:R.active,
    item:copy(R.items[i]),
    miss:copy(R.miss||[]),
    res:R.res.map(r=>r?{ok:r.ok,first:r.first}:null)
  };
}

export {startRound,press,back,go,choose,updateGoLabel,again,redo,quit,isPlaying,roundSnapshot};
