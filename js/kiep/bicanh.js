'use strict';
// ───────────────────────── Cơ quan bí ẩn và Bí cảnh (đợt 1)
// Mỗi trận (trừ Tháp) rải 2–4 cơ quan. Giải xong mở cổng không gian vào Bí cảnh: Tàng Bảo Khố (rương) hoặc Cổ Điện Hộ Vệ (Kỳ Vật).
// Đồng hồ trận dừng khi ở trong Bí cảnh. Hình vẽ: tools/art_src/pzprops.png, kyvat.png (Google Flow).

// ── Kỳ Vật: giữ vĩnh viễn, mang 1 món vào trận
const KV={
  nothan:{n:'Nỏ Thần',d:'Cứ 5 giây bắn 10 mũi tên vàng tỏa hình quạt về phía yêu quái gần nhất.',ic:'kv_nothan'},
  ngusat:{n:'Ngựa Sắt Thánh Gióng',d:'Chạy nhanh hơn 15%, vó ngựa để lại vệt lửa đốt yêu quái.',ic:'kv_ngusat'},
  nieucom:{n:'Niêu Cơm Thạch Sanh',d:'Hồi máu liên tục, chậm mà không bao giờ cạn.',ic:'kv_nieucom'},
  traucau:{n:'Trầu Cau',d:'Hồi sinh một lần với nửa máu, tỏa sóng đẩy lùi yêu quái.',ic:'kv_traucau'},
  gaythan:{n:'Gậy Thần',d:'Cứ 4 giây quét gậy một vòng quanh người, đánh văng yêu quái.',ic:'kv_gaythan'},
};
const KV_ORDER=['nothan','ngusat','nieucom','traucau','gaythan'];
for(const k in KV){KV[k].n=i18n('kv.'+k,KV[k].n);KV[k].d=i18n('kv.'+k+'.mota',KV[k].d)}
function kvSave(){if(!SAVE.kv)SAVE.kv={own:{},eq:null};return SAVE.kv}
function bcLog(){if(!SAVE.bcl)SAVE.bcl={pz:{},bc:{}};return SAVE.bcl}

// ── câu đố dân gian (Kent duyệt lại trong tài liệu)
const RIDDLES=[
  ['Con gì càng to càng nhỏ?','Con cua',['Con voi','Con kiến']],
  ['Con gì đầu dê mình ốc?','Con dốc',['Con sên','Con dê']],
  ['Mình bằng hạt đỗ, ăn giỗ cả làng. Là con gì?','Con ruồi',['Con kiến','Con muỗi']],
  ['Bằng cái vung, vùng xuống ao, đào chẳng thấy, lấy chẳng được. Là gì?','Bóng trăng',['Hòn đá','Con cá']],
  ['Nhà xanh lại đóng đố xanh, tra đố cho chặt, hỏi anh là gì?','Bánh chưng',['Bánh giầy','Quả bưởi']],
  ['Thân em xưa ở bụi tre, mùa đông xếp lại, mùa hè mở ra. Là gì?','Cái quạt',['Cái nón','Cái ô']],
  ['Ruột dài từ mũi đến chân, mũi mòn ruột cũng dần dần mòn theo. Là gì?','Bút chì',['Cây nến','Cái đũa']],
  ['Cái gì có răng mà không có miệng?','Cái lược',['Cái bát','Con dao']],
  ['Cái gì có cổ mà không có đầu?','Cái áo',['Cái mũ','Đôi giày']],
  ['Cái gì có chân mà không biết đi?','Cái bàn',['Con rắn','Con cá']],
  ['Quả gì có mắt mà không nhìn thấy?','Quả dứa',['Quả cam','Quả chuối']],
  ['Cái gì tay trái cầm được mà tay phải không cầm được?','Khuỷu tay phải',['Đôi đũa','Hòn đá']],
  ['Cái gì đi thì đứng, dừng lại thì ngã?','Xe đạp',['Con ngựa','Cái ghế']],
  ['Cái gì của bạn nhưng người khác dùng nhiều hơn bạn?','Cái tên',['Cái áo','Đôi dép']],
  ['Cái gì càng rửa càng bẩn?','Nước',['Cái chén','Bàn tay']],
  ['Cái gì luôn đến mà không bao giờ tới?','Ngày mai',['Cơn mưa','Mùa xuân']],
  ['Con gì mang cả cái nhà đi khắp nơi?','Con ốc sên',['Con kiến','Con chim']],
];
RIDDLES.forEach((r,i)=>{r[0]=i18n('caudo.'+(i+1)+'.hoi',r[0]);r[1]=i18n('caudo.'+(i+1)+'.dap',r[1]);r[2]=[i18n('caudo.'+(i+1)+'.sai1',r[2][0]),i18n('caudo.'+(i+1)+'.sai2',r[2][1])]});
const PZ_TYPES=['nguhanh','den','caudo','cot','ho','chuong'];
const PZ_NAME={nguhanh:'Ngũ Hành Ấn',den:'Thắp Đèn Theo Thứ Tự',caudo:'Câu Đố Dân Gian',cot:'Cột Phù Văn',ho:'Linh Hồ Dẫn Đường',chuong:'Phá Chướng Ngại'};
const BC_NAME={kho:'Tàng Bảo Khố',hove:'Cổ Điện Hộ Vệ',vu:'Vũ Điện'};
for(const k in PZ_NAME)PZ_NAME[k]=i18n('pz.'+k,PZ_NAME[k]);for(const k in BC_NAME)BC_NAME[k]=i18n('bc.'+k,BC_NAME[k]);
const ELC={kim:'#ffd45a',moc:'#7bff9a',thuy:'#7fd8ff',hoa:'#ff7a3a',tho:'#d8a860'};

