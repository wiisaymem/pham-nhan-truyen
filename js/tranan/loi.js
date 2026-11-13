'use strict';
// ───────────────────────── TRẤN ẤN LỘ · LÕI (js/tranan/loi.js)
// Chế độ hành động leo tầng vô hạn (kiểu Greater Rift, Kent duyệt 11/11/2026). Tách riêng khỏi chế độ Thiên Kiếp từ bản 1.0.67.
//
// CẢ CHẾ ĐỘ NẰM TRONG THƯ MỤC js/tranan/, nạp theo thứ tự:
//   mua.js           hai cõi chơi (Mùa giải / Thường), cấp và kinh nghiệm của từng tu sĩ, kho Pháp Bảo của mùa
//   loi.js           (file này) hằng số, ấn, vào tầng, rải quái, tiến độ, thủ lĩnh, kết tầng
//   danh.js          nút ĐÁNH, Chiêu 2, đòn của từng tu sĩ (bảng ATK)
//   ve.js            vẽ nền và vách hầm ngục
//   ui.js            nút trong trận, bảng chọn ấn, bảng chiêu, "có gì mới", cảnh kết
//   sanh.js          cửa ở sảnh + MÀN RIÊNG của Trấn Ấn Lộ (chọn tu sĩ, cõi, tầng, Bản Mệnh Đồ, kho Pháp Bảo)
//   noi.js           ĐIỂM NỐI: mọi chỗ chế độ này móc vào engine chung đều nằm ở đây, không ở file nào khác
//   banmenh_data.js  dữ liệu cây kỹ năng (thêm tu sĩ / nhánh / nút ở đây)
//   banmenh.js       luật và màn hình Bản Mệnh Đồ (chỉ có tác dụng trong Trấn Ấn Lộ)
//
// Các file nói chuyện với nhau qua TA (TA.init, TA.update, TA.showBoons…). Trạng thái một chuyến nằm ở G.hd; lưu lâu dài ở SAVE.coi / SAVE.mua / SAVE.thg / SAVE.tal.
// Engine chung (js/*.js) chỉ biết chế độ này qua: G.hd (đang trong chuyến), G.camR / G.camZ (máy quay), tranKho() (kho Pháp Bảo theo cõi).
// Dùng chung với Thiên Kiếp: linh thạch, Pháp Bảo cõi Thường, Linh Thú, Động Phủ, Ký Ức, nhiệm vụ hằng ngày, nút Thân pháp + Tuyệt kỹ (js/chudong.js).
// Tắt cả chế độ: mở game với ?hd=0 (nhớ trong máy), bật lại ?hd=1.
const TRANAN=(()=>{try{const q=new URLSearchParams(location.search).get('hd');if(q!==null)localStorage.setItem('vktt_hd',q==='1'?'1':'0');return localStorage.getItem('vktt_hd')!=='0'}catch(e){return true}})();   // 1.0.63: mở chính thức, tắt bằng ?hd=0
const TA=TRANAN&&typeof CDX!=='undefined'?{tier:1,next:false,hold:false,in:false}:null;   // tier: tầng đang chọn · next: lượt newRun kế tiếp là Trấn Ấn Lộ · hold: đang giữ nút ĐÁNH · in: đang ở trong khu Trấn Ấn Lộ (màn riêng hoặc trong chuyến)
if(TA){
  // hàm ở các file nạp sau, gọi qua TA lúc chạy
  const hdAttack=dt=>TA.attack(dt),drawFloor=f=>TA.drawFloor(f),drawWall=f=>TA.drawWall(f),showBoons=()=>TA.showBoons(),showEnding=()=>TA.showEnding(),kyTake=i=>TA.kyTake(i);
  const C=WORLD/2,RR=430,TIME=300;   // 11/11: hầm ngục rộng (bán kính 430), mỗi tầng 5 phút
  const MAPL=['daohoa','banghoa','hoason','vandinh'];
  // ── ấn
  const AN=[
    {id:'kim',ic:'sig_kim',n:()=>i18n('hd.an.kim','Ấn Kim · Phá Giáp'),d:()=>i18n('hd.an.kim.d','Đòn Đánh mạnh thêm 22%.')},
    {id:'hoa',ic:'sig_hoa',n:()=>i18n('hd.an.hoa','Ấn Hỏa · Bạo Viêm'),d:()=>i18n('hd.an.hoa.d','Đòn kết của chuỗi Đánh nổ lửa quanh mục tiêu.')},
    {id:'thuy',ic:'sig_thuy',n:()=>i18n('hd.an.thuy','Ấn Thủy · Lưu Vân'),d:()=>i18n('hd.an.thuy.d','Thân pháp hồi nhanh 20%. Cấp 2: thêm 1 lần lướt.')},
    {id:'moc',ic:'sig_moc',n:()=>i18n('hd.an.moc','Ấn Mộc · Hồi Xuân'),d:()=>i18n('hd.an.moc.d','Hồi ngay 22% máu, máu tối đa +12%.')},
    {id:'tho',ic:'sig_tho',n:()=>i18n('hd.an.tho','Ấn Thổ · Bàn Thạch'),d:()=>i18n('hd.an.tho.d','Giảm 14% sát thương phải nhận.')},
    {id:'loi',ic:'p_bolt',n:()=>i18n('hd.an.loi','Lôi Ấn · Tật Phong'),d:()=>i18n('hd.an.loi.d','Đánh nhanh hơn 12%.')},
    {id:'tam',ic:'p_yin',n:()=>i18n('hd.an.tam','Tâm Ấn · Ngưng Thần'),d:()=>i18n('hd.an.tam.d','Tuyệt kỹ và Chiêu 2 hồi nhanh 18%.')},
    {id:'sat',ic:'p_sword',n:()=>i18n('hd.an.sat','Sát Ấn · Nhất Kích'),d:()=>i18n('hd.an.sat.d','Tỉ lệ bạo kích +7%.')}];
  const POOL=[['thu'],['thu','xa'],['xa','buc','thu'],['ho','buc','xa'],['thi','hon','ho'],['matu','chu','thi'],['hoang','trung','hon','matu'],['hoang','ho','chu','quy','matu']];
  const W2={lamphong:'phikiem',linhnhi:'dangman',hanbang:'bangtien',loichan:'loichuong',modung:'phuchu',bachho:'hohoa'};
  const hdGear=b=>{const it=dropGear(b);if(typeof bmPhuRoll==='function')bmPhuRoll(it,G.hd?G.hd.tier:1);return it};   // Pháp Bảo rơi ở Trấn Ấn Lộ có thể mang dòng phụ theo nhánh
  // Trấn Ấn Lộ kiểu leo tầng vô hạn (11/11/2026, Kent duyệt): mỗi tầng một hầm ngục rộng, có đồng hồ.
  // Hạ quái để đầy thanh tiến độ → thủ lĩnh ra → hạ kịp giờ thì mở tầng cao hơn. Cấp và kinh nghiệm lưu theo cõi (js/tranan/mua.js).
  function hdInit(){
    const P=G.p,c=muaCh(G.ch),tier=Math.max(1,Math.min(TA.tier|0,(c.best|0)+1));
    G.hd={tier,floor:tier,st:'intro',t:0,time:TIME,prog:0,need:1,pend:[],packs:[],b:{},lt:0,gear:[],xp:0,lv0:c.lv,lvNow:c.lv,anQ:0,cleared:0,pow:1.15*(1+0.04*(c.lv-1)),at:{cd:0,n:0,last:-9,slow:0},w2:{t:1.5,cd:6}};
    G.camR=RR;G.camZ=[160,128];G.bm=null;   // máy quay giữ trong hầm tròn, nhìn gần hơn; Bản Mệnh Đồ tính lại cho chuyến này
    G.tower=null;G.w={};G.cdT=1;G.cdB=2;G.cdQ=0;if(G.pz)G.pz=[];   // không Cơ Duyên theo giờ, không cơ quan Bí cảnh
    const map=MAPL[(tier-1)%MAPL.length];if(MAPS[map]&&G.mapId!==map){G.mapId=map;G.world=genWorld(map,(Math.random()*1e9)|0);if(typeof CHUNKS!=='undefined')CHUNKS.clear()}
    G.fx.push({cd:1,t:0,dur:1e9,u:drawFloor,o:drawWall});TA.bdInit(G.hd);   // biến dị của tầng (biendi.js)
    hdApply();recompute();P.hp=P.mhp;hdPopulate();
    $('hdLbl').textContent='';
  }
  // Hệ số theo tầng (cân bằng 11/11, bản 1.0.69): máu ×HP_T mỗi tầng, sát thương ×DMG_T mỗi tầng. Người chơi mạnh lên nhờ cấp (+4%/cấp), Bản Mệnh Đồ, Pháp Bảo, ấn.
  // Mốc nhắm tới: lượt đầu chạm tường quanh tầng 15–18; cày cấp + cây + đồ tới khoảng tầng 25–30; tầng 40 (hạng Thiên) là gần tối đa của một mùa.
  const HP_T=1.12,DMG_T=1.06;
  function scaleE(e,elite,boss){const t=G.hd.tier,m=Math.pow(HP_T,t-1),dm=Math.pow(DMG_T,t-1);
    // thủ lĩnh mấy tầng đầu nhẹ tay hơn (1.0.74): máu 36% ở tầng 1 rồi tăng dần tới đủ ở tầng 5; sát thương 45% → 70% ở tầng 5
    if(boss){e.mhp=e.hp=5200*m*Math.min(1,0.36+0.16*(t-1));e.dmg=e.d.dmg*dm*Math.min(0.7,0.45+0.0625*(t-1))}else{e.mhp=e.hp=e.d.hp*3.2*(e.d.heavy?0.6:1)*(elite?6:1)*m;e.dmg=e.d.dmg*dm;if(elite)e.elite=1}
    e.val=boss?0:(e.d.xp||1)*(elite?6:1);TA.bdSpawn(e,elite,boss)}
  // rải các bầy yêu quái khắp hầm ngục; bầy nằm yên cho tới khi người chơi tới gần
  function hdPopulate(){
    const H=G.hd,t=H.tier,i0=Math.min(POOL.length-1,Math.floor((t-1)/1.5)),pool=POOL[i0],pool2=POOL[Math.min(POOL.length-1,i0+1)];let need=0;
    for(let i=0;i<16;i++){let x=C,y=C;for(let k=0;k<24;k++){const a=rand()*TAU,d=165+rand()*(RR-210);x=C+Math.cos(a)*d;y=C+Math.sin(a)*d;if(!inPond(x,y,14)&&!H.packs.some(p=>Math.hypot(p.x-x,p.y-y)<100))break}
      const elite=i%4===3,n=(elite?4:6+((rand()*3)|0))+TA.bdPack();H.packs.push({x,y,elite});
      for(let j=0;j<n;j++){const a=rand()*TAU,d=rand()*36,e=spawnEnemy(pick(rand()<0.3?pool2:pool),x+Math.cos(a)*d,y+Math.sin(a)*d,elite&&j===0?{elite:1}:{});if(!e)continue;scaleE(e,elite&&j===0);e.hx=e.x;e.hy=e.y;e.sleep=1;e.pk=i;need+=e.val}}
    H.need=Math.max(1,need*0.8);   // không cần dọn sạch hết
  }
  function hdApply(){
    const H=G.hd,b=k=>H.b[k]|0,T=CDX.tpOf(),K=CDX.tkOf();
    G.cdx.tp.cd=T.cd*Math.pow(0.8,b('thuy'))*(1-bm('tpCd'));G.cdx.tp.max=T.n+(b('thuy')>=2?1:0)+(bm('tpN')|0);
    G.cdx.tk.cd=K.cd*0.75*Math.pow(0.82,b('tam'))*(1-bm('tkCd'));H.w2.cd=6*Math.pow(0.82,b('tam'))*(1-bm('w2Cd'));
  }
  // ── diễn biến một tầng
  const spotNear=(x,y,r)=>{for(let k=0;k<14;k++){const a=rand()*TAU,d=r*(0.5+rand()*0.5),px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;if(Math.hypot(px-C,py-C)<RR-20&&!inPond(px,py,8)&&Math.hypot(px-G.p.x,py-G.p.y)>50)return[px,py]}return[x,y]};
  const spot=()=>spotNear(G.boss?G.boss.x:G.p.x,G.boss?G.boss.y:G.p.y,90);
  function hdKill(e){
    const H=G.hd,ch=G.ch;if(e.d.boss){if(H.st==='boss'&&e===H.boss){H.st='won';H.t=0;cdHS(0.3)}}else H.prog+=e.val||0;
    const v=e.d.boss?40*H.tier:(e.d.xp||1)*(e.elite?8:1)*(1+0.2*(H.tier-1))*TA.bdXp();H.xp+=v;TA.bdKill(e);const up=muaXp(ch,v);
    if(up){const lv=muaCh(ch).lv;H.lvNow=lv;H.pow=1.15*(1+0.04*(lv-1));recompute();const P=G.p;P.hp=Math.min(P.mhp,P.hp+Math.ceil(P.mhp*0.3));announce(i18nf('hd.lencap','Lên cấp {0}! +{1} điểm kỹ năng',lv,up),'realm');sfx('levelup');if(typeof vfxLevel==='function')vfxLevel()}
    if(e.elite&&!e.d.boss){H.anQ++;{const P=G.p;if(!P.dead)P.hp=Math.min(P.mhp,P.hp+Math.ceil(P.mhp*0.12))}   // hạ tinh anh hồi 12% máu
      if(rand()<Math.min(0.3,0.15+0.005*H.tier))H.gear.push(hdGear(Math.min(0.5,0.03*H.tier)))}
  }
  function hdFinish(){const H=G.hd,all5=[0,1,2,3,4].every(i=>kyGot('tranan',i));if(H.tier>=10&&all5&&!kyGot('tranan',5)){H.st='end';showEnding()}else endRun(true)}
  function hdUpdate(dt){
    const H=G.hd,P=G.p;H.t+=dt;G.pendLv=0;
    if(G.items.length){for(const it of G.items)if(it.k==='chest'){it.dead=true;H.lt+=15}G.items=G.items.filter(i=>!i.dead)}
    for(const s of H.pend){s.t-=dt;if(s.t<=0){s.done=1;const e=spawnEnemy(s.k,s.x,s.y,{});if(e){scaleE(e,false,s.boss);if(s.boss){G.boss=H.boss=e;{const P=G.p;if(!P.dead)P.hp=Math.min(P.mhp,P.hp+Math.ceil(P.mhp*0.3))}announce(i18nf('tb.bossra','{0} xuất hiện!',e.d.n),'boss')}burstP(s.x,s.y-4,8,['#e8c8ff','#9b7bff','#ffffff'],{spd:70,life:0.35,s:1.8})}}}
    if(H.pend.some(s=>s.done))H.pend=H.pend.filter(s=>!s.done);
    let wake=-1;
    for(const e of G.e){if(e.sleep){if(Math.hypot(e.x-P.x,e.y-P.y)<150||e.hp<e.mhp){e.sleep=0;wake=e.pk}else{e.x=e.hx;e.y=e.hy;e.kx=0;e.ky=0}}
      const dx=e.x-C,dy=e.y-C,d=Math.hypot(dx,dy),m=RR-e.r-2;if(d>m){e.x=C+dx/d*m;e.y=C+dy/d*m}}
    if(wake>=0)for(const e of G.e)if(e.sleep&&e.pk===wake)e.sleep=0;
    if(H.st==='intro'){if(H.t>1){H.st='run';H.t=0}}
    else if(H.st==='run'||H.st==='boss'){H.time-=dt;
      if(H.st==='run'&&H.prog>=H.need){H.st='boss';const k=TA.bossOf(H.tier),[x,y]=spotNear(P.x,P.y,90);H.pend.push({x,y,t:1.4,k,boss:1});announce(i18n('hd.annhan','Ấn Nhãn lộ ra: thủ lĩnh sắp tới!'),'boss');sfx('roar');shake(0.5);musicMode('boss')}
      if(H.time<=0){H.timeout=1;announce(i18n('hd.hetgio','Hết giờ!'),'boss');endRun(false);return}
      if(H.anQ>0&&!P.dash&&H.t>0.5){H.anQ--;showBoons()}}
    else if(H.st==='won'){if(H.t>1.4){const i=typeof kyNext==='function'&&KYUC.tranan?kyNext('tranan'):-1;
        if(i>=0&&i<5&&H.tier>=[1,3,5,7,9][i]){kyTake(i);kyShow('tranan',i,true);sfx('relic');H.st='won2'}else hdFinish()}}
    else if(H.st==='won2')hdFinish();
    // thủ lĩnh chia 3 giai đoạn: tới 66% và 33% máu thì gầm, hất văng, gọi thêm quái, nhanh và đau hơn
    const Bo=H.boss;if(Bo&&!Bo.dead&&H.st==='boss'){const ph=Bo.hdPh|0,thr=[0.66,0.33][ph];if(thr&&Bo.hp<Bo.mhp*thr){Bo.hdPh=ph+1;Bo.spd*=1.15;Bo.dmg*=1.15;sfx('roar');shake(0.6);flash('#ff3d6e',0.35);cdHS(0.12);
        const dx=P.x-Bo.x,dy=P.y-Bo.y,d=Math.hypot(dx,dy)||1;if(d<110){P.x+=dx/d*50;P.y+=dy/d*50}P.inv=Math.max(P.inv,0.8);for(const b of G.es)b.dead=true;
        CDX.fx({x:Bo.x,y:Bo.y,dur:0.6,u(f){const k=f.t/f.dur;ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.58);ring(0,0,130*k,'#ff7a9a',6*(1-k)+1,1-k);ctx.restore();ctx.globalAlpha=1}});
        const pool=POOL[Math.min(POOL.length-1,Math.floor((H.tier-1)/1.5))];for(let i=0;i<4;i++){const[x,y]=spot();H.pend.push({x,y,t:0.9+i*0.08,k:pick(pool)})}
        const L=Bo.t==='tamma'?[i18n('hd.tm1','Tâm Ma: "Giữ cửa thêm một kiếp, hay để tất cả kết thúc?"'),i18n('hd.tm2','Tâm Ma: "Các ngươi đã chọn sai chín vạn lần. Lần này khác gì?"')]:[i18nf('hd.gd2','{0} nổi giận!',Bo.d.n),i18nf('hd.gd3','{0} liều chết!',Bo.d.n)];announce(L[ph],'boss')}}
    hdAttack(dt);TA.bdTick(dt);TA.tmTick(dt);
    if(H.w2.t>0)H.w2.t-=dt;
  }
  // ── kết tầng (noi.js gọi thay cho endRun gốc khi đang ở Trấn Ấn Lộ)
  function hdEnd(win){
    if(G.over)return;const H=G.hd;G.over=true;G.win=win;G.t2=0;TA.ov.hidden=true;G.paused=false;TA.hold=false;
    H.cleared=win?H.tier:H.tier-1;const mc=muaCh(G.ch);if(win){const sec=Math.max(15,Math.min(300,Math.round((H.time0||TIME)-H.time)));if(H.tier>(mc.best|0)||(H.tier===mc.best&&sec<(mc.bsec||999)))mc.bsec=sec;mc.best=Math.max(mc.best|0,H.tier);const b=Math.round(60*H.tier*TA.bdXp());H.xp+=b;muaXp(G.ch,b)}
    G.gearDrops=H.gear.slice();if(win){G.gearDrops.push(hdGear(Math.min(0.6,0.04*H.tier)));if(H.tier%5===0)G.gearDrops.push(hdGear(Math.min(0.7,0.05*H.tier)))}
    const lt=Math.round((H.lt*0.45+(win?40+12*H.tier:0))*(1+upLv('luck')*0.05+(G.st.luck||0)));G.ltGain=lt;SAVE.lt+=lt;G.score=0;
    // nhiệm vụ hằng ngày và nguyên liệu Tu Luyện cũng tính ở Trấn Ấn Lộ (chuyến đi không qua endRun gốc)
    if(typeof dqAdd==='function'){dqAdd('kill',G.kills);dqAdd('time',Math.floor(Math.min(G.t,RUN_T)/60));dqAdd('boss',G.bossKills|0);dqAdd('ult',G.ultN|0);dqAdd('rx',Object.values(G.rx||{}).reduce((a,b)=>a+b,0));dqAdd('hd',win?1:0)}
    if(typeof matAdd==='function'){matAdd('thao',(G.bossKills|0)*2+(win?3:0));matAdd('thiet',(G.bossKills|0)+(win?1:0))}
    const S=SAVE.tal||(SAVE.tal={best:0,wins:0,runs:0});   // SAVE.hd là của thẻ hướng dẫn (huongdan.js)
    S.runs++;S.best=Math.max(S.best,H.cleared);if(win)S.wins++;saveSave();if(win)TA.tier=0;if(win&&coi()==='mua')TA.bxhGui();   // lên bảng xếp hạng mùa
    if(typeof track==='function')track('hd',{w:win?1:0,ch:G.ch,fl:H.floor,room:H.cleared,t:Math.round(G.t),dk:G.dk|0,an:Object.keys(H.b).join(',')});
    if(typeof buzz==='function')buzz(win?[30,60,30,60,90]:[120,60,200]);
    if(win){announce(i18nf('hd.thang2','VƯỢT TẦNG {0}',H.tier),'realm');sfx('realm');flash('#ffffff',1);G.fx.push({k:'pillar',x:G.p.x,y:G.p.y,t:0,dur:3,c:'#ffe680'})}
  }
  Object.assign(TA,{C,RR,TIME,AN,POOL,W2,init:hdInit,apply:hdApply,kill:hdKill,update:hdUpdate,end:hdEnd,gear:hdGear});
}
