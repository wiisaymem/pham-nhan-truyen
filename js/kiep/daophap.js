'use strict';
// ───────────────────────── Đạo Pháp: nhãn Hệ (Ngũ Hành) và Môn phái, gom đủ nhãn thì mở mốc (kiểu tộc/hệ TFT)
// Hệ đếm công pháp + tâm pháp (mốc 2/4/6). Môn chỉ đếm công pháp (mốc 2/3/4).
// Tương Sinh Lộ: có 2+ hệ A và 2+ hệ A sinh ra → phản ứng của cặp đó mạnh theo đòn kích hoạt. Ngũ Hành Viên Mãn: đủ 5 hệ.
const MON={kiem:{n:i18n('dp.mon.kiem','Kiếm'),c:'#9fd8ff',ic:'⚔'},tran:{n:i18n('dp.mon.tran','Trận'),c:'#ffd45a',ic:'◎'},phu:{n:i18n('dp.mon.phu','Phù'),c:'#ff9a5a',ic:'✦'},
  the:{n:i18n('dp.mon.the','Thể'),c:'#e8c27a',ic:'◆'},linh:{n:i18n('dp.mon.linh','Linh'),c:'#c9a8ff',ic:'❖'}};
const MON_ORDER=['kiem','tran','phu','the','linh'];
const W_MON={phikiem:'kiem',bangtien:'kiem',dangman:'tran',kiemtran:'tran',hoacau:'phu',loichuong:'phu',phuchu:'phu',kimchung:'the',thothuan:'the',holo:'linh'};
const P_EL={kiemtam:'kim',loithe:'kim',hoalinh:'hoa',daotam:'hoa',thuynguyet:'thuy',tulinh:'thuy',moclinh:'moc',thonguyen:'moc',kimcuong:'tho',thanhanh:'tho'};
const EL_BP=[2,4,6],MON_BP=[2,3,4];
const DP_EL={
  kim:[i18n('dp.kim.1','Chí mạng +6%'),i18n('dp.kim.2','Chí mạng gây ×2.5 thay vì ×2'),i18n('dp.kim.3','Cứ đòn Kim thứ 6 của mỗi công pháp: chắc chắn chí mạng ×3, phá giáp 3 giây')],
  moc:[i18n('dp.moc.1','Hồi 0.5 máu mỗi giây'),i18n('dp.moc.2','Đòn Mộc có 30% quấn chân 0.5 giây và hồi 1 máu'),i18n('dp.moc.3','Quái chết vì đòn Mộc mọc chồi trói quái, hút máu cho bạn')],
  thuy:[i18n('dp.thuy.1','Đòn Thủy làm chậm 1.2 giây'),i18n('dp.thuy.2','Trúng quái đang chậm 3 lần thì đóng băng 1 giây'),i18n('dp.thuy.3','Quái đóng băng bị đánh thì vỡ, nổ băng ra xung quanh')],
  hoa:[i18n('dp.hoa.1','Đòn Hỏa gây cháy: thêm 20% sát thương trong 3 giây'),i18n('dp.hoa.2','Quái đang cháy chết thì nổ'),i18n('dp.hoa.3','Lửa lan sang quái kề bên, đánh quái đang cháy +30%')],
  tho:[i18n('dp.tho.1','Giáp +2'),i18n('dp.tho.2','Mỗi 10 giây có lớp đá đỡ trọn một đòn'),i18n('dp.tho.3','Mỗi 6 giây địa chấn quanh người: choáng và sát thương theo máu tối đa')]};