// ── tiện ích thế giới
function pzGrid(W,o){const x0=Math.max(0,((o.x-o.r)/OCELL)|0),x1=Math.min(W.gw-1,((o.x+o.r)/OCELL)|0),y0=Math.max(0,((o.y-o.r)/OCELL)|0),y1=Math.min(W.gw-1,((o.y+o.r)/OCELL)|0);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)W.grid[y*W.gw+x].push(o)}
function pzAdd(o){const W=G.world;W.obs.push(o);pzGrid(W,o);return o}
function pzRemove(o){const W=G.world;W.obs=W.obs.filter(q=>q!==o);for(const c of W.grid){const i=c.indexOf(o);if(i>=0)c.splice(i,1)}}
function pzClear(x,y,R){for(const o of G.world.obs.slice())if(o.k==='prop'&&Math.hypot(o.x-x,o.y-y)<R+o.r)pzRemove(o)}
function pzSpotOK(x,y,R){if(x<R+40||y<R+40||x>WORLD-R-40||y>WORLD-R-40)return false;for(const o of G.world.obs)if(o.k==='pond'&&Math.hypot(o.x-x,o.y-y)<o.r+R+20)return false;return true}
const pzD=(o)=>Math.hypot(G.p.x-o.x,G.p.y-o.y);

// ── khởi tạo cơ quan
// tỉ lệ: không phải trận nào cũng có cơ quan, giải xong cũng chưa chắc mở cổng
const PZ_W={den:10,cot:10,caudo:10,chuong:10,nguhanh:7,ho:6,trantran:6,gioty:3,ankhi:3}; // kiểu càng hiếm trọng số càng thấp
const pzChance=n=>Math.min(0.8,0.5+n*0.03);   // tỉ lệ trận có cơ quan: Ải 1 ≈ 53%, Ải 10 trở lên 80%
const PZ_PORTAL=0.6;                          // giải xong có 60% mở cổng Bí cảnh
const BC_W={kho:40,hove:20,dau:15,tuyen:15,vu:10,phetich:14}; // tỉ lệ từng loại Bí cảnh
function pzInit(){
  G.pz=[];G.bc=null;G.bcGear=[];G.kvNew=[];G.kv=kvSave().eq;G.kvT=0;G.kvUsed=0;
  if(G.tower)return;
  const A=G.ai||{n:1};if(rand()>pzChance(A.n))return;
  const r=rand();let n=r<0.6?1:r<0.9?2:3;if(A.n>=5&&rand()<0.3)n++;
  const pool=PZ_TYPES.slice(),types=[];while(types.length<n&&pool.length){let tot=0;for(const t of pool)tot+=PZ_W[t]||5;let q=rand()*tot;for(let i=0;i<pool.length;i++){q-=PZ_W[pool[i]]||5;if(q<=0){types.push(pool.splice(i,1)[0]);break}}}
  const C=WORLD/2,spots=[];
  for(const ty of types){let x,y,ok=false;for(let i=0;i<80&&!ok;i++){const a=rand()*TAU,d=420+rand()*640;x=C+Math.cos(a)*d;y=C+Math.sin(a)*d;ok=pzSpotOK(x,y,ty==='cot'?340:130)&&spots.every(s=>Math.hypot(s[0]-x,s[1]-y)>560)}
    if(!ok)continue;spots.push([x,y]);pzMake(ty,x,y)}
}
function pzPart(M,part,x,y,spr,r,extra){return pzAdd(Object.assign({k:'pz',M,part,x,y,spr,r:r||0,deco:!r},extra||{}))}
function pzMake(ty,x,y){
  const M={ty,x,y,seen:0,solved:0,done:0,parts:[],t:0,bc:rand()<0.55?'kho':'hove'};G.pz.push(M);
  if(ty==='cot')for(let i=0;i<4;i++){const a=i/4*TAU+rand()*0.6;pzClear(x+Math.cos(a)*260,y+Math.sin(a)*190,40)}
  pzClear(x,y,ty==='den'?120:110);
  const P=(...a)=>{const o=pzPart(M,...a);M.parts.push(o);return o};
  if(ty==='nguhanh'){M.door=P('door',x,y-10,'p_door_closed',14);for(let i=0;i<3;i++){const a=Math.PI*0.5+(i-1)*1.25;P('seal',x+Math.cos(a)*85,y+Math.sin(a)*60+20,'p_pillar_off',6,{i,lit:0,el:null})}}
  else if(ty==='den'){M.order=[0,1,2,3].sort(()=>rand()-.5);M.prog=0;M.tab=P('tablet',x,y,'p_tablet',8);const els=['kim','moc','thuy','hoa','tho'].sort(()=>rand()-.5);
    [[-70,-50],[70,-50],[-70,55],[70,55]].forEach(([dx,dy],i)=>P('lamp',x+dx,y+dy,'p_slantern_off',5,{i,el:els[i],lit:0,hold:0}))}
  else if(ty==='caudo'){M.q=RIDDLES[(rand()*RIDDLES.length)|0];M.tab=P('tablet',x,y-30,'p_tablet',8);M.cool=0;pzRiddleLay(M)}
  else if(ty==='cot'){M.prog=0;M.timer=0;for(let i=0;i<4;i++){const a=i/4*TAU+rand()*0.6;P('pillar',x+Math.cos(a)*260,y+Math.sin(a)*190,'p_pillar_off',7,{i,lit:0})}}
  else if(ty==='ho'){M.fox={x,y,vx:0,vy:0,t:0,flee:0,anim:0,face:1};M.caught=0}
  else if(ty==='chuong'){M.kind=rand()<0.5?'vines':'boulder';M.cave=P('cave',x,y-16,'p_cave',0);M.block=P('block',x,y+2,M.kind==='vines'?'pz_vines':'pz_boulder',14,{hp:1})}
  return M;
}
function pzRiddleLay(M){const opts=[M.q[1],...M.q[2]].sort(()=>rand()-.5);for(const o of M.parts.filter(o=>o.part==='plate'))pzRemove(o);M.parts=M.parts.filter(o=>o.part!=='plate');
  opts.forEach((t,i)=>{const o=pzPart(M,'plate',M.x+(i-1)*58,M.y+40,'pz_plate',0,{ans:t,ok:t===M.q[1],hold:0,bad:0});M.parts.push(o)})}

