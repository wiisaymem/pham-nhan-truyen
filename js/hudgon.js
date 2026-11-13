'use strict';
// ───────────────────────── HUD kiểu MOBA (10/2026): máu + cấp + kinh nghiệm trên đầu nhân vật,
// bản đồ nhỏ góc trên trái, ô giữa trên gồm số quái hạ + đồng hồ + cảnh giới, nút dừng góc phải. Phía trên gần như để trống cho trận đánh.
(function(){
  const SA='max(6px,env(safe-area-inset-top))';
  const st=document.createElement('style');st.textContent=`
#top{display:block!important;padding:0!important;height:0}
#hpBar,#xpBar{display:none!important}
#row1{display:block!important}
#trPill{position:absolute;left:50%;transform:translateX(-50%);top:${SA};display:flex;flex-direction:column;align-items:center;pointer-events:none;z-index:5}
#trPill .pl{display:flex;align-items:center;gap:8px;padding:2px 12px 3px;background:linear-gradient(rgba(20,16,30,.78),rgba(10,8,16,.7));border:1px solid rgba(255,214,120,.55);border-radius:12px;box-shadow:0 2px 0 rgba(0,0,0,.35)}
#trPill .sep{width:1px;height:16px;background:rgba(255,214,120,.45)}
#trPill #timer{margin:0!important;font-size:20px!important;line-height:1.1;color:#fff}
#trPill #timer.kiep{font-size:15px!important;color:#ffd0ff}
#trPill #kills{font-size:14px!important;color:#ffe9b0}
#trPill #realm{margin-top:2px;font-size:11px!important;line-height:1;padding:1px 8px;border-radius:8px;background:rgba(10,8,16,.5);text-shadow:1px 1px 0 #000}
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
  const xp=Math.max(0,Math.min(1,(G.xp||0)/xpNeed(G.lv)));
  ctx.save();ctx.imageSmoothingEnabled=false;
  // khung
  ctx.fillStyle='rgba(12,8,18,.85)';ctx.fillRect(x0-1,y0-1,W+2,6.5);
  // máu: xanh như tướng phe mình trong MOBA, máu thấp chuyển đỏ nhấp nháy
  ctx.fillStyle='#3a1a22';ctx.fillRect(x0,y0,W,3.5);
  ctx.fillStyle='#fff1d8';ctx.fillRect(x0,y0,W*OH.lag,3.5);
  const low=hp<0.3,blink=low&&((G.t*6)|0)%2;
  ctx.fillStyle=low?(blink?'#ff6a6a':'#e8343e'):'#4fdc5c';ctx.fillRect(x0,y0,W*hp,3.5);
  ctx.fillStyle=low?'rgba(255,200,200,.5)':'rgba(220,255,200,.55)';ctx.fillRect(x0,y0,W*hp,1);
  // vạch mỗi 50 máu
  ctx.fillStyle='rgba(12,8,18,.55)';const step=50/P.mhp;for(let f=step;f<hp-0.005;f+=step)ctx.fillRect(Math.round(x0+W*f),y0+1,0.5,2.5);
  // kinh nghiệm
  ctx.fillStyle='#0e2230';ctx.fillRect(x0,y0+4.3,W,1.3);ctx.fillStyle='#7ff0e0';ctx.fillRect(x0,y0+4.3,W*xp,1.3);
  // huy hiệu cấp
  const bx=x0-4.5,by=y0+2.6;ctx.beginPath();ctx.arc(bx,by,4.6,0,Math.PI*2);ctx.fillStyle='#1a2236';ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='#f0c860';ctx.stroke();
  ctx.font='8px VT323, monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(String(G.lv),bx,by+0.5);
  ctx.restore()}
const _moHG=mapOver;mapOver=function(){_moHG();try{ohBar()}catch(e){}};

// bảng Hệ/Môn lùi xuống khi có thanh máu boss
let hgBoss=null;
const _hudHG=hud;hud=function(dt){_hudHG(dt);const b=$('bossBar'),on=!!(b&&!b.hidden);if(on!==hgBoss){hgBoss=on;$('hud').classList.toggle('hasBoss',on)}};

// ── bảng Hệ/Môn thu thành cột ô biểu tượng 24px: số đếm ở góc, mốc thể hiện bằng viền (1 màu, 2 sáng, 3 vàng phát sáng), chưa đạt mốc thì mờ
(function(){const st=document.createElement('style');st.textContent=`
#dpHud{gap:3px!important;left:6px!important}
#dpHud .tc{position:relative;width:24px;height:24px;display:flex!important;align-items:center;justify-content:center;padding:0!important;border-radius:6px!important;border:2px solid var(--c)!important;background:rgba(14,10,22,.62)!important;opacity:.55}
#dpHud .tc img{width:16px!important;height:16px!important;margin:0!important;vertical-align:0!important}
#dpHud .tc b{position:absolute;right:-4px;bottom:-4px;min-width:12px;height:12px;padding:0 2px;border-radius:6px;background:#140c18;border:1px solid var(--c);font:700 9px/10px var(--font);color:#fff;text-align:center;text-shadow:none}
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
