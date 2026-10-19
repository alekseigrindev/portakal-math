// Экран решения: состояние раунда, ввод ответа, проверка, переход к итогу.
import {show} from './nav.js';
import {S,stats,save} from '../state.js';
import {t} from '../i18n/index.js';
import {makeItems,isRight,blankCount,itemText,clockText} from '../core/index.js';
import {$} from '../view/dom.js';
import {fitSheet,buildItem} from '../view/item.js';
import {renderPad} from './pad.js';
import {logEvent} from '../feedback/log.js';

let R=null;

function startRound(items,mode){
  R={mode,items,i:0,vals:[''],active:0,tries:0,phase:'answer',res:[],t0:Date.now(),timer:null};
  resetInput(); show('play'); renderPlay();
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
  $('#count').textContent=t('count',{i:R.i+1,n:R.items.length});
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
function finish(){
  const n=R.items.length;
  const first=R.res.filter(r=>r.first).length;
  const st=stats[R.mode];
  st.done+=n; st.first+=first; save();
  const secs=Math.round((Date.now()-R.t0)/1000);
  const pct=first/n;
  const mark=$('#mark');
  if(pct>=0.9){mark.textContent=t('mark.hi');mark.className='mark';}
  else if(pct>=0.75){mark.textContent=t('mark.mid');mark.className='mark';}
  else if(pct>=0.5){mark.textContent=t('mark.low');mark.className='mark';}
  else{mark.textContent=t('res.none');mark.className='mark none';}
  const rt=$('#resText'); rt.replaceChildren();
  const b=document.createElement('b'); b.textContent=t('res.try',{a:first,n});
  const p=document.createElement('span'); p.textContent=t('res.time',{t:Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0')});
  rt.append(b,p);
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
function quit(){ if(R) clearTimeout(R.timer); R=null; }
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