const DP_MON={
  kiem:[i18n('dp.kiem.1','Công pháp Kiếm +1 đạn'),i18n('dp.kiem.2','Đạn Kiếm xuyên thêm 1'),i18n('dp.kiem.3','Đạn Kiếm bay hết tầm thì quay về đánh lần hai')],
  tran:[i18n('dp.tran.1','Vùng Trận rộng hơn 20%'),i18n('dp.tran.2','Vùng Trận lâu hơn 30%'),i18n('dp.tran.3','Vùng Trận hút quái vào giữa')],
  phu:[i18n('dp.phu.1','Vụ nổ rộng hơn 20%, sét nảy thêm 1'),i18n('dp.phu.2','Mỗi vụ nổ kéo theo một vụ nổ nhỏ'),i18n('dp.phu.3','Cứ lần thứ 4 của mỗi chiêu Phù thì ra đôi')],
  the:[i18n('dp.the.1','Nhận sát thương −10%'),i18n('dp.the.2','Chiêu Thể +30% sát thương'),i18n('dp.the.3','Bị đánh thì mọi chiêu Thể phát ngay (hồi 3 giây)')],
  linh:[i18n('dp.linh.1','Linh thú +30% sát thương'),i18n('dp.linh.2','Hút linh khí xa hơn 30%'),i18n('dp.linh.3','Linh thú +60% sát thương thay vì +30%')]};
const DP_LUAT={ // luật riêng mỗi nhân vật (chỉ cộng)
  lamphong:i18n('dp.luat.lamphong','Mỗi công pháp Kiếm tính là 2 khi đếm Môn. Đạn Kiếm xuyên thêm 1.'),
  linhnhi:i18n('dp.luat.linhnhi','Hồi máu khi đầy máu đổi thành khiên, tối đa 30% máu.'),
  hanbang:i18n('dp.luat.hanbang','Quái đang chậm nhận thêm 20% sát thương.'),
  loichan:i18n('dp.luat.loichan','Mỗi công pháp Thể tính là 2 khi đếm Môn. Chiêu Thể rộng hơn 20%.'),
  modung:i18n('dp.luat.modung','Vụ nổ Phù kích hoạt Tương sinh nhanh gấp 3.'),
  bachho:i18n('dp.luat.bachho','Mỗi hệ khác nhau đang có cho sát thương +4%. Hồ Lô Hút Hồn hồi chiêu nhanh hơn 30%.')};
const tierOf=(c,bp)=>c>=bp[2]?3:c>=bp[1]?2:c>=bp[0]?1:0;
const dpElT=el=>G&&G.dp?G.dp.elT[el]|0:0, dpMonT=m=>G&&G.dp?G.dp.monT[m]|0:0;
const dpLo=a=>G&&G.dp&&(G.dp.el[a]|0)>=2&&(G.dp.el[SINH[a]]|0)>=2;
function dpEvoOk(k){return !!G.pass[EVO[k].p]||dpElT(WEAP[k].el)>=2}
function monW(m){return (m==='kiem'&&G.ch==='lamphong')||(m==='the'&&G.ch==='loichan')?2:1}
function dpCalc(){const el={},mon={};
  for(const k in G.w){const e=WEAP[k].el,m=W_MON[k];el[e]=(el[e]|0)+1;if(m)mon[m]=(mon[m]|0)+monW(m)}
  for(const k in G.pass){const e=P_EL[k];if(e)el[e]=(el[e]|0)+1}
  if(G.cd&&typeof CD!=='undefined')for(const k in G.cd){const c=CD[k];if(!c)continue;if(c.el)el[c.el]=(el[c.el]|0)+1;if(c.mon)mon[c.mon]=(mon[c.mon]|0)+1}
  const elT={},monT={};for(const e in el)elT[e]=tierOf(el[e],EL_BP);for(const m in mon)monT[m]=tierOf(mon[m],MON_BP);
  const ngu=NH_ORDER.every(e=>(el[e]|0)>=1);
  const prev=G.dp;G.dp={el,mon,elT,monT,ngu};
  // báo khi lên mốc
  if(prev&&G.t>1){for(const e in elT)if(elT[e]>(prev.elT[e]|0))announce(i18nf('dp.tb.he','{0} {1} · {2}',EL[e].n,el[e],DP_EL[e][elT[e]-1]),'good');
    for(const m in monT)if(monT[m]>(prev.monT[m]|0))announce(i18nf('dp.tb.he','{0} {1} · {2}',MON[m].n,mon[m],DP_MON[m][monT[m]-1]),'good');
    for(const a of NH_ORDER)if(dpLo(a)&&!(prev.el[a]>=2&&prev.el[SINH[a]]>=2))announce(i18nf('dp.tb.lo','Tương Sinh Lộ · {0}',NH[a].n),'realm');
    if(ngu&&!prev.ngu)announce(i18n('dp.tb.ngu','Ngũ Hành Viên Mãn!'),'realm')}
}
const _rcDP=recompute;
recompute=function(){_rcDP();if(!G)return;dpCalc();const S=G.st,E=G.dp.elT,M=G.dp.monT;
  if(E.kim>=1)S.crit+=0.06; if(E.kim>=2)S.critM=2.5;
  if(E.moc>=1)S.regen+=0.5; if(E.tho>=1)S.armor+=2;
  if(M.kiem>=1)S.kiemAmt=1; if(M.kiem>=2)S.kiemP=1; if(M.kiem>=3)S.kiemRet=1; if(G.ch==='lamphong')S.kiemP=(S.kiemP||0)+1;
  if(M.tran>=1)S.tranR=1.2; if(M.tran>=2)S.tranD=1.3; if(M.tran>=3)S.tranPull=1;
  if(M.phu>=1){S.phuR=1.2;S.phuCh=1} if(M.phu>=2)S.phuMini=1;
  if(G.ch==='loichan')S.theR=1.2;
  if(M.linh>=2)S.mag*=1.3;
  if(G.dp.ngu)S.dmg*=1.1;
  if(G.ch==='bachho')S.dmg*=1+0.04*Object.keys(G.dp.el).length;
  if(typeof dpHud==='function')dpHud()};

