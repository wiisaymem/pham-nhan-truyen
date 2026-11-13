'use strict';
// ───────────────────────── Vạn Kiếp Tu Tiên: logic trận đấu (kiểu Vampire Survivors)
let G=null;
let VW=245, VH=500; // kích thước khung nhìn theo đơn vị thế giới (render.js cập nhật)

// ── lưu trữ
function defSave(){return{lt:0,up:{},best:0,bestLv:0,wins:0,unl:{},opt:{mus:1,sfx:1},runs:0,char:'lamphong',map:'daohoa',seen:0}}
function loadSave(){try{const s=JSON.parse(localStorage.getItem('vntt1')||'null');if(s&&typeof s==='object')return Object.assign(defSave(),s)}catch(e){}return defSave()}
let SAVE=loadSave();
function saveSave(){SAVE.upd=Date.now();try{localStorage.setItem('vntt1',JSON.stringify(SAVE))}catch(e){}if(typeof cloudQueue==='function')cloudQueue()}
const upLv=k=>SAVE.up[k]|0;
const charUnlocked=id=>!CHARS[id].lock||SAVE.unl[id];

// ── thế giới: chướng ngại (cây, đá, hồ)
const OCELL=64;
function genWorld(mapId,seed){
  const R=mulberry32(seed), MP=MAPS[mapId], C=WORLD/2, obs=[];
  const clear=(x,y,r)=>Math.hypot(x-C,y-C)>130+r;
  const free=(x,y,r,g)=>!obs.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+r+g);
  for(let i=0;i<60&&obs.length<14;i++){const r=26+R()*44,x=150+R()*(WORLD-300),y=150+R()*(WORLD-300);if(clear(x,y,r)&&free(x,y,r,60))obs.push({k:'pond',x,y,r,w:R()*100})}
  const wp=L=>{let t=L.reduce((a,b)=>a+b[1],0),r=R()*t;for(const [k,w] of L){r-=w;if(r<=0)return k}return L[0][0]};
  const RAD={p_peach:6,p_peach2:4,p_pine:5,p_snowpine:5,p_bamboo:4,p_boulder:8,p_rocks:7,p_stump:6,p_bush:6,p_jade:6,p_ice:6,p_lantern:4,p_gate:0,p_cauldron:6,p_pillar:4,p_maple:6,p_deadtree:5,p_sapling:3,p_burnstump:6,p_obsidian:8,p_vrocks:7,p_firecrystal:5,p_lavarock:0,p_brazier:4,p_firealtar:6,p_redgate:0,p_phoenixpillar:4,p_crust:0};
  const SC={p_lantern:0.5,p_gate:1.25,p_pillar:0.65,p_cauldron:0.55,p_bamboo:0.85,p_jade:0.65,p_ice:0.75,p_rocks:0.7,p_boulder:0.8,p_bush:0.7,p_stump:0.7,p_peach2:0.9,p_sapling:0.8,p_burnstump:0.7,p_obsidian:0.8,p_vrocks:0.7,p_firecrystal:0.65,p_brazier:0.5,p_firealtar:0.6,p_redgate:1.25,p_phoenixpillar:0.65,p_crust:0.7,p_lavarock:0.4};
  for(let c=0;c<80;c++){const cx=60+R()*(WORLD-120),cy=60+R()*(WORLD-120),n=2+((R()*6)|0);
    for(let i=0;i<n;i++){const x=cx+(R()-.5)*120,y=cy+(R()-.5)*120,spr=wp(MP.trees),r=RAD[spr];if(x<30||y<30||x>WORLD-30||y>WORLD-30||!clear(x,y,8)||!free(x,y,r,10))continue;obs.push({k:'prop',x,y,r,spr,sc:SC[spr]})}}
  for(let i=0;i<(MP.rocky?170:110);i++){const x=40+R()*(WORLD-80),y=40+R()*(WORLD-80),spr=wp(MP.rocks),r=RAD[spr];if(!clear(x,y,8)||!free(x,y,r,10))continue;obs.push({k:'prop',x,y,r,spr,sc:SC[spr]})}
  for(let i=0;i<45;i++){const x=60+R()*(WORLD-120),y=60+R()*(WORLD-120),spr=wp(MP.props),r=RAD[spr];if(!clear(x,y,8)||!free(x,y,Math.max(r,8),30))continue;obs.push({k:'prop',x,y,r,spr,deco:!r,sc:SC[spr]})}
  // vật trang trí trước điểm xuất phát
  obs.push({k:'prop',x:C,y:C-60,r:0,spr:'p_gate',deco:1,sc:1.25});obs.push({k:'prop',x:C-36,y:C-52,r:4,spr:'p_lantern',sc:0.5});obs.push({k:'prop',x:C+36,y:C-52,r:4,spr:'p_lantern',sc:0.5});
  // sen trên hồ
  for(const o of obs.filter(o=>o.k==='pond'))for(let i=0;i<3;i++){const a=R()*TAU,d=o.r*(0.3+R()*0.45);obs.push({k:'prop',x:o.x+Math.cos(a)*d,y:o.y+Math.sin(a)*d,r:0,spr:MP.lava?'p_lavarock':MP.ice?'p_ice':'p_lotus',deco:1,sc:MP.lava?0.4:MP.ice?0.5:0.55})}
  const gw=Math.ceil(WORLD/OCELL), grid=Array.from({length:gw*gw},()=>[]);
  for(const o of obs){const x0=Math.max(0,((o.x-o.r)/OCELL)|0),x1=Math.min(gw-1,((o.x+o.r)/OCELL)|0),y0=Math.max(0,((o.y-o.r)/OCELL)|0),y1=Math.min(gw-1,((o.y+o.r)/OCELL)|0);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)grid[y*gw+x].push(o)}
  return{obs,grid,gw,seed,map:mapId};
}
function obsNear(x,y){const W=G.world,cx=(x/OCELL)|0,cy=(y/OCELL)|0;if(cx<0||cy<0||cx>=W.gw||cy>=W.gw)return[];return W.grid[cy*W.gw+cx]}
function collideObs(ent,r){
  const cx=(ent.x/OCELL)|0,cy=(ent.y/OCELL)|0,W=G.world;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W.gw||y>=W.gw)continue;
    for(const o of W.grid[y*W.gw+x]){if(o.deco)continue;const ddx=ent.x-o.x,ddy=ent.y-o.y,d=Math.hypot(ddx,ddy),m=o.r*(o.k==='pond'?0.92:1)+r;
      if(d<m&&d>0.001){const p=(m-d)/d;ent.x+=ddx*p;ent.y+=ddy*p;
        // trượt quanh chướng ngại lớn
        if(o.k==='pond'&&ent.vx!==undefined){const tx=-ddy/d,ty=ddx/d,s=Math.sign(tx*(ent.vx||0)+ty*(ent.vy||0))||1;ent.x+=tx*s*0.6;ent.y+=ty*s*0.6}}}}
  ent.x=clamp(ent.x,12,WORLD-12); ent.y=clamp(ent.y,12,WORLD-12);
}
function inPond(x,y,pad){for(const o of obsNear(x,y))if(!o.deco&&Math.hypot(o.x-x,o.y-y)<o.r+pad)return true;return false}

