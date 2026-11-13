'use strict';
// ───────────────────────── Công pháp mới (Đạo Pháp giai đoạn 2–3): 10 công pháp chung + 12 công pháp bản môn (mỗi nhân vật 2)
// Hình từ Google Flow: tools/art_src/icons_new1.png, icons_new2.png (ic_*), skill_fx1.png, skill_fx2.png (fx_*, mn_*).
// Mỗi công pháp: dữ liệu như WEAP cũ + hàm bắn riêng (CPF) hoặc chạy liên tục (CPT). Vùng riêng (CPZ), đạn riêng vẽ ở CPD, linh vật ở G.mn.
const CPF={},CPT={},CPZ={},CPZD={},CPD={},EXW={};
const L5b=(a,l)=>a[l-1];
function defW(k,o){WEAP[k]={n:o.n,el:o.el,ic:o.ic||k,d:o.d,s:o.s};EVO[k]={p:o.p,n:o.en,d:o.ed};W_MON[k]=o.mon;
  if(o.ex){EXW[k]=o.ex}else WEAP_ORDER.push(k);if(o.fire)CPF[k]=o.fire;if(o.tick)CPT[k]=o.tick}
const linhMul=()=>{const t=dpMonT('linh');return t>=3?1.6:t>=1?1.3:1};
const sumN=n=>n+(G.ch==='bachho'?1:0);
const tgtNear=(r)=>nearestE(G.p.x,G.p.y,r);
function aimA(r){const P=G.p,t=tgtNear(r||220);return t?Math.atan2(t.y-P.y,t.x-P.x):Math.atan2(P.fy||1,P.fx||0)}
function cpFx(spr,x,y,size,dur,o){G.fx.push(Object.assign({k:'cpspr',spr,x,y,size,t:0,dur},o||{}))}
function hitIn(x,y,R,dmg,el,o){let n=0;forNear(x,y,R+20,e=>{if(Math.hypot(e.x-x,e.y-y)<R+e.r){hurtE(e,dmg,el,Object.assign({fx:x},o||{}));n++}});return n}
function bestCluster(r,R){const L=nearestN(G.p.x,G.p.y,r,14);let best=null,bn=-1;for(const e of L){let n=0;for(const o of L)if(Math.hypot(o.x-e.x,o.y-e.y)<R)n++;if(n>bn){bn=n;best=e}}return best}

// ════════ MỘC
defW('thanhtruc',{n:'Thanh Trúc Tiễn',el:'moc',mon:'kiem',p:'kiemtam',en:'Trúc Lâm Vạn Tiễn',ed:'Cứ 3 loạt bắn thêm vòng 12 phi tiêu, chắc chắn trói 1.2 giây.',
  d:['Bắn phi tiêu trúc, chỗ trúng có thể mọc chồi trói quái.','+1 phi tiêu.','Sát thương +20%, xuyên thêm 1.','+1 phi tiêu, hồi chiêu nhanh hơn.','+1 phi tiêu, dễ trói hơn.'],
  s:l=>({cd:L5b([1.1,1.0,0.95,0.88,0.8],l),n:L5b([2,3,3,4,5],l),dmg:L5b([8,9,11,12,15],l),pierce:L5b([1,1,2,2,2],l),root:L5b([0.25,0.25,0.3,0.3,0.38],l)}),
  fire(w,s,st,P){const n=s.n+st.amt+(st.kiemAmt||0),T=nearestN(P.x,P.y,230,n);if(!T.length)return 0.2;const root=s.root;
    const mk=(a,r2,big)=>G.pr.push({k:'bamboo',kiem:1,src:'thanhtruc',x:P.x,y:P.y-8,vx:Math.cos(a)*300,vy:Math.sin(a)*300,dmg:s.dmg,el:'moc',pierce:s.pierce+(st.kiemP||0),life:0.75,r:4,hit:[],
      onHit:e=>{if(!e.d.boss&&(big||rand()<r2)){e.rootT=Math.max(e.rootT,big?1.2:0.6);cpFx('fx_sprout',e.x,e.y+2,12,0.6)}}});
    for(let i=0;i<n;i++){const tg=T[i%T.length];mk(Math.atan2(tg.y-P.y,tg.x-P.x)+(i>=T.length?(rand()-.5)*0.4:(rand()-.5)*0.08),root)}
    if(w.evo){w.v=(w.v|0)+1;if(w.v%3===0)for(let i=0;i<12;i++)mk(i/12*TAU,1,1)}
    sfx('sword');return s.cd*st.cd}});
defW('docchuong',{n:'Độc Chướng Phù',el:'moc',mon:'phu',p:'daotam',en:'Vạn Độc Chướng Lâm',ed:'Đám độc làm chậm quái, lây sang chỗ mỗi con chết.',
  d:['Ném bùa nổ thành đám bào tử độc. Quái chết trong đó lây độc sang chỗ khác.','Đám độc rộng hơn.','+1 lá bùa.','Độc mạnh hơn.','+1 lá bùa, độc mạnh hơn.'],
  s:l=>({cd:L5b([3.2,3.0,2.8,2.6,2.3],l),n:L5b([1,1,2,2,3],l),dps:L5b([6,7,9,11,13],l),r:L5b([36,42,44,48,54],l)}),
  fire(w,s,st,P){const T=nearestN(P.x,P.y,200,s.n+2);if(!T.length)return 0.3;for(let i=0;i<s.n;i++){const e=T[i%T.length],x=e.x,y=e.y;
      G.later.push({t:0.25+i*0.1,f:()=>{G.zones.push({k:'spore',x,y,r:s.r*st.area*(st.phuR||1),t:0,dur:3*st.dur,dps:s.dps,el:'moc',tick:0,src:'docchuong',gen:0,evo:w.evo,sp:0});G.fx.push({k:'boom',x,y,r:14,t:0,dur:0.3})}})}
    sfx('tali');return s.cd*st.cd}});
CPZ.spore=(z,dt)=>{z.tick-=dt;if(z.tick>0)return;z.tick=0.4;G.src='docchuong';forNear(z.x,z.y,z.r+10,e=>{if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+e.r*0.5){hurtE(e,z.dps*0.4,'moc');if(z.evo)e.slowT=Math.max(e.slowT,0.5);
    if(e.dead&&z.gen<2&&z.sp<(z.evo?4:2)){z.sp++;G.zones.push({k:'spore',x:e.x,y:e.y,r:z.r*0.75,t:0,dur:2,dps:z.dps*0.8,el:'moc',tick:0.2,src:'docchuong',gen:z.gen+1,evo:z.evo,sp:0})}}})};
// đám độc: nhiều cụm bào tử nhỏ (cỡ gốc) rải trong vùng, trôi nhẹ
function scat(z,n,f){const R=mulberry32((z.x*7+z.y*13)|0);for(let i=0;i<n;i++){const a=R()*TAU,d=Math.sqrt(R())*z.r*0.85;f(z.x+Math.cos(a)*d,z.y+Math.sin(a)*d*0.65,R(),i)}}
CPZD.spore=z=>{const k=z.t/z.dur,a=Math.min(1,z.t*4)*Math.min(1,(1-k)*4);ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,0.65);ctx.globalAlpha=0.18*a;ctx.fillStyle='#6fbf3a';ctx.beginPath();ctx.arc(0,0,z.r,0,TAU);ctx.fill();ctx.restore();ctx.globalAlpha=1;
  scat(z,Math.round(z.r/6),(x,y,r,i)=>fxD(k>0.55&&i%2?'fx_spore1':'fx_spore0',x+Math.sin(z.t*1.5+i)*2,y-4-Math.sin(z.t*2+i)*1.5,10+r*6,{alpha:0.85*a}))};
