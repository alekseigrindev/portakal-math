// Сбор отчёта. Главное здесь — не картинка, а состояние: по нему экран
// воспроизводится точно, потому что примеры порождаются из настроек детерминированно.
import {S,stats} from '../state.js';
import {roundSnapshot} from '../screens/round.js';
import {getLog} from './log.js';

// Версию правим руками при заметных изменениях: сборки у проекта нет.
const VERSION='2026-10-17';

const copy=v=>JSON.parse(JSON.stringify(v));

function currentScreen(){
  if(!document.querySelector('#play').hidden) return 'play';
  if(!document.querySelector('#result').hidden) return 'result';
  return 'setup';
}

function buildReport(text){
  return {
    version:VERSION,
    at:new Date().toISOString(),
    screen:currentScreen(),
    lang:S.lang,
    mode:S.mode,
    cfg:copy(S),
    stats:copy(stats),
    round:roundSnapshot(),
    log:getLog(),
    env:{
      ua:navigator.userAgent,
      w:window.innerWidth, h:window.innerHeight,
      dpr:window.devicePixelRatio||1,
      theme:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light',
      tz:Intl.DateTimeFormat().resolvedOptions().timeZone||''
    },
    text:(text||'').slice(0,2000)
  };
}

export {buildReport,VERSION,currentScreen};
