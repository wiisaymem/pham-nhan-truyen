'use strict';
// ───────────────────────── tiến trình lâu dài: Pháp Bảo, Linh Thú, Thông Thiên Tháp
// ── Pháp bảo: 4 ô, 5 phẩm, ghép 3 món giống nhau lên phẩm cao hơn
const GSLOT=[{id:'kiem',n:'Pháp Kiếm'},{id:'bao',n:'Đạo Bào'},{id:'boi',n:'Ngọc Bội'},{id:'an',n:'Pháp Ấn'}];
const GRAR=[
  {n:i18n('ui.meta.pham','Phàm'),c:'#9aa3ad',m:1,max:10},{n:'Linh',c:'#3fbf6a',m:1.6,max:15},{n:i18n('ui.meta.huyen','Huyền'),c:'#3f8fe0',m:2.4,max:20},
  {n:i18n('ui.meta.dia','Địa'),c:'#a65ce0',m:3.4,max:25},{n:i18n('ui.meta.thien','Thiên'),c:'#f0a82a',m:4.8,max:30}];
// st: tên chỉ số trong G.st; v: giá trị ở phẩm Phàm cấp 1
const GEAR={
  thanhphong:{n:'Thanh Phong Kiếm',s:'kiem',st:'dmg',v:0.08,c:'#bfe6ff'},
  xichhoa:{n:'Xích Hỏa Kiếm',s:'kiem',st:'dmg',v:0.064,st2:'area',v2:0.048,c:'#ff7a4a'},
  loanvan:{n:'Loạn Vân Kiếm',s:'kiem',st:'crit',v:0.032,c:'#d8c8ff'},
  vanvan:{n:'Vân Văn Đạo Bào',s:'bao',st:'hp',v:0.096,c:'#e8f4ff'},
  huyenquy:{n:'Huyền Quy Giáp',s:'bao',st:'armor',v:0.8,c:'#c9a26a'},
  thanhmoc:{n:'Thanh Mộc Y',s:'bao',st:'regen',v:0.192,c:'#8fe08a'},
  bangtam:{n:'Băng Tâm Ngọc Bội',s:'boi',st:'cd',v:0.04,c:'#9fe8ff'},
  phongthan:{n:'Phong Thần Bội',s:'boi',st:'spd',v:0.048,c:'#c8fff0'},
  tulinh:{n:'Tụ Linh Bội',s:'boi',st:'mag',v:0.128,c:'#7ff0b0'},
  canhkhon:{n:'Càn Khôn Ấn',s:'an',st:'area',v:0.064,c:'#ffd45a'},
  ngotinh:{n:'Ngộ Tính Ấn',s:'an',st:'xp',v:0.064,c:'#ffe9a8'},
  phucduyen:{n:'Phúc Duyên Ấn',s:'an',st:'luck',v:0.08,c:'#ffb3cf'},
};
const GEAR_KEYS=Object.keys(GEAR);
const STAT_N={dmg:i18n('ui.meta.satThuong','Sát thương'),area:i18n('ui.meta.vungAnhHuong','Vùng ảnh hưởng'),crit:i18n('ui.meta.chiMang','Chí mạng'),hp:i18n('ui.meta.mauToiDa','Máu tối đa'),armor:i18n('ui.meta.giap','Giáp'),regen:i18n('ui.meta.hoiMauGiay','Hồi máu/giây'),cd:i18n('ui.meta.giamHoiChieu','Giảm hồi chiêu'),spd:i18n('ui.meta.tocChay','Tốc chạy'),mag:i18n('ui.meta.tamHut','Tầm hút'),xp:i18n('ui.meta.linhKhi','Linh khí'),luck:i18n('ui.meta.linhThach','Linh thạch')};
const statTxt=(k,v)=>k==='armor'?`${STAT_N[k]} +${v.toFixed(1)}`:k==='regen'?`${STAT_N[k]} +${v.toFixed(2)}`:`${STAT_N[k]} +${(v*100).toFixed(1)}%`;
function gearSave(){if(typeof tranKho==='function'){const k=tranKho();if(k)return k}   // Trấn Ấn Lộ ở cõi Mùa giải có kho riêng (js/tranan/sanh.js); Thiên Kiếp luôn dùng kho Thường
  if(!SAVE.gear)SAVE.gear={items:[],eq:{},nid:1};return SAVE.gear}