// ── chiêu tự đánh: thắp ấn, đốt dây gai
const _fwBC=fireWeapon;
fireWeapon=function(k,w){const r=_fwBC(k,w);if(G&&G.pz&&!G.bc)pzOnElem(WEAP[k].el,G.p.x,G.p.y,k);return r};
function pzOnElem(el,x,y,src){
  for(const M of G.pz){if(M.solved||Math.hypot(M.x-x,M.y-y)>260)continue;
    if(M.ty==='nguhanh')for(const s of M.parts)if(s.part==='seal'&&!s.lit&&s.el===el&&Math.hypot(s.x-x,s.y-y)<70){s.lit=1;s.litT=0;pzZap(x,y-10,s.x,s.y-26,ELC[el]);sfx('sense');pzCheck(M)}
    if(M.ty==='chuong'&&M.block&&Math.hypot(M.block.x-x,M.block.y-y)<120){
      if(M.kind==='vines'&&(el==='hoa'||src==='ult')){pzZap(x,y-10,M.block.x,M.block.y-10,'#ff7a3a');pzBreak(M)}
      if(M.kind==='boulder'&&(el==='tho'||src==='ult')){pzZap(x,y-10,M.block.x,M.block.y-10,'#d8a860');pzBreak(M)}}}
}
function pzZap(x0,y0,x1,y1,c){G.fx.push({k:'pzbeam',x:x0,y:y0,x1,y1,c,t:0,dur:0.45})}
function pzBreak(M){const b=M.block;if(!b||b.breaking)return;b.breaking=1;b.spr=M.kind==='vines'?'pz_vines_fire':'pz_rubble';b.deco=1;sfx(M.kind==='vines'?'fire':'boom');shake(0.3);
  burstP(b.x,b.y-14,40,M.kind==='vines'?PAL.hoa:['#8a7050','#b89870','#d8c8a0'],{spd:120,life:0.7,s:2.4});
  G.later.push({t:M.kind==='vines'?1.2:0.4,f:()=>{pzRemove(b);M.block=null;pzSolve(M,M.x,M.y-6)}})}
function pzCheck(M){if(M.ty==='nguhanh'&&M.parts.filter(s=>s.part==='seal').every(s=>s.lit)){M.door.spr='p_door_open';pzSolve(M,M.door.x,M.door.y+12)}}
function pzSolve(M,x,y){if(M.solved)return;M.solved=1;const L0=bcLog(),entered=Object.values(L0.bc).reduce((a,b)=>a+b,0);
  if(M.ty!=='gioty'&&entered>0&&rand()>PZ_PORTAL){M.done=1;const A=G.ai||{lt:1},v=Math.round((15+rand()*20)*(A.lt||1));G.lt+=v;G.nums.push({x,y:y-30,v:'+'+v+' ◈',t:0,c:'#7ff0e0'});
    for(let i=0;i<6;i++)dropGem(x+(rand()-.5)*40,y+(rand()-.5)*30,5);announce(i18nf('pz.giaikhong','Giải được {0}, nhưng cổng không gian chưa mở',PZ_NAME[M.ty]),'good');sfx('chest');
    burstP(x,y-12,30,['#ffffff','#ffd45a'],{spd:110,life:0.6,s:2});L0.pz[M.ty]=(L0.pz[M.ty]||0)+1;saveSave();return}
  M.portal=pzPart(M,'portal',x,y,'pz_portal',0,{hold:0});M.parts.push(M.portal);
  announce(i18nf('pz.giai','Giải được {0}! Cổng không gian đã mở',PZ_NAME[M.ty]),'realm');sfx('realm');flash('#fff6c0',0.3);if(typeof buzz==='function')buzz([30,30,60]);
  burstP(x,y-12,50,['#ffffff','#d0a8ff','#ffd45a'],{spd:150,life:0.8,s:2.4});const L=bcLog();L.pz[M.ty]=(L.pz[M.ty]||0)+1;saveSave()}

