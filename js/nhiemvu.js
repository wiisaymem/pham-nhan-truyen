'use strict';
// ───────────────────────── Nhiệm vụ hằng ngày + quà đăng nhập 7 ngày
const DQ_POOL={
  kill:{t:'Trảm {0} yêu quái',n:[800,1500,2500]},
  time:{t:'Trụ {0} phút trong một trận',n:[5,8,12]},
  boss:{t:'Trảm {0} boss',n:[1,2]},
  pz:{t:'Giải {0} cơ quan bí ẩn',n:[1,2]},
  ult:{t:'Dùng đại chiêu {0} lần',n:[5,10]},
  bc:{t:'Vào Bí cảnh {0} lần',n:[1,2]},
  rx:{t:'Kích hoạt tương sinh {0} lần',n:[30,80]},
  chest:{t:'Nhặt {0} bảo rương trong trận',n:[2,4]},
  tower:{t:'Vượt {0} tầng Thông Thiên Tháp',n:[1,2]},
};
for(const k in DQ_POOL)DQ_POOL[k].t=i18n('nv.'+k,DQ_POOL[k].t);
const dqDay=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function dqSave(){const S=SAVE.dq||(SAVE.dq={day:'',q:[],streak:0,lastLogin:'',loginGot:0,bonus:0});const day=dqDay();
  if(S.day!==day){S.day=day;const keys=Object.keys(DQ_POOL).sort(()=>Math.random()-.5).slice(0,3),A=(typeof aiSave==='function'?aiSave().best:0)|0;
    S.q=keys.map(k=>{const L=DQ_POOL[k].n,i=Math.min(L.length-1,Math.floor(Math.random()*L.length));return{k,need:L[i],prog:0,got:0,lt:Math.round((60+i*40)*(1+A*0.15))}});S.bonus=0;
    const y=new Date(Date.now()-864e5),yd=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
    if(S.lastLogin!==day){S.streak=S.lastLogin===yd?(S.streak%7)+1:1;S.loginGot=0;S.lastLogin=day}
    saveSave()}
  return S}
const loginLt=n=>n===7?0:20+n*15;
function dqClaimable(){const S=dqSave();return !S.loginGot||S.q.some(q=>q.prog>=q.need&&!q.got)||(S.q.every(q=>q.got)&&!S.bonus)}
function dqAdd(k,v){if(!v)return;const S=dqSave();for(const q of S.q)if(q.k===k&&!q.got)q.prog=k==='time'?Math.max(q.prog,v):q.prog+v}
// cộng tiến độ khi kết thúc trận
const _erDQ=endRun;
endRun=function(win){const was=G&&G.over;_erDQ(win);if(was||!G)return;
  if(G.tower){if(win)dqAdd('tower',1)}
  else{dqAdd('kill',G.kills);dqAdd('time',Math.floor(Math.min(G.t,RUN_T)/60));dqAdd('boss',G.bossKills|0);
    dqAdd('pz',(G.pz||[]).filter(M=>M.solved).length);dqAdd('bc',(G.pz||[]).filter(M=>M.done).length);dqAdd('ult',G.ultN|0);
    dqAdd('rx',Object.values(G.rx||{}).reduce((a,b)=>a+b,0));dqAdd('chest',G.chestN|0)}
  saveSave()};
const _ubDQ=useBurst;useBurst=function(){const r=_ubDQ();if(r&&G)G.ultN=(G.ultN||0)+1;return r};
// màn hình
function buildDQ(){const S=dqSave();$('dqSub').textContent=i18n('nv.phu','Làm mới mỗi ngày. Hoàn thành cả ba để nhận thêm bảo hạp.');
  const L=$('dqLogin');L.innerHTML='';for(let d=1;d<=7;d++){const got=d<S.streak||(d===S.streak&&S.loginGot),today=d===S.streak;
    const el=elx('div',(got?'got ':'')+(today?'today':''),`${i18nf('nv.ngay','Ngày {0}',d)}<b>${d===7?'🎁':'+'+loginLt(d)}</b>`);if(today&&!S.loginGot){el.style.cursor='pointer';el.onclick=()=>{dqLogin();buildDQ()}}L.appendChild(el)}
  const Q=$('dqList');Q.innerHTML='';
  if(!S.loginGot){const b=elx('button','btn',i18nf('nv.diemdanh','Điểm danh ngày {0}',S.streak));b.onclick=()=>{dqLogin();buildDQ()};Q.appendChild(b)}
  for(const q of S.q){const done=q.prog>=q.need,r=elx('div','dqrow'+(q.got?' claimed':done?' done':''),`<div><b>${i18nf('nv.'+q.k,DQ_POOL[q.k].t,q.need)}</b><small>${Math.min(q.prog,q.need)}/${q.need} · +${q.lt} ◈ · +3 ${i18n('mat.thao','Linh Thảo')}</small><div class="dqbar"><i style="width:${Math.min(100,q.prog/q.need*100)}%"></i></div></div>`);
    const b=elx('button','btn',q.got?i18n('nv.danhan','Đã nhận'):i18n('nv.nhan','Nhận'));b.disabled=!done||q.got;b.onclick=()=>{q.got=1;SAVE.lt+=q.lt;if(typeof matAdd==='function')matAdd('thao',3);saveSave();sfx('coin');toast(i18nf('nv.nhanlt2','+{0} linh thạch, +3 Linh Thảo',q.lt));buildDQ()};r.appendChild(b);Q.appendChild(r)}
  {const all=S.q.every(q=>q.got),r=elx('div','dqrow'+(S.bonus?' claimed':all?' done':''),`<div><b>${i18n('nv.thuong','Hoàn thành cả ba nhiệm vụ')}</b><small>${i18n('nv.thuongd2','Bảo hạp: một pháp bảo ngẫu nhiên và 3 Tinh Thiết')}</small></div>`);
    const b=elx('button','btn',S.bonus?i18n('nv.danhan','Đã nhận'):i18n('nv.mo','Mở'));b.disabled=!all||S.bonus;b.onclick=()=>{S.bonus=1;const it=dropGear(0.25);if(typeof matAdd==='function')matAdd('thiet',3);saveSave();if(typeof chestReveal==='function')chestReveal(it,()=>buildDQ());else buildDQ()};r.appendChild(b);Q.appendChild(r)}
  show('nhiemvu')}
function dqLogin(){const S=dqSave();if(S.loginGot)return;S.loginGot=1;if(S.streak===7){const it=dropGear(0.35);saveSave();if(typeof chestReveal==='function')chestReveal(it,()=>buildDQ())}else{SAVE.lt+=loginLt(S.streak);saveSave();sfx('coin');toast(i18nf('nv.nhanlt','+{0} linh thạch',loginLt(S.streak)))}}
SCREENS.push('nhiemvu');
on('dqB',buildDQ);on('dqBack',buildMenu);
const _bmDQ=buildMenu;buildMenu=function(){_bmDQ();const d=$('dqDot');if(d)d.hidden=!dqClaimable()};
BTN_IC.dqB='kv_trongdong';