// ── sát thương: hệ số thêm, chí mạng Kim Quang, hiệu ứng khi trúng
function dpMul(e,el,o){if(!G.dp)return 1;let m=1;const src=W_MON[G.src];
  if(e.burn&&dpElT('hoa')>=3)m*=1.3;
  if(src==='the'&&dpMonT('the')>=2)m*=1.3;
  if(G.ch==='hanbang'&&e.slowT>0)m*=1.2;
  if(e.shredT>0)m*=1.15;
  return m}
const kimN={};
function dpCrit(e,el){if(el!=='kim'||dpElT('kim')<3)return false;const k=G.src||'x';kimN[k]=(kimN[k]|0)+1;if(kimN[k]%6)return false;e.shredT=3;return true}
function dpOnHit(e,el,d,o){if(!G.dp)return;G.dpLastD=d;if(el)e.lastEl=el;if(o.dp)return;const P=G.p,E=G.dp.elT;
  if(el==='moc'&&E.moc>=2&&(e.mocT||0)<=0&&rand()<0.3){e.mocT=2;if(!e.d.boss)e.rootT=Math.max(e.rootT,0.5);P.hp=Math.min(P.mhp,P.hp+1)}
  if(el==='thuy'&&E.thuy>=1){const wasSlow=e.slowT>0;e.slowT=Math.max(e.slowT,1.2);
    if(E.thuy>=2&&wasSlow&&!e.d.boss&&(e.frzT||0)<=0){e.wet=(e.wet|0)+1;if(e.wet>=3){e.wet=0;e.frzT=3;e.frozen=1;e.rootT=Math.max(e.rootT,1);G.fx.push({k:'spark',x:e.x,y:e.y-e.r,t:0,dur:0.3,c:'#bff4ff'})}}}
  if(e.frozen>0&&E.thuy>=3&&!o.rx&&e.wet===0&&(e.frzT||0)<2.6){e.frozen=0;const x=e.x,y=e.y,dd=d*0.6;G.fx.push({k:'frost',x,y,r:34,t:0,dur:0.45});
    G.later.push({t:0.01,f:()=>forNear(x,y,40,t=>{if(t!==e&&Math.hypot(t.x-x,t.y-y)<34+t.r)hurtE(t,dd/Math.max(0.1,G.st.dmg),'thuy',{rx:1,dp:1})})})}
  if(el==='hoa'&&E.hoa>=1&&!o.rx){const dps=d*0.067;if(!e.burn||e.burn.dps<dps)e.burn={t:3,dps,tk:0.5};else e.burn.t=3}
}
// cháy, đóng băng, địa chấn: chạy mỗi khung
let dpQk=6,dpSh=0,dpShT=0,dpTheT=0,dpSprT=0;
function dpTick(dt){if(!G||!G.dp||G.over)return;const P=G.p,E=G.dp.elT;dpShT-=dt;dpTheT-=dt;dpSprT-=dt;
  for(const e of G.e){if(e.dead)continue;if(e.mocT>0)e.mocT-=dt;if(e.frzT>0)e.frzT-=dt;if(e.shredT>0)e.shredT-=dt;if(e.frozen>0&&e.rootT<=0)e.frozen=0;
    const b=e.burn;if(b){b.t-=dt;b.tk-=dt;if(b.tk<=0){b.tk=0.5;const dmg=b.dps*0.5;e.hp-=dmg;G.dmgBy.tuongsinh=(G.dmgBy.tuongsinh||0)+dmg;e.flash=Math.max(e.flash,0.04);
        if(G.nums.length<60)G.nums.push({x:e.x+(rand()-.5)*6,y:e.y-e.r*1.4,v:Math.round(dmg),t:0,c:'#ff8a3a'});
        if(E.hoa>=3&&rand()<0.2){let nb=null;forNear(e.x,e.y,32,t=>{if(t!==e&&!t.burn&&!nb)nb=t});if(nb)nb.burn={t:3,dps:b.dps*0.8,tk:0.5}}
        if(e.hp<=0){const o=G.src;G.src='tuongsinh';killE(e);G.src=o;continue}}
      if(b.t<=0)e.burn=null}}
  if(E.tho>=3){dpQk-=dt;if(dpQk<=0){dpQk=6;const R=70*G.st.area,o=G.src;G.src='tuongsinh';forNear(P.x,P.y,R,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<R+e.r){hurtE(e,12+P.mhp*0.12,'tho',{rx:1,dp:1,kb:40});if(!e.d.boss)e.rootT=Math.max(e.rootT,0.8)}});
    G.src=o;G.fx.push({k:'bell',x:P.x,y:P.y,r:R,t:0,dur:0.5});if(typeof cpFx==='function')for(let i=0;i<8;i++){const an=i/8*TAU;cpFx('st_dust',P.x+Math.cos(an)*R*0.8,P.y+Math.sin(an)*R*0.55,14,0.5)}shake(0.25);sfx('boom')}}
  // Tô Linh Nhi: hồi khi đầy máu thành khiên
  if(G.ch==='linhnhi'&&P.hp>=P.mhp-0.01)dpSh=Math.min(P.mhp*0.3,dpSh+G.st.regen*dt);
}
const _ntDP=nhTick;nhTick=function(dt){_ntDP(dt);try{dpTick(dt)}catch(e){}};
// quái chết: nổ cháy, mọc chồi
const _keDP=killE;
killE=function(e){const was=e.dead;_keDP(e);if(was||!G||!G.dp||e.d.boss)return;const E=G.dp.elT,x=e.x,y=e.y;
  if(e.burn&&E.hoa>=2){const o=G.src;G.src='tuongsinh';G.fx.push({k:'boom',x,y,r:26,t:0,dur:0.3});G.later.push({t:0.05,f:()=>{G.src='tuongsinh';forNear(x,y,34,t=>{if(Math.hypot(t.x-x,t.y-y)<28+t.r)hurtE(t,10+G.realm*5,'hoa',{rx:1,dp:1})})}});G.src=o}
  if(e.lastEl==='moc'&&E.moc>=3&&dpSprT<=0){dpSprT=0.6;if(typeof cpFx==='function')cpFx('st_sprout1',x,y,14,1.5);G.zones.push({k:'vine',x,y,r:22,t:0,dur:2,dps:6+G.realm*3,el:'moc',tick:0,seed:rand()*1000,leech:1,src:'tuongsinh'})}};