defW('linhmoc',{n:'Linh Mộc Khôi',el:'moc',mon:'linh',p:'thonguyen',en:'Thiên Niên Thụ Yêu',ed:'Mộc nhân to hơn, mỗi đòn trói quái và hồi máu cho bạn.',
  d:['Gọi mộc nhân đánh cận chiến, kéo quái xung quanh về phía nó.','Mạnh hơn, đứng lâu hơn.','Sát thương +20%.','Thêm 1 mộc nhân.','Sát thương +25%, đánh nhanh hơn.'],
  s:l=>({cd:L5b([13,12,11,10.5,9.5],l),dmg:L5b([12,14,17,19,24],l),n:L5b([1,1,1,2,2],l),dur:L5b([10,11,12,12,13],l),as:L5b([1,1,0.95,0.9,0.75],l)}),
  fire(w,s,st,P){G.mn=G.mn.filter(m=>m.src!=='linhmoc');for(let i=0;i<sumN(s.n);i++)G.mn.push({k:'wg',src:'linhmoc',el:'moc',x:P.x+(i?18:-18),y:P.y+8,t:0,dur:s.dur*st.dur,dmg:s.dmg,as:s.as,atk:0.5,aT:0,face:1,evo:w.evo,sc:w.evo?1.3:1});
    sfx('vine');return s.cd*st.cd}});

// ════════ THỦY
defW('thuykinh',{n:'Thủy Kính Trận',el:'thuy',mon:'tran',p:'thuynguyet',en:'Kính Hoa Thủy Nguyệt',ed:'Gương nước đi theo người, đạn phản lại mạnh gấp đôi.',
  d:['Bày gương nước dưới chân: làm chậm, phản lại đạn của quái.','Trận rộng hơn.','Sát thương +30%.','Trận lâu hơn.','Trận rộng, hồi chiêu nhanh.'],
  s:l=>({cd:L5b([5,4.7,4.4,4.1,3.7],l),r:L5b([50,54,58,62,70],l),dur:L5b([4,4,4.5,5,5],l),tick:L5b([5,6,8,8,10],l)}),
  fire(w,s,st,P){G.zones.push({k:'mirror',x:P.x,y:P.y,r:s.r*st.area*(st.tranR||1),t:0,dur:s.dur*st.dur*(st.tranD||1),dmg:s.tick,el:'thuy',tick:0,src:'thuykinh',follow:w.evo,evo:w.evo});sfx('ice');return s.cd*st.cd}});
CPZ.mirror=(z,dt)=>{const P=G.p;if(z.follow){z.x=P.x;z.y=P.y}G.src='thuykinh';
  for(const b of G.es)if(!b.dead&&Math.hypot(b.x-z.x,(b.y-z.y)/0.6)<z.r){b.dead=true;const t=nearestE(b.x,b.y,200);if(t){const a=Math.atan2(t.y-b.y,t.x-b.x);G.pr.push({k:'mirb',src:'thuykinh',x:b.x,y:b.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,dmg:(b.dmg||8)*(z.evo?2:1)+z.dmg,el:'thuy',pierce:1,life:0.8,r:4,hit:[]})}cpFx('fx_splash',b.x,b.y,10,0.3)}
  z.tick-=dt;if(z.tick>0)return;z.tick=0.5;forNear(z.x,z.y,z.r+10,e=>{if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+e.r*0.5){hurtE(e,z.dmg,'thuy',{fx:z.x});e.slowT=Math.max(e.slowT,1);if(G.st.tranPull&&!e.d.boss){e.x+=(z.x-e.x)*0.15;e.y+=(z.y-e.y)*0.15}}})};
CPZD.mirror=z=>{const k=z.t/z.dur,a=Math.min(1,z.t*4)*Math.min(1,(1-k)*5);ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,0.6);ctx.globalAlpha=0.2*a;ctx.fillStyle='#5ccbe8';ctx.beginPath();ctx.arc(0,0,z.r,0,TAU);ctx.fill();
  for(let i=0;i<3;i++){const rr=z.r*((z.t*0.5+i/3)%1);ctx.globalAlpha=0.6*a*(1-rr/z.r);ctx.strokeStyle='#e2fbff';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,rr,0,TAU);ctx.stroke()}
  ctx.globalAlpha=0.8*a;ctx.strokeStyle='#9fe8ff';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.lineDashOffset=-z.t*10;ctx.beginPath();ctx.arc(0,0,z.r,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();ctx.globalAlpha=1;
  scat(z,5,(x,y,r,i)=>{if(Math.sin(z.t*3+i*2)>0.7)fxD('fx_splash',x,y,7,{alpha:a})})};
defW('huyenthuy',{n:'Huyền Thủy Triều',el:'thuy',mon:'the',p:'kimcuong',en:'Thương Hải Hồi Triều',ed:'Sóng tràn ra rồi rút về, đánh hai lần, đóng băng quái đang chậm.',
  d:['Sóng nước tỏa ra từ người, đẩy lùi và làm ướt quái.','Sóng rộng hơn.','Sát thương +25%.','Hồi chiêu nhanh hơn.','Sóng rộng, sát thương +30%.'],
  s:l=>({cd:L5b([3.6,3.4,3.1,2.9,2.6],l),R:L5b([90,100,104,108,124],l),dmg:L5b([14,16,20,22,29],l),kb:L5b([60,65,70,80,90],l)}),
  fire(w,s,st,P){G.zones.push({k:'tide',x:P.x,y:P.y,R:s.R*st.area*(st.theR||1),r:0,t:0,dur:w.evo?1.2:0.6,dmg:s.dmg,kb:s.kb,el:'thuy',src:'huyenthuy',h1:new Set,h2:new Set,evo:w.evo});sfx('ice');return s.cd*st.cd}});
CPZ.tide=(z,dt)=>{const back=z.t>0.6,u=back?1-(z.t-0.6)/0.6:z.t/0.6;z.r=z.R*Math.max(0,u);G.src='huyenthuy';const H=back?z.h2:z.h1;
  forNear(z.x,z.y,z.R+20,e=>{if(H.has(e))return;const d=Math.hypot(e.x-z.x,(e.y-z.y)/0.7);if(Math.abs(d-z.r)<12+e.r){H.add(e);const sl=e.slowT>0;hurtE(e,z.dmg,'thuy',{kb:back?-z.kb*0.6:z.kb,kx:z.x,ky:z.y,fx:z.x});e.slowT=Math.max(e.slowT,1.5);if(back&&sl&&!e.d.boss){e.rootT=Math.max(e.rootT,1);e.frozen=1}}})};
CPZD.tide=z=>{const n=14,a=Math.min(1,(z.dur-z.t)*4);for(let i=0;i<n;i++){const an=i/n*TAU;fxD('fx_wave',z.x+Math.cos(an)*z.r,z.y+Math.sin(an)*z.r*0.7,18,{rot:an+Math.PI/2,alpha:0.85*a})}};

// ════════ HỎA
defW('viemquyen',{n:'Viêm Quyền',el:'hoa',mon:'the',p:'thanhanh',en:'Liệt Hỏa Bá Quyền',ed:'Đấm hai cú liền, cuối đường đấm để lại lửa cháy.',
  d:['Mỗi bước chạy tích nhiệt. Đủ nhiệt thì đấm lửa về phía quái gần nhất.','Đấm mạnh hơn.','Tích nhiệt nhanh hơn.','Nắm đấm to hơn.','Sát thương +30%, tích nhiệt nhanh.'],
  s:l=>({heat:L5b([90,85,78,74,64],l),dmg:L5b([24,30,34,38,50],l),r:L5b([14,14,16,19,20],l)}),
  fire:()=>1,tick(w,dt){const P=G.p,s=WEAP.viemquyen.s(w.lv);w.heat=(w.heat||0)+(P.mv?G.st.spd*dt:dt*12)/G.st.cd;if(w.heat<s.heat)return;const t=tgtNear(160);if(!t)return;w.heat=0;
    const punch=(da)=>{const a=Math.atan2(t.y-P.y,t.x-P.x)+da,R=s.r*G.st.area*(G.st.theR||1);G.src='viemquyen';
      G.pr.push({k:'fist',src:'viemquyen',x:P.x,y:P.y-8,vx:Math.cos(a)*380,vy:Math.sin(a)*380,dmg:s.dmg,el:'hoa',pierce:99,life:0.32,r:R*0.5,hit:[],R,
        onEnd:p=>{G.src='viemquyen';explode(p.x,p.y,p.R,p.dmg*0.5,'hoa');if(w.evo)G.zones.push({k:'burn',x:p.x,y:p.y,r:p.R,t:0,dur:2,dps:p.dmg*0.4,el:'hoa',tick:0,src:'viemquyen'})}});sfx('fire')};
    punch(0);if(w.evo)G.later.push({t:0.15,f:()=>{if(G.w.viemquyen)punch(0.35)}})}});