// ── bắt đầu trận
function newRun(charId,mapId,towerF,aiN){
  const seed=(Math.random()*1e9)|0, ch=CHARS[charId];
  const AI=towerF?null:aiSpec(aiN||aiSave().sel||1); if(AI)mapId=AI.map;
  G={t:0,ch:charId,mapId,world:null,lv:1,xp:0,realm:0,kills:0,
    p:{x:WORLD/2,y:WORLD/2,r:6,hp:ch.hp,mhp:ch.hp,face:1,dir:'D',fx:0,fy:1,mv:0,anim:0,hurtT:0,dead:false,ch:charId,vx:0,vy:0},
    w:{},pass:{},st:{},e:[],dying:[],pr:[],es:[],zones:[],fx:[],gems:[],items:[],nums:[],
    spT:0,evI:0,bossI:0,boss:null,pendLv:0,burst:0,shake:0,flash:0,flashC:'#fff',kiep:null,over:false,win:false,
    src:null,dmgBy:{},killBy:{},kt:[],maxHit:0,taken:0,rer:1+upLv('reroll'),ban:2+upLv('ban'),banned:{},cine:null,lt:0,bossKills:0,explored:new Uint8Array(Math.ceil(WORLD/32)**2),paused:false,annQ:[],ltBonus:0,later:[]};
  G.world=genWorld(mapId,seed);
  G.tower=towerF?towerSpec(towerF):null; G.ai=AI;
  addWeapon(ch.w);
  recompute(); G.p.hp=G.p.mhp;
  petInit();
  SAVE.runs++; saveSave();
}
function addWeapon(k){G.w[k]={lv:1,cd:0.4,orb:[]};}
const RUN_DMG=0.66; // cân bằng 10/2026: công pháp trong trận yếu đi, sức mạnh lâu dài đến từ Động Phủ
function recompute(){
  const P=G.p, pl=k=>G.pass[k]|0, ch=CHARS[G.ch];
  const S=gearStats(), T=G.tower;
  G.st={
    dmg:RUN_DMG*(1+pl('kiemtam')*0.07)*(1+upLv('dmg')*0.04)*(1+G.realm*0.08)*(1+(S.dmg||0)),
    area:1+pl('hoalinh')*0.08+upLv('area')*0.02+(S.area||0),
    crit:0.03+pl('loithe')*0.05+upLv('crit')*0.01+(S.crit||0),
    dur:(1+pl('thuynguyet')*0.1)*(G.ch==='hanbang'?1.3:1),
    amt:(pl('thuynguyet')>=3?1:0)+(pl('thuynguyet')>=5?1:0),
    regen:pl('moclinh')*0.2+upLv('regen')*0.1+(G.ch==='linhnhi'?0.4:0)+(S.regen||0),
    armor:pl('kimcuong')+upLv('armor')*0.5+(G.ch==='loichan'?2:0)+(S.armor||0),
    spd:62*ch.spd*(1+pl('thanhanh')*0.06)*(1+upLv('spd')*0.02)*(1+(S.spd||0)),
    mag:30*(1+pl('tulinh')*0.25)*(1+upLv('mag')*0.08)*(G.ch==='bachho'?1.4:1)*(1+(S.mag||0)),
    cd:(1-pl('daotam')*0.045)*(1-upLv('cd')*0.01)*(G.ch==='modung'?0.92:1)*Math.max(0.6,1-(S.cd||0))*(T&&T.mod.id==='phuc'?0.8:1),
    xp:(1+upLv('xp')*0.03)*(1+(S.xp||0))*(T?1+0.12*(T.f-1):1),
    luck:S.luck||0,
  };
  const mhp=Math.round(ch.hp*(1+pl('thonguyen')*0.1)*(1+upLv('hp')*0.04)*(1+(S.hp||0))+G.realm*20);
  if(mhp>P.mhp)P.hp+=mhp-P.mhp; P.mhp=mhp; P.hp=Math.min(P.hp,mhp);
}
const wSlots=()=>Math.min(MAX_W,BASE_SLOTS+G.realm);

// ── lưới không gian cho yêu quái
const HC=40; let HASH=new Map();
function buildHash(){HASH=new Map();for(const e of G.e){const k=((e.x/HC)|0)*4096+((e.y/HC)|0);let a=HASH.get(k);if(!a){a=[];HASH.set(k,a)}a.push(e)}}
function forNear(x,y,r,f){const x0=((x-r)/HC)|0,x1=((x+r)/HC)|0,y0=((y-r)/HC)|0,y1=((y+r)/HC)|0;
  for(let cx=x0;cx<=x1;cx++)for(let cy=y0;cy<=y1;cy++){const a=HASH.get(cx*4096+cy);if(a)for(const e of a)if(!e.dead&&f(e)===false)return}}
function nearestE(x,y,rng,skip){let best=null,bd=rng*rng;for(const e of G.e){if(e.dead||(skip&&skip.has(e)))continue;const d=(e.x-x)**2+(e.y-y)**2;if(d<bd){bd=d;best=e}}return best}
function nearestN(x,y,rng,n){const a=[];for(const e of G.e){if(e.dead)continue;const d=(e.x-x)**2+(e.y-y)**2;if(d<rng*rng)a.push([d,e])}a.sort((p,q)=>p[0]-q[0]);return a.slice(0,n).map(v=>v[1])}

// ── yêu quái
function spawnEnemy(type,x,y,o={}){
  const d=ENEMY[type], tm=effT()/60, T=G.tower;
  if(!d.boss&&G.e.length>=(G.ecap||420))return null;
  // 10/2026: đầu ván dễ thở hơn chút (máu ×0.85 lúc đầu, về ×1 ở phút 3); từ phút 6 tăng thêm để bù Cơ Duyên và Hợp Kích
  let hpm=d.boss?2.5:(1+tm*0.6+Math.max(0,tm-4)*0.7+Math.max(0,tm-9)*1.1+(T?0:Math.max(0,tm-6)*0.4))*(T?1:0.85+0.05*Math.min(3,tm));
  if(G.ai)hpm*=d.boss?G.ai.boss:G.ai.hp;
  if(T){hpm*=d.boss?T.bossHp:T.hp;if(T.mod.id==='giap'&&!d.boss)hpm*=1.5}
  const e={t:type,d,x,y,vx:0,vy:0,kx:0,ky:0,hp:d.hp*hpm,mhp:d.hp*hpm,r:d.r,el:d.el,spd:d.spd*(1+Math.min(0.3,tm*0.02))*(G.ai?G.ai.spd:1)*(0.92+rand()*0.16),
    dmg:d.dmg*(1+tm*0.075)*(G.ai?G.ai.dmg:1)*(d.boss?1.3:1),slowT:0,rootT:0,flash:0,hitT:0,orbT:0,dead:false,dieT:0,face:1,anim:rand()*4,ph:rand()*TAU,st:0,stT:0,cd:1+rand()*2,cd2:3+rand()*3,cd3:6};
  if(o.elite){e.hp*=8;e.mhp*=8;e.elite=1;e.r*=1.3}
  if(T&&T.mod.id==='hoa'&&!d.boss)e.el='hoa';
  if(T&&T.mod.id==='toc')e.spd*=1.3;
  if(type==='tamma'){e.el=CHARS[G.ch]?WEAP[CHARS[G.ch].w].el:null}
  G.e.push(e); return e;
}
function spawnRingPos(dist){
  for(let k=0;k<12;k++){const a=rand()*TAU,x=G.p.x+Math.cos(a)*dist,y=G.p.y+Math.sin(a)*dist;
    if(x>15&&y>15&&x<WORLD-15&&y<WORLD-15&&!inPond(x,y,6))return[x,y]}
  const a=rand()*TAU;return[clamp(G.p.x+Math.cos(a)*dist,15,WORLD-15),clamp(G.p.y+Math.sin(a)*dist,15,WORLD-15)];
}
const spawnDist=()=>Math.hypot(VW,VH)/2+18;
function rollType(){const t=effT();let tot=0;const L=[];for(const [s,k,w] of SPAWN_TABLE)if(t>=s){const ww=w*(t-s<60?0.5+0.5*(t-s)/60:1);L.push([k,ww]);tot+=ww}
  let r=rand()*tot;for(const [k,w] of L){r-=w;if(r<=0)return k}return 'thu'}