// nhận đòn: Thể giảm sát thương, khiên Thổ, khiên Linh Nhi, Thể phản kích
const _hpDP=hurtP;
hurtP=function(d,src){const P=G.p;if(!G.dp||P.dead||G.over||P.inv>0||G.god)return _hpDP(d,src);
  if(dpElT('tho')>=2&&dpShT<=0){dpShT=10;P.inv=0.3;G.fx.push({k:'spark',x:P.x,y:P.y-10,t:0,dur:0.35,c:'#e8c27a'});if(typeof cpFx==='function')cpFx('st_shell1',P.x,P.y-12,26,0.4);sfx('stone');return}
  if(dpMonT('the')>=1)d*=0.9;
  if(dpSh>0){const a=Math.min(dpSh,d);dpSh-=a;d-=a;if(d<=0){P.inv=0.06;return}}
  _hpDP(d,src);
  if(dpMonT('the')>=3&&dpTheT<=0&&!P.dead){dpTheT=3;for(const k in G.w)if(W_MON[k]==='the'&&k!=='thothuan')fireWeapon(k,G.w[k]);
    const o=G.src;G.src='thothuan';const R=50*G.st.area;forNear(P.x,P.y,R,e=>{if(Math.hypot(e.x-P.x,e.y-P.y)<R+e.r)hurtE(e,14+G.realm*6,'tho',{kb:60,dp:1})});G.src=o;G.fx.push({k:'bell',x:P.x,y:P.y,r:R,t:0,dur:0.4})}};