defW('hoanha',{n:'Hỏa Nha',el:'hoa',mon:'linh',p:'tulinh',en:'Kim Ô Phần Thiên',ed:'+2 quạ lửa, chỗ lao xuống để lại lửa cháy.',
  d:['Gọi quạ lửa bay quanh người, lao xuống quái có nhiều máu nhất rồi nổ.','Nổ mạnh hơn.','+1 quạ lửa.','Lao xuống nhanh hơn.','+1 quạ lửa, nổ to hơn.'],
  s:l=>({n:L5b([2,2,3,3,4],l),dmg:L5b([16,19,22,24,32],l),cd:L5b([1.6,1.5,1.45,1.25,1.1],l),R:L5b([20,22,22,24,28],l)}),
  fire:()=>1,tick(w,dt){const P=G.p,s=WEAP.hoanha.s(w.lv),n=sumN(s.n+(w.evo?2:0));w.crows=w.crows||[];while(w.crows.length<n)w.crows.push({st:0,a:rand()*TAU,x:P.x,y:P.y,cd:rand()*s.cd,vx:0,vy:0});w.crows.length=n;
    w.crows.forEach((c,i)=>{if(c.st===0){c.a+=dt*2.2;const ox=P.x+Math.cos(c.a+i/n*TAU)*34,oy=P.y-18+Math.sin(c.a+i/n*TAU)*14;c.vx=(ox-c.x)*6;c.vy=(oy-c.y)*6;c.x+=c.vx*dt;c.y+=c.vy*dt;c.cd-=dt;
        if(c.cd<=0){const L=nearestN(P.x,P.y,200,8);if(L.length){let b=L[0];for(const e of L)if(e.hp>b.hp)b=e;c.tg=b;c.st=1}else c.cd=0.4}}
      else if(c.st===1){const t=c.tg;if(!t||t.dead){c.st=2;return}const dx=t.x-c.x,dy=t.y-6-c.y,d=Math.hypot(dx,dy);c.vx=dx/d*280;c.vy=dy/d*280;c.x+=c.vx*dt;c.y+=c.vy*dt;
        if(d<8){G.src='hoanha';explode(c.x,c.y,s.R*G.st.area*(G.st.phuR||1),s.dmg*linhMul(),'hoa');if(w.evo)G.zones.push({k:'burn',x:c.x,y:c.y,r:s.R*0.8,t:0,dur:2,dps:s.dmg*0.3,el:'hoa',tick:0,src:'hoanha'});c.st=2}}
      else{const dx=P.x-c.x,dy=P.y-18-c.y,d=Math.hypot(dx,dy);c.vx=dx/(d||1)*220;c.vy=dy/(d||1)*220;c.x+=c.vx*dt;c.y+=c.vy*dt;if(d<20){c.st=0;c.cd=s.cd*G.st.cd}}})}});

// ════════ THỔ
defW('thachthuong',{n:'Thạch Thương',el:'tho',mon:'kiem',p:'loithe',en:'Thiên Thạch Liên Hoàn',ed:'Mỗi lần nảy, giáo vỡ ra 3 mảnh đá bay tứ phía.',
  d:['Ném giáo đá nảy qua nhiều quái, mỗi lần nảy nặng hơn.','+1 lần nảy.','Sát thương +20%.','+1 lần nảy, hồi chiêu nhanh.','+1 lần nảy, sát thương +20%.'],
  s:l=>({cd:L5b([1.5,1.4,1.3,1.15,1.0],l),dmg:L5b([16,18,22,24,29],l),b:L5b([2,3,3,4,5],l)}),
  fire(w,s,st,P){const t=tgtNear(230);if(!t)return 0.2;const mk=(x,y,a,b)=>G.pr.push({k:'spear',src:'thachthuong',x,y,vx:Math.cos(a)*320,vy:Math.sin(a)*320,dmg:s.dmg,el:'tho',pierce:1,life:0.8,r:5,hit:[],b:b+(st.kiemP||0),
      onHit:(e,p)=>{cpFx('fx_spearbrk',e.x,e.y-e.r,12,0.3);if(w.evo)for(let i=0;i<3;i++){const an=rand()*TAU;G.pr.push({k:'sword',src:'thachthuong',x:e.x,y:e.y-e.r,vx:Math.cos(an)*220,vy:Math.sin(an)*220,dmg:p.dmg*0.35,el:'tho',pierce:1,life:0.35,r:3,hit:[e],rx:1})}
        if(p.b>0){const n=nearestE(e.x,e.y,120,new Set(p.hit));if(n){p.b--;p.dmg*=1.2;const a=Math.atan2(n.y-e.y,n.x-e.x);p.vx=Math.cos(a)*340;p.vy=Math.sin(a)*340;p.life=0.6;p.x=e.x;p.y=e.y-e.r;return true}}return false}});
    for(let i=0;i<1+(st.kiemAmt||0);i++)mk(P.x,P.y-8,Math.atan2(t.y-P.y,t.x-P.x)+i*0.3,s.b);sfx('sword');return s.cd*st.cd}});
defW('sonnhac',{n:'Sơn Nhạc Trấn',el:'tho',mon:'tran',p:'hoalinh',en:'Ngũ Nhạc Trấn Thiên',ed:'Ba ngọn núi rơi liền nhau.',
  d:['Núi nhỏ rơi xuống chỗ quái đông nhất: choáng và để lại đá vụn làm chậm.','Vùng rộng hơn.','Sát thương +25%.','Hồi chiêu nhanh hơn.','Vùng rộng, sát thương +30%.'],
  s:l=>({cd:L5b([4.6,4.3,4,3.6,3.2],l),r:L5b([40,46,48,50,58],l),dmg:L5b([30,34,44,48,62],l)}),
  fire(w,s,st,P){const drop=(i)=>{const t=bestCluster(240,s.r)||tgtNear(240);if(!t)return;G.zones.push({k:'mshadow',x:t.x,y:t.y,r:s.r*st.area*(st.tranR||1),t:0,dur:0.55,dmg:s.dmg,el:'tho',src:'sonnhac'})};
    if(!tgtNear(240))return 0.3;drop(0);if(w.evo){G.later.push({t:0.35,f:()=>drop(1)});G.later.push({t:0.7,f:()=>drop(2)})}sfx('stone');return s.cd*st.cd}});
CPZ.mshadow=(z,dt)=>{if(z.t+dt>=z.dur&&!z.hit){z.hit=1;G.src='sonnhac';forNear(z.x,z.y,z.r+20,e=>{if(Math.hypot(e.x-z.x,(e.y-z.y)/0.7)<z.r+e.r){hurtE(e,z.dmg,'tho',{kb:30,kx:z.x,ky:z.y});if(!e.d.boss)e.rootT=Math.max(e.rootT,0.8)}});
  shake(0.3);sfx('boom');G.fx.push({k:'boom',x:z.x,y:z.y,r:z.r*0.8,t:0,dur:0.4});cpFx('st_dust',z.x,z.y,26,0.5);G.zones.push({k:'rubble',x:z.x,y:z.y,r:z.r,t:0,dur:3*(G.st.tranD||1),el:'tho',src:'sonnhac'})}};
