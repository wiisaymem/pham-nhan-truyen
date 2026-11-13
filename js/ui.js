'use strict';
// ───────────────────────── giao diện: màn hình, HUD, thẻ lên cấp, điều khiển
const $=id=>document.getElementById(id);
const SCREENS=['menu','select','dongphu','settings','pause','lvup','over','thap','phapbao','linhthu','bxh'];
function show(id){for(const s of SCREENS)$(s).hidden=s!==id;$('hud').hidden=!G||(id&&id!=='pause'&&id!=='lvup'&&!(id==='settings'&&G&&!G.over))}

// ── biểu tượng vẽ bằng code (pixel 16x16)
const ICON={};
function iconURL(id){
  if(ICON[id])return ICON[id];
  {const m=typeof SPR!=='undefined'&&SPR['ic_'+id];if(m&&ATLAS&&ATLAS.complete!==false){const r=m.r,S=Math.max(r[2],r[3])+2,c=mk(S,S),x=c.getContext('2d');x.drawImage(ATLAS,r[0],r[1],r[2],r[3],((S-r[2])/2)|0,((S-r[3])/2)|0,r[2],r[3]);return ICON[id]=c.toDataURL()}}
  const c=mk(32,32),x=c.getContext('2d');x.scale(2,2);const R=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
  switch(id){
    case 'sword':for(let i=0;i<9;i++)R(3+i,12-i,2,2,i>6?'#ffffff':'#d8ecff');R(2,10,5,2,'#ffcf3a');R(4,8,2,6,'#ffcf3a');R(1,13,3,2,'#8a5a20');break;
    case 'fire':R(5,6,7,8,'#ff5a1f');R(6,4,5,4,'#ff5a1f');R(7,2,3,3,'#ff8a2e');R(6,7,5,6,'#ffb02e');R(7,9,3,3,'#fff6c0');break;
    case 'bolt':[[9,1],[8,3],[7,5],[6,7],[9,7],[8,9],[7,11],[6,13]].forEach(([a,b])=>R(a,b,3,2,'#e8deff'));R(5,7,6,2,'#b39bff');R(6,13,2,2,'#ffffff');break;
    case 'ice':for(let i=0;i<8;i++)R(3+i,11-i,2,2,'#4cc3ff');R(11,2,3,3,'#e8fbff');R(2,11,2,3,'#9fe8ff');R(1,12,3,2,'#9fe8ff');break;
    case 'vine':x.strokeStyle='#2f9e36';x.lineWidth=2;x.beginPath();x.moveTo(3,14);x.bezierCurveTo(14,12,2,6,12,2);x.stroke();R(9,6,3,2,'#7ef06a');R(4,9,3,2,'#7ef06a');R(11,2,2,2,'#ffb3cf');break;
    case 'rock':R(3,5,10,8,'#9a6a3a');R(4,4,8,2,'#c99a55');R(4,6,4,3,'#ecc98a');R(3,12,10,1,'#6a4a2a');break;
    case 'bell':R(5,3,6,2,'#ffd23f');R(4,5,8,6,'#ffd23f');R(3,11,10,2,'#ffcf3a');R(5,5,2,5,'#fff3a0');R(7,13,2,2,'#a8780c');R(7,1,2,2,'#a8780c');break;
    case 'gourd':R(6,2,4,1,'#5a3a1a');R(6,3,4,4,'#e0a03a');R(4,7,8,7,'#e0a03a');R(5,8,2,4,'#ffd08a');R(5,6,6,1,'#c8202a');break;
    case 'talisman':R(5,2,6,12,'#ffe066');R(7,3,2,10,'#d42a2a');R(6,6,4,1,'#d42a2a');R(6,9,4,1,'#d42a2a');break;
    case 'array':x.strokeStyle='#ffd23f';x.lineWidth=1.5;x.beginPath();x.arc(8,9,6,0,TAU);x.stroke();for(let i=0;i<4;i++){const a=i/4*TAU;R(8+Math.cos(a)*6-1,9+Math.sin(a)*6-3,2,5,'#e8f4ff')}R(7,8,2,2,'#fff3a0');break;
    case 'p_sword':R(7,2,2,9,'#ffd23f');R(5,10,6,2,'#a8780c');R(7,12,2,3,'#8a5a20');break;
    case 'p_fire':R(5,7,6,7,'#ff6b3d');R(7,3,3,5,'#ff6b3d');R(6,9,4,4,'#ffd08a');break;
    case 'p_bolt':R(8,1,3,5,'#c8a8ff');R(5,6,6,2,'#c8a8ff');R(5,8,3,6,'#c8a8ff');break;
    case 'p_moon':R(5,3,6,10,'#4cc3ff');R(4,5,2,6,'#4cc3ff');R(8,3,4,8,'#ffffff00');x.clearRect(8,4,5,8);break;
    case 'p_leaf':R(4,4,8,8,'#5ee05a');R(6,3,5,2,'#5ee05a');R(7,6,1,7,'#23802a');R(3,12,3,2,'#23802a');break;
    case 'p_shield':R(4,3,8,7,'#d9a35a');R(5,10,6,2,'#d9a35a');R(7,12,2,2,'#d9a35a');R(6,4,2,5,'#ffe0a8');break;
    case 'p_boot':R(5,3,4,8,'#9ff0e0');R(5,10,8,3,'#9ff0e0');R(2,5,3,1,'#ffffff');R(1,8,3,1,'#ffffff');break;
    case 'p_magnet':R(3,3,3,9,'#7ff0b0');R(10,3,3,9,'#7ff0b0');R(3,10,10,3,'#7ff0b0');R(3,3,3,2,'#ffffff');R(10,3,3,2,'#ffffff');break;
    case 'p_yin':x.fillStyle='#ffffff';x.beginPath();x.arc(8,8,6,0,TAU);x.fill();x.fillStyle='#333';x.beginPath();x.arc(8,8,6,-Math.PI/2,Math.PI/2);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(8,11,3,0,TAU);x.fill();x.fillStyle='#333';x.beginPath();x.arc(8,5,3,0,TAU);x.fill();break;
    case 'p_heart':R(3,4,4,5,'#ff7b9c');R(9,4,4,5,'#ff7b9c');R(4,8,8,3,'#ff7b9c');R(6,11,4,2,'#ff7b9c');R(4,5,2,2,'#ffd0dc');break;
    case 'heal':R(5,6,6,7,'#c8202a');R(6,4,4,3,'#e83a44');R(7,2,2,2,'#5ee05a');break;
    case 'lt':R(5,3,6,10,'#7ff0e0');R(3,6,10,4,'#7ff0e0');R(6,4,2,4,'#ffffff');break;
    case 'lock':R(4,7,8,7,'#b08a5a');R(5,3,6,5,'#ffffff00');x.strokeStyle='#b08a5a';x.lineWidth=2;x.beginPath();x.arc(8,7,3,Math.PI,0);x.stroke();break;
  }
  const u=c.toDataURL();if(typeof ATLAS!=='undefined'&&ATLAS)ICON[id]=u;return u;
}
function cardIcon(c){return c.t==='w'||c.t==='e'?WEAP[c.k].ic:c.t==='p'?PASS[c.k].ic:c.t}

