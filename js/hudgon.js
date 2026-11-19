'use strict';
// ───────────────────────── HUD kiểu MOBA (10/2026): máu + cấp + kinh nghiệm trên đầu nhân vật,
// bản đồ nhỏ góc trên trái, ô giữa trên gồm số quái hạ + đồng hồ + cảnh giới, nút dừng góc phải. Phía trên gần như để trống cho trận đánh.
(function(){
  const SA='max(6px,env(safe-area-inset-top))';
  const st=document.createElement('style');st.textContent=`
body:not(.pn-dungeon-run) #lv,body:not(.pn-dungeon-run) #xpBar{display:none!important}
#top{display:block!important;padding:0!important;height:0}
#hpBar,#xpBar{display:none!important}
#row1{display:block!important}
#trPill{position:absolute;left:50%;transform:translateX(-50%);top:${SA};display:flex;flex-direction:column;align-items:center;pointer-events:none;z-index:5}
#trPill .pl{display:flex;align-items:center;gap:8px;padding:2px 12px 3px;background:linear-gradient(#19344B,#11263A);border:1px solid rgba(255,214,120,.55);border-radius:12px;box-shadow:0 2px 0 rgba(0,0,0,.35)}
#trPill .sep{width:1px;height:16px;background:rgba(255,214,120,.45)}
#trPill #timer{margin:0!important;font-size:20px!important;line-height:1.1;color:#fff}
#trPill #timer.kiep{font-size:15px!important;color:#ffd0ff}
#trPill #kills{font-size:14px!important;color:#ffe9b0}
#trPill #realm{margin-top:2px;font-size:11px!important;line-height:1;padding:1px 8px;border-radius:8px;background:#0B1B2A;text-shadow:1px 1px 0 #000}
#pauseB{position:absolute;right:8px;top:${SA};width:30px!important;height:30px!important;z-index:5}
#mini{top:${SA}!important;left:6px!important;right:auto!important;width:58px!important;height:58px!important;padding:4px!important}
#dpHud{top:calc(${SA} + 66px)!important;transition:top .25s}
#hud.hasBoss #dpHud{top:calc(${SA} + 66px)!important}
#bossBar{top:calc(${SA} + 50px)!important;left:24%!important;right:24%!important}
#bossBar .hb-boss{height:24px!important}
#kiepPips{top:calc(${SA} + 44px)!important}
#kiepPips i{width:15px!important;height:15px!important}`;document.head.appendChild(st);
  // gom số quái + đồng hồ + cảnh giới vào một ô giữa trên
  const top=$('top'),pill=document.createElement('div');pill.id='trPill';
  const pl=document.createElement('div');pl.className='pl';const sep=document.createElement('i');sep.className='sep';
  pl.append($('kills'),sep,$('timer'));pill.append(pl,$('realm'));top.appendChild(pill);top.appendChild($('pauseB'));
})();