CPZD.mshadow=z=>{const k=z.t/z.dur;ell(z.x,z.y,z.r*k,z.r*0.55*k,'#1a1208',0.35);fxD('fx_mount',z.x,z.y-(1-k)*130-12,34,{alpha:Math.min(1,k*3)})};
CPZ.rubble=(z,dt)=>{forNear(z.x,z.y,z.r+6,e=>{if(Math.hypot(e.x-z.x,(e.y-z.y)/0.7)<z.r)e.slowT=Math.max(e.slowT,0.4)})};
CPZD.rubble=z=>{const a=Math.min(1,(z.dur-z.t))*0.9;scat(z,Math.round(z.r/7),(x,y,r)=>fxD('fx_rubble',x,y,12+r*8,{alpha:a,flip:r>0.5}))};
defW('hoangtho',{n:'Hoàng Thổ Khôi Lỗi',el:'tho',mon:'linh',p:'moclinh',en:'Bàn Thạch Kim Thân',ed:'Khôi lỗi to hơn, gầm làm choáng quái, nổ mạnh gấp rưỡi.',
  d:['Gọi khôi lỗi đất: cứ vài giây gầm kéo quái về phía nó, hết giờ thì nổ.','Đứng lâu hơn.','Sát thương +25%.','Gầm thường hơn.','Thêm 1 khôi lỗi, nổ to hơn.'],
  s:l=>({cd:L5b([15,14,13,12,11],l),dur:L5b([10,11,12,12,13],l),dmg:L5b([6,7,9,10,13],l),boom:L5b([30,36,44,50,64],l),n:L5b([1,1,1,1,2],l),taunt:L5b([3.2,3.2,3,2.5,2.4],l)}),
  fire(w,s,st,P){G.mn=G.mn.filter(m=>m.src!=='hoangtho');for(let i=0;i<sumN(s.n);i++)G.mn.push({k:'eg',src:'hoangtho',el:'tho',x:P.x+(i?-22:22),y:P.y-6,t:0,dur:s.dur*st.dur,dmg:s.dmg,boom:s.boom*(w.evo?1.5:1),taunt:s.taunt,tT:1,cT:0,face:1,evo:w.evo,sc:w.evo?1.3:1});sfx('stone');return s.cd*st.cd}});

// ════════ CÔNG PHÁP BẢN MÔN (chỉ nhân vật đó rút được)
defW('kiemkhi',{ex:'lamphong',n:'Kiếm Khí Trảm',el:'kim',mon:'kiem',p:'kiemtam',en:'Nhất Kiếm Đoạn Không',ed:'Kiếm khí to hơn 30%, tới cuối đường tách đôi.',
  d:['Chém ra đường kiếm khí hình trăng khuyết, xuyên qua mọi thứ.','Sát thương +20%.','+1 đường kiếm khí.','Hồi chiêu nhanh hơn.','+1 đường kiếm khí, sát thương +25%.'],
  s:l=>({cd:L5b([2.0,1.9,1.75,1.55,1.4],l),dmg:L5b([20,24,26,30,38],l),n:L5b([1,1,2,2,3],l),r:L5b([12,13,14,15,16],l)}),
  fire(w,s,st,P){const a0=aimA(240),n=s.n+(st.kiemAmt||0),sz=w.evo?1.3:1;for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*0.28;
      G.pr.push({k:'cres',kiem:1,src:'kiemkhi',x:P.x,y:P.y-8,vx:Math.cos(a)*270,vy:Math.sin(a)*270,dmg:s.dmg*sz,el:'kim',pierce:99,life:0.6,r:s.r*sz*st.area,sz,hit:[],
        onEnd:w.evo?p=>{for(const d of [-0.5,0.5]){const b=Math.atan2(p.vy,p.vx)+d;G.pr.push({k:'cres',src:'kiemkhi',x:p.x,y:p.y,vx:Math.cos(b)*220,vy:Math.sin(b)*220,dmg:p.dmg*0.5,el:'kim',pierce:99,life:0.35,r:p.r*0.7,sz:0.7,hit:[],rx:1})}}:null})}
    sfx('sword');return s.cd*st.cd}});
defW('ngukiem',{ex:'lamphong',n:'Ngự Kiếm Hộ Thân',el:'kim',mon:'the',p:'thanhanh',en:'Vạn Kiếm Hộ Pháp',ed:'Kiếm luôn xoay, dừng chạy thì kiếm bắn ra bốn phía.',
  d:['Khi đang chạy, kiếm bay xoay quanh người chém quái chạm phải.','+1 thanh kiếm.','Sát thương +25%.','+1 thanh kiếm, xoay rộng hơn.','+1 thanh kiếm, sát thương +25%.'],
  s:l=>({n:L5b([3,4,4,5,6],l),dmg:L5b([8,9,11,12,15],l),r:L5b([30,32,34,38,40],l)}),
  fire:()=>1,tick(w,dt){const P=G.p,s=WEAP.ngukiem.s(w.lv),on=P.mv||w.evo,n=s.n+(G.st.kiemAmt||0),R=s.r*G.st.area*(G.st.theR||1);w.a=(w.a||0)+dt*(on?5:1.2);w.orb=w.orb||[];w.orb.length=n;
    for(let i=0;i<n;i++){const an=w.a+i/n*TAU,x=P.x+Math.cos(an)*(on?R:10),y=P.y-8+Math.sin(an)*(on?R*0.8:4)-(on?0:14);w.orb[i]={x,y,an};
      if(on){G.src='ngukiem';forNear(x,y,12,e=>{if((e.nkT||0)<=G.t&&Math.hypot(e.x-x,e.y-e.r*0.6-y)<e.r+6){e.nkT=G.t+0.35;hurtE(e,s.dmg,'kim',{kb:20,kx:x,ky:y})}})}}
    if(w.evo&&w.was&&!P.mv){for(let i=0;i<n;i++){const an=w.a+i/n*TAU;G.pr.push({k:'sword',src:'ngukiem',x:P.x,y:P.y-8,vx:Math.cos(an)*280,vy:Math.sin(an)*280,dmg:s.dmg*1.5,el:'kim',pierce:2,life:0.6,r:5,hit:[],gold:1})}sfx('sword')}w.was=P.mv}});
defW('bachthao',{ex:'linhnhi',n:'Bách Thảo Đan',el:'moc',mon:'linh',p:'moclinh',en:'Cửu Chuyển Kim Đan',ed:'Đan nổ to hơn, hồi gấp đôi và tăng 15% sát thương 4 giây.',
  d:['Ném linh đan vào quái: nổ sát thương và hồi máu cho bạn.','Hồi nhiều hơn.','Sát thương +25%.','Hồi chiêu nhanh hơn.','Nổ to hơn, hồi nhiều hơn.'],
  s:l=>({cd:L5b([4,3.8,3.5,3.2,2.8],l),dmg:L5b([16,18,22,24,30],l),r:L5b([28,30,32,34,40],l),heal:L5b([2,3,3,4,5],l)}),
  fire(w,s,st,P){const t=tgtNear(190);if(!t)return 0.3;const x0=P.x,y0=P.y-10,x1=t.x,y1=t.y,big=w.evo?1.3:1;G.fx.push({k:'cppill',x0,y0,x1,y1,t:0,dur:0.4});
    G.later.push({t:0.4,f:()=>{G.src='bachthao';hitIn(x1,y1,s.r*st.area*big,s.dmg*linhMul(),'moc');G.fx.push({k:'boom',x:x1,y:y1,r:s.r*0.7,t:0,dur:0.3});cpFx('fx_sprout',x1,y1,14,0.5);
      const h=s.heal*(w.evo?2:1);G.p.hp=Math.min(G.p.mhp,G.p.hp+h);if(G.nums.length<70)G.nums.push({x:G.p.x,y:G.p.y-30,v:'+'+h,t:0,c:'#6dff8a'});if(w.evo){G.cpBuff=4}}});sfx('pick');return s.cd*st.cd}});
