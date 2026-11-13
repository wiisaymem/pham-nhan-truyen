'use strict';
// ───────────────────────── Linh thú độc nhất: mở bằng Ẩn Nhiệm, không mua được
Object.assign(PETS,{
  kimquy:{n:'Kim Quy',spr:'pkq',gc:'#ffe680',cost:0,uniq:1,fly:0,d:'Cứ 10 giây kết khiên vàng chặn trọn một đòn đánh. Đào được kho báu nhiều hơn.',q:'Giải Ngũ Hành Ấn khi đang dẫn Huyền Quy.'},
  ngugiong:{n:'Ngựa Sắt Gióng',spr:'png',gc:'#ff9a3a',cost:0,uniq:1,fly:0,d:'Cứ 5 giây phi nước đại xuyên qua yêu quái, vó ngựa để lại lửa.',q:'Trảm 3 boss trong một trận mà không dùng đại chiêu.'},
  chimlac:{n:'Chim Lạc',spr:'plac',gc:'#ffd45a',cost:0,uniq:1,fly:1,d:'Bay mổ yêu quái. Biết trước chỗ mọi cơ quan bí ẩn trên bản đồ.',q:'Giải đủ mọi kiểu cơ quan bí ẩn.'},
  cuuviho:{n:'Cửu Vĩ Hồ Con',spr:'pcv',gc:'#ffb0e8',cost:0,uniq:1,fly:0,d:'Ba ngọn hồ hỏa xoay quanh chủ, đốt yêu quái chạm vào.',q:'Đuổi kịp Linh Hồ Dẫn Đường 5 lần.'},
});
const PET_UNIQ=['kimquy','ngugiong','chimlac','cuuviho'];
for(const k of PET_UNIQ){PET_KEYS.push(k);const D=PETS[k];D.n=i18n('linhthu.'+k,D.n);D.d=i18n('linhthu.'+k+'.mota',D.d);D.q=i18n('linhthu.'+k+'.an',D.q)}
const _pbU=petBuy;petBuy=function(k){if(PETS[k].uniq)return false;return _pbU(k)};
function petUnlock(k){if(petLv(k))return;petSave().lv[k]=1;saveSave();const D=PETS[k];
  if(G&&!G.over){G.cine={t:0,dur:2.8,pet:k};sfx('realm');flash('#fff6c0',0.5);if(typeof buzz==='function')buzz([60,40,120]);return}
  announce(i18nf('linhthu.mo','Ẩn Nhiệm hoàn thành! Linh thú độc nhất: {0}',D.n),'realm')}

// ── điều kiện Ẩn Nhiệm
const _psU=pzSolve;
pzSolve=function(M,x,y){const was=M.solved;_psU(M,x,y);if(was)return;
  if(M.ty==='nguhanh'&&G.pet&&G.pet.k==='huyenquy')petUnlock('kimquy');
  const L=bcLog();if(PZ_TYPES.every(t=>L.pz[t]))petUnlock('chimlac');
  if((L.pz.ho|0)>=5)petUnlock('cuuviho')};
const _ubU=useBurst;useBurst=function(){const r=_ubU();if(r&&G)G.ultUsed=1;return r};
const _upU=update;update=function(dt){_upU(dt);if(G&&!G.over&&!G.tower&&G.bossKills>=3&&!G.ultUsed&&!petLv('ngugiong'))petUnlock('ngugiong')};
// Chim Lạc: biết trước cơ quan
const _piU=pzInit;pzInit=function(){_piU();if(G.pet&&G.pet.k==='chimlac')for(const M of G.pz)M.seen=1};