const gItem=id=>gearSave().items.find(i=>i.id===id);
const gVal=(it,main=true)=>{const g=GEAR[it.k],v=main?g.v:g.v2;return v*GRAR[it.r].m*(1+0.08*(it.lv-1))};
function gearStats(){const S={};const gs=gearSave();for(const s of GSLOT){const it=gItem(gs.eq[s.id]);if(!it)continue;const g=GEAR[it.k];S[g.st]=(S[g.st]||0)+gVal(it);if(g.st2)S[g.st2]=(S[g.st2]||0)+gVal(it,false)}return S}
function rollRarity(bonus){const r=rand();const b=Math.min(0.5,bonus||0);if(r<0.012+b*0.06)return 4;if(r<0.05+b*0.15)return 3;if(r<0.18+b*0.3)return 2;if(r<0.5+b*0.3)return 1;return 0}
function addGear(k,r){const gs=gearSave();const it={id:gs.nid++,k,r,lv:1};gs.items.push(it);if(gs.items.length>80){const junk=gs.items.filter(i=>!Object.values(gs.eq).includes(i.id)).sort((a,b)=>a.r-b.r||a.lv-b.lv)[0];if(junk){gs.items.splice(gs.items.indexOf(junk),1);SAVE.lt+=salvageVal(junk)}}return it}
function dropGear(bonus){return addGear(pick(GEAR_KEYS),rollRarity(bonus))}
const lvCost=it=>Math.round((20+it.lv*12)*(1+it.r*0.6));
const salvageVal=it=>Math.round(8*(it.r+1)**2+it.lv*3);
function gearEquip(it){const gs=gearSave();gs.eq[GEAR[it.k].s]=it.id;saveSave()}
function gearLevel(it){const c=lvCost(it);if(it.lv>=GRAR[it.r].max||SAVE.lt<c)return false;SAVE.lt-=c;it.lv++;saveSave();return true}
function gearMates(it){return gearSave().items.filter(o=>o!==it&&o.k===it.k&&o.r===it.r)}
function gearMerge(it){const m=gearMates(it);if(it.r>=4||m.length<2)return null;const gs=gearSave(),used=[it,m[0],m[1]];
  const eqd=used.some(u=>gs.eq[GEAR[u.k].s]===u.id);for(const u of used)gs.items.splice(gs.items.indexOf(u),1);
  const n=addGear(it.k,it.r+1);if(typeof bmPhuKeep==='function')bmPhuKeep(n,used);n.lv=Math.max(1,Math.floor(Math.max(...used.map(u=>u.lv))/2));if(eqd)gs.eq[GEAR[n.k].s]=n.id;saveSave();return n}
// ghép nhanh (06/11/2026): ghép hết các bộ 3 món cùng loại cùng phẩm, từ phẩm thấp lên (món vừa ghép ra có thể ghép tiếp).
// Món đang mặc được ưu tiên đưa vào bộ để món mới tự mặc thay; còn lại lấy món cấp thấp trước để giữ món đã luyện.
function gearQuickPlan(){const gs=gearSave(),eqIds=Object.values(gs.eq),cnt={};let n=0;
  for(const it of gs.items){const key=it.k+'|'+it.r;cnt[key]=(cnt[key]||0)+1}
  for(let r=0;r<4;r++)for(const k of GEAR_KEYS){const c=cnt[k+'|'+r]|0,m=Math.floor(c/3);if(m){n+=m;cnt[k+'|'+(r+1)]=(cnt[k+'|'+(r+1)]|0)+m}}
  return n}
function gearQuickMerge(){const gs=gearSave(),made=[];
  for(let r=0;r<4;r++)for(const k of GEAR_KEYS){
    for(;;){const grp=gs.items.filter(i=>i.k===k&&i.r===r);if(grp.length<3)break;
      const isEq=i=>gs.eq[GEAR[i.k].s]===i.id;grp.sort((a,b)=>isEq(b)-isEq(a)||a.lv-b.lv);
      let used=grp.slice(0,3);if(isEq(used[0]))used=[used[0],...grp.slice(1).sort((a,b)=>a.lv-b.lv).slice(0,2)];
      const eqd=used.some(isEq);for(const u of used)gs.items.splice(gs.items.indexOf(u),1);
      const it={id:gs.nid++,k,r:r+1,lv:Math.max(1,Math.floor(Math.max(...used.map(u=>u.lv))/2))};gs.items.push(it);if(typeof bmPhuKeep==='function')bmPhuKeep(it,used);if(eqd)gs.eq[GEAR[k].s]=it.id;
      made.push(it)}}
  saveSave();return made.filter(it=>gs.items.includes(it))}   // chỉ giữ món còn lại sau cùng (món trung gian đã bị ghép tiếp)