function updateSpawns(dt){
  if(G.kiep)return;
  const T=G.tower, t=T?effT():G.t, tm=t/60;
  // boss
  if(T){if(!G.bossI&&G.t>=TOWER_T){G.bossI=1;const k=T.boss;const [x,y]=spawnRingPos(spawnDist()+20);G.boss=spawnEnemy(k,x,y);announce(i18nf('tb.thapboss','Tầng {0}: {1}!',T.f,ENEMY[k].n),'boss');sfx('roar');shake(0.5);musicMode('boss')}}
  else if(G.bossI<BOSSES.length&&t>=BOSSES[G.bossI][0]){const k=BOSSES[G.bossI][1];G.bossI++;const [x,y]=spawnRingPos(spawnDist()+20);G.boss=spawnEnemy(k,x,y);announce(i18nf('tb.bossra','{0} xuất hiện!',ENEMY[k].n),'boss');sfx('roar');shake(0.5);musicMode('boss')}
  // sự kiện vây quanh
  if(!T&&G.evI<EVENTS.length&&t>=EVENTS[G.evI][0]){const [,kind,k,n]=EVENTS[G.evI];G.evI++;
    if(kind==='ring'){announce(i18n('tb.vaychet','Yêu quái vây quanh!'),'warn');for(let i=0;i<n;i++){const a=i/n*TAU,x=G.p.x+Math.cos(a)*170,y=G.p.y+Math.sin(a)*170;if(!inPond(x,y,4))spawnEnemy(k,clamp(x,15,WORLD-15),clamp(y,15,WORLD-15))}}
    else{announce(i18n('tb.baythu','Bầy yêu thú tràn tới!'),'warn');const a=rand()*TAU,cx=G.p.x+Math.cos(a)*spawnDist(),cy=G.p.y+Math.sin(a)*spawnDist();for(let i=0;i<n;i++){const x=cx+(rand()-.5)*80,y=cy+(rand()-.5)*80;if(!inPond(x,y,4))spawnEnemy(k,clamp(x,15,WORLD-15),clamp(y,15,WORLD-15))}}}
  // quái cuối giờ: tinh anh
  G.spT-=dt; if(G.spT>0)return; G.spT=0.2;
  let target=Math.min(380,26+tm*26+Math.max(0,tm-8)*14);
  if(!T&&t>=RUN_T)target*=0.4; else if(G.boss&&!G.boss.dead)target*=T?0.45:0.7;
  const n=Math.min(10,Math.ceil((target-G.e.length)/4));
  for(let i=0;i<n;i++){const [x,y]=spawnRingPos(spawnDist());spawnEnemy(rollType(),x,y,{elite:rand()<(0.004+tm*0.0006)*(T&&T.mod.id==='dem'?5:1)*(G.dkE||1)})}
}

// ── sát thương
function hurtE(e,base,el,o={}){
  if(e.dead)return 0;
  let m=elMul(el,e.el), d=base*G.st.dmg*m*(0.9+rand()*0.2)*(typeof dpMul==='function'?dpMul(e,el,o):1);
  if(el==='kim'&&G.ch==='lamphong')d*=1.15;
  let crit=rand()<G.st.crit,cm=G.st.critM||2; if(typeof dpCrit==='function'&&dpCrit(e,el)){crit=true;cm=3} if(crit)d*=cm;
  if(e.d.ai==='shield'&&o.fx!==undefined&&(o.fx-e.x)*e.face>0)d*=0.35;
  {const sk=G.src||'khac',real=Math.min(d,Math.max(0,e.hp));G.dmgBy[sk]=(G.dmgBy[sk]||0)+real;if(d>G.maxHit)G.maxHit=d}
  e.hp-=d; e.flash=0.1; if(typeof vfxHit==='function')vfxHit(e,el,crit);
  if(G.nums.length<70||crit)G.nums.push({x:e.x+(rand()-.5)*6,y:e.y-e.r*1.6,v:Math.round(d),t:0,c:crit?'#ffe14a':m>1?'#ff9a3d':m<1?'#b9c4d0':'#ffffff',big:crit||e.d.boss});
  if(o.kb){const k=e.d.boss?0.12:e.d.heavy?0.3:1,   // thủ lĩnh bị đẩy lùi nhẹ (12%) thay vì miễn nhiễm
    dx=e.x-(o.kx??G.p.x),dy=e.y-(o.ky??G.p.y),dd=Math.hypot(dx,dy)||1;e.kx+=dx/dd*o.kb*k;e.ky+=dy/dd*o.kb*k}
  if(typeof dpOnHit==='function')dpOnHit(e,el,d,o);
  if(el&&!o.rx&&typeof nhHit==='function')nhHit(e,el);
  if(e.hp<=0)killE(e); else if(rand()<0.25)sfx('hit');
  return d;
}
// bảo rương từ tinh anh/linh thú: tối đa 1 rương mỗi 55 giây (boss luôn rơi)
function tryChest(x,y){if(G.t-(G.chestT??-99)<55)return false;G.chestT=G.t;G.items.push({k:'chest',x,y,t:0});return true}
function killE(e){
  if(e.dead)return; e.dead=true; e.dieT=0; G.kills++; {const sk=G.src||'khac';G.killBy[sk]=(G.killBy[sk]||0)+1;const b=(G.t/30)|0;G.kt[b]=(G.kt[b]||0)+1;if(e.d.boss)(G.bossT=G.bossT||[]).push([G.t,e.t])} G.dying.push(e); if(typeof vfxKill==='function')vfxKill(e);
  G.burst=Math.min(100,G.burst+0.12);
  const d=e.d;
  if(d.boss){
    sfx('bigkill'); shake(0.6); G.fx.push({k:'bossdie',x:e.x,y:e.y,r:e.r,el:e.el,bt:e.t,t:0,dur:1.4}); flash('#fff8d0',0.5); if(typeof buzz==='function')buzz([40,40,80]);
    for(let i=0;i<24;i++)dropGem(e.x+(rand()-.5)*60,e.y+(rand()-.5)*60,i<4?25:5);
    if(e.t!=='tamma')G.items.push({k:'chest',x:e.x,y:e.y,t:0});
    G.bossKills++; G.lt+=60;
    if(G.boss===e)G.boss=null;
    announce(i18nf('tb.tramboss','Đã trảm {0}!',d.n),'good');
    if(G.tower){endRun(true);return}
    if(e.t==='maton')startKiep(); else if(!G.kiep)musicMode(G.t>450?'run2':'run');
  }else{
    if(rand()<0.25)sfx('kill');
    let v=d.xp*(e.elite?10:1)*(G.tower&&G.tower.mod.id==='giap'?1.5:1)*(G.ai&&G.ai.xp||1);
    dropGem(e.x,e.y,v);
    if(e.elite&&!tryChest(e.x,e.y))dropGem(e.x+6,e.y,25);
    else if(rand()<0.011&&!(G.tower&&G.tower.mod.id==='vo'))G.items.push({k:'heal',x:e.x,y:e.y,t:0});
    else if(rand()<0.0025)G.items.push({k:'magnet',x:e.x,y:e.y,t:0});
  }
}
function dropGem(x,y,v){
  if(G.gems.length>350){let best=null,bd=1e9;for(let i=0;i<20;i++){const g=G.gems[(rand()*G.gems.length)|0];const dd=(g.x-x)**2+(g.y-y)**2;if(dd<bd){bd=dd;best=g}}if(best){best.v+=v;return}}
  G.drop=(G.drop||0)+v; G.gems.push({x,y,v,mag:0,t:rand()*3});
}
function hurtP(dmg,src){
  const P=G.p; if(P.dead||G.over||P.inv>0||G.god)return;
  const d=Math.max(1,dmg-G.st.armor);
  P.hp-=d; G.taken+=d; P.hurtT=0.25; if(typeof buzz==='function'&&d>=6)buzz(d>=15?60:25); if(src&&G.w.thothuan&&G.w.thothuan.evo&&!src.dead){const o=G.src;G.src='thothuan';hurtE(src,dmg*2,'tho');G.src=o} P.inv=0.06; sfx('ouch');
  if(G.nums.length<80)G.nums.push({x:P.x,y:P.y-30,v:Math.round(d),t:0,c:'#ff5a5a'});
  if(P.hp<=0){P.hp=0;P.dead=true;P.deadT=0;endRun(false)}
}