// ── chân dung nhân vật
function portrait(id,sz=64){const c=mk(sz,sz),x=c.getContext('2d');x.imageSmoothingEnabled=false;const m=SPR[`${CHARS[id].spr}_w_D0`];
  if(m&&ATLAS){const r=m.r,k=Math.min(sz/r[2],sz/r[3])*0.95;x.imageSmoothingEnabled=!!m.smooth;x.drawImage(m.img||ATLAS,r[0],r[1],r[2],r[3],(sz-r[2]*k)/2,(sz-r[3]*k)/2,r[2]*k,r[3]*k)}return c}

// ── menu
function buildMenu(){
  $('mLt').textContent=SAVE.lt; $('mTower').textContent=i18nf('ui.ui.tang','· tầng {0}',towerSave().best+1); $('mBest').textContent=SAVE.best?i18nf('ui.ui.kyLucCap','Kỷ lục: {0} · cấp {1}',mmss(SAVE.best),SAVE.bestLv)+(SAVE.wins?i18nf('ui.ui.doKiepLan',' · độ kiếp {0} lần',SAVE.wins):''):i18n('ui.ui.chuaCoKyLuc','Chưa có kỷ lục');
  show('menu'); musicMode('menu');
}
let selChar=SAVE.char, selMap=SAVE.map;
function buildSelect(){
  if(!CHARS[selChar]||!charUnlocked(selChar))selChar='lamphong';
  const box=$('chars'); box.innerHTML='';
  for(const id of CHAR_ORDER){const C=CHARS[id],b=document.createElement('button');b.className='chr'+(id===selChar?' on':'')+(charUnlocked(id)?'':' locked');
    const p=portrait(id,56);b.appendChild(p);const s=document.createElement('span');s.textContent=C.n;b.appendChild(s);
    if(!charUnlocked(id)){const l=document.createElement('small');l.textContent=i18nf('ui.ui.linhThach','{0} linh thạch',C.lock);b.appendChild(l)}
    b.onclick=()=>{sfx('click');if(!charUnlocked(id)){if(SAVE.lt>=C.lock){if(armed(b,i18n('ui.ui.bamLanNuaDe','Bấm lần nữa để mở'))){SAVE.lt-=C.lock;SAVE.unl[id]=1;saveSave();selChar=id}else return}else{toast(i18nf('ui.ui.canLinhThachHoac','Cần {0} linh thạch (hoặc độ kiếp thành công)',C.lock));return}}else selChar=id;buildSelect()};
    box.appendChild(b)}
  const C=CHARS[selChar],W=WEAP[C.w];
  $('cdName').textContent=`${C.n} · ${C.t}`;
  $('cdInfo').innerHTML=i18nf('ui.ui.mauCongPhapDau','Máu <b>{0}</b> · Công pháp đầu: <b style="color:{1}">{2}</b> ({3})<br>{4}',C.hp,EL[W.el].d,W.n,EL[W.el].n,C.note);
  const mb=$('maps'); mb.innerHTML=''; const S=aiSave(); const top=Math.min(AI_MAX,S.best+1); if(!aiUnlocked(S.sel))S.sel=top;
  for(let n=top;n>=1;n--){const A=aiSpec(n),M=MAPS[A.map],b=document.createElement('button');b.className='mapb aib'+(n===S.sel?' on':'')+(n<=S.best?' done':'');b.style.setProperty('--g',M.g[0]);b.style.setProperty('--w',M.water);
    b.innerHTML=i18nf('ui.ai.the','<b>Ải {0}</b><small>{1}</small><i>{2}</i>',n,M.n,n<=S.best?i18n('ui.ai.daQua','Đã qua ✓'):i18nf('ui.ai.lanDau','Lần đầu +{0} ◈',A.first))+`<em>${'★'.repeat(Math.min(5,1+((n-1)/3|0)))}</em>`;b.onclick=()=>{sfx('click');S.sel=n;saveSave();buildSelect()};mb.appendChild(b)}
  show('select');
}
function buildDongPhu(){
  const M=typeof matSave==='function'?matSave():{thiet:0};
  $('dpLt').textContent=SAVE.lt+(M.thiet?` · ${M.thiet} ${i18n('mat.thiet','Tinh Thiết')}`:''); const L=$('dpList'); L.innerHTML='';
  for(const k in DONGPHU){const U=DONGPHU[k],lv=upLv(k),row=document.createElement('div');row.className='uprow';
    const max=lv>=U.max,cost=max?0:U.cost(lv),mat=max||!U.mat?0:U.mat(lv),okLt=SAVE.lt>=cost,okMat=(M.thiet|0)>=mat;
    row.innerHTML=`<div><b>${U.n}</b> <span class="dplv">${i18nf('dp.cap','cấp {0}/{1}',lv,U.max)}</span><i class="dpbar"><i style="width:${lv/U.max*100}%"></i></i><small>${U.d}</small></div>`;
    const b=document.createElement('button');b.className='btn sm';b.innerHTML=max?i18n('ui.ui.toiDa','Tối đa'):`${cost} ◈${mat?`<small>+${mat} ${i18n('mat.thiet','Tinh Thiết')}</small>`:''}`;b.disabled=max||!okLt||!okMat;
    b.onclick=()=>{if(SAVE.lt<cost||(M.thiet|0)<mat)return;SAVE.lt-=cost;if(mat)M.thiet-=mat;SAVE.up[k]=lv+1;saveSave();sfx('pick');buildDongPhu()};row.appendChild(b);L.appendChild(row)}
  show('dongphu');
}
let setBack='menu';
function buildSettings(back){setBack=back;$('optMus').checked=!!SAVE.opt.mus;$('optSfx').checked=!!SAVE.opt.sfx;$('optVib').checked=SAVE.opt.vib!==0;buildCloud();show('settings')}