// Phù 4: cứ lần thứ 4 ra đôi
const _fwDP=fireWeapon;let fwDup=false;
fireWeapon=function(k,w){const r=_fwDP(k,w);if(!fwDup&&W_MON[k]==='phu'&&dpMonT('phu')>=3&&r>0.25){w.pc=(w.pc|0)+1;if(w.pc%4===0)G.later.push({t:0.22,f:()=>{if(G.w[k]){fwDup=true;try{_fwDP(k,G.w[k])}finally{fwDup=false}}}})}return r};
// Linh: linh thú mạnh hơn
const _ppDP=petPower;petPower=function(){const b=_ppDP();if(!G||!G.dp)return b;const t=dpMonT('linh');return b*(t>=3?1.6:t>=1?1.3:1)};
// Tương Sinh Lộ, Ngũ Hành Viên Mãn
nhHit=function(e,el){if(!EL[el])return;const ngu=G.dp&&G.dp.ngu;
  if(e.mk&&e.mk.t>0&&(SINH[e.mk.el]===el||(ngu&&e.mk.el!==el))&&(e.rxT||0)<=0&&nhBudget>0){const a=e.mk.el,s0=G.src;e.mk=null;e.rxT=0.8;nhBudget--;G.dpRxA=a;nhReact(e,a);G.dpRxA=null;
    if(dpLo(a))e.rxT=0.4;if(G.ch==='modung'&&W_MON[s0]==='phu')e.rxT=Math.min(e.rxT,0.27);return}
  if(!e.mk||e.mk.el!==el||e.mk.t<1.5)e.mk={el,t:MARK_T}};
const _ndDP=nhDmg;nhDmg=function(){const b=_ndDP(),a=G.dpRxA;if(a&&dpLo(a)&&G.dpLastD)return Math.max(b,0.5*G.dpLastD/Math.max(0.1,G.st.dmg));return b};

// ── ra thẻ: nghiêng về nhãn đang theo, chắc chắn có thẻ hợp build, thần thông mở thêm bằng Hệ 4
function cardTags(c){if(c.t==='w'||c.t==='e')return{el:WEAP[c.k].el,mon:W_MON[c.k]};if(c.t==='p')return{el:P_EL[c.k]};return{}}
function dpPreview(c){if(!G.dp)return[];const isNew=(c.t==='w'&&!G.w[c.k])||(c.t==='p'&&!G.pass[c.k]);if(!isNew)return[];const T=cardTags(c),out=[];
  if(T.el){const n=(G.dp.el[T.el]|0)+1;if(EL_BP.includes(n))out.push({k:'el',id:T.el,n,t:EL_BP.indexOf(n)+1})}
  if(T.mon){const n=(G.dp.mon[T.mon]|0)+monW(T.mon);const t=tierOf(n,MON_BP);if(t>(G.dp.monT[T.mon]|0))out.push({k:'mon',id:T.mon,n,t})}
  return out}