// ── công pháp
function fireWeapon(k,w){
  const s=WEAP[k].s(w.lv), P=G.p, st=G.st, el=WEAP[k].el, A=st.area; G.src=k;
  switch(k){
    case 'phikiem':{const n=s.n+st.amt+(st.kiemAmt||0),T=nearestN(P.x,P.y,230,n);if(!T.length)return 0.2;
      for(let i=0;i<n;i++){const tg=T[i%T.length],a=Math.atan2(tg.y-P.y,tg.x-P.x)+(i>=T.length?(rand()-.5)*0.5:0);
        G.pr.push({k:'sword',x:P.x,y:P.y-8,vx:Math.cos(a)*s.spd,vy:Math.sin(a)*s.spd,dmg:s.dmg*(w.evo?1.5:1),el,pierce:s.pierce+(st.kiemP||0),life:s.life,r:5,hit:[]})}
      if(w.evo){const m=10,o=G.t*2;for(let i=0;i<m;i++){const a=o+i/m*TAU;G.pr.push({k:'sword',x:P.x+Math.cos(a)*10,y:P.y-8+Math.sin(a)*10,vx:Math.cos(a)*s.spd*0.8,vy:Math.sin(a)*s.spd*0.8,dmg:s.dmg,el,pierce:3,life:0.8,r:5,hit:[],gold:1})}}
      sfx('sword');break}
    case 'hoacau':{const n=s.n+st.amt,T=nearestN(P.x,P.y,200,n+2);if(!T.length)return 0.2;
      for(let i=0;i<n;i++){const tg=T[(rand()*T.length)|0],a=Math.atan2(tg.y-P.y,tg.x-P.x)+(rand()-.5)*0.2;
        G.pr.push({k:'fire',x:P.x,y:P.y-8,vx:Math.cos(a)*s.spd,vy:Math.sin(a)*s.spd,dmg:s.dmg*(w.evo?1.4:1),el,pierce:1,life:1.4,r:5,R:s.r*A*(st.phuR||1),hit:[],burn:w.evo})}
      sfx('fire');break}
    case 'loichuong':{let cur=nearestE(P.x,P.y,s.rng);if(!cur)return 0.2;const hit=new Set(),pts=[[P.x,P.y-10]];
      for(let i=0;i<s.ch+st.amt+(st.phuCh||0)&&cur;i++){hit.add(cur);pts.push([cur.x,cur.y-cur.r]);hurtE(cur,s.dmg,el,{fx:P.x});cur=nearestE(cur.x,cur.y,s.jump*A,hit)}
      G.fx.push({k:'bolt',pts,t:0,dur:0.22});sfx('zap');
      if(w.evo){w.sky=(w.sky||0)+1;if(w.sky>=2){w.sky=0;const T=nearestN(P.x,P.y,170,6);for(const e of T){G.fx.push({k:'strike',x:e.x,y:e.y,r:16,t:0,dur:0.35,gold:1});forNear(e.x,e.y,26,o=>{if(Math.hypot(o.x-e.x,o.y-e.y)<22)hurtE(o,s.dmg*2.5,el)})}if(T.length)sfx('thunder')}}
      break}
    case 'bangtien':{const n=s.n+st.amt+(st.kiemAmt||0),tg=nearestE(P.x,P.y,220);const a0=tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.atan2(P.fy,P.fx);
      for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*0.17;G.pr.push({k:'ice',x:P.x,y:P.y-8,vx:Math.cos(a)*s.spd,vy:Math.sin(a)*s.spd,dmg:s.dmg,el,pierce:s.pierce+(w.evo?1:0)+(st.kiemP||0),life:s.life,r:4,slow:s.slow*st.dur,freeze:w.evo,hit:[]})}
      if(w.evo){w.nova=(w.nova||0)+1;if(w.nova>=5){w.nova=0;const R=120*A;forNear(P.x,P.y,R,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<R){hurtE(e,s.dmg*2,el);if(!e.d.boss)e.rootT=Math.max(e.rootT,2);e.slowT=Math.max(e.slowT,3)}});G.fx.push({k:'frost',x:P.x,y:P.y,r:R,t:0,dur:0.6})}}
      sfx('ice');break}
    case 'dangman':{G.zones.push({k:'vine',x:P.x,y:P.y,r:s.r*A*(w.evo?1.2:1)*(st.tranR||1),t:0,dur:s.dur*st.dur*(st.tranD||1),dps:s.dps*(w.evo?1.5:1),el,tick:0,seed:rand()*1000,leech:w.evo});sfx('vine');break}
    case 'kimchung':{const R=s.r*A*(w.evo?1.3:1)*(st.theR||1);forNear(P.x,P.y,R,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<R+e.r)hurtE(e,s.dmg*(w.evo?2:1),el,{kb:s.kb,fx:P.x})});if(w.evo)P.inv=Math.max(P.inv,0.6);
      G.fx.push({k:'bell',x:P.x,y:P.y,r:R,t:0,dur:0.5},{k:'bellspr',x:P.x,y:P.y,t:0,dur:0.6,big:w.evo});sfx('bell');break}
    case 'holo':{const R=s.r*A;for(const g of G.gems)if(w.evo||Math.hypot(g.x-P.x,g.y-P.y)<R)g.mag=1;for(const it of G.items)if(it.k!=='chest'&&Math.hypot(it.x-P.x,it.y-P.y)<R)it.mag=1;
      const R2=R*0.45;forNear(P.x,P.y,R2,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<R2){if(!e.d.boss&&e.hp<e.mhp*s.kill*(w.evo?2:1)){G.fx.push({k:'soul',x:e.x,y:e.y,t:0,dur:0.5});killE(e)}else hurtE(e,s.dmg,el,{fx:P.x})}});
      G.fx.push({k:'gourd',x:P.x,y:P.y,r:R2,t:0,dur:0.7},{k:'gourdspr',x:P.x,y:P.y,t:0,dur:0.75,big:w.evo});sfx('gourd');break}
    case 'phuchu':{const n=s.n+st.amt,T=nearestN(P.x,P.y,210,n+3);if(!T.length)return 0.2;
      for(let i=0;i<n;i++){const tg=T[(rand()*T.length)|0],side=(i%2?1:-1)*(30+rand()*30);
        G.pr.push({k:'tali',x0:P.x,y0:P.y-10,x:P.x,y:P.y,tg,tx:tg.x,ty:tg.y,side,u:0,dur:0.45,dmg:s.dmg,el,R:s.r*A*(st.phuR||1),stick:-1,life:3,hit:[],chain:w.evo})}
      sfx('tali');break}
    case 'kiemtran':{G.zones.push({k:'array',x:P.x,y:P.y,r:s.r*A*(w.evo?1.25:1)*(st.tranR||1),t:0,dur:s.dur*st.dur*(st.tranD||1),dmg:s.tick*(w.evo?1.3:1),el,tick:0,follow:w.evo});sfx('array');break}
  }
  return s.cd*st.cd;
}
function updateWeapons(dt){
  const P=G.p;
  for(const k in G.w){const w=G.w[k];
    if(k==='thothuan'){G.src='thothuan';const s=WEAP.thothuan.s(w.lv),n=s.n+G.st.amt+(w.evo?2:0),R=s.r*G.st.area*(G.st.theR||1);
      w.orb.length=n;for(let i=0;i<n;i++){const a=G.t*TAU/s.per+i/n*TAU,x=P.x+Math.cos(a)*R,y=P.y-6+Math.sin(a)*R*0.8;w.orb[i]={x,y,a};
        forNear(x,y,12,e=>{if(e.orbT<=0&&Math.hypot(e.x-x,e.y-e.r*0.6-y)<e.r+7){e.orbT=0.45;hurtE(e,s.dmg*(w.evo?1.6:1),'tho',{kb:40,kx:x,ky:y})}});
        for(const b of G.es)if(!b.dead&&Math.hypot(b.x-x,b.y-y)<9){b.dead=true;G.fx.push({k:'spark',x,y,t:0,dur:0.2,c:'#e8c27a'})}}
      continue}
    w.cd-=dt; if(w.cd<=0)w.cd=fireWeapon(k,w)||0.3;
  }
}
// ── Thủy Tinh: nước dâng — vòng sóng lan ra, có 3 khe để chạy qua
const WAVE_GAP=0.42;
function waveGap(w,a){for(let i=0;i<3;i++){let d=Math.abs(((a-w.g-i*TAU/3)%TAU+TAU*1.5)%TAU-Math.PI);if(d<WAVE_GAP)return true}return false}
function updateWaves(dt){if(!G.waves)return;const P=G.p;for(const w of G.waves){w.t+=dt;w.r+=72*dt;
    const d=Math.hypot(P.x-w.x,(P.y-w.y)/0.6);if(!w.hit&&Math.abs(d-w.r)<7&&!waveGap(w,Math.atan2((P.y-w.y)/0.6,P.x-w.x))){w.hit=1;hurtP(w.dmg,null)}}
  G.waves=G.waves.filter(w=>w.r<300)}