// ── kỹ năng
const _updPU=updatePet;
updatePet=function(dt){_updPU(dt);const Q=G.pet;if(!Q||G.p.dead||!PETS[Q.k].uniq)return;const P=G.p,pw=petPower()*(1+G.realm*0.25);G.src='pet';
  if(Q.k==='kimquy'){Q.cd2-=0;if(Q.cd2<=0&&!P.shield){Q.cd2=10;P.shield=1;Q.atkT=0.5;sfx('bell');G.fx.push({k:'spark',x:P.x,y:P.y-10,t:0,dur:0.3,c:'#ffe680'})}if(Q.cd2<=0)Q.cd2=0.5}
  else if(Q.k==='ngugiong'){if(Q.dash){const D=Q.dash;D.t+=dt;const k=Math.min(1,D.t/0.35);Q.x=D.x0+(D.x1-D.x0)*k;Q.y=D.y0+(D.y1-D.y0)*k;Q.face=D.x1>D.x0?1:-1;
      forNear(Q.x,Q.y,30,e=>{if(!D.hit.has(e)&&Math.hypot(e.x-Q.x,e.y-Q.y)<14+e.r){D.hit.add(e);hurtE(e,18*pw,'hoa',{kb:60,kx:Q.x,ky:Q.y})}});
      if(rand()<0.5&&G.zones.length<140)G.zones.push({k:'burn',x:Q.x,y:Q.y,r:10,t:0,dur:1.2,dps:5*pw,el:'hoa',tick:0,src:'pet'});if(k>=1)Q.dash=null}
    else if(Q.cd2<=0){const e=nearestE(Q.x,Q.y,170);Q.cd2=e?5:0.5;if(e){const a=Math.atan2(e.y-Q.y,e.x-Q.x);Q.dash={t:0,x0:Q.x,y0:Q.y,x1:Q.x+Math.cos(a)*140,y1:Q.y+Math.sin(a)*140,hit:new Set};Q.atkT=0.35;sfx('fire')}}}
  else if(Q.k==='chimlac'){if(Q.cd<=0){Q.cd=1.1;const e=nearestE(Q.x,Q.y,110);if(e){Q.atkT=0.35;Q.face=e.x>Q.x?1:-1;Q.x+=(e.x-Q.x)*0.6;Q.y+=(e.y-Q.y)*0.6;hurtE(e,12*pw,'kim',{kb:20,kx:Q.x,ky:Q.y});G.fx.push({k:'spark',x:e.x,y:e.y-e.r,t:0,dur:0.2,c:'#ffd45a'})}}}
  else if(Q.k==='cuuviho'){Q.fo=(Q.fo||0)+dt*2.6;Q.hc=Q.hc||new Map;for(let i=0;i<3;i++){const a=Q.fo+i/3*TAU,x=P.x+Math.cos(a)*30,y=P.y-6+Math.sin(a)*20;
      forNear(x,y,24,e=>{if(Math.hypot(e.x-x,e.y-y)<9+e.r&&(G.t-(Q.hc.get(e)||-9))>0.5){Q.hc.set(e,G.t);hurtE(e,8*pw,'hoa',{kb:16,kx:x,ky:y})}})}
    if(Q.hc.size>300)Q.hc.clear()}
  G.src=null};
const _hpU=hurtP;
hurtP=function(dmg,src){const P=G&&G.p;if(P&&P.shield&&!P.dead&&P.inv<=0&&!G.god){P.shield=0;P.inv=0.5;sfx('bell');burstP(P.x,P.y-10,24,['#ffe680','#ffffff'],{spd:90,life:0.4});return}_hpU(dmg,src)};
// đào bảo nhiều hơn với Kim Quy
const _ptU=petTask;petTask=function(Q,dt,D,pw){if(Q.k==='kimquy'&&Q.digT!==undefined&&!Q.task)Q.digT-=dt*0.6;return _ptU(Q,dt,D,pw)};

// ── vẽ: khiên vàng, hồ hỏa
const _dpetU=drawPet;
drawPet=function(){_dpetU();const Q=G.pet;if(!Q)return;const P=G.p;
  if(P.shield){const a=0.5+Math.sin(G.t*5)*0.15;fxD('fx_c_kiem',P.x,P.y-10,34,{rot:G.t,alpha:a,add:1,tint:'gold',sq:0.9});glow(P.x,P.y-10,18,'#ffe680',0.35)}
  if(Q.k==='cuuviho'){for(let i=0;i<3;i++){const a=(Q.fo||0)+i/3*TAU,x=P.x+Math.cos(a)*30,y=P.y-6+Math.sin(a)*20;glow(x,y,9,'#ffb0e8',0.8);fxD('fx_fb'+(1+(((G.t*12)|0)+i)%3),x,y,10,{rot:a+Math.PI/2,tint:'pink'})}}};