// ── thanh máu trên đầu nhân vật (vẽ trong thế giới, theo kích cỡ pixel của game)
const OH={lag:1,lagT:0,last:1};
function ohBar(){if(!G||!G.p)return;const P=G.p;if(P.dead||G.over)return;
  const m=SPR[`${CHARS[G.ch].spr}_w_D0`],h=m?m.ay:26,W=30,x0=Math.round(P.x-W/2+3),y0=Math.round(P.y-h-7);
  const hp=Math.max(0,Math.min(1,P.hp/P.mhp));
  if(hp<OH.last){OH.lagT=0.35}OH.last=hp;if(OH.lagT>0)OH.lagT-=1/60;else OH.lag=Math.max(hp,OH.lag-0.012);if(OH.lag<hp)OH.lag=hp;
  const inRun=!!(G&&!G.tower&&(G.ai||G.bc)),xp=inRun?Math.max(0,Math.min(1,(G.xp||0)/xpNeed(G.lv))):0;
  ctx.save();ctx.imageSmoothingEnabled=false;
  // khung
  ctx.fillStyle='#0B1B2A';ctx.fillRect(x0-1,y0-1,W+2,6.5);
  // máu: xanh như tướng phe mình trong MOBA, máu thấp chuyển đỏ nhấp nháy
  ctx.fillStyle='#11263A';ctx.fillRect(x0,y0,W,3.5);
  ctx.fillStyle='#fff1d8';ctx.fillRect(x0,y0,W*OH.lag,3.5);
  const low=hp<0.3,blink=low&&((G.t*6)|0)%2;
  ctx.fillStyle=low?(blink?'#ff6a6a':'#e8343e'):'#4fdc5c';ctx.fillRect(x0,y0,W*hp,3.5);
  ctx.fillStyle=low?'rgba(255,200,200,.5)':'rgba(220,255,200,.55)';ctx.fillRect(x0,y0,W*hp,1);
  // vạch mỗi 50 máu
  ctx.fillStyle='rgba(12,8,18,.55)';const step=50/P.mhp;for(let f=step;f<hp-0.005;f+=step)ctx.fillRect(Math.round(x0+W*f),y0+1,0.5,2.5);
  // Lv and EXP belong only to dungeon runs; keep the health bar outside.
  if(inRun&&!G.bc){
  // kinh nghiệm
  ctx.fillStyle='#0B1B2A';ctx.fillRect(x0,y0+4.3,W,1.3);ctx.fillStyle='#7ff0e0';ctx.fillRect(x0,y0+4.3,W*xp,1.3);
  // huy hiệu cấp
  const bx=x0-4.5,by=y0+2.6;ctx.beginPath();ctx.arc(bx,by,4.6,0,Math.PI*2);ctx.fillStyle='#19344B';ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='#f0c860';ctx.stroke();
  ctx.font='8px VT323, monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(String(G.lv),bx,by+0.5);
  }ctx.restore()}
const _moHG=mapOver;mapOver=function(){_moHG();try{ohBar()}catch(e){}};

// bảng Hệ/Môn lùi xuống khi có thanh máu boss
let hgBoss=null;
const _hudHG=hud;hud=function(dt){_hudHG(dt);const inRun=!!(G&&!G.over&&!G.tower&&(G.ai||G.bc));document.body.classList.toggle('pn-dungeon-run',inRun);const b=$('bossBar'),on=!!(b&&!b.hidden);if(on!==hgBoss){hgBoss=on;$('hud').classList.toggle('hasBoss',on)}};

// ── bảng Hệ/Môn thu thành cột ô biểu tượng 24px: số đếm ở góc, mốc thể hiện bằng viền (1 màu, 2 sáng, 3 vàng phát sáng), chưa đạt mốc thì mờ
(function(){const st=document.createElement('style');st.textContent=`
#dpHud{gap:3px!important;left:6px!important}
#dpHud .tc{position:relative;width:24px;height:24px;display:flex!important;align-items:center;justify-content:center;padding:0!important;border-radius:6px!important;border:2px solid var(--c)!important;background:#11263A!important;opacity:.55}
#dpHud .tc img{width:16px!important;height:16px!important;margin:0!important;vertical-align:0!important}
#dpHud .tc b{position:absolute;right:-4px;bottom:-4px;min-width:12px;height:12px;padding:0 2px;border-radius:6px;background:#0B1B2A;border:1px solid var(--c);font:700 9px/10px var(--font);color:#fff;text-align:center;text-shadow:none}
#dpHud .tc.t1{opacity:1}
#dpHud .tc.t2{opacity:1;box-shadow:0 0 5px var(--c)}
#dpHud .tc.t3{opacity:1;border-color:#ffd45a!important;box-shadow:0 0 8px #ffd45a}
#dpHud .tc.ngu{border-color:#fff1a0!important;box-shadow:0 0 8px #fff1a0;opacity:1}`;document.head.appendChild(st)})();
dpHud=function(){let el=$('dpHud');if(!G||!G.dp||G.over){if(el)el.innerHTML='';return}
  if(!el){el=document.createElement('div');el.id='dpHud';($('hud')||document.body).appendChild(el)}
  const L=[];for(const e of NH_ORDER){const n=G.dp.el[e]|0;if(n)L.push({k:e,n,t:G.dp.elT[e]|0,c:EL[e].c})}
  for(const m of MON_ORDER){const n=G.dp.mon[m]|0;if(n)L.push({k:m,n:Math.floor(n),t:G.dp.monT[m]|0,c:MON[m].c})}
  L.sort((a,b)=>b.t-a.t||b.n-a.n);
  const ic=k=>{const u=typeof iconURL==='function'&&SPR['ic_tg_'+k]?iconURL('tg_'+k):'';return u?`<img src="${u}" alt="">`:''};
  let h=L.slice(0,8).map(x=>`<div class="tc t${x.t}" style="--c:${x.c}">${ic(x.k)}<b>${x.n}</b></div>`).join('');
  if(G.dp.ngu)h=`<div class="tc ngu" style="--c:#fff1a0">${ic('ngu')}</div>`+h;
  el.innerHTML=h};