function gearSalvage(it){const gs=gearSave();if(Object.values(gs.eq).includes(it.id))return 0;gs.items.splice(gs.items.indexOf(it),1);const v=salvageVal(it);SAVE.lt+=v;saveSave();return v}
const CHEST_COST=180;
function buyChest(){if(SAVE.lt<CHEST_COST)return null;SAVE.lt-=CHEST_COST;const it=dropGear(0.15);saveSave();return it}

// ── Linh thú: đi theo người chơi, tự hỗ trợ
const PETS={
  linhho:{n:'Bạch Linh Hồ',spr:'pho',gc:'#bff4ff',cost:0,d:'Cắn yêu quái gần nhất, cứ 5 giây hồi 2 máu cho chủ.',fly:0},
  kimbuc:{n:'Kim Sí Bức',spr:'pbuc',gc:'#ffd45a',cost:400,d:'Bay lượn chém liên tục các yêu quái quanh chủ.',fly:1},
  thanhlong:{n:'Thanh Long Nhi',spr:'plong',gc:'#7ff0e0',cost:900,d:'Phun sét vào yêu quái gần nhất, nảy sang 2 con khác.',fly:1},
  huyenquy:{n:'Huyền Quy',spr:'pquy',gc:'#ffd45a',cost:1500,d:'Kết khiên chắn đạn quanh chủ, cứ 8 giây đẩy lùi yêu quái.',fly:0},
};
const PET_KEYS=Object.keys(PETS), PET_MAX=10;
function petSave(){if(!SAVE.pet)SAVE.pet={eq:'linhho',lv:{linhho:1}};return SAVE.pet}
const petLv=k=>petSave().lv[k]|0;
const petCost=lv=>60+lv*55;
function petBuy(k){const P=PETS[k];if(petLv(k)||SAVE.lt<P.cost)return false;SAVE.lt-=P.cost;petSave().lv[k]=1;petSave().eq=k;saveSave();return true}
function petUp(k){const lv=petLv(k);if(!lv||lv>=PET_MAX||SAVE.lt<petCost(lv))return false;SAVE.lt-=petCost(lv);petSave().lv[k]=lv+1;saveSave();return true}
function petPower(){const k=petSave().eq;return 1+0.14*(petLv(k)-1)}
function petInit(){const k=petSave().eq;if(!k||!petLv(k)){G.pet=null;return}G.pet={k,x:G.p.x-14,y:G.p.y+4,cd:1,cd2:3,face:1,anim:0,tg:null,orb:0}}
function updatePet(dt){
  const Q=G.pet;if(!Q||G.p.dead)return;G.src='pet';const P=G.p,D=PETS[Q.k],pw=petPower()*(1+G.realm*0.25);
  Q.atkT=Math.max(0,(Q.atkT||0)-dt);if(D.fly)Q.anim+=dt*10;
  if(Math.hypot(P.x-Q.x,P.y-Q.y)>260){Q.x=P.x;Q.y=P.y;if(Q.task&&Q.task.tg&&Q.task.tg.held){Q.task.tg.held=0;Q.task.tg.mag=1}Q.task=null}
  if(petTask(Q,dt,D,pw))return;
  // đi theo phía sau chủ
  const bx=P.x-P.fx*16-4, by=P.y-P.fy*10+4, dx=bx-Q.x, dy=by-Q.y, d=Math.hypot(dx,dy);
  Q.mv=d>3;
  if(d>3){const s=Math.min(G.st.spd*1.5,d*4);Q.x+=dx/d*s*dt;Q.y+=dy/d*s*dt;if(Math.abs(dx)>1)Q.face=dx>0?1:-1;Q.anim+=dt*8}
  if(d>200){Q.x=P.x;Q.y=P.y}
  Q.cd-=dt;Q.cd2-=dt;
  if(Q.k==='linhho'){
    if(Q.cd<=0){const e=nearestE(Q.x,Q.y,70);Q.cd=0.9;if(e){Q.atkT=0.35;Q.face=e.x>Q.x?1:-1;Q.x+=(e.x-Q.x)*0.5;Q.y+=(e.y-Q.y)*0.5;hurtE(e,10*pw,'kim',{kb:20,kx:Q.x,ky:Q.y});G.fx.push({k:'spark',x:e.x,y:e.y-e.r,t:0,dur:0.2,c:'#ffffff'})}}
    if(Q.cd2<=0){Q.cd2=5;P.hp=Math.min(P.mhp,P.hp+2*pw);G.nums.push({x:P.x,y:P.y-28,v:'+'+Math.round(2*pw),t:0,c:'#6dff8a'})}}
  else if(Q.k==='kimbuc'){
    Q.orb+=dt*3.2;Q.x=P.x+Math.cos(Q.orb)*26;Q.y=P.y-4+Math.sin(Q.orb)*18;Q.face=Math.cos(Q.orb+1.57)>0?1:-1;
    if(Q.cd<=0){Q.cd=0.35;forNear(Q.x,Q.y,18,e=>{if(Math.hypot(e.x-Q.x,e.y-Q.y)<14+e.r){if(Q.atkT<=0)Q.atkT=0.3;hurtE(e,6*pw,'hoa',{kb:10,kx:Q.x,ky:Q.y});return false}})}}
  else if(Q.k==='thanhlong'){
    if(Q.cd<=0){Q.cd=2;let cur=nearestE(Q.x,Q.y,150);if(cur){Q.atkT=0.4;Q.face=cur.x>Q.x?1:-1;const hit=new Set(),pts=[[Q.x+Q.face*6,Q.y-14]];for(let i=0;i<3&&cur;i++){hit.add(cur);pts.push([cur.x,cur.y-cur.r]);hurtE(cur,16*pw,'thuy',{fx:Q.x});cur=nearestE(cur.x,cur.y,70,hit)}G.fx.push({k:'bolt',pts,t:0,dur:0.2});sfx('zap')}}}
  else if(Q.k==='huyenquy'){
    for(const b of G.es)if(!b.dead&&Math.hypot(b.x-P.x,b.y-(P.y-8))<24){b.dead=true;G.fx.push({k:'spark',x:b.x,y:b.y,t:0,dur:0.2,c:'#ffd45a'})}
    if(Q.cd2<=0){Q.cd2=8;Q.atkT=0.5;forNear(P.x,P.y,60,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<60)hurtE(e,12*pw,'tho',{kb:90})});G.fx.push({k:'bell',x:P.x,y:P.y,r:60,t:0,dur:0.5})}}
}
// ── linh thú nhặt đồ và đào bảo (kiểu Diablo)
function petTask(Q,dt,D,pw){
  const P=G.p,lv=petLv(Q.k),R=90+lv*14,spd=G.st.spd*(1.6+lv*0.06);
  if(Q.digT===undefined)Q.digT=18+rand()*15;
  if(!Q.task){Q.digT-=dt;
    // tìm đồ rơi gần nhất (linh đan, tụ linh phù, bảo rương) hoặc cụm linh khí xa
    let best=null,bd=R;for(const it of G.items){if(it.mag||it.held)continue;const d=Math.hypot(it.x-P.x,it.y-P.y);if(d<bd&&d>18){bd=d;best=it}}
    if(!best){let bd2=R;for(const g of G.gems){if(g.mag)continue;const d=Math.hypot(g.x-P.x,g.y-P.y);if(d>40&&d<bd2&&g.v>=5){bd2=d;best=g}}if(best)best={gem:best}}
    if(best)Q.task={k:'fetch',tg:best.gem||best,gem:!!best.gem,t:6};
    else if(Q.digT<=0&&G.e.length<160){Q.digT=(26+rand()*16)*(1-lv*0.04);Q.task={k:'dig',t:1.6,x:Q.x,y:Q.y}}}
  const T=Q.task;if(!T)return false;
  T.t-=dt;if(T.t<=0){if(T.tg&&T.tg.held){T.tg.held=0;T.tg.mag=1}Q.task=null;return false}
  if(T.k==='fetch'){
    const tg=T.tg,carrying=tg.held,tx=carrying?P.x:tg.x,ty=carrying?P.y:tg.y,dx=tx-Q.x,dy=ty-Q.y,d=Math.hypot(dx,dy)||1;
    Q.x+=dx/d*Math.min(spd,d*6)*dt;Q.y+=dy/d*Math.min(spd,d*6)*dt;if(Math.abs(dx)>1)Q.face=dx>0?1:-1;Q.anim+=dt*12;Q.mv=true;
    for(const g of G.gems)if(!g.mag&&Math.abs(g.x-Q.x)<16&&Math.abs(g.y-Q.y)<16)g.mag=1; // hút linh khí dọc đường
    if(T.gem){if(d<8||tg.mag){Q.task=null}return true}
    if(!G.items.includes(tg)){Q.task=null;return true}
    if(!carrying&&d<8){tg.held=1;if(typeof sfx==='function')sfx('gem')}
    if(carrying){tg.x=Q.x;tg.y=Q.y-14-(D.fly?10:0);if(d<14){tg.held=0;tg.mag=1;Q.task=null}}
    return true}
  if(T.k==='dig'){Q.mv=false;Q.atkT=0.2;
    if(typeof vp==='function'&&rand()<0.5)vp(Q.x+(rand()-.5)*6,Q.y,{vx:(rand()-.5)*40,vy:-30-rand()*30,g:160,life:0.5,s:2,c:rand()<0.5?'#8a6a40':'#c8a870',k:3,vr:8,add:0});
    if(T.t<=0.05){Q.task=null;const r=rand(),A=G.ai||{lt:1};
      if(r<0.04+lv*0.004&&tryChest(Q.x,Q.y)){G.nums.push({x:Q.x,y:Q.y-24,v:i18n('ui.pet.baoRuong','Bảo rương!'),t:0,c:'#ffd45a'})}
      else if(r<0.25){G.items.push({k:'heal',x:Q.x,y:Q.y,t:0})}
      else{const v=Math.round((2+rand()*4)*(1+lv*0.1)*A.lt);G.lt+=v;G.nums.push({x:Q.x,y:Q.y-24,v:'+'+v+' ◈',t:0,c:'#7ff0e0'})}
      if(typeof burstP==='function')burstP(Q.x,Q.y-6,12,['#ffd45a','#ffffff','#7ff0e0'],{spd:60,up:30,life:0.5,s:1.8});if(typeof sfx==='function')sfx('pick')}
    return true}
  return false;
}
function drawPet(){const Q=G.pet;if(!Q)return;const D=PETS[Q.k],z=D.fly?9+Math.sin(G.t*5)*2:0,sp=D.spr;
  let k;
  if(Q.atkT>0){const dur=Q.k==='huyenquy'?0.5:Q.k==='thanhlong'?0.4:0.35;k=`e_${sp}_atk${Math.min(3,((1-Q.atkT/dur)*4)|0)}`}
  else if(Q.mv||D.fly)k=`e_${sp}_walk${(Q.anim|0)%4}`;
  else k=`e_${sp}_idle${((G.t*2.5)|0)%2}`;
  ell(Q.x,Q.y,D.fly?4:6,2,'#23402a',D.fly?0.15:0.25);
  if(typeof glow==='function')glow(Q.x,Q.y-6-z,10+Math.sin(G.t*4)*1.5,D.gc,0.28);
  if(!drawS(k,Q.x,Q.y-z,{flip:Q.face<0,sc:1.25}))dot(Q.x,Q.y-6-z,4,D.gc);
  if(typeof vp==='function'&&Math.random()<0.08)vp(Q.x+(Math.random()-.5)*10,Q.y-4-z-Math.random()*8,{vy:-12,vx:(Math.random()-.5)*6,life:0.6,s:1.3,c:D.gc,drag:1});
  if(Q.k==='huyenquy'){const a=0.22+Math.sin(G.t*4)*0.08;ctx.save();ctx.translate(G.p.x,G.p.y-8);ctx.rotate(G.t*0.8);ctx.globalAlpha=a;ctx.strokeStyle='#ffd45a';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=6;i++){const an=i/6*TAU;i?ctx.lineTo(Math.cos(an)*24,Math.sin(an)*24):ctx.moveTo(24,0)}ctx.stroke();ctx.restore();ctx.globalAlpha=1}}

