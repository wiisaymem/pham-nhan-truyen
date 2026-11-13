'use strict';
// ───────────────────────── Âm thanh cho nội dung mới: sfx2.mp3 (mẫu CC0 từ freesound.org, xem README) + tiếng nền dung nham
const SFX2_MAP={"bell": [0.0, 1.9981], "gong": [2.2981, 2.9648], "sense": [5.5629, 1.9], "hint": [7.7629, 0.7711], "solve": [8.834, 2.2], "portal": [11.334, 1.375], "ignite": [13.009, 0.75], "stone": [14.0589, 1.0], "freeze": [15.3589, 1.6], "relic": [17.2589, 2.9213], "wing": [20.4802, 0.9], "stele": [21.6802, 2.8724], "coin": [24.8526, 0.5081], "wrong": [25.6606, 1.0], "chest": [26.9606, 1.3305], "levelup": [28.5911, 1.6458], "rumble": [30.5369, 3.0]};
const SFX2_V={bell:0.55,gong:0.6,sense:0.4,hint:0.35,solve:0.6,portal:0.5,ignite:0.45,stone:0.4,freeze:0.5,relic:0.6,wing:0.45,stele:0.5,coin:0.45,wrong:0.4,chest:0.5,levelup:0.45,rumble:0.5};
const SFX2_GAP={stone:0.35,ignite:0.15,bell:0.1,coin:0.08,wrong:0.4};
let SFX2BUF=null,s2Last={};
function s2Load(){if(SFX2BUF||!AC)return;SFX2BUF=1;fetch('assets/sfx2.mp3?v='+VER).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(buf=>{SFX2BUF=buf}).catch(()=>{SFX2BUF=null})}
function sfx2(k,rate=1,vol=1){if(!AC||!SAVE.opt.sfx)return false;s2Load();const c=SFX2_MAP[k];if(!c||!SFX2BUF||SFX2BUF===1)return false;
  const now=AC.currentTime;if(now-(s2Last[k]||0)<(SFX2_GAP[k]||0.05))return true;s2Last[k]=now;
  try{const s=AC.createBufferSource(),g=AC.createGain();s.buffer=SFX2BUF;s.playbackRate.value=rate;g.gain.value=(SFX2_V[k]||0.5)*vol;s.connect(g);g.connect(sfxBus);s.start(0,c[0]+0.03,c[1])}catch(e){}return true}
const _sfxS2=sfx;sfx=function(k){if(SFX2_MAP[k]){if(sfx2(k))return;if(k==='chest'||k==='hint')return _sfxS2(k==='hint'?'pick':k);return _sfxS2({freeze:'ice',wrong:'ouch',coin:'pick',ignite:'fire',solve:'realm',relic:'realm',levelup:'level',portal:'array'}[k]||'pick')}return _sfxS2(k)};
const _aiS2=audioInit;audioInit=function(){_aiS2();s2Load()};
// chuông cổ: lấy mẫu chuông thật, đổi cao độ theo nốt
pzBell=function(M,b){if(b.ring>0)return;b.ring=0.6;if(!sfx2('bell',NOTE_F[b.i]/NOTE_F[0]*0.9))ptone(NOTE_F[b.i],NOTE_F[b.i]*1.01,0.6,'triangle',0.07);G.fx.push({k:'spark',x:b.x,y:b.y-24,t:0,dur:0.3,c:'#ffd45a'});
  if(M.song[M.prog]===b.i){M.prog++;if(M.prog>=M.song.length)pzSolve(M,M.x,M.y)}else{M.prog=0;M.fail=1;sfx('wrong');announce(i18n('pz.nhacS','Lạc điệu rồi, gõ lại từ đầu'),'warn')}};
// sự kiện
const _pzSolveS2=pzSolve;pzSolve=function(M,x,y){const was=M.solved;_pzSolveS2(M,x,y);if(!was&&M.solved)sfx('solve')};
const _bcEnS2=bcEnter;bcEnter=function(M){sfx('portal');_bcEnS2(M)};
const _bcExS2=bcExit;bcExit=function(){if(G&&G.bc)sfx('portal');_bcExS2()};
const _kyS2=kyShow;kyShow=function(m,i,isNew){_kyS2(m,i,isNew);sfx(isNew?'stele':'hint')};
const _bcKVS2=bcKV;bcKV=function(){sfx('relic');return _bcKVS2()};
// thông báo đi kèm tiếng (khớp theo câu đã dịch)
const ANN_S2=[['pz.camnhan','sense'],['bc.hoveG','gong'],['pz.hethoigian','wrong'],['pz.lac','wrong'],['pz.hobangT','wrong'],['pz.ho3','solve'],['linhthu.mo','relic'],['an.xong','levelup'],['bc.dauX','levelup'],['ky.tron','relic']]
  .map(([k,s])=>[i18n(k,'').split('{')[0],s]).filter(a=>a[0]);