function onTag(c){if(!G.dp)return false;const T=cardTags(c);return (T.el&&(G.dp.el[T.el]|0)>0)||(T.mon&&(G.dp.mon[T.mon]|0)>0)}
rollCards=function(excl){
  const opts=[];const ch=CHARS[G.ch],cEl=WEAP[ch.w].el,cMon=W_MON[ch.w];
  for(const k in G.w)if(G.w[k].lv<5)opts.push({t:'w',k,wt:3});
  const needP={};for(const k in G.w){const w=G.w[k];if(!w.evo&&w.lv>=3&&dpElT(WEAP[k].el)<2)needP[EVO[k].p]=1}
  if(Object.keys(G.w).length<wSlots())for(const k of WEAP_ORDER)if(!G.w[k]&&!G.banned[k])opts.push({t:'w',k,wt:1.7,nw:1});
  for(const k in G.pass)if(G.pass[k]<5)opts.push({t:'p',k,wt:2});
  for(const o of opts)if(o.t==='p'&&needP[o.k])o.wt*=1.6;
  if(Object.keys(G.pass).length<MAX_P)for(const k of PASS_ORDER)if(!G.pass[k]&&!G.banned[k])opts.push({t:'p',k,wt:needP[k]?2.6:1.2,nw:1});
  // trọng số theo nhãn
  for(const o of opts){const T=cardTags(o);let m=1;if(T.el&&(G.dp.el[T.el]|0)>0)m+=0.5;if(T.mon&&(G.dp.mon[T.mon]|0)>0)m+=0.5;
    if(o.nw&&dpPreview(o).length)m*=2;if(T.el===cEl||(T.mon&&T.mon===cMon))m*=1.1;o.wt*=Math.min(3,m)}
  const evo=[];for(const k in G.w){const w=G.w[k];if(w.lv>=5&&!w.evo&&dpEvoOk(k))evo.push({t:'e',k,wt:6})}
  if(G.chestOpen&&evo.length)return[evo[0]];
  opts.push(...evo);
  if(excl)for(let i=opts.length-1;i>=0;i--)if(excl.some(c=>c.t===opts[i].t&&c.k===opts[i].k))opts.splice(i,1);
  const pick=L=>{let tot=L.reduce((s,o)=>s+o.wt,0),r=rand()*tot,i=0;for(;i<L.length;i++){r-=L[i].wt;if(r<=0)break}return L.splice(Math.min(i,L.length-1),1)[0]};
  const out=[];while(out.length<3&&opts.length)out.push(pick(opts));
  // chắc chắn có ít nhất 1 thẻ hợp build khi đã có từ 2 công pháp
  if(Object.keys(G.w).length>=2&&out.length===3&&!out.some(onTag)){const L=opts.filter(onTag);if(L.length)out[2]=pick(L)}
  if(out.length<3)out.push({t:'heal'});
  if(out.length<3)out.push({t:'lt'});
  return out};

