'use strict';
// ───────────────────────── TRẤN ẤN LỘ · THỦ LĨNH (js/tranan/thulinh.js)
// Thủ lĩnh của từng tầng xoay vòng qua 7 con: 3 thủ lĩnh cũ (Cửu Vĩ, Ngư Tinh, Thủy Tinh) xen với 4 "Trấn Mạch Thú" chỉ có ở Trấn Ấn Lộ.
// Tầng chia hết cho 10 vẫn là Tâm Ma. Trấn Mạch Thú có hình riêng (tools/art_src/boss_tm_*.png, cắt bằng tools/flow_sheet.py mon tm<mã> … <chiều cao>), cộng 2 THUẬT riêng.
// Từ tầng 8, cả thủ lĩnh cũ cũng mang thêm 1 thuật (cố định theo mùa + tầng, giống biến dị).
//
// THÊM THỦ LĨNH: thêm một mục vào TM {mã: {d:{…chỉ số như ENEMY trong js/data.js, boss:1}, thuat:[mã thuật…]}} rồi thêm mã vào ROSTER.
// THÊM THUẬT:    thêm một mục vào THUAT {mã: {cd: giây hồi, n: tên, f(e,H,P){…}}}. Dùng được: TA.haz (vùng báo trước rồi nổ / vũng độc), eshot (đạn), H.pend (gọi quái).
if(TA){
  const {C,RR,POOL}=TA;
  const TM={
    tm_ho:{d:{n:i18n('quai.tm_ho','Hổ Vương Trấn Mạch'),el:'kim',spr:'tmho',sc:1,hp:5200,spd:44,dmg:26,xp:120,r:19,ai:'charge',boss:1},thuat:['vuot','goi']},
    tm_chu:{d:{n:i18n('quai.tm_chu','Độc Chu Mẫu'),el:'moc',spr:'tmchu',sc:1,hp:5200,spd:36,dmg:24,xp:120,r:19,ai:'poison',boss:1},thuat:['luoidoc','goi']},
    tm_quy:{d:{n:i18n('quai.tm_quy','Thạch Quy Lão Tổ'),el:'tho',spr:'tmquy',sc:1,hp:5200,spd:27,dmg:30,xp:120,r:22,ai:'chase',boss:1},thuat:['diachan','da']},
    tm_phien:{d:{n:i18n('quai.tm_phien','Hồn Phiên Chủ'),el:'thuy',spr:'tmphien',sc:1,hp:5200,spd:30,dmg:24,xp:120,r:15,ai:'ranged',boss:1},thuat:['vongdan','goi']}};
  for(const k in TM)if(!ENEMY[k])ENEMY[k]=TM[k].d;
  // dòng mô tả trong Yêu Lục (Bí Kíp): chỉ tả cách đánh, không thêm chi tiết cốt truyện
  if(typeof YL_TXT!=='undefined')Object.assign(YL_TXT,{tm_ho:'Thủ lĩnh ở Trấn Ấn Lộ. Lao tới vồ, quạt năm đường trảo và gọi bầy.',tm_chu:'Thủ lĩnh ở Trấn Ấn Lộ. Giăng vòng vũng độc quanh con mồi rồi gọi bầy.',
    tm_quy:'Thủ lĩnh ở Trấn Ấn Lộ. Chậm nhưng mỗi cú dậm làm nổ đất dưới chân, kèm mưa đá.',tm_phien:'Thủ lĩnh ở Trấn Ấn Lộ. Giữ khoảng cách, thả hai vòng hồn đạn so le.'});
  const ROSTER=['cuuvi','tm_ho','long','tm_chu','maton','tm_quy','tm_phien'];
  const near=(P,r)=>{for(let k=0;k<10;k++){const a=rand()*TAU,d=rand()*r,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;if(Math.hypot(x-C,y-C)<RR-24)return[x,y]}return[P.x,P.y]};
  const THUAT={
    diachan:{cd:5.5,n:()=>i18n('tl.diachan','Địa Chấn'),f(e,H,P){TA.haz(P.x,P.y,48,1.1,'no',e.dmg*1.1);for(let i=0;i<2;i++){const[x,y]=near(P,90);TA.haz(x,y,40,1.3+i*0.2,'no',e.dmg*1.1)}sfx('roar');shake(0.3)}},
    da:{cd:7.5,n:()=>i18n('tl.da','Thạch Vũ'),f(e,H,P){for(let i=0;i<6;i++){const[x,y]=near(P,130);TA.haz(x,y,30,0.9+i*0.18,'no',e.dmg*0.9)}}},
    luoidoc:{cd:6.5,n:()=>i18n('tl.luoidoc','Lưới Độc'),f(e,H,P){const o=rand()*TAU;for(let i=0;i<5;i++){const a=o+i/5*TAU,x=P.x+Math.cos(a)*62,y=P.y+Math.sin(a)*62;if(Math.hypot(x-C,y-C)<RR-20)TA.haz(x,y,30,5,'doc',e.dmg*0.45)}sfx('fire')}},
    vongdan:{cd:4.5,n:()=>i18n('tl.vongdan','Hồn Hoàn'),f(e,H,P){const n=14,o=rand()*TAU;for(let i=0;i<n;i++)eshot(e.x,e.y-14,o+i/n*TAU,66,e.dmg*0.55,'#9b7bff',4.5,'orb');CDX.later(0.55,()=>{if(e.dead||!G||G.over)return;for(let i=0;i<n;i++)eshot(e.x,e.y-14,o+(i+0.5)/n*TAU,66,e.dmg*0.55,'#c8a8ff',4.5,'orb')});e.atkT=0.5;sfx('no')}},
    vuot:{cd:3.6,n:()=>i18n('tl.vuot','Liệt Trảo'),f(e,H,P){const a0=Math.atan2(P.y-8-(e.y-12),P.x-e.x);for(let i=-2;i<=2;i++)eshot(e.x,e.y-12,a0+i*0.2,120,e.dmg*0.6,'#ffd45a',4,'blade');e.atkT=0.4;sfx('sword')}},
    goi:{cd:10,n:()=>i18n('tl.goi','Hiệu Triệu'),f(e,H,P){const pool=POOL[Math.min(POOL.length-1,Math.floor((H.tier-1)/1.5))];for(let i=0;i<4;i++){const[x,y]=near(e,80);H.pend.push({x,y,t:0.8+i*0.1,k:pick(pool)})}sfx('roar')}}};
  // thủ lĩnh của một tầng, và thuật của nó
  const bossOf=tier=>tier%10===0?'tamma':ROSTER[(tier-1)%ROSTER.length];
  function thuatOf(tier){const k=bossOf(tier);if(TM[k])return TM[k].thuat;if(tier<8)return[];
    let h=2166136261;for(const c of muaId()+'@'+tier){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}const L=['diachan','da','luoidoc','vongdan'];return[L[(h>>>0)%L.length]]}
  const bossText=tier=>{const k=bossOf(tier),t=thuatOf(tier);return ENEMY[k].n+(t.length?' ('+t.map(x=>THUAT[x].n()).join(', ')+')':'')};
  // mỗi khung hình: thủ lĩnh đang sống thì chạy các thuật theo hồi chiêu (so le nhau, nhanh hơn 25% khi còn dưới nửa máu)
  function tmTick(dt){const H=G.hd,e=H.boss,P=G.p;if(!e||e.dead||H.st!=='boss'||P.dead)return;
    if(!e.tm){e.tm=thuatOf(H.tier).map((k,i)=>({k,t:2.5+i*2.2}));if(e.tm.length)announce(ENEMY[e.t]?bossText(H.tier):'','boss')}
    const sp=e.hp<e.mhp*0.5?1.25:1;for(const s of e.tm){s.t-=dt*sp;if(s.t<=0){s.t=THUAT[s.k].cd;sfx('warn');THUAT[s.k].f(e,H,P)}}}
  Object.assign(TA,{TM,THUAT,ROSTER,bossOf,thuatOf,bossText,tmTick});
}
