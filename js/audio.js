'use strict';
// ───────────────────────── âm thanh: sfx.mp3 (cắt theo SFX_MAP) + âm tổng hợp; nhạc nền tạm
let AC=null, SFXBUF=null, sfxBus=null; const last={};
function audioInit(){
  if(AC)return; try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}
  sfxBus=AC.createGain(); sfxBus.gain.value=0.7; sfxBus.connect(AC.destination);
  fetch('assets/sfx.mp3').then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(buf=>{SFXBUF=buf}).catch(()=>{});
}
function tone(f0,f1,dur,type='sine',vol=0.05,delay=0){
  const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+dur+0.02);
}
function sample(k){const v=SFX_MAP[k];if(!v||!SFXBUF)return false;const c=v.c[(Math.random()*v.c.length)|0];
  const s=AC.createBufferSource(),g=AC.createGain();s.buffer=SFXBUF;s.playbackRate.value=(v.p||1)*(1+(Math.random()-.5)*0.12);g.gain.value=(v.v||0.5);s.connect(g);g.connect(sfxBus);s.start(0,c[0],c[1]);return true}
const GAP={hit:0.05,gem:0.045,sword:0.08,fire:0.1,ice:0.1,boom:0.08,kill:0.06,ouch:0.15,zap:0.1,tali:0.1};
function sfx(k){
  if(!AC||!SAVE.opt.sfx)return; const now=AC.currentTime; if(now-(last[k]||0)<(GAP[k]||0.03))return; last[k]=now;
  try{switch(k){
    case 'hit':tone(420,180,0.05,'square',0.012);break;
    case 'gem':tone(1300+Math.random()*300,1900,0.05,'sine',0.025);break;
    case 'sword':tone(1800,900,0.08,'triangle',0.02);break;
    case 'fire':tone(240,90,0.18,'sawtooth',0.02);break;
    case 'ice':tone(2200,1400,0.1,'sine',0.025);break;
    case 'zap':tone(1500,260,0.12,'sawtooth',0.025);break;
    case 'vine':tone(180,320,0.2,'triangle',0.03);break;
    case 'bell':tone(660,640,0.6,'sine',0.06);tone(1320,1300,0.4,'sine',0.025);break;
    case 'gourd':tone(300,900,0.35,'sine',0.04);break;
    case 'tali':tone(900,1200,0.06,'square',0.012);break;
    case 'array':tone(520,1040,0.3,'triangle',0.035);break;
    case 'boom':if(!sample('heavy'))tone(160,40,0.25,'sawtooth',0.04);break;
    case 'kill':if(!sample('kill'))tone(220,60,0.1,'sawtooth',0.02);break;
    case 'bigkill':if(!sample('bigkill'))tone(200,40,0.6,'sawtooth',0.06);break;
    case 'roar':if(!sample('roar'))tone(120,60,0.8,'sawtooth',0.06);break;
    case 'thunder':if(!sample('thunder'))tone(90,30,0.8,'sawtooth',0.08);break;
    case 'ouch':tone(260,120,0.12,'square',0.035);break;
    case 'heal':[523,659,784].forEach((f,i)=>tone(f,f,0.15,'sine',0.04,i*0.06));break;
    case 'chest':[523,659,784,1047].forEach((f,i)=>tone(f,f*1.01,0.2,'triangle',0.05,i*0.08));break;
    case 'level':[392,523,659,784].forEach((f,i)=>tone(f,f,0.18,'triangle',0.05,i*0.07));break;
    case 'pick':tone(880,1320,0.1,'triangle',0.05);break;
    case 'realm':[262,330,392,523,659,784,1047].forEach((f,i)=>tone(f,f,0.4,'sine',0.06,i*0.07));tone(130,128,1.5,'triangle',0.06);break;
    case 'click':if(!sample('click'))tone(1000,900,0.03,'square',0.02);break;
  }}catch(e){}
}
// nhạc nền CC0 (OpenGameArt): Tozan, iamoneabe, Juhani Junkala — xem README
const MUS={menu:'assets/mus_menu.mp3',run:'assets/mus_explore.mp3',run2:'assets/mus_run2.mp3',boss:'assets/mus_boss.mp3'};
let musEl=null, musK='';
function musicMode(k){
  if(musK===k&&musEl)return; musK=k;
  if(musEl){musEl.pause();musEl=null}
  if(!SAVE.opt.mus||!k||!AC)return;
  musEl=new Audio(MUS[k]); musEl.loop=true; musEl.volume=0.35; musEl.play().catch(()=>{});
}
function musicRefresh(){const k=musK;musK='';if(musEl){musEl.pause();musEl=null}musicMode(k)}

// tắt hẳn âm thanh khi app/tab xuống nền
function audioPause(){if(AC&&AC.state==='running')AC.suspend().catch(()=>{});if(musEl)musEl.pause()}
function audioResume(){if(AC&&AC.state==='suspended')AC.resume().catch(()=>{});if(musEl&&SAVE.opt.mus)musEl.play().catch(()=>{})}
document.addEventListener('visibilitychange',()=>{document.hidden?audioPause():audioResume()});
addEventListener('pagehide',audioPause);
window.__vtdPause=audioPause; window.__vtdResume=audioResume;
