export const topics=['range() & iterations','Running totals','Boundary errors'];
export function trace(start,stop,initial=0){
 if(![start,stop,initial].every(Number.isSafeInteger)||Math.abs(stop-start)>100)throw new Error('Unsupported loop bounds');
 const rows=[];let total=initial;
 for(let i=start;i<stop;i++){const before=total;total+=i;rows.push({iteration:rows.length+1,i,before,total});}
 return rows;
}
const choice=(label,options,answer,feedback,hints={})=>({type:'choice',label,options,answer,feedback,hints});
const number=(label,answer,feedback,hint)=>({type:'number',label,answer,feedback,hint});
function rangeQ(id,start,stop,choices){const vals=trace(start,stop).map(r=>r.i),n=vals.length;return{id,topic:0,title:'Read the range',code:`for i in range(${start}, ${stop}):\n    print(i)`,prompt:'Which values will print, and how many times will the loop body run?',parts:[
 choice('Values printed, in order',choices,0,`range(${start}, ${stop}) includes ${start} and stops before ${stop}: ${vals.join(', ')}.`,{1:`Your list ends with ${stop}. Check whether range() ever gives the loop its stop value.`,2:`Your list starts at 0. When range() is given two numbers, where does it begin?`}),
 number('Number of iterations',n,`There are ${n} values, so the body runs ${n} times.`,v=>v===n+1?`That count includes ${stop}. Count only the values range() actually hands to the loop.`:'Each value range() supplies is one trip through the loop body. Count the values you expect i to take.')]};}
function totalQ(id,start,stop,initial){const rows=trace(start,stop,initial),final=rows.at(-1).total,sum=final-initial,last=rows.at(-1).i;return{id,topic:1,title:'Follow the running total',code:`total = ${initial}\nfor i in range(${start}, ${stop}):\n    total = total + i\nprint(total)`,prompt:'Find the final total and choose the reasoning that explains it.',parts:[
 number('Final value of total',final,`Start at ${initial}, then add ${rows.map(r=>r.i).join(' + ')}. The final total is ${final}.`,v=>v===sum?`Did you count where total starts? It is ${initial} before the first iteration, not 0.`:v===initial+last||v===last?'That looks like only one value of i was added. Which line runs on every iteration?':v===final+stop?`Check the last value of i. Does range(${start}, ${stop}) ever give i the value ${stop}?`:'Build a small trace: for each iteration write previous total + i = new total, the way the worked example did.'),
 choice('Why does this happen?',['The total starts over at zero each iteration.','Each value of i is added to the total left by the previous iteration.','Only the last value of i is added.'],1,'Assignment keeps the updated total for the next iteration; it does not reset inside this loop.',{0:`Look at where total = ${initial} sits. Is that line inside the loop or before it?`,2:'The addition line is indented under the for line. How many times does an indented line run?'})]};}
function boundaryQ(id,start,last){return{id,topic:2,title:'Repair the boundary',code:`for i in range(${start}, ${last}):\n    print(i)`,prompt:`The goal is to print every integer from ${start} through ${last}, including ${last}. Choose the corrected line and explain it.`,parts:[
 choice('Corrected loop line',[`for i in range(${start}, ${last+1}):`,`for i in range(${start}, ${last}):`,`for i in range(${start+1}, ${last+1}):`],0,`range(${start}, ${last+1}) keeps the start and includes ${last} because the stop value is excluded.`,{1:`That is the original line. Trace it: what is the last value it prints?`,2:`Trace that line: does it still print ${start}?`}),
 choice('Why does the correction work?',['Python includes both endpoints of range().','The stop value is excluded, so it must be one beyond the last wanted value.','Increasing the start adds an extra iteration.'],1,'The stop is exclusive. Changing the start would skip the first wanted value.',{0:`If both endpoints were included, would the original loop have needed a fix?`,2:'Moving the start later removes a value from the beginning. Does that add the missing last value?'})]};}