// ── thẻ: nhãn hệ, môn và mốc sắp mở
(function(){const st=document.createElement('style');st.textContent=`
.dpt{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px}.dpt span{font:700 10px var(--font);padding:1px 5px;border-radius:6px;background:rgba(0,0,0,.07);color:#5a4024;border:1px solid rgba(0,0,0,.08)}
.dpt span.up{background:#fff2b8;border-color:#e0a83a;color:#8a4a00;animation:dpUp 1s steps(2) infinite}@keyframes dpUp{50%{background:#ffe27a}}
#dpHud{position:absolute;left:6px;top:calc(max(6px,env(safe-area-inset-top)) + 124px);display:flex;flex-direction:column;gap:2px;pointer-events:none;z-index:4}
#dpHud div{display:flex;align-items:center;gap:3px;font:700 11px var(--font);color:#fff;text-shadow:1px 1px 0 #000;background:rgba(20,16,30,.45);border-radius:6px;padding:1px 5px 1px 3px;border-left:3px solid var(--c)}
#dpHud div.on{background:rgba(40,30,10,.6)}#dpHud i{font-style:normal;color:var(--c);letter-spacing:-1px;font-size:9px}
#dpHud div.big{border-left-width:5px}`;document.head.appendChild(st)})();
const _rcUI=renderCards;
renderCards=function(){_rcUI();if(!G||!G.dp)return;const bs=$('luCards').children;
  cards.forEach((c,i)=>{const b=bs[i];if(!b)return;const T=cardTags(c);if(!T.el&&!T.mon)return;const pv=dpPreview(c);const ch=[];
    if(T.el){const p=pv.find(x=>x.k==='el');ch.push(`<span style="color:${EL[T.el].d}"${p?' class="up"':''}>${tgI(T.el)}${EL[T.el].n} ${(G.dp.el[T.el]|0)}${p?` → ${p.n}`:''}</span>`)}
    if(T.mon){const p=pv.find(x=>x.k==='mon');ch.push(`<span${p?' class="up"':''}>${tgI(T.mon)}${MON[T.mon].n} ${(G.dp.mon[T.mon]|0)}${p?` → ${p.n}`:''}</span>`)}
    for(const p of pv){const L=p.k==='el'?DP_EL[p.id]:DP_MON[p.id];ch.push(`<span class="up">✦ ${L[p.t-1]}</span>`)}
    if(c.t==='w'&&!G.w[c.k]?.evo&&dpElT(T.el)<2&&(G.w[c.k]?.lv|0)>=3)ch.push(`<span>✦ ${i18nf('dp.evoalt','Thần thông: hoặc {0} 4',EL[T.el].n)}</span>`);
    const d=document.createElement('div');d.className='dpt';d.innerHTML=ch.join('');(b.querySelector('.ct')||b).appendChild(d)})};

// biểu tượng nhãn (Flow: tools/art_src/tags.png → ic_tg_*)
const tgI=id=>{const u=typeof iconURL==='function'&&SPR['ic_tg_'+id]?iconURL('tg_'+id):'';return u?`<img src="${u}" style="width:12px;height:12px;vertical-align:-2px;margin-right:2px;image-rendering:pixelated">`:''};
// ── HUD: nhãn đang có, mốc đã mở
function dpHud(){let el=$('dpHud');if(!G||!G.dp||G.over){if(el)el.innerHTML='';return}
  if(!el){el=document.createElement('div');el.id='dpHud';($('hud')||document.body).appendChild(el)}
  const L=[];for(const e of NH_ORDER){const n=G.dp.el[e]|0;if(n)L.push({n,t:G.dp.elT[e]|0,name:tgI(e)+EL[e].n,c:EL[e].c,bp:EL_BP})}
  for(const m of MON_ORDER){const n=G.dp.mon[m]|0;if(n)L.push({n,t:G.dp.monT[m]|0,name:tgI(m)+MON[m].n,c:MON[m].c,bp:MON_BP})}
  L.sort((a,b)=>b.t-a.t||b.n-a.n);
  let h=L.slice(0,7).map(x=>{const nx=x.bp.find(v=>v>x.n);return `<div class="${x.t?'on':''}${x.t>=3?' big':''}" style="--c:${x.c}">${x.name} ${x.n}${nx?`<i>/${nx}</i>`:''}<i>${'●'.repeat(x.t)}${'○'.repeat(3-x.t)}</i></div>`}).join('');
  if(G.dp.ngu)h=`<div class="on big" style="--c:#fff1a0">${tgI('ngu')}${i18n('dp.ngu','Ngũ Hành')}</div>`+h;
  el.innerHTML=h}
const _bsDP=buildSlots;buildSlots=function(){_bsDP();try{dpHud()}catch(e){}};
const _nrDP=newRun;newRun=function(...a){dpQk=6;dpSh=0;dpShT=0;dpTheT=0;for(const k in kimN)delete kimN[k];const r=_nrDP(...a);if(G){G.dp=null;recompute()}return r};
// luật riêng hiện ở màn chọn tu sĩ
// luật riêng hiện ở màn chọn tu sĩ
const _bsSel=buildSelect;buildSelect=function(...a){const r=_bsSel(...a);try{const L=DP_LUAT[selChar],el=$('cdInfo');if(L&&el&&!el.querySelector('.dpl')){const sp=document.createElement('div');sp.className='dpl';sp.style.cssText='color:#8a4a00;margin:4px 0';sp.textContent='✦ '+L;const f=el.querySelector('div');f?el.insertBefore(sp,f):el.appendChild(sp)}}catch(e){}return r};