// ── cập nhật mỗi khung hình
function pzTick(dt){
  if(!G.pz)return;const P=G.p;
  if(G.bc){bcTick(dt);return}
  if(G.kv)kvTick(dt);
  for(const M of G.pz){if(M.done)continue;const d=Math.hypot(P.x-M.x,P.y-M.y);
    if(!M.seen&&d<300){M.seen=1;announce(i18n('pz.camnhan','Cảm nhận được cơ quan bí ẩn gần đây…'),'good');if(G.pet&&G.nums.length<80)G.nums.push({x:G.pet.x,y:G.pet.y-26,v:'!',t:0,c:'#ffd45a'});
      if(M.ty==='nguhanh'){const els=[...new Set(Object.keys(G.w).map(k=>WEAP[k].el))];for(const s of M.parts)if(s.part==='seal')s.el=els[(s.i+((rand()*els.length)|0))%els.length]||'kim'}}
    if(d>520)continue;M.t+=dt;
    if(M.portal){const pd=pzD(M.portal);if(pd<16){M.portal.hold+=dt;if(M.portal.hold>0.6){if(G.kiep){announce(i18n('pz.kiep','Thiên Kiếp đang giáng, cổng không mở được'),'warn');M.portal.hold=-2}else bcEnter(M)}}else M.portal.hold=Math.min(M.portal.hold,0)+0;continue}
    if(M.ty==='nguhanh'){for(const s of M.parts)if(s.part==='seal'){s.spr=s.lit?'p_pillar_on':'p_pillar_off';if(s.lit){s.litT+=dt;if(s.litT>25){s.lit=0}}}}
    else if(M.ty==='den'){for(const l of M.parts)if(l.part==='lamp'&&!l.lit){if(pzD(l)<26){l.hold+=dt;if(l.hold>0.8){l.hold=0;if(M.order[M.prog]===l.i){l.lit=1;l.spr='p_slantern_on';M.prog++;sfx('ignite');burstP(l.x,l.y-24,14,['#fff6c0',ELC[l.el]],{spd:60,life:0.5});if(M.prog>=4)pzSolve(M,M.tab.x,M.tab.y+30)}
            else{M.prog=0;for(const q of M.parts)if(q.part==='lamp'){q.lit=0;q.spr='p_slantern_off'}M.fail=1;announce(i18n('pz.sai','Sai thứ tự, đèn tắt hết'),'warn');sfx('wrong');flash('#ff6060',0.15)}}}else l.hold=0}}
    else if(M.ty==='caudo'){M.cool=Math.max(0,M.cool-dt);for(const p of M.parts)if(p.part==='plate'){p.bad=Math.max(0,p.bad-dt);if(M.cool<=0&&Math.abs(P.x-p.x)<17&&Math.abs(P.y-p.y)<12){p.hold+=dt;if(p.hold>1){p.hold=0;
          if(p.ok){p.spr='pz_plate_on';pzSolve(M,M.tab.x,M.tab.y+20)}else{p.spr='pz_plate_x';p.bad=2.5;M.cool=2.5;sfx('wrong');announce(i18n('pz.sai2','Chưa đúng, nghĩ lại xem…'),'warn');G.later.push({t:2.5,f:()=>{if(!M.solved)pzRiddleLay(M)}})}}}else p.hold=0}}
    else if(M.ty==='cot'){if(M.prog>0){M.timer-=dt;if(M.timer<=0){M.prog=0;for(const c of M.parts)if(c.part==='pillar'){c.lit=0;c.spr='p_pillar_off'}announce(i18n('pz.hethoigian','Hết giờ, cột phù văn tắt'),'warn')}}
      for(const c of M.parts)if(c.part==='pillar'&&!c.lit&&c.i===M.prog&&pzD(c)<24){c.lit=1;c.spr='p_pillar_on';M.prog++;sfx('sense');burstP(c.x,c.y-30,18,['#fff6c0','#ffd45a'],{spd:70,life:0.5});
        if(M.prog===1){M.timer=30;announce(i18n('pz.cot','Chạm hết cột phù văn trong 30 giây!'),'good')}if(M.prog>=4)pzSolve(M,M.x,M.y)}}
    else if(M.ty==='ho')pzFox(M,dt);
    else if(M.ty==='chuong'&&M.block&&!M.block.breaking&&G.ult&&pzD(M.block)<180)pzBreak(M);
  }
  if(G.ult)for(const M of G.pz)if(M.ty==='nguhanh'&&!M.solved&&pzD(M)<160){const s=M.parts.find(s=>s.part==='seal'&&!s.lit);if(s){s.lit=1;s.litT=0;pzZap(G.p.x,G.p.y-10,s.x,s.y-26,'#ffffff');pzCheck(M)}}
}
function pzFox(M,dt){const F=M.fox,P=G.p,d=Math.hypot(P.x-F.x,P.y-F.y);F.anim+=dt*10;
  if(M.lead){const dx=M.lead[0]-F.x,dy=M.lead[1]-F.y,L=Math.hypot(dx,dy);if(L>4){F.x+=dx/L*120*dt;F.y+=dy/L*120*dt;F.face=dx>0?1:-1;F.mv=1}else{F.mv=0;if(!M.solved)pzSolve(M,F.x,F.y+18)}
    if(rand()<0.3)vp(F.x,F.y,{life:1.2,s:2,c:'#e8f8ff',drag:3});return}
  if(d<16){M.caught++;sfx('gem');burstP(F.x,F.y-8,24,['#ffffff','#d0e8ff'],{spd:80,life:0.5});
    if(M.caught>=3){announce(i18n('pz.ho3','Linh Hồ chịu dẫn đường!'),'good');const a=rand()*TAU;M.lead=[clamp(F.x+Math.cos(a)*220,80,WORLD-80),clamp(F.y+Math.sin(a)*180,80,WORLD-80)];pzClear(M.lead[0],M.lead[1],50);return}
    announce(i18nf('pz.ho','Chạm được Linh Hồ {0}/3',M.caught),'good');const a=rand()*TAU;F.x=clamp(F.x+Math.cos(a)*200,60,WORLD-60);F.y=clamp(F.y+Math.sin(a)*160,60,WORLD-60);if(inPond(F.x,F.y,8)){F.x=M.x;F.y=M.y}return}
  if(d<110){const sp=95+M.caught*15;F.x+=(F.x-P.x)/d*sp*dt;F.y+=(F.y-P.y)/d*sp*dt;F.face=F.x>P.x?1:-1;F.mv=1;const o={x:F.x,y:F.y};collideObs(o,6);F.x=o.x;F.y=o.y;
    if(Math.hypot(F.x-M.x,F.y-M.y)>320){F.x+=(M.x-F.x)*dt;F.y+=(M.y-F.y)*dt}}else F.mv=0;
  if(rand()<0.15)vp(F.x+(rand()-.5)*6,F.y,{life:1.5,s:1.8,c:'#cfe8ff',drag:3})}

// ── Bí cảnh
function bcGenWorld(){const C=WORLD/2,obs=[],MP=MAPS[G.mapId];
  for(let i=0;i<24;i++){const a=i/24*TAU;obs.push({k:'prop',x:C+Math.cos(a)*255,y:C+Math.sin(a)*200,r:8,spr:i%2?'p_pillar':'p_lantern',sc:i%2?0.65:0.5})}
  const R=mulberry32((rand()*1e9)|0);for(let i=0;i<70;i++){const a=R()*TAU,d=280+R()*160,L=MP.trees,spr=L[(R()*L.length)|0][0];obs.push({k:'prop',x:C+Math.cos(a)*d*1.2,y:C+Math.sin(a)*d,r:5,spr,deco:1})}
  const gw=Math.ceil(WORLD/OCELL),W={obs:[],grid:Array.from({length:gw*gw},()=>[]),gw,seed:G.world.seed,map:G.mapId,pocket:1};for(const o of obs){W.obs.push(o);pzGrid(W,o)}return W}
function bcRoll(){const L=bcLog(),n=Object.values(L.bc).reduce((a,b)=>a+b,0),kvLeft=KV_ORDER.some(k=>!kvSave().own[k]),wLeft=typeof WING_ORDER!=='undefined'&&WING_ORDER.some(k=>!wingSave().own[k]);
  // bảo hiểm: vào 3 lần chưa có Kỳ Vật thì lần sau chắc Cổ Điện Hộ Vệ; vào 5 lần chưa có cánh thì chắc Vũ Điện
  if(kvLeft&&n>=3&&!Object.keys(kvSave().own).length)return 'hove';
  if(wLeft&&n>=5&&!Object.keys(wingSave().own).length)return 'vu';
  const W=Object.assign({},BC_W);if(!kvLeft)W.hove=0;if(!wLeft)W.vu=0;if(typeof kyLeft!=='function'||!kyLeft(G.mapId))W.phetich=0;let tot=0;for(const k in W)tot+=W[k];let q=rand()*tot;for(const k in W){q-=W[k];if(q<=0)return k}return 'kho'}