function explode(x,y,R,dmg,el,mini){if(!mini&&G.st.phuMini){const s=G.src;G.later.push({t:0.16,f:()=>{G.src=s;explode(x+(rand()-.5)*R,y+(rand()-.5)*R*0.6,R*0.6,dmg*0.3,el,1)}})}forNear(x,y,R+20,e=>{if(Math.hypot(e.x-x,e.y-y)<R+e.r)hurtE(e,dmg,el,{kb:30,kx:x,ky:y,fx:x})});G.fx.push({k:'boom',x,y,r:R,t:0,dur:0.35});if(rand()<0.6)sfx('boom')}
function updateProjectiles(dt){
  const PSRC={sword:'phikiem',fire:'hoacau',ice:'bangtien',tali:'phuchu'};
  for(const p of G.pr){
    G.src=p.src||PSRC[p.k]||null;
    if(p.k==='tali'){
      if(p.stick>=0){p.stick-=dt;if(p.tg&&!p.tg.dead){p.x=p.tg.x;p.y=p.tg.y-p.tg.r}if(p.stick<0){explode(p.x,p.y,p.R,p.dmg,p.el);if(p.chain)for(let i=0;i<3;i++){const a=rand()*TAU,x=p.x+Math.cos(a)*p.R*1.2,y=p.y+Math.sin(a)*p.R*1.2;G.later.push({t:0.12*(i+1),f:()=>{G.src='phuchu';explode(x,y,p.R*0.7,p.dmg*0.6,p.el)}})}p.dead=true}continue}
      if(p.tg&&!p.tg.dead){p.tx=p.tg.x;p.ty=p.tg.y-p.tg.r}
      p.u+=dt/p.dur; const u=Math.min(1,p.u),dx=p.tx-p.x0,dy=p.ty-p.y0,L=Math.hypot(dx,dy)||1,cx=(p.x0+p.tx)/2-dy/L*p.side,cy=(p.y0+p.ty)/2+dx/L*p.side;
      p.x=(1-u)*(1-u)*p.x0+2*(1-u)*u*cx+u*u*p.tx; p.y=(1-u)*(1-u)*p.y0+2*(1-u)*u*cy+u*u*p.ty;
      if(u>=1){p.stick=0.35}continue}
    if(p.steer)p.steer(p,dt);
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt;
    if(p.life<=0){if(G.st.kiemRet&&(p.k==='sword'||p.k==='ice'||p.kiem)&&!p.back&&!p.rx&&!p.arrow){p.back=1;p.vx=-p.vx;p.vy=-p.vy;p.life=0.55;p.hit=[];p.pierce=Math.max(p.pierce,2);continue}p.dead=true;if(p.onEnd)p.onEnd(p);if(p.k==='fire')explode(p.x,p.y,p.R,p.dmg,p.el);continue}
    const py=p.y+6;
    forNear(p.x,py,16,e=>{if(p.dead||p.hit.includes(e))return;if(Math.hypot(e.x-p.x,e.y-e.r*0.7-p.y)<e.r+p.r){
      p.hit.push(e);
      if(p.k==='fire'){explode(p.x,p.y,p.R,p.dmg,p.el);if(p.burn)G.zones.push({k:'burn',x:p.x,y:p.y,r:p.R*0.8,t:0,dur:2.5,dps:p.dmg*0.5,el:p.el,tick:0});p.dead=true;return false}
      hurtE(e,p.dmg,p.el,{rx:p.rx,kb:p.k==='sword'?18:8,kx:p.x-p.vx,ky:p.y-p.vy,fx:p.x-p.vx*0.1});
      if(p.slow)e.slowT=Math.max(e.slowT,p.slow);if(p.freeze&&!e.d.boss)e.rootT=Math.max(e.rootT,1.2);
      if(p.onHit&&p.onHit(e,p))return;
      if(--p.pierce<=0){p.dead=true;if(p.onEnd)p.onEnd(p);return false}}});
  }
  G.pr=G.pr.filter(p=>!p.dead);
  // đạn của yêu quái
  const P=G.p;
  for(const b of G.es){b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)b.dead=true;
    else if(Math.hypot(b.x-P.x,b.y-(P.y-8))<b.r+5){b.dead=true;if(typeof vfxEHit==='function')vfxEHit(b);hurtP(b.dmg)}}
  G.es=G.es.filter(b=>!b.dead);
}
function updateZones(dt){
  const P=G.p;
  const ZSRC={vine:'dangman',burn:'hoacau',array:'kiemtran'};
  for(const z of G.zones){z.t+=dt;if(z.t>=z.dur){z.dead=true;continue}
    G.src=z.src||ZSRC[z.k]||null;
    if(G.st.tranPull&&(z.k==='vine'||z.k==='array')&&!z.src)forNear(z.x,z.y,z.r,e=>{if(!e.d.boss&&!e.d.heavy){e.x+=(z.x-e.x)*dt*0.9;e.y+=(z.y-e.y)*dt*0.9}});
    if(z.k==='vine'){z.tick-=dt;const tk=z.tick<=0;if(tk)z.tick=0.25;forNear(z.x,z.y,z.r,e=>{if(Math.hypot(e.x-z.x,e.y-z.y)<z.r){if(!e.d.boss)e.rootT=Math.max(e.rootT,0.3);if(tk){const d=hurtE(e,z.dps*0.25,z.el,{rx:z.src?1:0});if(z.leech&&d)P.hp=Math.min(P.mhp,P.hp+Math.min(0.6,d*0.04))}}})}
    else if(z.k==='burn'){z.tick-=dt;if(z.tick<=0){z.tick=0.3;forNear(z.x,z.y,z.r,e=>{if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+e.r*0.5)hurtE(e,z.dps*0.3,z.el,{rx:z.src?1:0})})}}
    else if(z.k==='lava'){z.tick-=dt;if(z.tick<=0){z.tick=0.3;forNear(z.x,z.y,z.r,e=>{if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+e.r*0.5){hurtE(e,z.dps*0.3,z.el,{rx:1});e.slowT=Math.max(e.slowT,0.6)}})}}
    else if(z.k==='array'){if(z.follow){z.x=P.x;z.y=P.y}z.tick-=dt;if(z.tick<=0){z.tick=z.follow?0.18:0.25;forNear(z.x,z.y,z.r,e=>{if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+e.r*0.5)hurtE(e,z.dmg,z.el,{fx:z.x})})}}
    else if(z.k==='poison'){z.tick-=dt;if(z.tick<=0&&Math.hypot(P.x-z.x,P.y-z.y)<z.r){z.tick=0.5;hurtP(z.dmg)}}
  }
  G.zones=G.zones.filter(z=>!z.dead);
}

