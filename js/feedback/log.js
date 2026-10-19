// Кольцевой буфер последних действий.
// Нужен потому, что на ошибку жалуются уже после того, как ушли с примера:
// без истории отчёт приходит пустым.
const MAX=24;
const events=[];

function logEvent(type,data){
  events.push({at:Date.now(),type,...data});
  if(events.length>MAX) events.shift();
}
const getLog=()=>events.map(e=>({...e}));
const clearLog=()=>{ events.length=0; };

export {logEvent,getLog,clearLog};