function bcEnter(M){
  const P=G.p,C=WORLD/2;
  G.bc={M,ty:M.bc,t:0,save:{world:G.world,e:G.e,gems:G.gems,items:G.items,zones:G.zones,es:G.es,pr:G.pr,x:P.x,y:P.y,boss:G.boss,t0:G.t,waves:G.waves,dying:G.dying},done:0};
  G.bc.ty=bcRoll();
  G.world=bcGenWorld();G.e=[];G.gems=[];G.items=[];G.zones=[];G.es=[];G.pr=[];G.dying=[];G.boss=null;G.waves=null;
  P.x=C;P.y=C+60;if(G.pet){G.pet.x=C+14;G.pet.y=C+66}
  flash('#ffffff',0.7);shake(0.3);sfx('realm');if(typeof buzz==='function')buzz([40,40,80]);
  announce(i18nf('bc.vao','Bí cảnh · {0}',BC_NAME[G.bc.ty]),'realm');
  G.bc.exit=pzAdd({k:'pz',part:'exit',x:C,y:C+100,spr:'pz_portal',r:0,deco:1,hold:-1.5});
  const A=G.ai||{hp:1,lt:1,rar:0};
  if(G.bc.ty==='kho'){const n=3+((rand()*3)|0);G.bc.chests=[];for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*0.55;G.bc.chests.push(pzAdd({k:'pz',part:'bchest',x:C+Math.cos(a)*150,y:C+Math.sin(a)*110,spr:'pz_chest',r:8,open:0}))}
    for(let i=0;i<4+((rand()*4)|0);i++){const a=rand()*TAU;spawnEnemy(rollType(),C+Math.cos(a)*170,C+Math.sin(a)*130,{})}}
  else if(G.bc.ty==='vu')vuSetup();
  else if(G.bc.ty==='tuyen'||G.bc.ty==='dau')bc2Setup();
  else if(G.bc.ty==='phetich')ptSetup();
  else{const g=spawnEnemy('quy',C,C-110,{elite:1});const e=G.e[G.e.length-1];if(e){e.guard=1;e.hp=e.mhp=(1200+G.t*1.6)*(1+G.realm*0.45)*(A.hp||1);e.r*=1.4;e.spd*=0.9}
    announce(i18n('bc.hoveG','Hộ vệ cổ điện đã thức tỉnh!'),'warn')}
  const L=bcLog();L.bc[G.bc.ty]=(L.bc[G.bc.ty]||0)+1;saveSave();
}
function bcTick(dt){const B=G.bc,P=G.p,C=WORLD/2;B.t+=dt;
  // tường vòng tròn
  for(const o of [P,...G.e]){const dx=o.x-C,dy=(o.y-C)*1.27,d=Math.hypot(dx,dy);if(d>236){o.x=C+dx/d*236;o.y=C+dy/d*236/1.27}}
  if(G.kv)kvTick(dt);
  if(B.ty==='kho'){for(const c of B.chests)if(!c.open&&pzD(c)<18)bcOpen(c);if(!B.done&&B.chests.every(c=>c.open)){B.done=1;announce(i18n('bc.xong','Đã vét sạch kho báu! Đi vào cổng để quay về'),'good')}}
  else if(B.ty==='vu')vuTick(dt);
  else if(B.ty==='tuyen'||B.ty==='dau')bc2Tick(dt);
  else if(B.ty==='phetich')ptTick(dt);
  else if(!B.done&&!G.e.some(e=>e.guard&&!e.dead)){B.done=1;bcKV()}
  const ex=B.exit;ex.hold+=dt;if(pzD(ex)<16&&ex.hold>0.6)bcExit();else if(pzD(ex)>=16&&ex.hold>0)ex.hold=0;
  if(B.t>75){announce(i18n('bc.dong','Bí cảnh khép lại…'),'warn');bcExit()}
}
function bcOpen(c){c.open=1;c.spr='pz_chest_open';sfx('chest');burstP(c.x,c.y-12,36,['#ffd45a','#ffffff','#7bff9a'],{spd:110,up:30,life:0.7,s:2.2});
  const A=G.ai||{lt:1,rar:0},r=rand();
  if(r<0.45){const v=Math.round((25+rand()*25)*(A.lt||1));G.lt+=v;G.nums.push({x:c.x,y:c.y-26,v:'+'+v+' ◈',t:0,c:'#7ff0e0'})}
  else if(r<0.75){const it=dropGear(0.2+(A.rar||0));G.bcGear.push(it);announce(i18nf('bc.phapbao','Pháp bảo: {0} · {1}',GEAR[it.k].n,GRAR[it.r].n),'realm')}
  else{const P=G.p;P.hp=P.mhp;G.pendLv++;G.nums.push({x:c.x,y:c.y-26,v:i18n('bc.linhdan','Linh đan!'),t:0,c:'#6dff8a'})}
  saveSave()}
function bcKV(){const S=kvSave(),left=KV_ORDER.filter(k=>!S.own[k]);
  if(!left.length){const v=150;G.lt+=v;announce(i18nf('bc.kvdu','Hộ Vệ ngã xuống · +{0} linh thạch',v),'good');return}
  const k=left[(rand()*left.length)|0];S.own[k]=1;if(!S.eq)S.eq=k;G.kvNew.push(k);saveSave();
  sfx('realm');flash('#fff6c0',0.6);if(typeof buzz==='function')buzz([60,40,120]);
  G.cine={t:0,dur:2.6,kv:k};
  announce(i18nf('bc.kv','Kỳ Vật: {0}! Trang bị ở màn chọn nhân vật',KV[k].n),'realm')}
function bcExit(){const B=G.bc;if(!B)return;const S=B.save,P=G.p;
  G.world=S.world;G.e=S.e;G.gems=S.gems;G.items=S.items;G.zones=S.zones;G.es=S.es;G.pr=S.pr;G.boss=S.boss;G.t=S.t0;G.waves=S.waves;G.dying=S.dying;
  P.x=S.x;P.y=S.y+26;if(G.pet){G.pet.x=P.x+12;G.pet.y=P.y+6}P.inv=Math.max(P.inv,1.5);
  const M=B.M;M.done=1;for(const o of M.parts)if(o.part==='portal')pzRemove(o);
  G.bc=null;flash('#ffffff',0.5);sfx('level');announce(i18n('bc.ra','Trở về trận'),'good')}