// ── AI yêu quái
function eshot(x,y,a,spd,dmg,c,r=3.5,k='orb'){G.es.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,dmg,life:4,r,c,k,t:0})}
function updateEnemies(dt){
  const P=G.p, far=Math.hypot(VW,VH)*0.75+60;
  for(const e of G.e){
    if(e.dead)continue;
    e.flash-=dt; e.hitT-=dt; e.orbT-=dt; e.slowT-=dt; e.rootT-=dt; e.cd-=dt; e.cd2-=dt; e.cd3-=dt;
    let dx=P.x-e.x, dy=P.y-e.y; const dist=Math.hypot(dx,dy)||1; dx/=dist; dy/=dist;
    let mx=dx,my=dy,sp=e.spd;
    const ai=e.d.ai;
    if(ai==='zig'){const s=Math.sin(G.t*5+e.ph)*0.9;mx=dx-dy*s;my=dy+dx*s}
    else if(ai==='fly'){const s=Math.sin(G.t*3+e.ph)*0.5;mx=dx-dy*s;my=dy+dx*s}
    else if(ai==='hop'){const ph=(G.t*1.1+e.ph)%1;sp=ph<0.45?e.spd*2:0;e.hopZ=ph<0.45?Math.sin(ph/0.45*Math.PI)*7:0}
    else if(ai==='ranged'||ai==='heal'){const want=ai==='heal'?95:125;if(dist<want-20){mx=-dx;my=-dy}else if(dist<want+25){mx=-dy*0.6;my=dx*0.6}
      if(ai==='ranged'&&e.cd<=0&&dist<200){e.cd=2.4+rand();eshot(e.x,e.y-e.r,Math.atan2(P.y-8-(e.y-e.r),P.x-e.x),72,e.dmg,'#c86bff');e.atkT=0.4}
      if(ai==='heal'&&e.cd<=0){e.cd=3.2;forNear(e.x,e.y,70,o=>{if(o!==e&&!o.d.boss)o.hp=Math.min(o.mhp,o.hp+o.mhp*0.3)});G.fx.push({k:'heal',x:e.x,y:e.y,r:70,t:0,dur:0.5})}}
    else if(ai==='charge'){
      if(e.st===0&&e.cd<=0&&dist<130){e.st=1;e.stT=0.6;e.cx=dx;e.cy=dy}
      if(e.st===1){sp=0;e.stT-=dt;e.atkT=0.2;if(e.stT<=0){e.st=2;e.stT=0.55}}
      else if(e.st===2){mx=e.cx;my=e.cy;sp=e.spd*4;e.stT-=dt;if(e.stT<=0){e.st=0;e.cd=2.5+rand()*1.5}}}
    else if(ai==='poison'){if(e.cd<=0){e.cd=2.4+rand();G.zones.push({k:'poison',x:e.x,y:e.y,r:15,t:0,dur:4,dmg:e.dmg*0.5,tick:0})}}
    else if(ai==='b_fox'){
      if(e.cd<=0){e.cd=3.2;const a0=Math.atan2(P.y-e.y,P.x-e.x);for(let i=-3;i<=3;i++)eshot(e.x,e.y-14,a0+i*0.16,85,e.dmg*0.7,'#ff7a2e',4.5,'foxfire');e.atkT=0.5;sfx('fire')}
      if(e.cd2<=0){e.cd2=8;for(let i=0;i<6;i++){const [x,y]=spawnRingPos(150);spawnEnemy('ho',x,y)}}
      if(e.st===0&&e.cd3<=0&&dist<160){e.st=1;e.stT=0.7;e.cx=dx;e.cy=dy}
      if(e.st===1){sp=0;e.stT-=dt;if(e.stT<=0){e.st=2;e.stT=0.6}}else if(e.st===2){mx=e.cx;my=e.cy;sp=e.spd*4.2;e.stT-=dt;if(e.stT<=0){e.st=0;e.cd3=6}}}
    else if(ai==='b_dragon'){
      const a=Math.atan2(e.y-P.y,e.x-P.x)+0.6, tx=P.x+Math.cos(a)*115, ty=P.y+Math.sin(a)*115, ddx=tx-e.x, ddy=ty-e.y, dd=Math.hypot(ddx,ddy)||1;mx=ddx/dd;my=ddy/dd;sp=e.spd*(dd>40?1.4:0.8);
      if(e.cd<=0){e.cd=2.6;const a0=Math.atan2(P.y-e.y,P.x-e.x);for(let i=0;i<9;i++)eshot(e.x,e.y,a0+(i-4)*0.12,70+(i%3)*14,e.dmg*0.6,'#5ab8ff',4.5,'iceshard');e.atkT=0.5;sfx('ice')}
      if(e.cd2<=0){e.cd2=9;for(let i=0;i<10;i++){const [x,y]=spawnRingPos(160);spawnEnemy('buc',x,y)}}}
    else if(ai==='b_demon'){
      const hard=e.hp<e.mhp*0.5;
      if(e.cd<=0){e.cd=hard?2.0:3.0;const n=hard?20:16,o=rand()*TAU;for(let i=0;i<n;i++)eshot(e.x,e.y-20,o+i/n*TAU,62,e.dmg*0.6,'#3fa8ff',4.5,'drop');e.atkT=0.5;sfx('boom')}
      if(e.cd2<=0){e.cd2=7;for(let i=0;i<7;i++){const [x,y]=spawnRingPos(140);spawnEnemy(rand()<0.5?'thi':'matu',x,y)}}
      if(e.cd3<=0){e.cd3=hard?5:7.5;G.waves=G.waves||[];G.waves.push({x:e.x,y:e.y,r:18,g:rand()*TAU,hit:0,dmg:e.dmg*0.8,t:0});e.atkT=0.7;sfx('ice');shake(0.25)}}
    else if(ai==='b_mirror'){
      const want=95;if(dist<want-15){mx=-dx;my=-dy}else if(dist<want+30){mx=-dy;my=dx}
      if(e.cd<=0){e.cd=1.3;const a0=Math.atan2(P.y-e.y,P.x-e.x);for(let i=-1;i<=1;i++)eshot(e.x,e.y-12,a0+i*0.2,110,e.dmg*0.55,'#9b5cff',4,'blade');e.atkT=0.3;sfx('sword')}
      if(e.cd2<=0){e.cd2=5;e.x=clamp(P.x+(P.x-e.x)*0.6,20,WORLD-20);e.y=clamp(P.y+(P.y-e.y)*0.6,20,WORLD-20);G.fx.push({k:'soul',x:e.x,y:e.y,t:0,dur:0.5})}}
    if(e.slowT>0)sp*=0.45; if(e.rootT>0)sp=0;
    e.vx=mx*sp; e.vy=my*sp;
    e.x+=(e.vx+e.kx)*dt; e.y+=(e.vy+e.ky)*dt;
    const kd=Math.pow(0.0005,dt); e.kx*=kd; e.ky*=kd;
    if(Math.abs(e.vx)>2)e.face=e.vx>0?1:-1;
    e.anim+=dt*(sp>0?7:3);
    // tách nhau
    let n=0;forNear(e.x,e.y,e.r*2,o=>{if(o===e||n>5)return;n++;const ox=e.x-o.x,oy=e.y-o.y,d=Math.hypot(ox,oy),m=(e.r+o.r)*0.8;if(d<m&&d>0.01){const p=(m-d)/d*0.35;e.x+=ox*p;e.y+=oy*p}});
    if(!(e.d.fly||ai==='fly'))collideObs(e,e.r*0.6); else{e.x=clamp(e.x,10,WORLD-10);e.y=clamp(e.y,10,WORLD-10)}
    // không đè lên người chơi (1.0.74): quái dừng ở mép thân người, không đứng chồng lên hình nhân vật
    {const ox=e.x-P.x,oy=e.y-P.y,d=Math.hypot(ox,oy),m=e.r+P.r+1;if(d<m){if(d>0.01){e.x=P.x+ox/d*m;e.y=P.y+oy/d*m}else e.x=P.x+m}
    // chạm người chơi: gây sát thương rồi giật lùi một nhịp (thủ lĩnh cũng lùi), để người đánh gần có khoảng thở
    if(e.hitT<=0&&d<m+2.5){e.hitT=e.d.boss?1.1:0.8;hurtP(e.dmg*(e.d.boss&&G.hd?0.5:1),e);   /* Trấn Ấn Lộ: đòn chạm của thủ lĩnh chỉ bằng nửa, chiêu của nó mới là thứ phải né */const k=e.d.boss?70:e.d.heavy?45:110,dd=Math.max(d,0.01);e.kx+=ox/dd*k;e.ky+=oy/dd*k}}
    // quá xa thì chuyển lên phía trước
    if(!e.d.boss&&dist>far){const [x,y]=spawnRingPos(spawnDist());e.x=x;e.y=y}
    if(e.atkT>0)e.atkT-=dt;
  }
  G.e=G.e.filter(e=>!e.dead);
  for(const e of G.dying)e.dieT+=dt;
  G.dying=G.dying.filter(e=>e.dieT<0.6);
}

