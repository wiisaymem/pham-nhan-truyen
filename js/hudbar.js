'use strict';
// ───────────────────────── Thanh máu, kinh nghiệm, máu boss: khung Google Flow (tools/art_src/hud_bars.png → assets/bar_*.png, fill_*.png)
// khung 9 mảnh, phần ruột có vệt trễ khi mất máu, máu thấp thì khung nháy đỏ, ngọc linh khí hiện cấp hiện tại.
// số đo (điểm ảnh gốc): w,h, lề trong t r b l tới máng chứa
const HB={hp:{w:232,h:36,t:12,r:23,b:13,l:47,H:28},xp:{w:229,h:30,t:10,r:18,b:9,l:33,H:22},boss:{w:234,h:46,t:22,r:16,b:12,l:42,H:30}};
(function(){
  const css=[];
  for(const [k,m] of Object.entries(HB)){const s=m.H/m.h,T=(m.t*s).toFixed(1),R=(m.r*s).toFixed(1),B=(m.b*s).toFixed(1),L=(m.l*s).toFixed(1);
    css.push(`.hb-${k}{position:relative;height:${m.H}px!important;background:none!important;border:0!important;border-radius:0!important;overflow:visible!important}
.hb-${k}::after{content:'';position:absolute;inset:0;border-style:solid;border-width:${T}px ${R}px ${B}px ${L}px;border-image:url(assets/bar_${k}.png) ${m.t} ${m.r} ${m.b} ${m.l} stretch;image-rendering:pixelated;pointer-events:none;z-index:2}
.hb-${k}>.tr{position:absolute;left:${L-1}px;right:${R-1}px;top:${T-1}px;bottom:${B-1}px;overflow:hidden;background:#0B1B2A;z-index:1}
.hb-${k}>.tr>i{position:absolute;left:0;top:0;bottom:0;width:0;background:url(assets/fill_${k}.png) left center/auto 100% repeat-x!important;image-rendering:pixelated;transition:width .12s;z-index:2}
.hb-${k}>.tr>b{position:absolute;left:0;top:0;bottom:0;width:0;background:#fff3e0;opacity:.75;transition:width .6s ease-in .25s;z-index:1}`)}
  css.push(`#hpT{z-index:3!important;line-height:${HB.hp.H}px!important;font-size:12px!important;padding-left:${(HB.hp.l*HB.hp.H/HB.hp.h*0.6).toFixed(0)}px}
#xpLv{position:absolute;z-index:3;left:0;top:0;width:${(HB.xp.l*HB.xp.H/HB.xp.h*0.78).toFixed(0)}px;height:${HB.xp.H}px;line-height:${HB.xp.H}px;text-align:center;font-size:12px;color:#fff;text-shadow:1px 1px 0 #0a3a40,-1px -1px 0 #0a3a40,1px -1px 0 #0a3a40,-1px 1px 0 #0a3a40}
.hb-hp.low::after{animation:hbLow .7s steps(2) infinite}@keyframes hbLow{50%{filter:brightness(1.35) drop-shadow(0 0 4px #ff3a4a)}}
.hb-hp.hit::after{filter:brightness(1.8)}
#top{gap:1px!important}
#mini{top:calc(max(6px,env(safe-area-inset-top)) + 84px)!important}
#bossBar{top:calc(max(6px,env(safe-area-inset-top)) + 84px)!important;left:10%!important;right:24%!important}
#kiepPips{top:calc(env(safe-area-inset-top,0px) + 138px)!important}
.hb-xp .tr>i::after{content:'';position:absolute;right:0;top:0;bottom:0;width:3px;background:#eafffa;box-shadow:0 0 4px #9ffff0}`);
  const st=document.createElement('style');st.textContent=css.join('\n');document.head.appendChild(st);
  const wrap=(barEl,k)=>{if(!barEl)return;barEl.classList.add('hb-'+k);const tr=document.createElement('span');tr.className='tr';const lag=document.createElement('b');tr.appendChild(lag);
    const f=barEl.querySelector('i');if(f)tr.appendChild(f);barEl.insertBefore(tr,barEl.firstChild);return lag};
  HB.hp.lag=wrap($('hpBar'),'hp');HB.xp.lag=wrap($('xpBar'),'xp');HB.boss.lag=wrap(document.querySelector('#bossBar .bar'),'boss');
  const lv=document.createElement('span');lv.id='xpLv';$('xpBar').appendChild(lv);
})();
let hbLast={hp:-1,boss:-1,lv:-1},hbHit=0;
function hbTick(dt){if(!G)return;const P=G.p,hp=Math.max(0,P.hp/P.mhp),bar=$('hpBar');
  if(hp!==hbLast.hp){if(hp<hbLast.hp){HB.hp.lag.style.transition='none';HB.hp.lag.style.width=(hbLast.hp*100)+'%';void HB.hp.lag.offsetWidth;HB.hp.lag.style.transition='';hbHit=0.12;bar.classList.add('hit')}
    HB.hp.lag.style.width=(hp*100)+'%';hbLast.hp=hp}
  if(hbHit>0){hbHit-=dt;if(hbHit<=0)bar.classList.remove('hit')}
  bar.classList.toggle('low',hp<0.3&&!P.dead);
  const b=G.boss&&!G.boss.dead?G.boss:null;if(b){const v=Math.max(0,b.hp/b.mhp);if(v!==hbLast.boss){HB.boss.lag.style.width=(v*100)+'%';hbLast.boss=v}}else hbLast.boss=-1;
  if(G.lv!==hbLast.lv){hbLast.lv=G.lv;$('xpLv').textContent=G.lv}}
const _hudHB=hud;hud=function(dt){_hudHB(dt);try{hbTick(dt)}catch(e){}};