defW('hoavu',{ex:'linhnhi',n:'Hoa Vũ',el:'moc',mon:'phu',p:'hoalinh',en:'Bách Hoa Tề Phóng',ed:'Bão hoa đi theo người lâu hơn, nổ hai lần.',
  d:['Bão cánh hoa quanh người cắt quái liên tục, cuối cùng nổ tung.','Vùng rộng hơn.','Sát thương +25%.','Lâu hơn.','Vùng rộng, nổ mạnh hơn.'],
  s:l=>({cd:L5b([5,4.8,4.5,4.2,3.8],l),r:L5b([58,64,66,68,78],l),dps:L5b([8,9,11,12,15],l),dur:L5b([3,3,3,3.6,3.6],l)}),
  fire(w,s,st,P){G.zones.push({k:'petal',x:P.x,y:P.y,r:s.r*st.area*(st.phuR||1),t:0,dur:s.dur*st.dur*(w.evo?1.4:1),dps:s.dps,el:'moc',tick:0,src:'hoavu',evo:w.evo});sfx('vine');return s.cd*st.cd}});
CPZ.petal=(z,dt)=>{const P=G.p;z.x=P.x;z.y=P.y;G.src='hoavu';z.tick-=dt;if(z.tick<=0){z.tick=0.3;forNear(z.x,z.y,z.r+10,e=>{if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+e.r*0.5)hurtE(e,z.dps*0.3,'moc')})}
  if(z.t+dt>=z.dur&&!z.done){z.done=1;explode(z.x,z.y,z.r*0.8,z.dps*2,'moc');if(z.evo)G.later.push({t:0.25,f:()=>{G.src='hoavu';explode(G.p.x,G.p.y,z.r*0.9,z.dps*2,'moc')}})}};
CPZD.petal=z=>{const n=10;for(let i=0;i<n;i++){const an=z.t*3+i/n*TAU,rr=z.r*(0.45+0.45*((i*37)%10)/10);fxD('fx_petals',z.x+Math.cos(an)*rr,z.y+Math.sin(an)*rr*0.6-6,11,{rot:an*2,alpha:0.85*Math.min(1,(z.dur-z.t)*3)})}};
defW('hanbangthuong',{ex:'hanbang',n:'Hàn Băng Thương',el:'thuy',mon:'kiem',p:'thuynguyet',en:'Huyền Băng Phá Thiên',ed:'Giáo vỡ thành 6 mũi băng ở cuối đường.',
  d:['Phóng giáo băng lớn xuyên thẳng, đóng băng quái đang chậm.','Sát thương +20%.','Hồi chiêu nhanh hơn.','Giáo to hơn.','Sát thương +30%, hồi chiêu nhanh.'],
  s:l=>({cd:L5b([2.2,2.1,1.9,1.8,1.55],l),dmg:L5b([26,30,32,36,46],l),r:L5b([6,6,6,8,8],l)}),
  fire(w,s,st,P){const a0=aimA(260),n=1+(st.kiemAmt||0);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*0.2;
      G.pr.push({k:'icesp',kiem:1,src:'hanbangthuong',x:P.x,y:P.y-8,vx:Math.cos(a)*340,vy:Math.sin(a)*340,dmg:s.dmg,el:'thuy',pierce:99,life:0.7,r:s.r,slow:1.5*st.dur,hit:[],
        onHit:e=>{if(e.slowT>0.3&&!e.d.boss){e.rootT=Math.max(e.rootT,1);e.frozen=1}},
        onEnd:w.evo?p=>{for(let j=0;j<6;j++){const b=j/6*TAU;G.pr.push({k:'ice',src:'hanbangthuong',x:p.x,y:p.y,vx:Math.cos(b)*220,vy:Math.sin(b)*220,dmg:p.dmg*0.35,el:'thuy',pierce:1,life:0.4,r:3,slow:1,hit:[],rx:1})}}:null})}
    sfx('ice');return s.cd*st.cd}});
defW('bangphach',{ex:'hanbang',n:'Băng Phách Kính',el:'thuy',mon:'tran',p:'kimcuong',en:'Vạn Niên Huyền Băng',ed:'Gương lạnh hơn: trúng 2 nhịp đã đóng băng, vỡ băng gây sát thương.',
  d:['Dựng gương băng tỏa hàn khí theo nhịp. Trúng 3 nhịp thì đóng băng.','Vùng rộng hơn.','Sát thương +30%.','Gương đứng lâu hơn.','Vùng rộng, hồi chiêu nhanh.'],
  s:l=>({cd:L5b([7,6.6,6.2,5.8,5.2],l),r:L5b([60,66,68,72,80],l),dmg:L5b([8,9,12,13,16],l),dur:L5b([5,5,5,6,6.5],l)}),
  fire(w,s,st,P){G.zones.push({k:'icem',x:P.x,y:P.y-4,r:s.r*st.area*(st.tranR||1),t:0,dur:s.dur*st.dur*(st.tranD||1),dmg:s.dmg,el:'thuy',tick:0.3,src:'bangphach',evo:w.evo});sfx('ice');return s.cd*st.cd}});
CPZ.icem=(z,dt)=>{z.tick-=dt;if(z.tick>0)return;z.tick=1;G.src='bangphach';G.fx.push({k:'frost',x:z.x,y:z.y,r:z.r,t:0,dur:0.45});const need=z.evo?2:3;
  forNear(z.x,z.y,z.r+10,e=>{if(Math.hypot(e.x-z.x,(e.y-z.y)/0.7)<z.r+e.r){hurtE(e,z.dmg,'thuy');e.slowT=Math.max(e.slowT,1.2);e.bpN=(e.bpN|0)+1;if(e.bpN>=need&&!e.d.boss){e.bpN=0;e.rootT=Math.max(e.rootT,1.5);e.frozen=1;cpFx('st_ice0',e.x,e.y-e.r*0.6,16,1.5)}}})};
CPZD.icem=z=>{fxD('fx_icemirror',z.x,z.y-10,22,{alpha:Math.min(1,(z.dur-z.t)*3,z.t*5)})};
defW('loiquyen',{ex:'loichan',n:'Lôi Quyền',el:'kim',mon:'the',p:'kimcuong',en:'Thiên Lôi Chấn Địa',ed:'Đấm xuống làm choáng quái 0.6 giây, sét nảy thêm 2.',
  d:['Đấm sấm xuống đất trước mặt, sét nảy sang quái xung quanh.','Sát thương +20%.','Vùng rộng hơn, +1 lần nảy.','Hồi chiêu nhanh hơn.','Sát thương +30%, +1 lần nảy.'],
  s:l=>({cd:L5b([2.4,2.2,2.0,1.8,1.55],l),r:L5b([36,38,44,46,52],l),dmg:L5b([22,26,30,34,44],l),ch:L5b([2,2,3,3,4],l)}),
  fire(w,s,st,P){const a=aimA(90),x=P.x+Math.cos(a)*22,y=P.y+Math.sin(a)*16,R=s.r*st.area*(st.theR||1);G.src='loiquyen';const hit=new Set;
    forNear(x,y,R+20,e=>{if(Math.hypot(e.x-x,e.y-y)<R+e.r){hit.add(e);hurtE(e,s.dmg,'kim',{kb:40,kx:x,ky:y});if(w.evo&&!e.d.boss)e.rootT=Math.max(e.rootT,0.6)}});
    G.fx.push({k:'strike',x,y,r:R*0.7,t:0,dur:0.35},{k:'bell',x,y,r:R,t:0,dur:0.4});shake(0.15);
    let cur={x,y},pts=[[x,y]];for(let i=0;i<s.ch+(w.evo?2:0)+(st.phuCh||0);i++){const n=nearestE(cur.x,cur.y,90,hit);if(!n)break;hit.add(n);pts.push([n.x,n.y-n.r]);hurtE(n,s.dmg*0.6,'kim');cur=n}
    if(pts.length>1)G.fx.push({k:'bolt',pts,t:0,dur:0.22});sfx('thunder');return s.cd*st.cd}});