// ── người chơi
const INPUT={x:0,y:0};
function updatePlayer(dt){
  const P=G.p; if(P.dead){P.deadT+=dt;return}
  let ix=INPUT.x,iy=INPUT.y;if(!isFinite(ix)||!isFinite(iy)){ix=0;iy=0}const m=Math.hypot(ix,iy);if(m>1){ix/=m;iy/=m}
  P.vx=ix*G.st.spd; P.vy=iy*G.st.spd; P.x+=P.vx*dt; P.y+=P.vy*dt; collideObs(P,P.r);
  P.mv=m>0.1; if(P.mv){P.fx=ix;P.fy=iy;P.anim+=dt*9*Math.min(1,m+0.3);P.dir=Math.abs(ix)>Math.abs(iy)*0.9?(ix>0?'R':'L'):(iy>0?'D':'U')}else P.anim=0;
  P.hurtT-=dt; P.inv-=dt;
  if(G.st.regen>0)P.hp=Math.min(P.mhp,P.hp+G.st.regen*dt);
  // linh khí
  const mag=G.st.mag;
  for(const g of G.gems){g.t+=dt;const dx=P.x-g.x,dy=P.y-6-g.y,d=Math.hypot(dx,dy)||0.01;
    if(!g.mag&&d<mag)g.mag=1;
    if(g.mag){g.mag+=dt*3;const s=Math.min(420,90*g.mag+d*2);g.x+=dx/d*s*dt;g.y+=dy/d*s*dt;if(d<8){g.dead=true;gainXp(g.v)}}}
  G.gems=G.gems.filter(g=>!g.dead);
  for(const it of G.items){it.t+=dt;if(it.held)continue;const dx=P.x-it.x,dy=P.y-6-it.y,d=Math.hypot(dx,dy)||0.01;
    if(it.mag||d<mag*0.7){it.mag=1;const s=160;it.x+=dx/d*s*dt;it.y+=dy/d*s*dt}
    if(d<10){it.dead=true;pickItem(it)}}
  G.items=G.items.filter(i=>!i.dead);
  // khám phá bản đồ
  const ec=Math.ceil(WORLD/32),cx=(P.x/32)|0,cy=(P.y/32)|0;for(let y=cy-5;y<=cy+5;y++)for(let x=cx-4;x<=cx+4;x++)if(x>=0&&y>=0&&x<ec&&y<ec)G.explored[y*ec+x]=1;
}
function pickItem(it){
  const P=G.p;
  if(it.k==='heal'){const h=25*(G.ch==='linhnhi'?2:1);P.hp=Math.min(P.mhp,P.hp+h);sfx('heal');G.nums.push({x:P.x,y:P.y-30,v:'+'+h,t:0,c:'#6dff8a'})}
  else if(it.k==='magnet'){for(const g of G.gems)g.mag=1;sfx('gourd');announce(i18n('tb.tulinh','Tụ Linh Phù: hút toàn bộ linh khí'),'good')}
  else if(it.k==='chest'){G.chestN=(G.chestN||0)+1;G.lt+=15;sfx('chest');G.pendLv++;G.chestOpen=true;announce(i18n('tb.ruong','Bảo rương: +15 linh thạch'),'good')}
}
function gainXp(v){
  G.xp+=v*G.st.xp; G.xpTot=(G.xpTot||0)+v; sfx('gem');
  while(G.xp>=xpNeed(G.lv)){G.xp-=xpNeed(G.lv);G.lv++;G.pendLv++;if(typeof vfxLevel==='function')vfxLevel();
    const r=REALMS.findIndex((R,i)=>i>G.realm&&G.lv>=R.lv);if(r>0)breakthrough(r)}
}
function breakthrough(r){
  const P=G.p, hp0=P.mhp, slots0=wSlots();
  G.realm=r; recompute(); P.hp=P.mhp;
  // đột phá có cảnh riêng: tụ khí (chậm thời gian) → bùng nổ → bảng cảnh giới
  G.bt={r,t:0,dur:4.2,boom:false,gain:{hp:P.mhp-hp0,slot:wSlots()>slots0?wSlots():0}};
  P.inv=Math.max(P.inv,4.5); sfx('level'); if(typeof buzz==='function')buzz([20,60,20,60,20]);
}
function breakthroughBoom(){
  const B=G.bt,P=G.p,r=B.r; B.boom=true; G.src='dotpha';
  forNear(P.x,P.y,170,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<170){if(e.d.boss)hurtE(e,e.mhp*0.04/G.st.dmg,null);else{e.hp=0;killE(e)}}});
  for(const b of G.es)b.dead=true;
  G.fx.push({k:'pillar',x:P.x,y:P.y,t:0,dur:2.6,c:REALMS[r].c},{k:'btwave',x:P.x,y:P.y,r,t:0,dur:1.2},{k:'btcrack',x:P.x,y:P.y,r,t:0,dur:3.5,sd:rand()*1e4});
  shake(0.7); sfx('realm'); if(typeof buzz==='function')buzz([80,40,160]);
  SAVE.bestRealm=Math.max(SAVE.bestRealm|0,r);
}

// ── Bộc phát
function useBurst(){
  if(!G||G.over||G.paused||G.burst<100)return false;
  G.burst=0; G.src='burst'; const P=G.p, dmg=60*(1+G.realm*0.6);
  forNear(P.x,P.y,210,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<210)hurtE(e,e.d.boss?dmg*3:dmg,null,{kb:120})});
  for(const b of G.es)if(Math.hypot(b.x-P.x,b.y-P.y)<210)b.dead=true;
  P.inv=1.2; G.fx.push({k:'burst',x:P.x,y:P.y,t:0,dur:0.7}); flash('#fff4c0',0.5); shake(0.5); sfx('realm');
  return true;
}

// ── Thiên Kiếp
function startKiep(){
  if(G.kiep)return;
  G.kiep={wave:0,t:4,strikes:[],tamma:null,tammaDone:false,age:0};
  announce(i18n('tb.kiep','THIÊN KIẾP GIÁNG LÂM'),'kiep'); sfx('thunder'); flash('#c9b8ff',0.5);
  musicMode('boss');
}
function updateKiep(dt){
  const K=G.kiep; if(!K)return; const P=G.p;
  K.t-=dt; K.age+=dt;
  if(K.t<=0){const last=K.wave>=9;K.wave=Math.min(9,K.wave+1);K.t=last?5:4.2;const n=2+K.wave+(last?2:0);
    announce(i18nf('tb.daoloi','Đạo lôi kiếp {0}/9',K.wave),'kiep');
    for(let i=0;i<n;i++){const lead=i===0?1.1:0,x=i===0?P.x+P.vx*lead:P.x+(rand()-.5)*200,y=i===0?P.y+P.vy*lead:P.y+(rand()-.5)*260;K.strikes.push({x:clamp(x,15,WORLD-15),y:clamp(y,15,WORLD-15),t:0,dur:1.25+rand()*0.35,r:22+K.wave})}
    if(K.wave===5&&!K.tamma){const [x,y]=spawnRingPos(130);K.tamma=G.boss=spawnEnemy('tamma',x,y);announce(i18n('tb.tamma','Tâm Ma hiện hình!'),'boss');sfx('roar')}}
  for(const s of K.strikes){s.t+=dt;if(s.t>=s.dur&&!s.done){s.done=true;G.src='kiep';
    G.fx.push({k:'strike',x:s.x,y:s.y,r:s.r,t:0,dur:0.4},{k:'scorch',x:s.x,y:s.y,r:s.r,t:0,dur:6,sd:rand()*1e4});shake(0.35);sfx('thunder');
    if(Math.hypot(P.x-s.x,P.y-s.y)<s.r+P.r)hurtP((14+K.wave*4)*(G.ai?G.ai.dmg:1));
    forNear(s.x,s.y,s.r+10,e=>{if(Math.hypot(e.x-s.x,e.y-s.y)<s.r+e.r)hurtE(e,e.d.boss?300:999,null)})}}
  K.strikes=K.strikes.filter(s=>!s.done);
  if(K.tamma&&K.tamma.dead)K.tammaDone=true;
  if(K.wave>=9&&K.tammaDone&&!K.strikes.length&&!G.over)endRun(true);
}

// ── hiệu ứng chung
function announce(t,k){G&&G.annQ.push({t,k})}
function shake(v){if(G)G.shake=Math.max(G.shake,v)}
function flash(c,v){if(G){G.flash=Math.max(G.flash,v);G.flashC=c}}

