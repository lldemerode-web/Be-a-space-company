'use strict';
const KEY='nasa-keep-alive-v1',JOBS=['Astronaut','Media Relations','Presidential Relations','Engineer','Expert'];
const MISSIONS=[['Sounding Rocket',2,1,1,5,.5,2],['Communications Satellite',4,2,1,10,1,3],['Crewed Orbital Flight',6,3,2,10,1.5,5],['Moon Orbiter',8,3,2,15,2,5],['Space Telescope',10,3,3,15,2.5,8],['Robotic Moon Landing',12,4,3,20,3,10],['Mars Rover',15,4,3,20,3,12],['Crewed Moon Landing',20,5,4,25,4,15],['Europa Probe',22,5,4,25,4,18],['Crewed Mars Mission',30,7,5,30,5,25]].map(([name,cost,fuel,years,happy,funding,cash])=>({name,cost,fuel,years,happy,funding,cash}));
const CARDS=[
['Sensitive Talk',1,2,'Happiness +5%; free with Media Relations','happy'],['Explain About Space',2,5,'Happiness +5%; free with Expert','happy'],['Donation Stands',3,10,'Funding +1%','fund'],['Fuel Price Drop',3,0,'Fuel price −0.5 MD/MG','drop'],['Science Breakthrough',2,2,'Gain 0.5 MG with Expert, otherwise 0.25 MG','science'],['Presidential Call',5,0,'Funding +1% with Presidential Relations, otherwise +0.5%','pres'],['1 on 1 With Worker',4,0,'Requires an employee; draw one card','worker'],['Lead Protests',1,4,'Happiness +5%, funding −0.5%','protest'],['Demonstrating Rocket',4,6,'Happiness +15%, funding −0.5%; uses 1 MG','demo'],['Recruitment',2,12,'Hire one employee of your choice','recruit'],['Take Out O₂',5,5,'Happiness −5%, gain 1 MG','oxygen'],['Orbital Research',2,10,'Mark orbital research ready','orbital'],['Protests for Higher Priced Fuel',5,0,'Fuel price +0.5 MD/MG; happiness +15%','fuelprotest']].map(([name,copies,cost,description,type])=>({name,copies,cost,description,type}));
const el=id=>document.getElementById(id), money=n=>`${Number(n.toFixed(2))} MD`,fuel=n=>`${Number(n.toFixed(2))} MG`,esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function newState(){const deck=CARDS.flatMap((c,i)=>Array(c.copies).fill(i));shuffle(deck);return {year:1,cash:7,fuel:0,fuelPrice:1.5,happiness:50,funding:1,happinessAtYearStart:50,launches:0,employees:Object.fromEntries(JOBS.map(j=>[j,0])),deck,discard:[],hand:[deck.pop()],missions:[],phase:'card',drew:false,played:false,over:'',orbitalReady:false,orbitalLaunchesUsed:0,log:[{year:1,text:'Mission Control begins operations.'}]};}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}
let s;try{s=JSON.parse(localStorage.getItem(KEY));if(!s||!Array.isArray(s.hand))throw Error();}catch{s=newState();}
// Existing saved games: preserve progress and initialize the new research counter.
if(typeof s.orbitalLaunchesUsed!=='number')s.orbitalLaunchesUsed=0;
if(typeof s.orbitalReady!=='boolean')s.orbitalReady=false;
if(typeof s.happinessAtYearStart!=='number')s.happinessAtYearStart=s.happiness;
function note(t){s.log.unshift({year:s.year,text:t});s.log=s.log.slice(0,60);}
function round(n){return Math.round(n*100)/100;}
function happy(v){s.happiness=Math.max(0,Math.min(100,s.happiness+v));}
function fund(p){s.funding=Math.max(0,round(s.funding+p*2));}
function draw(n){let got=0;while(n--){if(!s.deck.length){if(!s.discard.length)break;s.deck=s.discard.splice(0);shuffle(s.deck);}s.hand.push(s.deck.pop());got++;}return got;}
function check(){if(s.happiness<=10){s.over='lose';note('Mission Control shuts down: happiness fell to 10% or below.');}else if(s.launches>=6&&s.happiness>=90){s.over='win';note('Victory: 6 launches and 90% or more happiness!');}}
function commit(){check();localStorage.setItem(KEY,JSON.stringify(s));render();}
function failureChance(m){return Math.max(0,m.fuel*2-(s.employees.Engineer>0?5:0));}
function cardCost(c){return (c.type==='happy'&&((c.name==='Sensitive Talk'&&s.employees['Media Relations'])||(c.name==='Explain About Space'&&s.employees.Expert)))?0:c.cost;}
function play(i){if(s.phase!=='card'||s.played||s.over)return;const c=CARDS[s.hand[i]];if(!c)return;const cost=cardCost(c);if(s.cash<cost||(c.type==='demo'&&s.fuel<1)||(c.type==='worker'&&!JOBS.some(j=>s.employees[j])))return;
const job=c.type==='recruit'?el('hireJob')?.value:null;if(job&&!JOBS.includes(job))return;
s.cash=round(s.cash-cost);if(c.type==='demo')s.fuel=round(s.fuel-1);
s.hand.splice(i,1);s.discard.push(CARDS.indexOf(c));s.played=true;
switch(c.type){case 'happy':happy(5);break;case 'fund':fund(1);break;case 'drop':s.fuelPrice=Math.max(.25,round(s.fuelPrice-.5));break;case 'science':s.fuel=round(s.fuel+(s.employees.Expert?.5:.25));break;case 'pres':fund(s.employees['Presidential Relations']?1:.5);break;case 'worker':draw(1);break;case 'protest':happy(5);fund(-.5);break;case 'demo':happy(15);fund(-.5);break;case 'recruit':s.employees[job]++;break;case 'oxygen':happy(-5);s.fuel=round(s.fuel+1);break;case 'orbital':s.orbitalReady=true;s.orbitalLaunchesUsed=0;break;case 'fuelprotest':happy(15);s.fuelPrice=round(s.fuelPrice+.5);break;}
note(`Played ${c.name}${job?' — hired '+job:''}.`);commit();}
// Sell a card for 1 MD during the card phase. Selling does not count as playing a card or taking an action.
function sellCard(i){
  if(s.over||!Number.isInteger(i)||i<0||i>=s.hand.length)return;
  const id=s.hand.splice(i,1)[0];
  const c=CARDS[id];
  s.discard.push(id);
  s.cash=round(s.cash+1);
  note(`Sold ${c.name} for 1 MD.`);
  commit();
}
// Alternative to playing the 10 MD Orbital Research card: purchase research directly for 20 MD.
function buyOrbitalResearch(){
  if(s.over||s.orbitalReady)return;
  if(s.cash<20){alert('You need 20 MD to purchase Orbital Research.');return;}
  s.cash=round(s.cash-20);
  s.orbitalReady=true;
  s.orbitalLaunchesUsed=0;
  note('Purchased Orbital Research for 20 MD. Next two launches unlocked.');
  commit();
}
function finish(){const completed=[];for(const m of s.missions){if(m.started<s.year)m.remaining--;if(m.remaining<=0)completed.push(m);}s.missions=s.missions.filter(m=>m.remaining>0);
for(const m of completed){const x=MISSIONS[m.id];const risk=failureChance(x);if(Math.random()*100<risk){note(`❌ ${x.name} FAILED (${risk}% failure risk). No launch rewards or successful launch credit.`);continue;}s.launches++;happy(x.happy);fund(x.funding);s.cash=round(s.cash+x.cash);note(`✅ ${x.name} succeeded! +${x.happy}% happiness, +${x.funding}% funding, +${money(x.cash)}, +1 launch.`);}
if(s.happiness<=s.happinessAtYearStart){happy(-5);note('Happiness did not rise this year: −5% happiness.');}
check();if(s.over)return;s.year++;s.happinessAtYearStart=s.happiness;s.cash=round(s.cash+s.funding);s.phase='card';s.drew=false;s.played=false;note(`Year ${s.year}: received ${money(s.funding)} funding.`);}
function act(type,id){if(s.phase!=='action'||s.over)return;if(type==='money'){s.cash=round(s.cash+3);note('Action: gain 3 MD.');}
else if(type==='cards'){note(`Action: drew ${draw(2)} cards.`);}
else if(type==='fuel'){const n=Number(el('buyAmount').value);if(!Number.isFinite(n)||n<=0||Math.abs(n*4-Math.round(n*4))>1e-8){alert('Enter fuel in increments of 0.25 MG.');return;}const cost=round(n*s.fuelPrice);if(cost>s.cash){alert('Not enough money.');return;}s.cash=round(s.cash-cost);s.fuel=round(s.fuel+n);note(`Bought ${fuel(n)} for ${money(cost)}.`);}
else if(type==='launch'){if(!s.orbitalReady){alert('Orbital Research required! Play an Orbital Research card (10 MD) or buy it directly (20 MD) before launching.');return;}const m=MISSIONS[id];const cost=Math.max(0,m.cost-(s.employees.Astronaut?1:0));if(s.cash<cost||s.fuel<m.fuel)return;s.cash=round(s.cash-cost);s.fuel=round(s.fuel-m.fuel);s.missions.push({id,remaining:m.years,started:s.year});s.orbitalLaunchesUsed++;if(s.orbitalLaunchesUsed>=2){s.orbitalReady=false;s.orbitalLaunchesUsed=0;note('Orbital Research expired after two launches. Play another Orbital Research card to launch again.');}note(`Started ${m.name} for ${money(cost)} and ${fuel(m.fuel)}.`);}
finish();commit();}
function render(){el('yearBadge').textContent=`YEAR ${s.year}`;el('cashStat').textContent=money(s.cash);el('fundStat').textContent=money(s.funding)+'/year';el('fundPercent').textContent='# track: '+(s.funding/2)+'%';el('happyStat').textContent=s.happiness+'%';el('happyBar').style.width=s.happiness+'%';el('fuelStat').textContent=fuel(s.fuel);el('priceStat').textContent=money(s.fuelPrice)+'/MG';el('launchStat').textContent=s.launches+'/6';el('orbitalStatus').textContent=s.orbitalReady?'YES':'NO';el('orbitalStatus').className=s.orbitalReady?'orbital-yes':'orbital-no';el('orbitalSwitch').setAttribute('aria-checked',String(!!s.orbitalReady));el('orbitalSwitch').classList.toggle('is-on',!!s.orbitalReady);el('launchObjective').textContent=`${s.launches>=6?'✓':'○'} Launches ${s.launches}/6`;el('happyObjective').textContent=`${s.happiness>=90?'✓':'○'} Happiness ${s.happiness}% / 90%`;
el('outcome').classList.toggle('hidden',!s.over);el('outcome').innerHTML=s.over==='win'?'<h2>🏆 You saved Mission Control!</h2><p>Six successful launches and at least 90% happiness.</p>':s.over==='lose'?'<h2>Mission Control has shut down</h2><p>Happiness reached 10% or lower.</p>':'';
el('phaseTitle').textContent=s.over?'Game finished':s.phase==='card'?'Card phase':'Choose one action';el('phasePill').textContent=s.over?'FINISHED':s.phase==='card'?'STEP 1 OF 2':'STEP 2 OF 2';el('phaseHelp').textContent=s.over?'Start a new game to play again.':s.phase==='card'?'Optionally draw 1 card, play up to 1 card, or sell cards for 1 MD each, then continue.':'Choose one action. You can still sell cards for 1 MD. Missions advance at year end.';
el('phaseContent').innerHTML=s.over?'<p class="empty">Game complete.</p>':s.phase==='card'?`<div class="actions"><button id="drawOne" ${s.drew?'disabled':''}>Draw 1 card</button><button class="primary" id="continue">Continue to action →</button></div><p class="subtle">Card played: ${s.played?'Yes':'No'}</p>`:`<div class="optionGrid"><button class="option" id="showLaunch"><b>🚀 Start a launch</b><small>Choose a mission</small></button><button class="option" id="getMoney"><b>💵 Gain 3 MD</b></button><button class="option" id="getCards"><b>🃏 Draw 2 cards</b></button><button class="option" id="showFuel"><b>⛽ Buy fuel</b></button></div><div id="actionDetail"></div>`;
if(!s.over){if(s.phase==='card'){el('drawOne').onclick=()=>{if(!s.drew){s.drew=true;note(`Drew ${draw(1)} card.`);commit();}};el('continue').onclick=()=>{s.phase='action';commit();};}else{el('showLaunch').onclick=showLaunches;el('showFuel').onclick=showFuel;el('getMoney').onclick=()=>act('money');el('getCards').onclick=()=>act('cards');}}
el('missions').innerHTML=s.missions.length?s.missions.map(m=>`<div class="row"><div><b>${esc(MISSIONS[m.id].name)}</b><small>Started year ${m.started}</small></div><strong>${m.remaining} year(s) left · ${failureChance(MISSIONS[m.id])}% failure risk</strong></div>`).join(''):'<p class="empty">No missions underway.</p>';
el('employees').innerHTML=JOBS.map((j,i)=>`<div class="row"><div><b>${j}</b><small>${['1 MD discount on launch costs (provisional)','Sensitive Talk is free','Improves Presidential Call','Reduces rocket failure chance by 5 percentage points','Explain About Space is free; improves Science Breakthrough'][i]}</small></div><strong>×${s.employees[j]}</strong></div>`).join('');
// Show direct purchase beside the existing Orbital Research status, without editing index.html.
const researchSwitch=el('orbitalSwitch');
let purchaseButton=el('buyOrbitalResearch');
if(!purchaseButton){
  purchaseButton=document.createElement('button');
  purchaseButton.id='buyOrbitalResearch';
  purchaseButton.type='button';
  purchaseButton.className='small';
  researchSwitch.insertAdjacentElement('afterend',purchaseButton);
}
purchaseButton.textContent=s.orbitalReady?'Orbital Research active':'Buy Orbital Research — 20 MD';
purchaseButton.disabled=!!s.over||s.orbitalReady||s.cash<20;
purchaseButton.title=s.orbitalReady?'Already active for up to two launches':s.cash<20?'Requires 20 MD':'Unlock two launches without using a card';
purchaseButton.onclick=buyOrbitalResearch;
el('handCount').textContent=`(${s.hand.length})`;el('hand').innerHTML=s.hand.length?s.hand.map((id,i)=>{const c=CARDS[id],cost=cardCost(c),can=s.phase==='card'&&!s.played&&!s.over&&s.cash>=cost&&(c.type!=='demo'||s.fuel>=1)&&(c.type!=='worker'||JOBS.some(j=>s.employees[j]));return `<div class="card"><h3>${esc(c.name)}</h3><div class="meta">${esc(c.description)}</div><p>Cost: <b>${money(cost)}</b>${c.type==='demo'?' + 1 MG':''}</p>${c.type==='recruit'&&can?`<label>Hire: <select id="hireJob">${JOBS.map(j=>`<option>${j}</option>`).join('')}</select></label>`:''}<div class="actions"><button class="small" data-play="${i}" ${can?'':'disabled'}>Play card</button><button type="button" class="small" data-sell="${i}" ${!s.over?'':'disabled'}>Sell for 1 MD</button></div></div>`;}).join(''):'<p class="empty">No cards in hand.</p>';document.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>play(+b.dataset.play));el('log').innerHTML=s.log.slice(0,18).map(x=>`<div class="logItem"><b>Year ${x.year}</b> · ${esc(x.text)}</div>`).join('');}
function showFuel(){const max=Math.floor((s.cash/s.fuelPrice)*4)/4;el('actionDetail').innerHTML=`<div class="card"><h3>Buy fuel</h3><p>Price: ${money(s.fuelPrice)} per MG. Affordable: up to ${fuel(max)}.</p><div class="inline"><input id="buyAmount" type="number" step="0.25" min="0.25" value="${Math.min(1,max)}"><button class="primary" id="buyFuel">Buy and end year</button></div></div>`;el('buyFuel').onclick=()=>act('fuel');}
function showLaunches(){if(!s.orbitalReady){el('actionDetail').innerHTML='<div class="card"><h3>🔒 Orbital Research required</h3><p>Play an Orbital Research card for 10 MD or buy research directly for 20 MD to unlock your next two launches. Your research status is currently NO.</p></div>';return;}el('actionDetail').innerHTML=`<div class="card"><h3>Choose a launch</h3><p class="subtle">You can have multiple missions underway. Costs are paid now; rewards arrive when completed.</p>${MISSIONS.map((m,i)=>{const cost=Math.max(0,m.cost-(s.employees.Astronaut?1:0));return `<div class="row"><div><b>${m.name}</b><small>Cost ${money(cost)} + ${fuel(m.fuel)} · ${m.years} year(s)<br>Failure risk ${failureChance(m)}% · Reward if successful: +${m.happy}% happiness, +${m.funding}% #, +${money(m.cash)}, +1 launch</small></div><button class="small" data-launch="${i}" ${s.orbitalReady&&s.cash>=cost&&s.fuel>=m.fuel?'':'disabled'}>Launch</button></div>`;}).join('')}</div>`;document.querySelectorAll('[data-launch]').forEach(b=>b.onclick=()=>act('launch',+b.dataset.launch));}
document.addEventListener('click',event=>{const btn=event.target.closest('button[data-sell]');if(!btn)return;event.preventDefault();event.stopPropagation();sellCard(Number(btn.dataset.sell));});
el('rulesBtn').onclick=()=>el('rulesDialog').showModal();el('closeRules').onclick=()=>el('rulesDialog').close();el('resetBtn').onclick=()=>{if(confirm('Start a new game? Saved progress will be erased.')){s=newState();commit();}};commit();