// ── trận đấu
function startGame(){
  SAVE.char=selChar;SAVE.map=selMap;saveSave();
  newRun(selChar,selMap,towerNext,aiSave().sel); towerNext=0; CHUNKS.clear(); if(QS.get('god'))G.god=1;
  buildSlots(); show(null); $('hud').hidden=false; musicMode('run');
  if(G.tower){announce(i18nf('tb.thaptang','Thông Thiên Tháp · Tầng {0}',G.tower.f),'title');setTimeout(()=>announce(`${G.tower.mod.n}: ${G.tower.mod.d}`,'good'),1300)}
  else{announce(G.ai?i18nf('tb.ai','Ải {0} · {1}',G.ai.n,MAPS[G.mapId].n):MAPS[G.mapId].n,'title'); setTimeout(()=>announce(i18n('tb.batdau','Sống sót 15 phút, rồi vượt Thiên Kiếp'),'good'),1300)}
  if(!SAVE.seen){SAVE.seen=1;saveSave()} // hướng dẫn di chuyển nay do thẻ hướng dẫn (huongdan.js) đảm nhận
}
function setPause(on){if(!G||G.over)return;G.paused=on;if(on){buildPause();show('pause')}else{show(null)}}
function buildPause(){const L=$('pList');L.innerHTML='';
  for(const k in G.w){const W=WEAP[k],d=document.createElement('div');d.className='prow';d.innerHTML=`<img src="${iconURL(W.ic)}"><b>${G.w[k].evo?EVO[k].n:W.n}</b><span style="color:${EL[W.el].d}">${EL[W.el].n}</span><span class="pips">${'◆'.repeat(G.w[k].lv)}${'◇'.repeat(5-G.w[k].lv)}</span>`;L.appendChild(d)}
  for(const k in G.pass){const Pp=PASS[k],d=document.createElement('div');d.className='prow';d.innerHTML=`<img src="${iconURL(Pp.ic)}"><b>${Pp.n}</b><span></span><span class="pips">${'◆'.repeat(G.pass[k])}${'◇'.repeat(5-G.pass[k])}</span>`;L.appendChild(d)}
  $('pInfo').textContent=i18nf('ui.ui.capYeuQuai','{0} · cấp {1} · {2} yêu quái · {3}',REALMS[G.realm].n,G.lv,G.kills,mmss(G.t));
}

