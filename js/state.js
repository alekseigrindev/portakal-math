// Настройки и статистика: значения по умолчанию, чтение из localStorage с проверкой каждого поля.
import {detectLang,CODES} from './i18n/index.js';
import {MODES,RANGES,LIMITS} from './config.js';
import {ALL as SHAPES_ALL} from './core/shapes.js';

const MODE_IDS=MODES.map(m=>m[0]);

const KEY='schetnik-v1';
const DEF={
  mode:'addsub', count:10, lang:detectLang(), theme:'auto',
  addsub:{range:20,ops:'both',carry:'any',blank:'operand',actions:'one',unknown:1},
  mul:{tables:[2,3,4,5,6,7,8,9],limit:100,blank:'result'},
  div:{tables:[2,3,4,5,6,7,8,9],limit:100,blank:'result'},
  comp:{numbers:[2,3,4,5,6,7,8,9,10],view:'bond',blank:'other'},
  seq:{kind:'add',steps:[2,3,4,5],factors:[2,3],limit:20,dir:'up',start:'zero',blank:'last',gaps:1,hint:'show'},
  place:{digits:2,view:'sum',blank:'part'},
  clock:{step:30,numerals:'arabic'},
  roman:{limit:12},
  shapes:{tasks:['name','corners'],figs:SHAPES_ALL.slice()}
};
const S=JSON.parse(JSON.stringify(DEF));
let stats=Object.fromEntries(MODE_IDS.map(m=>[m,{done:0,first:0}]));

function loadSaved(){
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null');
    if(!raw) return;
    const c=raw.cfg||{};
    if(MODE_IDS.includes(c.mode)) S.mode=c.mode;
    if([10,15,20].includes(c.count)) S.count=c.count;
    if(CODES.includes(c.lang)) S.lang=c.lang;
    if(['auto','light','dark'].includes(c.theme)) S.theme=c.theme;
    if(c.addsub){
      if(RANGES.includes(c.addsub.range)) S.addsub.range=c.addsub.range;
      if(['plus','minus','both'].includes(c.addsub.ops)) S.addsub.ops=c.addsub.ops;
      if(['any','none','only'].includes(c.addsub.carry)) S.addsub.carry=c.addsub.carry;
      if(['operand','result','any'].includes(c.addsub.blank)) S.addsub.blank=c.addsub.blank;
      if(['one','two','mix'].includes(c.addsub.actions)) S.addsub.actions=c.addsub.actions;
      if([1,2,'mix'].includes(c.addsub.unknown)) S.addsub.unknown=c.addsub.unknown;
    }
    for(const m of ['mul','div']){
      if(c[m]){
        if(Array.isArray(c[m].tables)){
          const t=c[m].tables.filter(x=>Number.isInteger(x)&&x>=2&&x<=9);
          if(t.length) S[m].tables=t;
        }
        if(LIMITS.includes(c[m].limit)) S[m].limit=c[m].limit;
        if(['result','other','any'].includes(c[m].blank)) S[m].blank=c[m].blank;
      }
    }
    if(c.comp){
      if(Array.isArray(c.comp.numbers)){
        const t=c.comp.numbers.filter(x=>Number.isInteger(x)&&x>=2&&x<=20).sort((x,y)=>x-y);
        if(t.length) S.comp.numbers=t;
      }
      if(['bond','eq','mix'].includes(c.comp.view)) S.comp.view=c.comp.view;
      if(['other','result','any'].includes(c.comp.blank)) S.comp.blank=c.comp.blank;
    }
    if(c.seq){
      if(['add','mul','div','mix'].includes(c.seq.kind)) S.seq.kind=c.seq.kind;
      if(Array.isArray(c.seq.factors)){
        const t=c.seq.factors.filter(x=>[2,3,4,5,10].includes(x)).sort((x,y)=>x-y);
        if(t.length) S.seq.factors=t;
      }
      if(Array.isArray(c.seq.steps)){
        const t=c.seq.steps.filter(x=>Number.isInteger(x)&&x>=2&&x<=10).sort((x,y)=>x-y);
        if(t.length) S.seq.steps=t;
      }
      if([20,50,100].includes(c.seq.limit)) S.seq.limit=c.seq.limit;
      if(['up','down','mix'].includes(c.seq.dir)) S.seq.dir=c.seq.dir;
      if(['zero','any'].includes(c.seq.start)) S.seq.start=c.seq.start;
      if(['last','any'].includes(c.seq.blank)) S.seq.blank=c.seq.blank;
      if([1,2,'mix'].includes(c.seq.gaps)) S.seq.gaps=c.seq.gaps;
      if(['show','hide'].includes(c.seq.hint)) S.seq.hint=c.seq.hint;
    }
    if(c.place){
      if([2,3,'mix'].includes(c.place.digits)) S.place.digits=c.place.digits;
      if(['sum','units','mix'].includes(c.place.view)) S.place.view=c.place.view;
      if(['part','whole','any'].includes(c.place.blank)) S.place.blank=c.place.blank;
    }
    if(c.clock){
      if([60,30,15,5,1].includes(c.clock.step)) S.clock.step=c.clock.step;
      if(['arabic','roman','ticks'].includes(c.clock.numerals)) S.clock.numerals=c.clock.numerals;
    }
    if(c.roman){
      if([12,20,50,100].includes(c.roman.limit)) S.roman.limit=c.roman.limit;
    }
    if(c.shapes){
      const tasks=['name','odd','corners','perim','area'];
      if(Array.isArray(c.shapes.tasks)){
        const t=tasks.filter(x=>c.shapes.tasks.includes(x));
        if(t.length) S.shapes.tasks=t;
      }
      if(Array.isArray(c.shapes.figs)){
        const f=SHAPES_ALL.filter(x=>c.shapes.figs.includes(x));
        if(f.length) S.shapes.figs=f;
      }
    }
    if(raw.stats){
      for(const m of MODE_IDS){
        const s=raw.stats[m];
        if(s&&Number.isFinite(s.done)&&Number.isFinite(s.first)) stats[m]={done:s.done,first:s.first};
      }
    }
  }catch(e){}
}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify({cfg:S,stats})); }catch(e){} }

export {KEY,DEF,S,stats,loadSaved,save};