// ── Kỳ Vật trong trận
function kvTick(dt){const k=G.kv,P=G.p;G.kvT-=dt;
  if(k==='nieucom')P.hp=Math.min(P.mhp,P.hp+P.mhp*0.006*dt);
  else if(k==='ngusat'&&P.mv){P.x+=P.vx*dt*0.15;P.y+=P.vy*dt*0.15;collideObs(P,P.r);if(G.kvT<=0){G.kvT=0.16;G.zones.push({k:'burn',x:P.x,y:P.y+2,r:11,t:0,dur:1.4,dps:6+G.realm*3,el:'hoa',tick:0,src:'kyvat'})}}
  else if(k==='nothan'&&G.kvT<=0){const tg=nearestE(P.x,P.y,240);if(!tg){G.kvT=0.4;return}G.kvT=5;const a0=Math.atan2(tg.y-P.y,tg.x-P.x);
    for(let i=0;i<10;i++){const a=a0+(i-4.5)*0.09;G.pr.push({k:'sword',arrow:1,src:'khac',x:P.x,y:P.y-8,vx:Math.cos(a)*320,vy:Math.sin(a)*320,dmg:10+G.realm*5,el:'kim',pierce:2,life:0.8,r:4,hit:[]})}sfx('sword')}
  else if(k==='gaythan'&&G.kvT<=0){G.kvT=4;const R=72;G.src='kyvat';forNear(P.x,P.y,R+20,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<R+e.r)hurtE(e,16+G.realm*7,'tho',{kb:90,kx:P.x,ky:P.y})});G.src=null;G.fx.push({k:'kvstaff',x:P.x,y:P.y,t:0,dur:0.45});sfx('sword')}
}
const _hurtPBC=hurtP;
hurtP=function(dmg,src){const P=G.p;if(G&&G.kv==='traucau'&&!G.kvUsed&&!P.dead&&!G.god&&P.inv<=0){const d=Math.max(1,dmg-G.st.armor);if(P.hp-d<=0){G.kvUsed=1;P.hp=P.mhp*0.5;P.inv=2.5;
    G.src='kyvat';forNear(P.x,P.y,140,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<140)hurtE(e,30+G.realm*10,'moc',{kb:160,kx:P.x,ky:P.y})});G.src=null;
    flash('#7bff9a',0.6);shake(0.5);sfx('realm');G.fx.push({k:'ultslam',x:P.x,y:P.y,r:140,lv:2,c:['#e8ffe0','#7bff9a','#2f9e36'],t:0,dur:0.9});announce(i18n('kv.hoisinh','Trầu Cau hồi sinh!'),'realm');return}}
  _hurtPBC(dmg,src)};

// ── nối vào vòng lặp
const _nrBC=newRun;newRun=function(...a){const r=_nrBC(...a);pzInit();return r};
const _usBC=updateSpawns;updateSpawns=function(dt){if(G.bc)return;_usBC(dt)};
const _skBC=startKiep;startKiep=function(...a){if(G.bc)return;return _skBC(...a)};
const _upBC=update;update=function(dt){_upBC(dt);if(G&&!G.over&&!G.paused&&G.pz)pzTick(Math.min(dt,0.05))};
const _erBC=endRun;endRun=function(win){if(G&&G.bc)bcExit();_erBC(win);if(G&&G.bcGear&&G.gearDrops)G.gearDrops.push(...G.bcGear)};

// ── vẽ
const _doBC=drawObs;
drawObs=function(o){if(o.k!=='pz'){_doBC(o);return}const M=o.M,t=G.t;
  if(o.part==='seal'){const el=o.el;drawS(o.spr,o.x,o.y+1,{sc:0.65});if(el){const y=o.y-34+Math.sin(t*3+o.i)*2;if(o.lit)glow(o.x,y,16,ELC[el],0.8);fxD('ic_sig_'+el,o.x,y,14,{alpha:o.lit?1:0.75})}return}
  if(o.part==='lamp'){drawS(o.spr,o.x,o.y+1,{sc:0.55});if(o.lit)glow(o.x,o.y-20,18,ELC[o.el],0.6);fxD('ic_sig_'+o.el,o.x,o.y-40+Math.sin(t*2+o.i)*1.5,10,{alpha:0.9});if(o.hold>0){ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.5);ring(0,0,16,'#ffffff',2,0.3+o.hold);ctx.restore()}return}
  if(o.part==='tablet'){drawS('p_tablet',o.x,o.y+1,{sc:0.6});
    if(M.ty==='den'&&pzD(o)<130){M.order.forEach((li,j)=>{const l=M.parts.find(q=>q.part==='lamp'&&q.i===li);fxD('ic_sig_'+l.el,o.x-27+j*18,o.y-46,13,{alpha:j<M.prog?0.35:1})})}return}
  if(o.part==='plate'){drawS(o.spr,o.x,o.y+8,{sc:0.95});const near=pzD(M.tab)<150;if(near){ctx.font=`700 7px 'Baloo 2',sans-serif`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#1a1030';ctx.strokeText(o.ans,o.x,o.y-14);ctx.fillStyle=o.bad>0?'#ff8080':'#fff6d0';ctx.fillText(o.ans,o.x,o.y-14)}
    if(o.hold>0){ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.5);ring(0,0,18,'#ffd45a',2,0.3+o.hold*0.7);ctx.restore()}return}
  if(o.part==='pillar'){drawS(o.spr,o.x,o.y+1,{sc:0.7});if(o.lit){glow(o.x,o.y-30,20,'#ffd45a',0.6);const nx=M.parts.find(q=>q.part==='pillar'&&q.i===M.prog);if(nx&&M.prog<4){const a=Math.atan2(nx.y-o.y,nx.x-o.x);for(let i=0;i<5;i++){const k=((t*1.5+i/5)%1),L=Math.min(120,Math.hypot(nx.x-o.x,nx.y-o.y));fxD('fx_ember',o.x+Math.cos(a)*k*L,o.y-30+Math.sin(a)*k*L,6,{add:1,alpha:1-k})}}}
    else if(M.prog===o.i&&M.prog>0)glow(o.x,o.y-30,12+Math.sin(t*8)*3,'#ffffff',0.5);return}
  if(o.part==='door'){drawS(o.spr,o.x,o.y+1,{sc:0.8});return}
  if(o.part==='cave'){drawS('p_cave',o.x,o.y+1,{sc:0.9});return}
  if(o.part==='block'){drawS(o.spr,o.x,o.y+1,{sc:1});if(!o.breaking&&pzD(o)<130)fxD('ic_sig_'+(M.kind==='vines'?'hoa':'tho'),o.x,o.y-30+Math.sin(t*2)*2,10,{alpha:0.55});return}
  if(o.part==='portal'||o.part==='exit'){const s=1+Math.sin(t*4)*0.05;glow(o.x,o.y-10,26,'#b48cff',0.7);fxD('pz_portal',o.x,o.y-10,24*s,{rot:t*2});fxD('pz_portal',o.x,o.y-10,16*s,{rot:-t*3,alpha:0.7,add:1});
    if(rand()<0.4)vp(o.x+(rand()-.5)*20,o.y-10+(rand()-.5)*14,{vx:0,vy:-20,life:0.6,s:1.6,c:rand()<0.5?'#d0a8ff':'#ffffff'});if(o.hold>0){ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.5);ring(0,0,18,'#ffffff',2,Math.min(1,o.hold*1.6));ctx.restore()}return}
  if(o.part==='bchest'){glow(o.x,o.y-8,14,'#ffd45a',o.open?0.2:0.5);drawS(o.spr,o.x,o.y+1,{sc:0.9});return}
  _doBC(o)};