export const banks={baseline:[rangeQ('b-range',1,5,['1, 2, 3, 4','1, 2, 3, 4, 5','0, 1, 2, 3, 4']),totalQ('b-total',1,4,2),boundaryQ('b-boundary',2,5)],practice:[rangeQ('p-range',3,7,['3, 4, 5, 6','3, 4, 5, 6, 7','0, 1, 2, 3, 4, 5, 6']),totalQ('p-total',2,5,1),boundaryQ('p-boundary',3,6)],final:[rangeQ('f-range',2,6,['2, 3, 4, 5','2, 3, 4, 5, 6','0, 1, 2, 3, 4, 5']),totalQ('f-total',2,5,2),boundaryQ('f-boundary',4,7)]};
// A fresh, same-structure question shown after a wrong first practice attempt. Not part of the nine counted questions.
export const retryPractice=[rangeQ('p2-range',5,9,['5, 6, 7, 8','5, 6, 7, 8, 9','0, 1, 2, 3, 4, 5, 6, 7, 8']),totalQ('p2-total',3,6,4),boundaryQ('p2-boundary',5,8)];
export const practiceItems=i=>[banks.practice[i],retryPractice[i]];
// Misconception hint for a wrong part, without revealing the answer.
export function hintFor(part,value){if(part.type==='number')return part.hint(Number(value));return part.hints[Number(value)]||'Compare your choice with the trace in the worked example.';}
// Deterministic option order per question part, so the correct choice is not always first.
export function optionOrder(key,n){let h=2166136261;for(const c of key)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;const o=[...Array(n).keys()];for(let i=n-1;i>0;i--){h=Math.imul(h,1103515245)+12345>>>0;const j=h%(i+1);[o[i],o[j]]=[o[j],o[i]];}return o;}
export const lessons=[
 {title:'A range has a rhythm.',subtitle:'Start here. Stop just before there.',text:'range(start, stop) supplies one integer at a time. The start is included; the stop is excluded. With range(stop), the start defaults to 0. Each supplied value produces one iteration.',start:0,stop:4,initial:0,kind:'range',note:'Watch i take each value from 0 through 3. The value 4 never enters the loop.'},
 {title:'Small steps. A growing total.',subtitle:'The previous value comes along.',text:'An accumulator remembers work from earlier iterations. Python evaluates the right side of total = total + i first, then stores the result in total. Initialize total before the loop so it does not reset each time.',start:1,stop:5,initial:0,kind:'total',note:'Read across each trace row: previous total + current i = updated total.'},
 {title:'Find the missing last step.',subtitle:'A tiny boundary. A different result.',text:'To include a final integer, set the stop to one greater than that integer. To print 1 through 4, range(1, 4) stops too early. The repair is range(1, 5). Compare the two traces below.',start:1,stop:4,initial:0,kind:'boundary',note:'The original loop misses 4. Switch to the corrected loop and trace it to see the extra iteration.'}
];
export function scoreQuestion(q,response){return q.parts.map((p,i)=>{const v=response?.[i];return v!==''&&v!==undefined&&v!==null&&Number(v)===p.answer?1:0;});}
export function scoreStage(stage,responses){return banks[stage].map(q=>scoreQuestion(q,responses[q.id]).reduce((a,b)=>a+b,0));}
export function stats(values){if(!values.length)return null;const a=[...values].sort((x,y)=>x-y);return{mean:values.reduce((a,b)=>a+b,0)/a.length,median:a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2,min:a[0],max:a.at(-1)};}
export function newSession(){return{version:1,id:createSessionId(),startedAt:new Date().toISOString(),completedAt:null,activeSeconds:0,phase:'diagnostic',diagnostic:null,baseline:{},final:{},baselineDone:false,finalDone:false,lesson:0,worked:[false,false,false],practice:[[],[],[]],feedback:null};}
export function validateSession(s){return s?.version===1&&typeof s.id==='string'&&s.id.length<100&&typeof s.startedAt==='string'&&Number.isFinite(s.activeSeconds)&&s.activeSeconds>=0&&Array.isArray(s.practice)&&s.practice.length===3&&s.practice.every(a=>Array.isArray(a)&&a.length<1000)&&s.baseline&&s.final&&typeof s.baselineDone==='boolean'&&typeof s.finalDone==='boolean'&&Array.isArray(s.worked)&&s.worked.length===3&&['diagnostic','baseline','lessons','final','results'].includes(s.phase)&&Number.isInteger(s.lesson)&&s.lesson>=0&&s.lesson<3;}

// Local-network HTTP may not expose randomUUID; random bytes remain available.
function createSessionId(){
 if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
 const bytes=crypto.getRandomValues(new Uint8Array(16));
 bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

// End-of-session feedback dropdowns. Every question is optional ('' = prefer not to answer).
const scale=(low,high)=>[['1',`1 — ${low}`],['2','2'],['3','3 — Neutral'],['4','4'],['5',`5 — ${high}`]];
export const feedbackQuestions=[
 {id:'clarity',label:'How clear were the explanations?',options:scale('Very unclear','Very clear')},
 {id:'navigation',label:'How easy was it to find your way through the lab?',options:scale('Very hard','Very easy')},
 {id:'trace',label:'How helpful were the step-by-step examples?',options:scale('Not helpful','Very helpful')},
 {id:'hints',label:'How helpful were the hints after a wrong practice answer?',options:[...scale('Not helpful','Very helpful'),['none','I never got a hint']]},
 {id:'pace',label:'How was the pace?',options:[['Too slow','Too slow'],['About right','About right'],['Too fast','Too fast']]},
 {id:'difficulty',label:'How hard were the questions?',options:[['Too easy','Too easy'],['About right','About right'],['Too hard','Too hard']]},
 {id:'confusing',label:'Which topic was most confusing?',options:[['range()','range() & iterations'],['Running totals','Running totals'],['Boundary errors','Boundary errors'],['Nothing','Nothing was confusing']]},
 {id:'device',label:'What did you use?',options:[['Laptop/desktop','Laptop or desktop'],['Tablet','Tablet'],['Phone','Phone']]}
];
// Normalized answers for sending/exports: 1–5 scales become numbers, unanswered become null.
export function feedbackAnswers(f={}){const out={};for(const q of feedbackQuestions){const v=f?.[q.id];out[q.id]=!v||!q.options.some(o=>o[0]===String(v))?null:/^[1-5]$/.test(v)?Number(v):v==='none'?'No hint seen':String(v);}return out;}