// ── vòng lặp cập nhật
function update(dt){
  if(!G||G.paused)return;
  if(G.over){G.t2=(G.t2||0)+dt;updateFx(dt);if(G.p.dead)G.p.deadT+=dt;return}
  if(G.ult&&typeof updateUlt==='function')dt*=updateUlt(dt);
  if(G.bt){const B=G.bt;B.t+=dt;if(!B.boom&&B.t>=1.1)breakthroughBoom();if(B.t>=B.dur)G.bt=null;else dt*=B.t<1.1?0.08:B.t<1.8?0.25:Math.min(1,0.25+(B.t-1.8)*0.6)}
  if(G.cine){G.cine.t+=dt;if(G.cine.t>=G.cine.dur)G.cine=null;else dt*=G.cine.t<1.5?0.15:Math.min(1,0.15+(G.cine.t-1.5)*0.9)}
  G.t+=dt;
  for(const l of G.later){l.t-=dt;if(l.t<=0){l.done=1;l.f()}} G.later=G.later.filter(l=>!l.done);
  buildHash();
  updatePlayer(dt);
  updateWeapons(dt);
  updatePet(dt);
  updateProjectiles(dt);
  updateZones(dt);
  if(typeof nhTick==='function')nhTick(dt);
  updateWaves(dt);
  G.src=null; updateEnemies(dt);
  updateSpawns(dt);
  if(!G.tower&&!G.kiep&&G.t>=RUN_T+150)startKiep();
  updateKiep(dt);
  G.burst=Math.min(100,G.burst+dt*(100/55)*(1+upLv('burst')*0.05));
  updateFx(dt);
}
function updateFx(dt){
  for(const f of G.fx)f.t+=dt; G.fx=G.fx.filter(f=>f.t<f.dur);
  for(const n of G.nums)n.t+=dt; G.nums=G.nums.filter(n=>n.t<0.7);
  G.shake=Math.max(0,G.shake-dt*1.6); G.flash=Math.max(0,G.flash-dt*1.5);
}

// ── thẻ lên cấp
function rollCards(excl){
  const opts=[];
  for(const k in G.w)if(G.w[k].lv<5)opts.push({t:'w',k,wt:3});
  // tâm pháp giúp tiến hóa: ưu tiên khi công pháp đã ≥ cấp 3
  const needP={};for(const k in G.w){const w=G.w[k];if(!w.evo&&w.lv>=3)needP[EVO[k].p]=1}
  if(Object.keys(G.w).length<wSlots())for(const k of WEAP_ORDER)if(!G.w[k]&&!G.banned[k])opts.push({t:'w',k,wt:1.7,nw:1});
  for(const k in G.pass)if(G.pass[k]<5)opts.push({t:'p',k,wt:2});
  for(const o of opts)if(o.t==='p'&&needP[o.k])o.wt*=1.6;
  if(Object.keys(G.pass).length<MAX_P)for(const k of PASS_ORDER)if(!G.pass[k]&&!G.banned[k])opts.push({t:'p',k,wt:needP[k]?2.6:1.2,nw:1});
  const evo=[];for(const k in G.w){const w=G.w[k];if(w.lv>=5&&!w.evo&&G.pass[EVO[k].p])evo.push({t:'e',k,wt:6})}
  if(G.chestOpen&&evo.length)return[evo[0]];
  opts.push(...evo);
  if(excl)for(let i=opts.length-1;i>=0;i--)if(excl.some(c=>c.t===opts[i].t&&c.k===opts[i].k))opts.splice(i,1);
  const out=[];
  while(out.length<3&&opts.length){let tot=opts.reduce((s,o)=>s+o.wt,0),r=rand()*tot,i=0;for(;i<opts.length;i++){r-=opts[i].wt;if(r<=0)break}out.push(opts.splice(Math.min(i,opts.length-1),1)[0])}
  if(out.length<3)out.push({t:'heal'});
  if(out.length<3)out.push({t:'lt'});
  return out;
}
function applyCard(c){
  if(c.t==='e'){G.w[c.k].evo=1;flash('#fff4c0',0.6);sfx('realm');shake(0.4);G.fx.push({k:'pillar',x:G.p.x,y:G.p.y,t:0,dur:2.4,c:'#ffd45a'});G.cine={t:0,dur:2.6,k:c.k};G.p.inv=Math.max(G.p.inv,2.8);
    SAVE.evoSeen=SAVE.evoSeen||{};if(!SAVE.evoSeen[c.k]){SAVE.evoSeen[c.k]=1;saveSave()}if(typeof buzz==='function')buzz([30,40,30,40,120])}
  else if(c.t==='w'){if(G.w[c.k])G.w[c.k].lv++;else addWeapon(c.k)}
  else if(c.t==='p'){G.pass[c.k]=(G.pass[c.k]|0)+1}
  else if(c.t==='heal'){G.p.hp=Math.min(G.p.mhp,G.p.hp+G.p.mhp*0.3)}
  else if(c.t==='lt'){G.lt+=25}
  recompute(); sfx('pick');
}

// ── kết thúc trận
function endRun(win){
  if(G.over)return; G.over=true; G.win=win; G.t2=0;
  const T=G.tower; G.gearDrops=[];
  let lt;
  if(T){lt=G.lt+Math.floor(G.kills/15)+(win?T.lt:Math.floor(T.lt*0.2));
    if(win){const ts=towerSave();if(T.f>ts.best){ts.best=T.f;G.unlockMsg=i18nf('ket.thap.mo','Lên được tầng {0}! Mở tầng {1}',T.f,T.f+1)}G.gearDrops.push(dropGear(T.rar+0.1));if(T.f%5===0)G.gearDrops.push(dropGear(T.rar+0.2))}}
  else{const mins=Math.min(G.t,RUN_T)/60;
    const A=G.ai||aiSpec(1);
    lt=(G.lt+Math.floor(G.kills/12)+Math.floor(mins*8)+G.realm*25+(win?300:0))*A.lt;
    const rolls=(mins>=3?1:0)+G.bossKills+(win?2:0);for(let i=0;i<rolls;i++)G.gearDrops.push(dropGear(0.05*G.bossKills+(win?0.15:0)+A.rar));
    if(win){const S=aiSave();if(A.n>S.best){S.best=A.n;S.sel=Math.min(AI_MAX,A.n+1);lt+=A.first;G.gearDrops.push(dropGear(A.rar+0.25));G.unlockMsg=i18nf('ket.ai.mo','Qua Ải {0}! Mở Ải {1} · thưởng lần đầu +{2} linh thạch',A.n,A.n+1,A.first)}}}
  lt=Math.round(lt*(1+upLv('luck')*0.05+(G.st.luck||0)));
  G.ltGain=lt; SAVE.lt+=lt;
  if(!T){if(G.t>SAVE.best)SAVE.best=G.t; if(G.lv>SAVE.bestLv)SAVE.bestLv=G.lv;}
  if(win&&!T){SAVE.wins++;if(!SAVE.unl.bachho){SAVE.unl.bachho=1;G.unlockMsg=i18nf('ket.mokhoa','Đã mở khóa {0}!',CHARS.bachho.n)}}
  if(!T&&typeof dkEnd==='function')dkEnd(win);   // độ khó: mở bậc mới (js/dokho.js)
  G.score=T?0:Math.round((Math.floor(Math.min(G.t,RUN_T+400))*10+G.kills+G.realm*1000+G.bossKills*2000+(win?20000:0))*(typeof dkScore==='function'?dkScore(G.dk|0):1));
  saveSave();
  if(typeof cloudScore==='function'&&G.score>0)cloudScore(G.score,G.realm,G.ch);
  if(typeof track==='function')track('run',{w:win?1:0,dk:G.dk|0,ch:G.ch,map:G.mapId,t:Math.round(G.t),lv:G.lv,re:G.realm,k:G.kills,tw:T?T.f:0,mod:T?T.mod.id:'',wp:Object.keys(G.w).join(',')});
  if(typeof buzz==='function')buzz(win?[30,60,30,60,90]:[120,60,200]);
  if(win&&G.kiep){G.kiep.clear=0.001;G.fx.push({k:'pillar',x:G.p.x,y:G.p.y,t:0,dur:3,c:'#ffe680'})}
  if(win){announce(T?i18nf('tb.quatang','QUA TẦNG {0}',T.f):i18n('tb.dokiep','ĐỘ KIẾP THÀNH CÔNG'),'realm');sfx('realm');flash('#ffffff',1)}
}