// cáo linh vẽ cùng lớp hiệu ứng
const _foBC=drawFxOver;
drawFxOver=function(f){if(f.k==='pzbeam'){const k=f.t/f.dur;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-k;ctx.strokeStyle=f.c;ctx.lineWidth=3*(1-k)+1;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x1,f.y1);ctx.stroke();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';glow(f.x1,f.y1,14,f.c,1-k);return}
  if(f.k==='kvstaff'){const k=f.t/f.dur,P=G.p;for(let i=0;i<3;i++){const a=k*TAU*1.2-i*0.35;fxD('ic_kv_gaythan',P.x+Math.cos(a)*48,P.y-8+Math.sin(a)*30,26,{rot:a+Math.PI/2,alpha:(1-k)*(1-i*0.3)})}return}
  _foBC(f)};
const _muBC=mapUnder;
mapUnder=function(){_muBC();if(!G)return;
  if(G.bc){const C=WORLD/2;fxD('fx_c_bagua',C,C,300,{sq:0.78,rot:G.t*0.15,alpha:0.2,add:1})}
  if(G.pz)for(const M of G.pz){if(M.done||M.ty!=='ho'||Math.hypot(G.p.x-M.fox.x,G.p.y-M.fox.y)>400)continue;const F=M.fox,sp=(PETS.linhho&&PETS.linhho.spr)||'pho';
    glow(F.x,F.y-6,14,'#cfe8ff',0.6);if(!drawS(`e_${sp}_${F.mv?'walk':'idle'}${F.mv?(F.anim|0)%4:((G.t*2.5)|0)%2}`,F.x,F.y,{flip:F.face<0,sc:1.2}))fxD('pz_fox',F.x,F.y-8,16)}};
