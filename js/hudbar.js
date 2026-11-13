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

// Danh hiệu cảnh giới: chỉ trang trí chữ DOM và lớp nhãn Canvas, không đổi dữ liệu tu luyện.
(function(){
  const names=['Luyện Khí','Trúc Cơ','Kết Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa','Độ Kiếp'];
  const en=['Qi Refining','Foundation Establishment','Core Formation','Nascent Soul','Soul Transformation','Void Refining','Body Integration','Great Ascension','Tribulation Crossing'];
  const colors=['#7f95a6','#bbcbd6','#6aafe0','#78c69d','#f1c453','#efa83f','#ed793f','#e95b56'];
  const rainbow=['#ef4444','#f97316','#facc15','#22c55e','#0ea5e9','#6366f1','#a855f7'];
  const gradient='linear-gradient(90deg,'+rainbow.join(',')+')';
  const st=document.createElement('style');st.id='realmLetteringStyle';
  st.textContent='.realm-name{position:relative;display:inline-block;white-space:nowrap;font-family:var(--font) !important;font-weight:700 !important;color:var(--realm-color) !important;text-shadow:0 0 1px var(--realm-color),0 0 3px var(--realm-color) !important;line-height:inherit}.realm-name .realm-ink{font:inherit!important;color:inherit!important;text-shadow:inherit!important}.realm-name.realm-apex{color:#a855f7!important;text-shadow:none!important}.realm-apex .realm-ink,.realm-apex::before{background:'+gradient+';background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:transparent!important;text-shadow:none!important}.realm-apex::before{content:attr(data-label);position:absolute;inset:0;pointer-events:none;filter:blur(.7px);opacity:.7}';
  document.head.appendChild(st);
  const all=names.concat(en),rx=new RegExp(all.join('|'),'g');
  const skip='script,style,textarea,input,select,option,canvas,[contenteditable],.realm-name,#sanhWho>b,.lbrow>span,#ovTitle';
  function decorate(node){
    if(node.nodeType===3){const p=node.parentElement;if(!p||p.closest(skip))return;const text=node.nodeValue;rx.lastIndex=0;if(!rx.test(text))return;rx.lastIndex=0;
      const frag=document.createDocumentFragment();let last=0;for(const m of text.matchAll(rx)){frag.appendChild(document.createTextNode(text.slice(last,m.index)));const i=all.indexOf(m[0])%9,s=document.createElement('span'),label='‹ '+m[0]+' ›';s.className='realm-name'+(i===8?' realm-apex':'');s.dataset.realmTier=i+1;s.dataset.label=label;s.setAttribute('aria-label',m[0]);s.style.setProperty('--realm-color',colors[i]||rainbow[6]);const ink=document.createElement('span');ink.className='realm-ink';ink.textContent=label;s.appendChild(ink);frag.appendChild(s);last=m.index+m[0].length}frag.appendChild(document.createTextNode(text.slice(last)));node.replaceWith(frag);
    }else if(node.nodeType===1&&!node.matches(skip)&&!node.closest(skip)){for(const child of Array.from(node.childNodes))decorate(child)}
  }
  const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')decorate(r.target);else for(const n of r.addedNodes)decorate(n)}});
  decorate(document.body);observer.observe(document.body,{childList:true,characterData:true,subtree:true});
  // Chữ hệ thống vẽ thẳng vào Canvas, không bitmap trung gian, không viền nhòe.
  const previous=drawPlayer;drawPlayer=function(){previous();if(!G||G.p.dead)return;const i=Math.max(0,Math.min(8,G.realm|0)),name=REALMS[i]?REALMS[i].n:names[i],label='‹ '+name+' ›',P=G.p,m=SPR[CHARS[G.ch].spr+'_w_D0'],head=m?m.ay:26,hpY=Math.round(P.y-head-7),x=Math.round(P.x);ctx.save();ctx.globalAlpha=1;ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.shadowBlur=0;ctx.shadowOffsetX=ctx.shadowOffsetY=0;ctx.filter='none';const metrics=ctx.measureText(label),y=hpY-7-Math.ceil(metrics.actualBoundingBoxDescent||2);let fill=colors[i]||colors[0];if(i===8){fill=ctx.createLinearGradient(x-metrics.width/2,0,x+metrics.width/2,0);rainbow.forEach((v,j)=>fill.addColorStop(j/6,v))}ctx.fillStyle=fill;ctx.fillText(label,x,y);ctx.restore()};
})();