// màn hình nhận linh thú
const _dcU=drawCine;
drawCine=function(c){if(!c.pet){_dcU(c);return}const t=c.t,A=Math.min(1,t/0.25)*(t>2.3?Math.max(0,1-(t-2.3)/0.5):1),D=PETS[c.pet],cx=VW/2,cy=VH*0.42;
  ctx.globalAlpha=0.6*A;ctx.fillStyle='#120a20';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1;
  fxD('fx_c_bagua',cx,cy+30,VH*0.45,{sq:0.5,rot:t*0.6,alpha:0.5*A,add:1});glow(cx,cy,70,D.gc,0.8*A);
  const k=Math.min(1,t/0.6),sc=3.2+(1-(1-k)**3)*1.2,fr=((t*8)|0)%4;ctx.save();ctx.translate(cx,cy+20);ctx.scale(sc,sc);ctx.globalAlpha=A;drawS(`e_${D.spr}_walk${fr}`,0,0,{});ctx.restore();ctx.globalAlpha=1;
  if(t>0.5){const q=Math.min(1,(t-0.5)/0.35);ctx.save();ctx.translate(VW/2,VH*0.2);ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=A*q;
    ctx.font="800 11px 'Baloo 2',sans-serif";ctx.fillStyle='#ffe9a8';ctx.fillText(i18n('linhthu.docnhat','— LINH THÚ ĐỘC NHẤT —'),0,-16);
    ctx.font="800 20px 'Baloo 2',sans-serif";ctx.lineWidth=4;ctx.strokeStyle='#5a2a0a';ctx.strokeText(D.n,0,4);ctx.fillStyle='#ffe066';ctx.fillText(D.n,0,4);ctx.restore();pzPanelAt(D.d,VH*0.64,A*q)}
  ctx.globalAlpha=1};

// ── màn Linh Thú: linh thú độc nhất hiện gợi ý Ẩn Nhiệm thay vì nút mua
buildPets=function(){
  const ps=petSave();$('ptLt').textContent=SAVE.lt;const L=$('ptList');L.innerHTML='';
  for(const k of PET_KEYS){const D=PETS[k],lv=petLv(k);if(k===PET_UNIQ[0])L.appendChild(elx('div','osec',i18n('linhthu.docnhatT','Linh thú độc nhất · mở bằng Ẩn Nhiệm')));
    const row=elx('div','ptrow');row.appendChild(petCanvas(k));
    if(!lv)row.lastChild.style.filter=D.uniq?'brightness(0)':'brightness(.35)';
    row.appendChild(elx('div','',`<b>${!lv&&D.uniq?'???':D.n}</b>${lv?i18nf('ui.ui2.cap',' · cấp {0}/{1}',lv,PET_MAX):''}<small>${!lv&&D.uniq?i18n('linhthu.anT','Ẩn Nhiệm: ')+D.q:D.d}</small>`));
    if(!lv&&!D.uniq){const b=elx('button','btn',`${D.cost} ◈`);b.disabled=SAVE.lt<D.cost;b.onclick=()=>{if(petBuy(k)){sfx('chest');buildPets()}};row.appendChild(b)}
    else if(lv){const be=elx('button','btn alt',ps.eq===k?i18n('ui.ui2.dangDan','Đang dẫn'):i18n('ui.ui2.dan','Dẫn'));be.disabled=ps.eq===k;be.onclick=()=>{ps.eq=k;saveSave();sfx('pick');buildPets()};
      const bu=elx('button','btn',lv>=PET_MAX?i18n('ui.ui2.toiDa','Tối đa'):`+1 · ${petCost(lv)} ◈`);bu.disabled=lv>=PET_MAX||SAVE.lt<petCost(lv);bu.onclick=()=>{if(petUp(k)){sfx('level');buildPets()}};
      const col=elx('div','');col.style.display='grid';col.style.gap='4px';col.style.flex='none';col.append(be,bu);row.appendChild(col)}
    L.appendChild(row)}
  show('linhthu')};