// ── Thông Thiên Tháp: mỗi tầng là trận ngắn có luật riêng, kết thúc bằng boss
const TOWER_T=150;
const TMODS=[
  {id:'hoa',n:'Hỏa Vực',d:'Mọi yêu quái mang hành Hỏa'},
  {id:'toc',n:'Cuồng Phong',d:'Yêu quái nhanh hơn 30%'},
  {id:'giap',n:'Thiết Giáp',d:'Yêu quái thêm 50% máu, rơi thêm 50% linh khí'},
  {id:'vo',n:'Vô Linh Đan',d:'Không có linh dược hồi máu'},
  {id:'phuc',n:'Phúc Địa',d:'Công pháp hồi chiêu nhanh hơn 20%'},
  {id:'dem',n:'Âm Dạ',d:'Yêu quái tinh anh xuất hiện nhiều gấp 5'},
];
function towerSave(){if(!SAVE.tower)SAVE.tower={best:0};return SAVE.tower}
function towerSpec(f){const R=mulberry32(f*7919+13);return{f,mod:TMODS[(R()*TMODS.length)|0],off:Math.min(780,(f-1)*55),hp:1+0.16*(f-1),boss:['cuuvi','long','maton'][(f-1)%3],bossHp:0.2+0.07*(f-1),lt:40+f*18,rar:Math.min(0.5,f*0.03)}}
const TW=()=>G&&G.tower;
const effT=()=>G.tower?G.t+G.tower.off:G.t;