defW('thienloitru',{ex:'loichan',n:'Thiên Lôi Trụ',el:'kim',mon:'tran',p:'loithe',en:'Cửu Tiêu Lôi Đình',ed:'Cột sét đi theo người, đánh 2 mục tiêu mỗi nhịp.',
  d:['Cắm cột sét xuống đất, cứ nửa giây giật quái quanh đó.','Vùng rộng hơn.','Sát thương +25%.','Cột đứng lâu hơn.','Mỗi nhịp đánh 2 mục tiêu.'],
  s:l=>({cd:L5b([6,5.7,5.4,5,4.4],l),r:L5b([70,76,78,80,88],l),dmg:L5b([14,16,20,22,26],l),dur:L5b([4,4,4,5,5],l),n:L5b([1,1,1,1,2],l)}),
  fire(w,s,st,P){G.zones.push({k:'lpil',x:P.x,y:P.y,r:s.r*st.area*(st.tranR||1),t:0,dur:s.dur*st.dur*(st.tranD||1),dmg:s.dmg,n:s.n+(w.evo?1:0),el:'kim',tick:0.2,src:'thienloitru',follow:w.evo});sfx('zap');return s.cd*st.cd}});
CPZ.lpil=(z,dt)=>{if(z.follow){z.x=G.p.x;z.y=G.p.y}z.tick-=dt;if(z.tick>0)return;z.tick=0.55;G.src='thienloitru';const L=nearestN(z.x,z.y,z.r,8);
  for(let i=0;i<Math.min(z.n,L.length);i++){const e=L[(rand()*L.length)|0];hurtE(e,z.dmg,'kim');G.fx.push({k:'bolt',pts:[[z.x,z.y-34],[e.x,e.y-e.r]],t:0,dur:0.18})}if(L.length&&rand()<0.5)sfx('zap')};
CPZD.lpil=z=>{const a=Math.min(1,(z.dur-z.t)*3,z.t*5);glow(z.x,z.y-20,18,'#c9a8ff',0.5*a);fxD('fx_lpillar',z.x,z.y-18,40,{alpha:a,add:1})};
defW('baophu',{ex:'modung',n:'Bạo Phù Liên Hoàn',el:'hoa',mon:'phu',p:'daotam',en:'Thiên La Hỏa Võng',ed:'Bùa tự lao vào quái gần đó, nổ to hơn.',
  d:['Rải bùa bẫy quanh người. Quái chạm vào thì nổ, kéo các bùa gần đó nổ theo.','+1 lá bùa.','Sát thương +25%.','+1 lá bùa, nổ rộng hơn.','+1 lá bùa, sát thương +25%.'],
  s:l=>({cd:L5b([3,2.8,2.6,2.4,2.1],l),n:L5b([3,4,4,5,6],l),dmg:L5b([20,22,28,30,38],l),R:L5b([26,26,28,32,34],l)}),
  fire(w,s,st,P){for(let i=0;i<s.n;i++){const a=rand()*TAU,d=40+rand()*55;G.zones.push({k:'trap',x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d*0.7,r:12,t:0,dur:8,dmg:s.dmg,R:s.R*st.area*(st.phuR||1),el:'hoa',src:'baophu',evo:w.evo})}sfx('tali');return s.cd*st.cd}});
function trapBoom(z){if(z.boomed)return;z.boomed=1;z.dead=true;z.t=z.dur;G.src='baophu';explode(z.x,z.y,z.R*(z.evo?1.25:1),z.dmg,'hoa');
  for(const o of G.zones)if(o.k==='trap'&&!o.boomed&&Math.hypot(o.x-z.x,o.y-z.y)<70)G.later.push({t:0.12,f:()=>trapBoom(o)})}
CPZ.trap=(z,dt)=>{if(z.boomed)return;let near=null;forNear(z.x,z.y,z.evo?40:14,e=>{if(!near&&Math.hypot(e.x-z.x,e.y-z.y)<(z.evo?36:10)+e.r)near=e});
  if(near){if(z.evo&&Math.hypot(near.x-z.x,near.y-z.y)>near.r+10){z.x+=(near.x-z.x)*Math.min(1,dt*6);z.y+=(near.y-z.y)*Math.min(1,dt*6)}else trapBoom(z)}};
CPZD.trap=z=>{if(z.boomed)return;fxD('ic_talisman',z.x,z.y-3+Math.sin(z.t*5)*1,9,{alpha:Math.min(1,z.t*4,(z.dur-z.t)*2)});glow(z.x,z.y,6,'#ff9a3a',0.3)};
defW('phonghoa',{ex:'modung',n:'Phong Hỏa Phù Trận',el:'hoa',mon:'tran',p:'hoalinh',en:'Liệt Diễm Phong Luân',ed:'Trận có 6 điểm nổ, xoay nhanh hơn.',
  d:['Trận bùa xoay quanh người, cứ hơn một giây nổ ở bốn điểm.','Vùng rộng hơn.','Sát thương +25%.','Trận lâu hơn.','Nổ dày hơn, sát thương +25%.'],
  s:l=>({cd:L5b([5,4.8,4.5,4.2,3.8],l),r:L5b([58,62,64,66,72],l),dmg:L5b([14,16,20,22,28],l),dur:L5b([4,4,4,5,5],l),every:L5b([1.2,1.2,1.15,1.1,0.95],l)}),
  fire(w,s,st,P){G.zones.push({k:'farr',x:P.x,y:P.y,r:s.r*st.area*(st.tranR||1),t:0,dur:s.dur*st.dur*(st.tranD||1),dmg:s.dmg,ev:s.every,n:w.evo?6:4,el:'hoa',tick:0.5,src:'phonghoa'});sfx('tali');return s.cd*st.cd}});
CPZ.farr=(z,dt)=>{z.x=G.p.x;z.y=G.p.y;z.tick-=dt;if(z.tick>0)return;z.tick=z.ev;G.src='phonghoa';for(let i=0;i<z.n;i++){const an=z.t*1.6+i/z.n*TAU;explode(z.x+Math.cos(an)*z.r,z.y+Math.sin(an)*z.r*0.7,18*G.st.area,z.dmg,'hoa')}};
CPZD.farr=z=>{const a=Math.min(1,(z.dur-z.t)*3,z.t*5);for(let i=0;i<z.n;i++){const an=z.t*1.6+i/z.n*TAU;fxD('ic_talisman',z.x+Math.cos(an)*z.r,z.y+Math.sin(an)*z.r*0.7-6,9,{alpha:a,rot:an})}
  ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,0.7);ring(0,0,z.r,'#ffb07a',1,0.35*a);ctx.restore()};
defW('hohoa',{ex:'bachho',n:'Hồ Hỏa',el:'hoa',mon:'linh',p:'tulinh',en:'Cửu U Hồ Hỏa',ed:'+2 lửa hồ, mỗi ngọn đánh 2 lần.',
  d:['Lửa hồ ly bay ra tìm quái, mỗi ngọn mang một hệ khác nhau, dễ kích hoạt Tương sinh.','+1 lửa hồ.','Sát thương +25%.','+1 lửa hồ, hồi chiêu nhanh.','+1 lửa hồ, sát thương +25%.'],
  s:l=>({cd:L5b([2.2,2.1,2.0,1.8,1.6],l),n:L5b([3,4,4,5,6],l),dmg:L5b([12,14,17,18,23],l)}),
  fire(w,s,st,P){const n=sumN(s.n+(w.evo?2:0));for(let i=0;i<n;i++){const el=NH_ORDER[(w.cyc=(w.cyc|0)+1)%5],a=i/n*TAU;
      G.pr.push({k:'fox',src:'hohoa',x:P.x+Math.cos(a)*10,y:P.y-10+Math.sin(a)*6,vx:Math.cos(a)*90,vy:Math.sin(a)*90,dmg:s.dmg*linhMul(),el,pierce:w.evo?2:1,life:1.8,r:4,hit:[],
        steer:(p,dt)=>{if(!p.tg||p.tg.dead)p.tg=nearestE(p.x,p.y,220,new Set(p.hit));if(!p.tg)return;const a=Math.atan2(p.tg.y-p.tg.r-p.y,p.tg.x-p.x),v=Math.hypot(p.vx,p.vy)+dt*260,cur=Math.atan2(p.vy,p.vx);let d=((a-cur+Math.PI*3)%TAU)-Math.PI;const na=cur+Math.max(-6*dt,Math.min(6*dt,d));p.vx=Math.cos(na)*Math.min(v,240);p.vy=Math.sin(na)*Math.min(v,240)}})}
    sfx('fire');return s.cd*st.cd}});