const _annS2=announce;announce=function(t,k){_annS2(t,k);if(typeof t==='string')for(const [p,s] of ANN_S2)if(t.startsWith(p)){sfx(s);if(s==='gong')setTimeout(()=>sfx('rumble'),300);break}};
// tiếng nền Hỏa Diệm Sơn
let ambEl=null;
function ambTick(){const want=!!(G&&!G.over&&!G.paused&&G.mapId==='hoason'&&!G.bc&&SAVE.opt.sfx);
  if(want&&!ambEl){ambEl=new Audio('assets/amb_lava.mp3?v='+VER);ambEl.loop=true;ambEl.volume=0.28;ambEl.play().catch(()=>{ambEl=null})}
  else if(!want&&ambEl){ambEl.pause();ambEl=null}}
setInterval(ambTick,1000);
// nhạc nền mới (Gemini): Bí cảnh, Thiên Kiếp, nhạc riêng từng bản đồ
Object.assign(MUS,{bicanh:'assets/mus_bicanh.mp3',kiep:'assets/mus_kiep.mp3',m_hoason:'assets/mus_hoason.mp3',m_banghoa:'assets/mus_banghoa.mp3',m_daohoa:'assets/mus_daohoa.mp3',m_vandinh:'assets/mus_vandinh.mp3'});
const MUS_HAVE={bicanh:1,kiep:1,m_hoason:1,m_banghoa:1,m_daohoa:1,m_vandinh:1}; // bài đã có file
const _mmS2=musicMode;musicMode=function(k){if(G&&!G.over&&k&&k!=='menu'){
    if(G.bc&&MUS_HAVE.bicanh)k='bicanh';else if(k==='boss'&&G.kiep&&MUS_HAVE.kiep)k='kiep';else if((k==='run'||k==='run2')&&MUS_HAVE['m_'+G.mapId])k='m_'+G.mapId}
  _mmS2(k)};
const _bcEnM=bcEnter;bcEnter=function(M){_bcEnM(M);musicMode('run')};
const _bcExM=bcExit;bcExit=function(){_bcExM();if(G&&!G.over)musicMode(G.kiep?'boss':G.boss?'boss':G.t>450?'run2':'run')};
// nhạc đánh boss mới (Gemini, Kent tạo): "The Bronze Gate Defiance"; Thiên Kiếp có bài riêng
MUS.boss='assets/mus_boss2.mp3';
// âm lượng chỉnh được: nhạc nền và hiệu ứng (0–100, mặc định 80)
const volM=()=>(SAVE.opt.mv??80)/100, volS=()=>(SAVE.opt.sv??80)/100;
function volApply(){if(musEl)musEl.volume=Math.min(1,0.35*volM()/0.8);if(sfxBus)sfxBus.gain.value=0.7*volS()/0.8;if(ambEl)ambEl.volume=Math.min(1,0.28*volS()/0.8)}
const _mmVol=musicMode;musicMode=function(k){_mmVol(k);volApply()};
const _aiVol=audioInit;audioInit=function(){_aiVol();volApply()};
setInterval(()=>{if(ambEl)volApply()},500);
function volUI(){const m=$('volMus'),s=$('volSfx');if(!m)return;m.value=Math.round(volM()*100);s.value=Math.round(volS()*100);m.classList.toggle('off',!SAVE.opt.mus);s.classList.toggle('off',!SAVE.opt.sfx)}
(function(){const m=$('volMus'),s=$('volSfx');if(!m)return;
  m.oninput=()=>{SAVE.opt.mv=+m.value;volApply()};m.onchange=()=>{SAVE.opt.mv=+m.value;saveSave()};
  s.oninput=()=>{SAVE.opt.sv=+s.value;volApply()};s.onchange=()=>{SAVE.opt.sv=+s.value;saveSave();if(typeof sfx==='function')sfx('hint')};
  for(const id of ['optMus','optSfx']){const c=$(id);if(c)c.addEventListener('change',()=>setTimeout(volUI,0))}})();
const _bsVol=buildSettings;buildSettings=function(b){_bsVol(b);volUI()};