// ── thẻ lên cấp
let cards=null;
function openLevelUp(){
  G.paused=true; const chest=G.chestOpen;
  cards=rollCards(); G.chestOpen=false;
  $('luTitle').textContent=chest?i18n('ui.ui.baoRuong','Bảo Rương'):i18nf('ui.ui.lenCap','Lên cấp {0}',G.lv-G.pendLv+1);
  $('luSub').textContent=chest?i18n('ui.ui.chon1PhanThuong','Chọn 1 phần thưởng'):i18nf('ui.ui.chon1Trong3','{0} · chọn 1 trong 3',REALMS[G.realm].n);
  const box=$('luCards'); box.innerHTML='';
  cards.forEach((c,i)=>{const b=document.createElement('button');b.className='card3';let n,desc,tag='',el=null,lvT='';
    if(c.t==='e'){const W=WEAP[c.k],E=EVO[c.k];n=E.n;desc=E.d;el=W.el;tag=i18n('ui.ui.thanThong','<i class="new evo">Thần thông</i>');lvT=`${W.n} + ${PASS[E.p].n}`;b.classList.add('evoc')}
    else if(c.t==='w'){const W=WEAP[c.k],lv=G.w[c.k]?G.w[c.k].lv:0;n=W.n;desc=W.d[lv];el=W.el;tag=lv?'':i18n('ui.ui.moi','<i class="new">Mới</i>');lvT=lv?i18nf('ui.ui.cap','Cấp {0} → {1}',lv,lv+1):i18n('ui.ui.congPhap','Công pháp')}
    else if(c.t==='p'){const Pp=PASS[c.k],lv=G.pass[c.k]|0;n=Pp.n;desc=Pp.d;tag=lv?'':i18n('ui.ui.moi','<i class="new">Mới</i>');lvT=lv?i18nf('ui.ui.tamPhapCap','Tâm pháp · cấp {0} → {1}',lv,lv+1):i18n('ui.ui.tamPhap','Tâm pháp')}
    else if(c.t==='heal'){n=i18n('ui.ui.linhDan','Linh Đan');desc=i18n('ui.ui.hoi30Mau','Hồi 30% máu.');lvT=i18n('ui.ui.danDuoc','Đan dược')}
    else{n=i18n('ui.ui.linhThach2','Linh Thạch');desc=i18n('ui.ui.25LinhThach','+25 linh thạch.');lvT=i18n('ui.ui.taiNguyen','Tài nguyên')}
    b.innerHTML=`<img src="${iconURL(cardIcon(c))}"><div class="ct"><b>${n}${tag}</b><small>${lvT}${el?` · <span style="color:${EL[el].d}">${EL[el].n}</span>`:''}</small><p>${desc}</p></div>`;
    b.onclick=()=>pickCard(i); box.appendChild(b)});
  show('lvup'); sfx(chest?'chest':'level');
  lvLock=performance.now()+350;
}
let lvLock=0;
function pickCard(i){if(performance.now()<lvLock||!cards)return;applyCard(cards[i]);cards=null;G.pendLv--;buildSlots();
  if(G.pendLv>0&&!G.cine&&!G.bt)openLevelUp();else{G.paused=false;show(null)}}