defW('mithuat',{ex:'bachho',n:'Mị Thuật',el:'thuy',mon:'linh',p:'thuynguyet',en:'Khuynh Thành Mị Ảnh',ed:'Mê hoặc nhiều quái hơn, lâu hơn, quái bị mê đánh mạnh gấp đôi.',
  d:['Mê hoặc quái gần nhất: chúng đứng yên, nhận thêm sát thương và đánh quái bên cạnh.','+1 con bị mê.','Lâu hơn.','+2 con bị mê.','+2 con, đánh quái khác mạnh hơn.'],
  s:l=>({cd:L5b([6,5.6,5.2,4.8,4.2],l),n:L5b([3,4,4,6,8],l),dur:L5b([3,3,3.5,3.5,4],l),hit:L5b([1,1,1,1.2,1.5],l)}),
  fire(w,s,st,P){const L=nearestN(P.x,P.y,150,30).filter(e=>!e.d.boss).slice(0,sumN(s.n)+(w.evo?3:0));if(!L.length)return 0.4;
    for(const e of L){e.charmT=s.dur*st.dur*(w.evo?1.4:1);e.charmP=s.hit*(w.evo?2:1);e.rootT=Math.max(e.rootT,e.charmT);cpFx('ic_mithuat',e.x,e.y-e.r*2-4,8,1.2)}sfx('pick');return s.cd*st.cd}});

// ── chạy các phần riêng mỗi khung: công pháp liên tục, vùng riêng, linh vật, mê hoặc
function cpTick(dt){if(!G||G.over)return;const o=G.src;
  for(const k in G.w)if(CPT[k])CPT[k](G.w[k],dt);
  for(const z of G.zones){const f=CPZ[z.k];if(f&&!z.dead&&z.t<z.dur){G.src=z.src||null;f(z,dt)}}
  // linh vật
  const P=G.p;for(const m of G.mn){m.t+=dt;if(m.t>=m.dur){if(!m.dead){m.dead=1;m.dieT=0;if(m.k==='eg'){G.src='hoangtho';hitIn(m.x,m.y,50*G.st.area,m.boom*linhMul(),'tho',{kb:50,kx:m.x,ky:m.y});G.fx.push({k:'boom',x:m.x,y:m.y,r:40,t:0,dur:0.4});cpFx('st_dust',m.x,m.y,26,0.5);shake(0.25)}}m.dieT+=dt;continue}
    G.src=m.src;
    if(m.k==='wg'){let t=nearestE(m.x,m.y,150);if(t&&Math.hypot(t.x-P.x,t.y-P.y)>200)t=null;const tx=t?t.x:P.x+20,ty=t?t.y:P.y+10,dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy);
      if(d>14){m.x+=dx/d*44*dt;m.y+=dy/d*44*dt;m.mv=1}else m.mv=0;if(Math.abs(dx)>2)m.face=dx>0?1:-1;
      m.atk-=dt;m.aT-=dt;if(t&&d<20&&m.atk<=0){m.atk=m.as*G.st.cd;m.aT=0.25;forNear(m.x,m.y,30,e=>{if(Math.hypot(e.x-m.x,e.y-m.y)<24+e.r){hurtE(e,m.dmg*linhMul(),'moc',{kb:20,kx:m.x,ky:m.y});if(m.evo){if(!e.d.boss)e.rootT=Math.max(e.rootT,0.6);P.hp=Math.min(P.mhp,P.hp+0.5)}}});sfx('hit')}
      forNear(m.x,m.y,62,e=>{if(!e.d.boss&&!e.d.heavy){const dd=Math.hypot(e.x-m.x,e.y-m.y);if(dd>16&&dd<60){e.x+=(m.x-e.x)*dt*0.5;e.y+=(m.y-e.y)*dt*0.5}}})}
    else if(m.k==='eg'){const dx=P.x+(m.face>0?-24:24)-m.x,dy=P.y-6-m.y,d=Math.hypot(dx,dy);if(d>30){m.x+=dx/d*50*dt;m.y+=dy/d*50*dt;m.mv=1}else m.mv=0;
      m.tT-=dt;if(m.tT<=0){m.tT=m.taunt;m.roar=0.6;sfx('roar');forNear(m.x,m.y,100,e=>{if(!e.d.boss){e.pullT=0.6;e.pullX=m.x;e.pullY=m.y;if(m.evo)e.rootT=Math.max(e.rootT,1)}})}if(m.roar>0)m.roar-=dt;
      m.cT-=dt;if(m.cT<=0){m.cT=0.5;forNear(m.x,m.y,30,e=>{if(Math.hypot(e.x-m.x,e.y-m.y)<18+e.r)hurtE(e,m.dmg*linhMul(),'tho',{kb:25,kx:m.x,ky:m.y})})}}}
  G.mn=G.mn.filter(m=>!m.dead||m.dieT<0.5);
  for(const e of G.e){if(e.dead)continue;if(e.pullT>0){e.pullT-=dt;e.x+=(e.pullX-e.x)*dt*2.2;e.y+=(e.pullY-e.y)*dt*2.2}
    if(e.charmT>0){e.charmT-=dt;e.chT=(e.chT||0)-dt;if(e.chT<=0){e.chT=0.5;G.src='mithuat';forNear(e.x,e.y,26,o=>{if(o!==e&&!(o.charmT>0)&&Math.hypot(o.x-e.x,o.y-e.y)<20+o.r)hurtE(o,e.dmg*(e.charmP||1),'thuy',{kb:15,kx:e.x,ky:e.y})})}}}
  if(G.cpBuff>0)G.cpBuff-=dt;
  G.src=o}
const _uwCP=updateWeapons;updateWeapons=function(dt){_uwCP(dt);try{cpTick(dt)}catch(e){console.error(e)}};
let cpDup=false;const _fwCP=fireWeapon;fireWeapon=function(k,w){if(CPF[k]){G.src=k;const s=WEAP[k].s(w.lv),r=CPF[k](w,s,G.st,G.p);
  if(!cpDup&&W_MON[k]==='phu'&&dpMonT('phu')>=3&&r>0.25){w.pc=(w.pc|0)+1;if(w.pc%4===0)G.later.push({t:0.22,f:()=>{if(G.w[k]){cpDup=true;try{G.src=k;CPF[k](G.w[k],WEAP[k].s(G.w[k].lv),G.st,G.p)}finally{cpDup=false}}}})}return r}return _fwCP(k,w)};
const _dmCP=dpMul;dpMul=function(e,el,o){let m=_dmCP(e,el,o);if(e.charmT>0)m*=1.2;if(G.cpBuff>0)m*=1.15;return m};