const _msBC=mapScreen;
mapScreen=function(dt){_msBC(dt);if(!G)return;
  if(G.bc){const g=ctx.createRadialGradient(VW/2,VH/2,VH*0.3,VW/2,VH/2,VH*0.75);g.addColorStop(0,'rgba(30,10,60,0)');g.addColorStop(1,'rgba(30,10,60,0.55)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
    const left=Math.max(0,75-G.bc.t)|0;pzLabel(BC_NAME[G.bc.ty]+' · '+left+'s',VW/2,VH*0.13,9)}
  if(G.pz&&!G.bc)for(const M of G.pz){if(M.solved||M.done)continue;
    if(M.ty==='caudo'&&pzD(M.tab)<150)pzPanel(M.q[0]+'\n'+i18n('pz.dungo','Đứng lên ô đáp án đúng'));
    if(M.ty==='cot'&&M.prog>0)pzLabel(i18nf('pz.cotT','Cột phù văn {0}/4 · {1}s',M.prog,Math.ceil(M.timer)),VW/2,VH*0.13,9);
    if(M.ty==='nguhanh'&&pzD(M)<170)pzPanel(i18n('pz.nhgoi','Đứng sát đá ấn, dùng chiêu đúng hành để thắp sáng'));
    if(M.ty==='den'&&pzD(M)<170)pzPanel(i18n('pz.dengoi','Bia đá ghi thứ tự. Đứng cạnh đèn để thắp'));}};
function pzLabel(s,x,y,sz){ctx.save();ctx.font=`800 ${sz}px 'Baloo 2',sans-serif`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#1a0c2a';ctx.strokeText(s,x,y);ctx.fillStyle='#fff6d0';ctx.fillText(s,x,y);ctx.restore()}
function pzPanel(s){const w=Math.min(VW-24,250),lines=[];ctx.save();ctx.font=`700 8px 'Baloo 2',sans-serif`;
  for(const para of s.split('\n')){let cur='';for(const word of para.split(' ')){const t2=cur?cur+' '+word:word;if(ctx.measureText(t2).width>w-16){lines.push(cur);cur=word}else cur=t2}lines.push(cur)}
  const h=lines.length*11+10,x=(VW-w)/2,y=VH*0.17;ctx.globalAlpha=0.88;ctx.fillStyle='#24163c';ctx.fillRect(x,y,w,h);ctx.globalAlpha=1;ctx.strokeStyle='#ffd45a';ctx.lineWidth=1;ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
  ctx.textAlign='center';ctx.fillStyle='#fff6d0';lines.forEach((l,i)=>ctx.fillText(l,VW/2,y+14+i*11));ctx.restore()}
// bản đồ nhỏ: dấu "?" ở cơ quan đã thấy
const _dmBC=drawMini;
drawMini=function(){_dmBC();if(!G||!G.pz||G.bc)return;const c=$('mini'),x=c.getContext('2d'),S=c.width;x.font='bold 9px sans-serif';x.textAlign='center';
  for(const M of G.pz)if(M.seen&&!M.done){x.fillStyle=M.solved?'#b48cff':'#ffd45a';x.fillText(M.solved?'◎':'?',M.x/WORLD*S,M.y/WORLD*S+3)}};
// mũi tên vàng cho Nỏ Thần
const _dpBC=drawProj;
drawProj=function(p){if(p.arrow){const a=Math.atan2(p.vy,p.vx);glow(p.x,p.y,6,'#ffd45a',0.5);fxD('fx_icespear',p.x,p.y,14,{rot:a,tint:'gold'});return}_dpBC(p)};
// màn hình nhận Kỳ Vật
const _dcBC=drawCine;
drawCine=function(c){if(!c.kv){_dcBC(c);return}const t=c.t,A=Math.min(1,t/0.25)*(t>2.1?Math.max(0,1-(t-2.1)/0.5):1),K=KV[c.kv],cx=VW/2,cy=VH*0.42;
  ctx.globalAlpha=0.6*A;ctx.fillStyle='#120a20';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1;
  fxD('fx_c_hoa',cx,cy,VH*0.5,{rot:t*0.5,alpha:0.5*A,add:1,tint:'gold'});glow(cx,cy,70,'#ffd45a',0.8*A);
  const k=Math.min(1,t/0.6),sc=0.5+0.5*(1-(1-k)**3)+Math.sin(t*3)*0.03;fxD('ic_'+K.ic,cx,cy,90*sc,{alpha:A});
  if(t>0.5){const q=Math.min(1,(t-0.5)/0.35);ctx.save();ctx.translate(VW/2,VH*0.2);ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=A*q;
    ctx.font="800 11px 'Baloo 2',sans-serif";ctx.fillStyle='#ffe9a8';ctx.fillText(i18n('bc.kvmoi','— KỲ VẬT —'),0,-16);
    ctx.font="800 19px 'Baloo 2',sans-serif";ctx.lineWidth=4;ctx.strokeStyle='#5a2a0a';ctx.strokeText(K.n,0,4);ctx.fillStyle='#ffe066';ctx.fillText(K.n,0,4);ctx.restore();
    pzPanelAt(K.d,VH*0.62,A*q)}
  ctx.globalAlpha=1};
function pzPanelAt(s,y,a){ctx.save();ctx.globalAlpha=a;ctx.font="700 9px 'Baloo 2',sans-serif";ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#1a0c2a';const w=VW-40,words=s.split(' '),L=[];let cur='';for(const wd of words){const t2=cur?cur+' '+wd:wd;if(ctx.measureText(t2).width>w){L.push(cur);cur=wd}else cur=t2}L.push(cur);
  L.forEach((l,i)=>{ctx.strokeText(l,VW/2,y+i*12);ctx.fillStyle='#fff6d0';ctx.fillText(l,VW/2,y+i*12)});ctx.restore()}

// ── màn chọn nhân vật: trang bị Kỳ Vật
const _selBC=buildSelect;
buildSelect=function(){_selBC();const box=$('cdInfo');if(!box)return;const S=kvSave(),owned=KV_ORDER.filter(k=>S.own[k]);
  const d=document.createElement('div');d.className='kvbox';
  d.innerHTML=`<small>${i18n('kv.tieude','Kỳ Vật')} ${owned.length}/${KV_ORDER.length}</small><div class="kvrow">${KV_ORDER.map(k=>`<button data-kv="${k}" class="${S.own[k]?'own':''}${S.eq===k?' on':''}">${S.own[k]?`<img src="${iconURL(KV[k].ic)}" alt="">`:'<b class="q">?</b>'}</button>`).join('')}</div><p>${S.eq&&S.own[S.eq]?'<b>'+KV[S.eq].n+'</b>: '+KV[S.eq].d:(owned.length?i18n('kv.chon','Chạm để mang một Kỳ Vật vào trận'):i18n('kv.chuaco','Chưa có Kỳ Vật. Giải cơ quan bí ẩn, hạ hộ vệ trong Cổ Điện Hộ Vệ để nhận'))}</p>`;
  d.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.kv;if(!S.own[k])return;S.eq=S.eq===k?null:k;saveSave();sfx('gem');buildSelect()});
  box.appendChild(d)};
// ── Bí Kíp: Bí cảnh và Kỳ Vật
const _bkBC=buildBikip;
buildBikip=function(){_bkBC();const L=$('bkList'),S=kvSave(),B=bcLog();
  L.appendChild(elx('div','osec',i18nf('bk.kv','Kỳ Vật ({0}/{1})',KV_ORDER.filter(k=>S.own[k]).length,KV_ORDER.length)));
  for(const k of KV_ORDER){const ok=S.own[k];L.appendChild(elx('div','bkrow bkkv'+(ok?' seen':''),`${ok?`<img src="${iconURL(KV[k].ic)}" alt="">`:'<b class="pl">?</b>'}<div class="bke"><b>${ok?KV[k].n:'???'}</b><p>${ok?KV[k].d:i18n('bk.kvan','Hạ hộ vệ trong Cổ Điện Hộ Vệ để nhận')}</p></div>`))}
  const n=PZ_TYPES.filter(t=>B.pz[t]).length;L.appendChild(elx('div','osec',i18nf('bk.pz','Cơ quan bí ẩn ({0}/{1})',n,PZ_TYPES.length)));
  for(const t of PZ_TYPES){const c=B.pz[t]|0;L.appendChild(elx('div','bkrow'+(c?' seen':''),`<div class="bke"><b>${c?PZ_NAME[t]:'???'}</b><i>${c?i18nf('bk.pzn','Đã giải {0} lần',c):i18n('bk.pzan','Chưa khám phá')}</i></div>`))}
  const bn=Object.keys(BC_NAME).map(k=>`${BC_NAME[k]}: ${B.bc[k]|0}`).join(' · ');L.appendChild(elx('div','dbs',`<span>${i18n('bk.bc','Bí cảnh đã vào')} · ${bn}</span>`))};