// ── HUD
const hudC={};
function setT(id,v){if(hudC[id]!==v){hudC[id]=v;$(id).textContent=v}}
function setW(id,v){v=Math.round(v*1000)/10;if(hudC[id]!==v){hudC[id]=v;$(id).style.width=v+'%'}}
function buildSlots(){
  const ws=$('wSlots'),ps=$('pSlots');ws.innerHTML='';ps.innerHTML='';const wk=Object.keys(G.w),pk=Object.keys(G.pass);
  for(let i=0;i<MAX_W;i++){const d=document.createElement('div');d.className='slot';
    if(i<wk.length){const W=WEAP[wk[i]];d.innerHTML=`<img src="${iconURL(W.ic)}"><i style="background:${EL[W.el].c}"></i><b>${G.w[wk[i]].evo?'★':G.w[wk[i]].lv}</b>`;if(G.w[wk[i]].evo)d.classList.add('evo')}
    else if(i>=wSlots()){d.classList.add('lock');d.innerHTML=`<img src="${iconURL('lock')}">`}
    ws.appendChild(d)}
  for(let i=0;i<MAX_P;i++){const d=document.createElement('div');d.className='slot sm';if(i<pk.length){d.innerHTML=`<img src="${iconURL(PASS[pk[i]].ic)}"><b>${G.pass[pk[i]]}</b>`}ps.appendChild(d)}
}
let annT=0;
function hud(dt){
  if(!G)return; const P=G.p;
  setW('hpF',P.hp/P.mhp); setT('hpT',`${Math.ceil(P.hp)}/${P.mhp}`);
  setW('xpF',G.xp/xpNeed(G.lv));
  const R=REALMS[G.realm]; setT('realm',i18nf('ui.ui.tang2','{0} · tầng {1}',R.n,G.lv-R.lv+1)); $('realm').style.color=R.c;
  setT('timer',G.kiep?i18nf('ui.ui.thienKiep9','Thiên Kiếp {0}/9',G.kiep.wave):G.tower?`T${G.tower.f} · `+(G.t<TOWER_T?mmss(TOWER_T-G.t):'BOSS'):mmss(G.t)); $('timer').classList.toggle('kiep',!!G.kiep);
  setT('kills',G.kills);
  const b=G.boss&&!G.boss.dead?G.boss:null; $('bossBar').hidden=!b; if(b){setT('bossN',b.d.n);setW('bossF',b.hp/b.mhp)}
  setW('burstF',G.burst/100); $('burstB').classList.toggle('ready',G.burst>=100);
  {const sc=JSON.stringify([G.w,G.pass,G.realm].map(o=>typeof o==='object'?Object.entries(o).map(([k,v])=>k+(v.lv??v)+(v.evo?1:0)).join():o));if(slotCount!==sc){slotCount=sc;buildSlots()}}
  // thông báo
  annT-=dt; if(annT<=0&&G.annQ.length){const a=G.annQ.shift(),el=$('ann');el.textContent=a.t;el.className='show '+a.k;annT=a.k==='realm'||/^kiep/.test(a.k)?1.8:1.3;setTimeout(()=>{if(el.textContent===a.t)el.className=''},annT*1000)}
  // mini map
  miniT-=dt; if(miniT<=0){miniT=0.3;drawMini()}
  if(!G.paused&&!G.over&&G.pendLv>0&&!P.dead&&!G.bt&&!(G.cine&&G.cine.t<2.2))openLevelUp();
  if(G.over&&G.t2>(G.win?2.5:1.6)&&$('over').hidden)showOver();
}
let slotCount=-1, miniT=0;
function drawMini(){const c=$('mini'),x=c.getContext('2d'),S=c.width,ec=Math.ceil(WORLD/32),k=S/ec;x.fillStyle='#e9f6ff';x.fillRect(0,0,S,S);
  const MP=MAPS[G.mapId];x.fillStyle=MP.g[0];for(let j=0;j<ec;j++)for(let i=0;i<ec;i++)if(G.explored[j*ec+i])x.fillRect(i*k,j*k,k+0.5,k+0.5);
  x.fillStyle=MP.water;for(const o of G.world.obs)if(o.k==='pond'&&G.explored[((o.y/32)|0)*ec+((o.x/32)|0)]){x.beginPath();x.arc(o.x/WORLD*S,o.y/WORLD*S,Math.max(1.5,o.r/WORLD*S),0,TAU);x.fill()}
  if(G.boss&&!G.boss.dead){x.fillStyle='#ff3d6e';x.fillRect(G.boss.x/WORLD*S-2,G.boss.y/WORLD*S-2,4,4)}
  x.fillStyle='#ffffff';x.fillRect(G.p.x/WORLD*S-2,G.p.y/WORLD*S-2,4,4);x.fillStyle='#d42a2a';x.fillRect(G.p.x/WORLD*S-1,G.p.y/WORLD*S-1,2,2)}
