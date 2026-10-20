// Описание настроек каждого режима: какие варианты показывать, когда прятать и что пояснить.
// Новый режим добавляется записью в MODES и списком в OPTS.
import {range} from './core/shared.js';
import {seqUnfit} from './core/seq.js';
import {ALL as SHAPES_ALL,TASKS as SHAPES_TASKS,feasible} from './core/shapes.js';

const MODES=[['addsub','m.addsub'],['mul','m.mul'],['div','m.div'],['comp','m.comp'],
  ['place','m.place'],['seq','m.seq'],['clock','m.clock'],['roman','m.roman'],['shapes','m.shapes']];
const BLANK_OTHER_MUL=[['result','c.result'],['other','c.factor'],['any','c.anyNum']];
const BLANK_OTHER_DIV=[['result','c.result'],['other','c.divOther'],['any','c.anyNum']];
const RANGES=[10,20,30,40,50,100];
const LIMITS=[30,40,50,100];
const TABLES_OPT={key:'tables',label:'o.tables',multi:true,list:[2,3,4,5,6,7,8,9],presets:[['c.all_t',[2,3,4,5,6,7,8,9]]]};
const NUMS_OPT={key:'numbers',label:'o.numbers',multi:true,list:range(2,20),
  presets:[['c.upto10',range(2,10)],['11–20',range(11,20)],['c.all_n',range(2,20)]]};
const LIMIT_CHOICES=[[30,'30'],[40,'40'],[50,'50'],[100,'c.allTo100']];
const OPTS={
  addsub:[
    {key:'range',label:'o.range',choices:RANGES.map(r=>[r,String(r)])},
    {key:'ops',label:'o.ops',choices:[['plus','c.plus'],['minus','c.minus'],['both','c.both']]},
    {key:'actions',label:'o.actions',choices:[['one','c.act1'],['two','c.act2'],['mix','c.mix']]},
    {key:'unknown',label:'o.unknown',choices:[[1,'c.n1'],[2,'c.n2'],['mix','c.mix']],
      note:c=>(c.unknown===2||c.unknown==='mix')?'n.unknown2':''},
    {key:'carry',label:'o.carry',choices:[['any','c.carryAny'],['none','c.carryNone'],['only','c.carryOnly']],needs:c=>c.range>=20,hint:'n.carry10'},
    {key:'blank',label:'o.blank',choices:[['operand','c.operand'],['result','c.result'],['any','c.anyNum']]}
  ],
  mul:[TABLES_OPT,{key:'limit',label:'o.limitx',choices:LIMIT_CHOICES},{key:'blank',label:'o.blank',choices:BLANK_OTHER_MUL}],
  div:[TABLES_OPT,{key:'limit',label:'o.limitx',choices:LIMIT_CHOICES},{key:'blank',label:'o.blank',choices:BLANK_OTHER_DIV}],
  comp:[
    NUMS_OPT,
    {key:'view',label:'o.view',choices:[['bond','c.bond'],['eq','c.eq'],['mix','c.mix']]},
    {key:'blank',label:'o.blank',choices:[['other','c.compPart'],['result','c.compWhole'],['any','c.anyOne']]}
  ],
  seq:[
    {key:'kind',label:'o.kind',choices:[['add','c.kindAdd'],['mul','c.kindMul'],['div','c.kindDiv'],['mix','c.mix']]},
    {key:'steps',label:'o.steps',multi:true,list:range(2,10),presets:[['c.all_n',range(2,10)]],show:c=>c.kind==='add'||c.kind==='mix'},
    {key:'factors',label:'o.factors',multi:true,list:[2,3,4,5,10],presets:[['c.all_n',[2,3,4,5,10]]],show:c=>c.kind!=='add'},
    {key:'limit',label:'o.range',choices:[[20,'20'],[50,'50'],[100,'100']],
      note:c=>seqUnfit(c)?'n.unfit':''},
    {key:'dir',label:'o.dir',choices:[['up','c.up'],['down','c.down'],['mix','c.mix']],show:c=>c.kind==='add'||c.kind==='mix'},
    {key:'start',label:'o.start',choices:[['zero','c.zero'],['any','c.anyStart']],show:c=>c.kind==='add'||c.kind==='mix'},
    {key:'blank',label:'o.blank',choices:[['last','c.last'],['any','c.anyInSeq']]},
    {key:'gaps',label:'o.gaps',choices:[[1,'c.g1'],[2,'c.g2'],['mix','c.mix']],
      note:c=>(c.gaps!==1&&c.blank==='last')?'n.gapsLast':''},
    {key:'hint',label:'o.hint',choices:[['show','c.show'],['hide','c.hide']]}
  ],
  place:[
    {key:'digits',label:'o.digits',choices:[[2,'c.d2'],[3,'c.d3'],['mix','c.mix']]},
    {key:'view',label:'o.view',choices:[['sum','c.sum'],['units','c.units'],['mix','c.mix']]},
    {key:'blank',label:'o.blank',choices:[['part','c.placePart'],['whole','c.placeWhole'],['any','c.anyOne']]}
  ],
  clock:[
    {key:'step',label:'o.step',choices:[[60,'c.step60'],[30,'c.step30'],[15,'c.step15'],[5,'c.step5'],[1,'c.step1']]},
    {key:'numerals',label:'o.numerals',choices:[['arabic','c.numArabic'],['roman','c.numRoman'],['ticks','c.numTicks']],
      note:c=>c.numerals==='ticks'?'n.ticks':''}
  ],
  roman:[
    {key:'limit',label:'o.range',choices:[[12,'c.to12'],[20,'20'],[50,'50'],[100,'100']]}
  ],
  shapes:[
    {key:'tasks',label:'o.tasks',multi:true,list:SHAPES_TASKS,
      labels:{name:'c.taskName',odd:'c.taskOdd',corners:'c.taskCorners',perim:'c.taskPerim',area:'c.taskArea'},
      presets:[['c.all_n',SHAPES_TASKS]],
      note:c=>c.tasks.some(x=>!feasible(x,c.figs))?'n.shapeSkip'
        :c.tasks.some(x=>x==='perim'||x==='area')?'n.measure':''},
    {key:'figs',label:'o.figs',multi:true,list:SHAPES_ALL,
      labels:{circle:'f.circle',triangle:'f.triangle',square:'f.square',rect:'f.rect',pentagon:'f.pentagon',hexagon:'f.hexagon'},
      presets:[['c.all_n',SHAPES_ALL]]}
  ]
};
// global:true — настройка живёт в S, а не в конфиге раздела
const COUNT_OPT={key:'count',label:'o.count',global:true,choices:[[10,'10'],[15,'15'],[20,'20']]};
// Цель на день общая для всех разделов, как и число примеров за раз
const GOAL_OPT={key:'goal',label:'o.goal',global:true,choices:[[10,'10'],[20,'20'],[30,'30']]};

export {MODES,RANGES,LIMITS,OPTS,COUNT_OPT,GOAL_OPT};