// Permanent pill progression; original EXP and skill-choice flow stays untouched.
(function(){
function install(){
 if(window.PNTProgress)return;
 const names=['Tụ Khí Đan','Trúc Cơ Đan','Ngưng Nguyên Đan','Nguyên Anh Đan','Hóa Thần Đan'];
 const colors=['#7f95a6','#bbcbd6','#6aafe0','#78c69d','#f1c453'];
 const tier=level=>Math.max(0,REALMS.findLastIndex(r=>r.lv<=level));
 function stock(){
  if(!SAVE.alchemy){const old=Math.max(0,Math.min(4,Math.max(SAVE.bestRealm|0,SAVE.pnt?.realm|0))),level=Math.max(1,Math.min(45,Math.max(SAVE.bestLv|0,SAVE.pnt?.level|0,REALMS[old].lv)));
   SAVE.alchemy={version:1,level,herb:0,pills:[0,0,0,0,0]};}
  return SAVE.alchemy;
 }
 const level=()=>stock().level,realm=()=>tier(level());
 function scope(){return G&&!G.tower?(G.bc||G.ai):null}
 function playerName(){return window.PNTOnline?.playerName?.()||CHARS[G?.ch||0].n}
 function cost(){const S=stock();if(S.level>=45)return null;const t=tier(S.level+1),major=t>tier(S.level);return {tier:t,herb:major?6+2*t:2+t,major};}
 function combine(t){const S=stock();if(!Number.isInteger(t)||t<0||t>4)return false;const h=t?4+2*t:3;
  if(S.herb<h||(t&&S.pills[t-1]<3))return false;
  S.herb-=h;if(t)S.pills[t-1]-=3;S.pills[t]++;saveSave();sfx('chest');draw();return true;
 }
 const oldBT=breakthrough;
 // No automatic XP/currency caller can advance a realm. Only advance() below spends pills.
 breakthrough=function(){return false};
 function commitAdvance(){if(G&&!G.over)return false;const S=stock(),c=cost();if(!c||S.herb<c.herb||S.pills[c.tier]<1)return false;
  S.herb-=c.herb;S.pills[c.tier]--;S.level++;SAVE.bestRealm=Math.max(SAVE.bestRealm|0,realm());
  if(SAVE.pnt)SAVE.pnt.realm=Math.max(SAVE.pnt.realm|0,realm());saveSave();sfx('realm');if(typeof flash==='function')flash(colors[realm()],.5);if(typeof buzz==='function')buzz([20,60,100]);
  toast((c.major?'Đột phá ':'Tăng cấp ')+REALMS[realm()].n+' · cấp '+(level()-REALMS[realm()].lv+1));draw();return true;
 }
let advancing=false;
 function advance(){if(advancing||G&&!G.over)return false;const S=stock(),c=cost();if(!c||S.herb<c.herb||S.pills[c.tier]<1)return false;advancing=true;const o=document.createElement('div');o.setAttribute('role','dialog');o.setAttribute('aria-label','Ngồi thiền đột phá');o.style.cssText='position:fixed;inset:0;z-index:99999;background:#0b1b2af5;display:grid;place-items:center;touch-action:manipulation';const cv=document.createElement('canvas');cv.width=320;cv.height=380;cv.style.cssText='width:min(100%,320px);height:auto;max-height:95%;image-rendering:pixelated';o.append(cv);document.body.append(o);const x=cv.getContext('2d'),start=performance.now();let done=false;function finish(){if(done)return;done=true;o.remove();advancing=false;commitAdvance();}o.onclick=finish;function frame(now){if(done)return;const t=(now-start)/1000;x.fillStyle='#0B1B2A';x.fillRect(0,0,320,380);const strike=[.45,1,1.55].find(s=>t>=s&&t<s+.15);x.save();if(strike!==undefined)x.translate(Math.sin(t*160)*3,0);x.strokeStyle='#f1c453';x.lineWidth=2;x.beginPath();x.ellipse(160,265,65,15,0,0,7);x.stroke();x.fillStyle='#19344B';x.fillRect(143,171,34,59);x.fillStyle='#bbcbd6';x.fillRect(147,145,26,27);x.fillStyle='#11263A';x.fillRect(144,138,32,12);x.fillRect(151,131,18,10);x.fillStyle='#6aafe0';x.beginPath();x.moveTo(144,184);x.lineTo(112,246);x.lineTo(151,254);x.lineTo(160,230);x.lineTo(171,254);x.lineTo(210,246);x.lineTo(176,184);x.fill();x.fillStyle='#bbcbd6';x.fillRect(133,215,24,8);x.fillRect(165,215,24,8);x.fillStyle='#ffd678';x.fillRect(153,214,15,7);if(strike!==undefined){x.fillStyle='#ffd67822';x.fillRect(0,0,320,380);x.strokeStyle='#ffd678';x.lineWidth=4;x.beginPath();x.moveTo(150+Math.sin(strike*9)*45,15);x.lineTo(180,65);x.lineTo(151,85);x.lineTo(174,116);x.lineTo(160,145);x.stroke();}x.restore();x.textAlign='center';x.fillStyle='#f1c453';x.font='22px "Baloo 2",sans-serif';x.fillText('Ngưng thần · Đột phá',160,318);x.font='16px VT323,monospace';x.fillText('Chạm để bỏ qua',160,345);if(t>=2.2)finish();else requestAnimationFrame(frame);}requestAnimationFrame(frame);return true;}
 const rc=recompute;
 recompute=function(){if(!G)return;const P=G.p,h=P.hp,m=P.mhp;if(!G.tower)G.realm=realm();rc();if(G.tower)return;
  const b=1+.01*(level()-REALMS[realm()].lv);
  G.st.dmg*=b;const max=Math.round(P.mhp*b);P.mhp=max;P.hp=Math.max(0,Math.min(max,h+Math.max(0,max-m)));
 };
 const nr=newRun;
 newRun=function(...a){const result=nr.apply(this,a);if(G&&!document.body.classList.contains('pn-locked')&&!G.tower){G.realm=realm();recompute();G.p.hp=G.p.mhp;}return result};
 // Use the original G.items movement, attraction, collision and cleanup pipeline.
 const seeded=new WeakSet();
 function scatter(){const S=scope();if(!S||seeded.has(S)||G.over||G.p.dead)return;
  seeded.add(S);const pocket=!!G.world.pocket&&!G.bc?.explore,d=Math.max(0,Math.min(3,G.bc?.explore?.id??Math.floor(((G.ai?.n||1)-1)/15))),herbs=pocket?4+d:12+4*d,pills=pocket?1:3+d;
  const placed=[],C=WORLD/2;
  for(let i=0;i<herbs+pills;i++){let x,y,ok=false;
   for(let attempt=0;attempt<200;attempt++){if(pocket){const a=rand()*TAU,r=45+rand()*125;x=C+Math.cos(a)*r;y=C+Math.sin(a)*r*.75;}else{const col=i%4,row=Math.floor(i/4)%4;x=60+(col+.15+rand()*.7)*(WORLD-120)/4;y=60+(row+.15+rand()*.7)*(WORLD-120)/4;}
    if(!G.world.obs.some(o=>o.r&&Math.hypot(o.x-x,o.y-y)<o.r+18)&&!G.bc?.explore?.obs.some(o=>Math.abs(o.x-x)<(o.rx||35)+24&&Math.abs(o.y-y)<(o.ry||70)+24)&&!placed.some(o=>Math.hypot(o.x-x,o.y-y)<24)){ok=true;break;}}
   if(!ok){x=C+(i%5-2)*22;y=C+110+Math.floor(i/5)*20;}
   const it={k:i<herbs?'alchemyHerb':'alchemyPill',x,y,t:0};placed.push(it);G.items.push(it);
  }
 }
 const pick=pickItem;
 pickItem=function(it){if(it.k!=='alchemyHerb'&&it.k!=='alchemyPill')return pick.apply(this,arguments);const S=stock(),herb=it.k==='alchemyHerb';if(herb)S.herb++;else S.pills[0]++;saveSave();sfx('gem');G.nums.push({x:G.p.x,y:G.p.y-30,v:'+1 '+(herb?'Tinh Lực':names[0]),t:0,c:herb?'#78c69d':colors[0]});};
 const step=update;update=function(dt){if(G&&!G.paused&&!document.body.classList.contains('pn-locked'))scatter();const E=G?.bc?.explore;if(E&&!G.paused&&!G.over){for(const it of G.items){if(it.k!=='alchemyHerb'&&it.k!=='alchemyPill')continue;it.t+=Math.min(dt,.05);if(Math.hypot(it.x-E.x,it.y-E.y)<24){pickItem(it);it.dead=true;}}G.items=G.items.filter(it=>!it.dead);}return step.apply(this,arguments)};
 const art=new Map();
 function sprite(k){if(art.has(k))return art.get(k);const c=document.createElement('canvas');c.width=c.height=24;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  const herb=k==='herb',col=herb?'#78c69d':colors[k];x.fillStyle='#0B1B2A';
  if(herb){x.fillRect(11,5,3,17);x.fillRect(3,7,10,7);x.fillRect(13,3,8,8);x.fillRect(12,13,10,6);x.fillStyle=col;x.fillRect(4,8,7,4);x.fillRect(14,4,6,5);x.fillRect(14,14,7,3);x.fillStyle='#f1c453';x.fillRect(12,17,1,5);x.fillStyle='#d7f2e6';x.fillRect(5,8,4,1);x.fillRect(15,4,3,1);}
  else{x.fillRect(7,2,10,2);x.fillRect(3,6,18,12);x.fillRect(5,4,14,16);x.fillRect(7,20,10,2);x.fillStyle=col;x.fillRect(7,4,10,16);x.fillRect(5,7,14,10);x.fillStyle='#ffffff';x.globalAlpha=.65;x.fillRect(7,6,7,2);x.fillRect(6,8,2,4);x.globalAlpha=1;x.fillStyle='#19344B';x.fillRect(9,12,6,2);x.fillRect(11,10,2,6);x.fillStyle='#ffd678';for(let j=0;j<=k;j++)x.fillRect(6+j*3,18,2,1);}
  art.set(k,c);return c;
 }
 const itemArt=drawItem;
 drawItem=function(it){if(it.k!=='alchemyHerb'&&it.k!=='alchemyPill')return itemArt.apply(this,arguments);ctx.drawImage(sprite(it.k==='alchemyHerb'?'herb':0),it.x-7,it.y-12+Math.sin(it.t*4),14,14);};

 const render0=render;
 render=function(...a){const result=render0.apply(this,a);const E=G?.bc?.explore;if(!E||G.over||G.p.dead)return result;
  const f=cv.width,w=cv.height,L=E.wide?Math.min(f/2440,w/2440):Z,R=f/L,H=w/L,cx=E.wide?1200:Math.max(R/2,Math.min(2400-R/2,E.x)),cy=E.wide?1200:Math.max(H/2,Math.min(2400-H/2,E.y));
  const label=REALMS[realm()].n,x=E.x,y=E.y-36;
  ctx.save();ctx.setTransform(L,0,0,L,Math.round(f/2-cx*L),Math.round(w/2-cy*L));for(const it of G.items)if(it.k==='alchemyHerb'||it.k==='alchemyPill')drawItem(it);ctx.font='8px VT323, monospace';ctx.textAlign='center';ctx.textBaseline='middle';const width=ctx.measureText(label).width+8;ctx.fillStyle='#0B1B2A';ctx.fillRect(x-width/2,y-6,width,12);ctx.strokeStyle='#f1c453';ctx.lineWidth=.5;ctx.strokeRect(x-width/2,y-6,width,12);ctx.fillStyle='#ffd678';ctx.fillText(label,x,y);ctx.restore();return result;
 };

 const menu=buildMenu;
 buildMenu=function(...a){const r=menu.apply(this,a);if($('sanhWho'))$('sanhWho').querySelector('span').textContent=REALMS[realm()].n+' · cấp '+(level()-REALMS[realm()].lv+1);if($('mBest'))$('mBest').textContent=SAVE.best?'Kỷ lục: '+mmss(SAVE.best):'Chưa có kỷ lục';return r};
 function rename(root){if(!root)return;for(const e of [root,...(root.querySelectorAll?.('[aria-label],[title]')||[])])if(e.nodeType===1)for(const a of ['aria-label','title']){const v=e.getAttribute(a);if(v&&v.includes('Đạo Đồ'))e.setAttribute(a,v.replaceAll('Đạo Đồ','Cảnh Giới'));}const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.parentElement?.closest('script,style,textarea,#pn-log'))continue;if(/Đạo Đồ|ĐẠO ĐỒ/.test(n.nodeValue))n.nodeValue=n.nodeValue.replaceAll('Đạo Đồ','Cảnh Giới').replaceAll('ĐẠO ĐỒ','CẢNH GIỚI');}}
 rename(document.body);const observer=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData'){const n=m.target;if(/Đạo Đồ|ĐẠO ĐỒ/.test(n.nodeValue)&&!n.parentElement?.closest('script,style,textarea,#pn-log'))n.nodeValue=n.nodeValue.replaceAll('Đạo Đồ','Cảnh Giới').replaceAll('ĐẠO ĐỒ','CẢNH GIỚI');}else for(const n of m.addedNodes)if(n.nodeType===1)rename(n);else if(n.nodeType===3&&/Đạo Đồ/.test(n.nodeValue))n.nodeValue=n.nodeValue.replaceAll('Đạo Đồ','Cảnh Giới');}});observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 const style=document.createElement('style');style.textContent='#ddAlchemy{min-width:0;overflow-wrap:anywhere;font-family:var(--font);color:#e5edf3}#ddAlchemy .pn-row{padding:9px;margin-bottom:7px;background:#11263A;border:1px solid #19344B;border-radius:5px}#ddAlchemy canvas{width:28px;height:28px;image-rendering:pixelated;vertical-align:middle;margin-right:7px}#ddAlchemy button{white-space:normal;max-width:100%}#ddAlchemy .row{flex-wrap:wrap}#ddScr[data-progress-tab="break"] #ddList,#ddScr[data-progress-tab="break"] .card>p.sub{display:none}#ddScr[data-progress-tab="road"] #ddAlchemy{display:none}#ddProgressTabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}#ddProgressTabs button{flex:1;min-width:0}';document.head.append(style);
 const scr=$('ddScr'),card=scr?.querySelector('.card');let panel;
 function icon(k){const i=document.createElement('canvas');i.width=i.height=24;i.setAttribute('aria-label',k==='herb'?'Tinh Lực · đột phá':names[k]);i.getContext('2d').drawImage(sprite(k),0,0);return i;}
 function row(label,k){const e=document.createElement('div');e.className='pn-row';if(k!==undefined)e.append(icon(k));const s=document.createElement('span');s.textContent=label;e.append(s);return e;}
 function button(label,fn,disabled){const b=document.createElement('button');b.className='btn sm';b.textContent=label;b.disabled=!!disabled;b.onclick=fn;return b;}
 function draw(){if(!panel)return;const S=stock(),c=cost();panel.replaceChildren();
  const from=REALMS[realm()].n+' · cấp '+(S.level-REALMS[realm()].lv+1);
  const to=c?REALMS[c.tier].n+' · cấp '+(S.level+1-REALMS[c.tier].lv+1):'Đã tối đa (45)';
  const r=row(from+' → '+to);r.style.color=colors[realm()];panel.append(r);
  let craft=c?c.tier:0;
  if(c){
   panel.append(row(names[c.tier]+': '+S.pills[c.tier]+' / 1',c.tier),row('Tinh Lực: '+S.herb+' / '+c.herb,'herb'));
   // Show only the next useful recipe, including a missing precursor when needed.
   while(craft>0&&S.pills[craft-1]<3)craft--;
   const herb=craft?4+2*craft:3;
   panel.append(row('Luyện 1 '+names[craft]+': '+(craft?'3 '+names[craft-1]+' ('+S.pills[craft-1]+'/3) + ':'')+'Tinh Lực ('+S.herb+'/'+herb+')',craft));
  }else panel.append(row('Hóa Thần đã đạt cấp tối đa.'));
  const actions=document.createElement('div');actions.className='row';
  actions.append(button('Luyện đan',()=>combine(craft),!c||S.herb<(craft?4+2*craft:3)||craft>0&&S.pills[craft-1]<3),button('Đột phá',advance,!c||S.herb<c.herb||S.pills[c.tier]<1||G&&!G.over));panel.append(actions);
 }

 if(card){const tabs=document.createElement('nav');tabs.id='ddProgressTabs';tabs.className='ktabs';tabs.setAttribute('aria-label','Cảnh Giới');panel=document.createElement('div');panel.id='ddAlchemy';
  for(const [key,label] of [['break','Đột Phá'],['road','Lộ Trình']]){const b=button(label,()=>{scr.dataset.progressTab=key;for(const x of tabs.children){x.classList.toggle('on',x===b);x.setAttribute('aria-selected',String(x===b));}draw();});b.dataset.tab=key;tabs.append(b);}
  card.querySelector('h2').after(tabs);tabs.after(panel);scr.dataset.progressTab='break';tabs.firstChild.classList.add('on');
  const oldShow=show;show=function(id){const r=oldShow.apply(this,arguments);if(id==='ddScr')draw();return r;};
 }
 window.PNTProgress={version:3,scope,playerName,stock,level,realm,cost,combine,advance,sprite,draw};stock();draw();
}
 if(document.readyState==='complete')install();else addEventListener('load',install,{once:true});
})();

// Permanent realm and run level are independent; never subtract realm level from run level.
(function(){const prior=hud;hud=function(dt){const r=prior.apply(this,arguments);if(!G||G.tower)return r;const node=document.getElementById('realm');if(!node)return r;const index=window.PNTProgress?.realm?.()??G.realm,name=REALMS[index]?.n;if(name){const text=G.bc?name:name+' · cấp '+Math.max(1,G.lv|0);if(node.textContent!==text)node.textContent=text;}return r;};})();