function showOver(){
  const w=G.win,T=G.tower;$('ovTitle').textContent=T?(w?i18nf('ket.thap.thang','Qua Tầng {0}!',T.f):i18nf('ket.thap.thua','Bại ở Tầng {0}',T.f)):w?i18n('ket.thang','Độ Kiếp Thành Công!'):i18n('ket.thua','Thân Tử Đạo Tiêu');$('ovTitle').className=w?'win':'';
  $('ovSub').textContent=T?(w?i18n('ket.thap.thang.phu','Tháp rung chuyển, tầng mới đã mở.'):i18n('ket.thap.thua.phu','Tầng tháp này còn quá sức, tu luyện thêm rồi quay lại.')):w?i18n('ket.thang.phu','Bạn đã vượt Cửu Cửu Thiên Kiếp, phi thăng tiên giới.'):i18n('ket.thua.phu','Đạo tâm chưa vững, hẹn kiếp sau tu luyện tiếp.');
  $('ovStats').innerHTML=i18nf('ui.ui.thoiGiancanhGioicapyeuQuaibosslinh','<div><small>Thời gian</small><b>{0}</b></div><div><small>Cảnh giới</small><b>{1}</b></div><div><small>Cấp</small><b>{2}</b></div><div><small>Yêu quái</small><b>{3}</b></div><div><small>Boss</small><b>{4}</b></div><div><small>Linh thạch</small><b class="lt">+{5}</b></div>',mmss(G.t),REALMS[G.realm].n,G.lv,G.kills,G.bossKills,G.ltGain);
  $('ovUnlock').textContent=(G.unlockMsg||'')+(G.score?i18nf('ui.ui.diem',' · Điểm: {0}',G.score):''); showOverGear(); show('over'); musicMode('menu');
}
// xác nhận bằng cách bấm 2 lần (không dùng confirm())
function armed(b,msg){if(b.dataset.arm&&Date.now()-b.dataset.arm<3000){delete b.dataset.arm;return true}b.dataset.arm=Date.now();const keep=b.innerHTML;toast(msg);setTimeout(()=>{delete b.dataset.arm},3000);return false}
let toastT=null;function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2600)}

// ── điều khiển: cần ảo nổi + phím
const JOY={on:false,id:null,ox:0,oy:0};
const KEYS={};
function updKeys(){if(JOY.on)return;let x=0,y=0;if(KEYS.ArrowLeft||KEYS.KeyA)x--;if(KEYS.ArrowRight||KEYS.KeyD)x++;if(KEYS.ArrowUp||KEYS.KeyW)y--;if(KEYS.ArrowDown||KEYS.KeyS)y++;const m=Math.hypot(x,y)||1;INPUT.x=x/m;INPUT.y=y/m}
addEventListener('keydown',e=>{if(e.repeat)return;KEYS[e.code]=1;updKeys();if(e.code==='Space'){useBurst();e.preventDefault()}if((e.code==='Escape'||e.code==='KeyP')&&G&&!G.over){if(!$('lvup').hidden)return;setPause(!G.paused)}
  if(!$('lvup').hidden&&/Digit[123]/.test(e.code))pickCard(+e.code.slice(5)-1)});