// khiên đá Thổ 4: hiện quanh người khi sẵn sàng, vỡ khi đỡ đòn
const _dplDP=drawPlayer;drawPlayer=function(){_dplDP();if(!G||!G.dp||G.p.dead)return;if(dpElT('tho')>=2&&dpShT<=0)fxD('st_shell0',G.p.x,G.p.y-12,26,{alpha:0.45+Math.sin(G.t*3)*0.1});
  if(G.ch==='linhnhi'&&dpSh>0.5){ctx.save();ctx.translate(G.p.x,G.p.y-12);ctx.globalAlpha=Math.min(0.6,dpSh/G.p.mhp*2);ctx.strokeStyle='#9fffc0';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.stroke();ctx.restore();ctx.globalAlpha=1}};

// ── Đại chiêu mang theo Hệ có mốc cao nhất, và được kích Tương Sinh
function dpTopEl(){if(!G||!G.dp)return null;let b=null,bt=0;
  for(const k in G.dp.elT){const t=G.dp.elT[k]|0;if(t>bt||(t===bt&&t>0&&(G.dp.el[k]|0)>(G.dp.el[b]|0))){b=k;bt=t}}return bt>0?b:null}
let dpInRx=0;
const _nxDP=nhReact;nhReact=function(e,a){dpInRx++;try{return _nxDP(e,a)}finally{dpInRx--}};
const _heDPu=hurtE;
hurtE=function(e,dmg,el,o){
  if(!G||G.src!=='burst'||!o||o.rx!==1||dpInRx||o.uDone)return _heDPu(e,dmg,el,o);
  const top=dpTopEl(),T=top?G.dp.elT[top]|0:0;o=Object.assign({},o,{rx:0,uDone:1});
  if(top==='kim')dmg*=1+0.15*T;
  const r=_heDPu(e,dmg,el,o);
  if(top&&!e.dead){const boss=e.d&&e.d.boss;
    if(top==='moc'&&!boss)e.rootT=Math.max(e.rootT||0,0.3*T);
    else if(top==='tho'&&!boss)e.rootT=Math.max(e.rootT||0,0.25*T);
    else if(top==='thuy')e.slowT=Math.max(e.slowT||0,1.5);
    if(top!==el){dpOnHit(e,top,G.dpLastD||dmg,{});if(typeof nhHit==='function')nhHit(e,top)}}
  return r};
// biểu tượng Hệ đang gắn vào đại chiêu, góc nút
(function(){const st=document.createElement('style');st.textContent='#burstEl{position:absolute;right:-2px;bottom:-2px;width:24px;height:24px;image-rendering:pixelated;pointer-events:none;z-index:3;filter:drop-shadow(0 0 3px #000)}';document.head.appendChild(st)})();
let dpBE=null;
const _hudDPu=hud;hud=function(dt){_hudDPu(dt);try{const b=$('burstB');if(!b||!G)return;const t=dpTopEl()||'';if(t===dpBE&&$('burstEl'))return;dpBE=t;
  let im=$('burstEl');if(!im){im=document.createElement('img');im.id='burstEl';im.alt='';b.appendChild(im)}
  const u=t&&SPR['ic_tg_'+t]?iconURL('tg_'+t):'';im.hidden=!u;if(u)im.src=u}catch(e){}};

// Bạch Hồ: Hồ Lô hồi chiêu nhanh hơn 30% (đầu ván đỡ chậm)
if(WEAP.holo){const _hlS=WEAP.holo.s;WEAP.holo.s=function(lv){const s=_hlS(lv);return G&&G.ch==='bachho'?Object.assign({},s,{cd:s.cd*0.7}):s}}