// ── vẽ: đạn, vùng, linh vật, hiệu ứng phụ
CPD.bamboo=p=>fxD('fx_bamboo',p.x,p.y,11,{rot:Math.atan2(p.vy,p.vx)});
CPD.spear=p=>fxD('fx_spear',p.x,p.y,16,{rot:Math.atan2(p.vy,p.vx)});
CPD.fist=p=>{glow(p.x,p.y,p.R,'#ff8a3a',0.5);fxD(p.life>0.16?'fx_fist0':'fx_fist1',p.x,p.y,p.R*1.6,{rot:Math.atan2(p.vy,p.vx)})};
CPD.cres=p=>{glow(p.x,p.y,p.r*1.2,'#ffe48a',0.4);fxD('fx_crescent',p.x,p.y,p.r*2.2,{rot:Math.atan2(p.vy,p.vx),alpha:Math.min(1,p.life*4)})};
CPD.icesp=p=>{glow(p.x,p.y,10,'#9fe8ff',0.5);fxD('fx_icespear2',p.x,p.y,22,{rot:Math.atan2(p.vy,p.vx)})};
CPD.mirb=p=>{glow(p.x,p.y,6,'#9fe8ff',0.6);fxD('fx_splash',p.x,p.y,7,{rot:G.t*8})};
CPD.fox=p=>{glow(p.x,p.y,8,EL[p.el].c,0.7);fxD('fx_foxfire',p.x,p.y,10,{rot:Math.atan2(p.vy,p.vx)+Math.PI/2})};
const _dpCP=drawProj;drawProj=function(p){const f=CPD[p.k];if(f){f(p);return}_dpCP(p)};
const _dzCP=drawZone;drawZone=function(z){const f=CPZD[z.k];if(f){if(z.t<z.dur)f(z);return}_dzCP(z)};
const _foCP=drawFxOver;drawFxOver=function(f){const k=f.t/f.dur;
  if(f.k==='cpspr'){fxD(f.spr,f.x,f.y,f.size*(f.grow?1+k*f.grow:1),{alpha:Math.min(1,(1-k)*3),add:f.add});return}
  if(f.k==='cppill'){const x=f.x0+(f.x1-f.x0)*k,y=f.y0+(f.y1-f.y0)*k-Math.sin(k*Math.PI)*30;fxD('fx_pill',x,y,8,{rot:k*8});glow(x,y,6,'#7bff9a',0.5);return}
  _foCP(f)};
function drawMinions(){for(const m of G.mn){let f;const dying=m.dead;
    if(m.k==='wg')f=dying?'mn_wg3':m.aT>0?'mn_wg2':m.mv&&((G.t*6)|0)%2?'mn_wg1':'mn_wg0';
    else f=dying?'mn_eg3':m.roar>0?'mn_eg2':m.mv&&((G.t*5)|0)%2?'mn_eg1':'mn_eg0';
    ell(m.x,m.y,8*m.sc,3*m.sc,'#1f2a18',0.25);drawS(f,m.x,m.y,{sc:m.sc*(m.k==='eg'?1.1:1),flip:m.face<0,alpha:dying?Math.max(0,1-m.dieT*2):Math.min(1,m.t*4)});
    if(m.k==='eg'&&m.roar>0){ctx.save();ctx.translate(m.x,m.y);ctx.scale(1,0.6);ring(0,0,100*(1-m.roar/0.6),'#e8c27a',2,m.roar)}if(m.k==='eg'&&m.roar>0)ctx.restore()}
  // quạ lửa, kiếm hộ thân
  for(const k of ['hoanha','ngukiem']){const w=G.w[k];if(!w)continue;
    if(k==='hoanha'&&w.crows)for(const c of w.crows){glow(c.x,c.y,8,'#ff8a3a',0.4);fxD(((G.t*8)|0)%2?'mn_crow1':'mn_crow0',c.x,c.y,13,{rot:Math.atan2(c.vy,c.vx)+Math.PI/2})}
    if(k==='ngukiem'&&w.orb)for(const o of w.orb)if(o){glow(o.x,o.y,6,'#ffe48a',0.4);fxD('fx_gsword2',o.x,o.y,11,{rot:o.an+Math.PI})}}}
const _moCP=mapOver;mapOver=function(){_moCP();if(G&&G.mn)try{drawMinions()}catch(e){}};
const _nrCP=newRun;newRun=function(...a){const r=_nrCP(...a);if(G)G.mn=[];return r};
// hình vẽ trạng thái trên yêu quái: cháy, đóng băng, ướt, phá giáp, mê hoặc
const _deCP=drawEnemy;
drawEnemy=function(e){_deCP(e);if(e.dead)return;const sc=Math.max(0.7,e.r/7);
  if(e.burn)fxD('st_burn'+(((G.t*10)+e.ph*3|0)%4),e.x,e.y-2,14*sc,{alpha:0.9});
  if(e.frozen>0&&e.rootT>0)fxD('st_ice0',e.x,e.y-e.r*0.9,20*sc,{alpha:0.7});
  if(e.wet>0&&!e.frozen)fxD('st_wet',e.x+e.r*0.6,e.y-e.r*1.8,6,{alpha:0.9});
  if(e.shredT>0)fxD('st_shred',e.x-e.r*0.8,e.y-e.r*1.8,7,{alpha:0.9});
  if(e.charmT>0)fxD('ic_mithuat',e.x,e.y-e.r*2.2-3+Math.sin(G.t*5)*1.5,7,{alpha:0.9})};

// ── ra thẻ: công pháp bản môn của nhân vật đang chơi
const _rcCP=rollCards;rollCards=function(excl){const keep=WEAP_ORDER.length,mine=Object.keys(EXW).filter(k=>EXW[k]===G.ch);WEAP_ORDER.push(...mine);try{return _rcCP(excl)}finally{WEAP_ORDER.length=keep}};

// ── tiếng ra chiêu riêng cho 22 công pháp mới: mẫu CC0 freesound.org (xem README), cắt sẵn trong assets/sfx3.mp3.
// [bắt đầu, độ dài, âm lượng]; mỗi lần phát đổi cao độ ±5% cho đỡ lặp. Hàn Băng Thương thêm lớp tiếng băng của sfx2.
const SFX3_MAP={"thanhtruc": [0.0, 0.2798, 0.45], "kiemkhi": [0.5798, 0.66, 0.5], "hanbangthuong": [1.5398, 0.16, 0.55], "thachthuong": [1.9998, 0.8, 0.55], "docchuong": [3.0998, 0.9, 0.4], "linhmoc": [4.2998, 0.56, 0.55], "hoangtho": [5.1598, 1.3, 0.55], "huyenthuy": [6.7598, 1.2, 0.5], "thuykinh": [8.2598, 1.0, 0.4], "viemquyen": [9.5598, 0.35, 0.6], "hoanha": [10.2098, 0.3, 0.45], "hohoa": [10.8098, 0.78, 0.45], "sonnhac": [11.8898, 1.4, 0.65], "bachthao": [13.5897, 0.5, 0.4], "hoavu": [14.3897, 1.2, 0.45], "bangphach": [15.8897, 0.89, 0.5], "loiquyen": [17.0797, 0.7, 0.5], "thienloitru": [18.0797, 1.8, 0.6], "baophu": [20.1797, 0.31, 0.5], "phonghoa": [20.7897, 1.2, 0.45], "mithuat": [22.2897, 0.51, 0.45]};
let SFX3BUF=null;
function s3Load(){if(SFX3BUF||!AC)return;SFX3BUF=1;fetch('assets/sfx3.mp3?v='+VER).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(buf=>{SFX3BUF=buf}).catch(()=>{SFX3BUF=null})}
function sfx3(k){if(!AC||!SAVE.opt.sfx)return false;s3Load();const c=SFX3_MAP[k];if(!c||!SFX3BUF||SFX3BUF===1)return false;
  try{const s=AC.createBufferSource(),g=AC.createGain();s.buffer=SFX3BUF;s.playbackRate.value=0.95+rand()*0.1;g.gain.value=c[2];s.connect(g);g.connect(sfxBus);s.start(0,c[0],c[1]+0.02)}catch(e){}return true}
const _aiS3=audioInit;audioInit=function(){_aiS3();s3Load()};
const cpSndT={};
const _fwSnd=fireWeapon;fireWeapon=function(k,w){const r=_fwSnd(k,w);
  if(SFX3_MAP[k]&&r>0.31&&G&&G.t-(cpSndT[k]??-9)>=0.3){cpSndT[k]=G.t;sfx3(k);if(k==='hanbangthuong')try{sfx2('freeze',1.7,0.25)}catch(e){}}
  return r};