addEventListener('keyup',e=>{KEYS[e.code]=0;updKeys()});
cv.addEventListener('pointerdown',e=>{audioInit();if(!G||G.paused||G.over)return;JOY.on=true;JOY.id=e.pointerId;JOY.ox=e.clientX;JOY.oy=e.clientY;INPUT.x=0;INPUT.y=0;try{cv.setPointerCapture(e.pointerId)}catch(_){}});
cv.addEventListener('pointermove',e=>{if(!JOY.on||e.pointerId!==JOY.id)return;let dx=e.clientX-JOY.ox,dy=e.clientY-JOY.oy;const d=Math.hypot(dx,dy),R=44;
  if(d>R){JOY.ox+=dx*(1-R/d);JOY.oy+=dy*(1-R/d);dx=e.clientX-JOY.ox;dy=e.clientY-JOY.oy}
  const m=Math.min(1,Math.hypot(dx,dy)/R);if(m<0.12){INPUT.x=0;INPUT.y=0}else{const a=Math.atan2(dy,dx);INPUT.x=Math.cos(a)*m;INPUT.y=Math.sin(a)*m}});
const endJoy=e=>{if(e.pointerId!==JOY.id)return;JOY.on=false;INPUT.x=0;INPUT.y=0;updKeys()};
cv.addEventListener('pointerup',endJoy);cv.addEventListener('pointercancel',endJoy);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G&&!G.over&&!G.paused&&$('lvup').hidden)setPause(true);if(musEl){document.hidden?musEl.pause():musEl.play().catch(()=>{})}});

// ── nút bấm
const on=(id,f)=>$(id).addEventListener('click',e=>{audioInit();if(musK&&!musEl)musicRefresh();sfx('click');f(e)});
function wire(){
  on('playB',buildSelect); on('dpB',buildDongPhu); on('setB',()=>buildSettings('menu'));
  on('selBack',buildMenu); on('goB',startGame); on('dpBack',buildMenu);
  on('setBack',()=>{setBack==='pause'?(buildPause(),show('pause')):buildMenu()});
  on('pauseB',()=>setPause(true)); on('resumeB',()=>setPause(false)); on('pSetB',()=>buildSettings('pause'));
  on('quitB',()=>{if(armed($('quitB'),i18n('ui.ui.bamLanNuaDe2','Bấm lần nữa để bỏ'))){G.paused=false;show(null);endRun(false);G.p.dead=true;G.p.deadT=0}});
  on('ovAgain',()=>{const T=G.tower;G=null;if(T)buildTower();else buildSelect()}); on('ovMenu',()=>{G=null;buildMenu()});
  $('burstB').addEventListener('pointerdown',e=>{e.stopPropagation();audioInit();useBurst()});
  $('optMus').onchange=e=>{SAVE.opt.mus=e.target.checked?1:0;saveSave();musicRefresh()};
  $('optSfx').onchange=e=>{SAVE.opt.sfx=e.target.checked?1:0;saveSave()};
  $('optVib').onchange=e=>{SAVE.opt.vib=e.target.checked?1:0;saveSave();if(e.target.checked)buzz(30)};
  wire2();
}

// ── vòng lặp
let lastT=0;
const QS=new URLSearchParams(location.search), SPEED=Math.max(1,Math.min(40,+(QS.get('speed')||1)));
function frame(now){
  const dt=Math.min(0.05,(now-lastT)/1000||0); lastT=now;
  if(G){for(let i=0;i<SPEED&&!G.paused;i++)update(dt);hud(dt)}
  render(now);
  requestAnimationFrame(frame);
}
function boot(){
  if(typeof i18nPatch==='function')i18nPatch();
  fxqInit(); resize(); addEventListener('resize',resize); wire();
  loadArt(()=>{$('loadT').hidden=true;buildMenu();drawLogo();if(typeof cloudPull==='function')cloudPull()});
  requestAnimationFrame(frame);
}
function drawLogo(){const c=$('logoC');if(!c)return;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,c.width,c.height);
  ['lamphong','linhnhi','hanbang','loichan','modung'].forEach((id,i)=>{const p=portrait(id,48);x.drawImage(p,8+i*44,4)})}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot);else boot();
