'use strict';
// ───────────────────────── Đạo Pháp giai đoạn 4: Hợp Kích (5 cặp tương sinh) và Cơ Duyên (3 lượt chọn định hình ván)
// Hợp Kích: có công pháp cấp 5 hệ A và công pháp cấp 3+ hệ A sinh ra → thẻ viền tím, không chiếm ô.
// Cơ Duyên: lúc 2:30, sau boss thứ nhất và boss thứ hai, chọn 1 trong 3. Phẩm Phàm (bạc), Linh (vàng), Tiên (tím, cần đạt mốc).

const HK={
  phanlam:{a:'moc',b:'hoa',ic:'hk_phanlam',c:'#ff8a3a',n:()=>i18n('hk.phanlam.n','Phần Lâm'),d:()=>i18n('hk.phanlam.d','Chiêu Mộc trúng quái đang bị trói thì đốt cháy nó. Sát thương Hỏa lên quái bị trói +40%.')},
  dungnham:{a:'hoa',b:'tho',ic:'hk_dungnham',c:'#ff5a1f',n:()=>i18n('hk.dungnham.n','Dung Nham Phún Trào'),d:()=>i18n('hk.dungnham.d','Vụ nổ Hỏa có 50% để lại vũng dung nham đốt và làm chậm. Chiêu Thổ +20% sát thương.')},
  kimthach:{a:'tho',b:'kim',ic:'hk_kimthach',c:'#ffd45a',n:()=>i18n('hk.kimthach.n','Kim Thạch Bất Hoại'),d:()=>i18n('hk.kimthach.d','Chiêu Thổ có 20% bắn ra 3 mảnh kim xuyên. Mỗi điểm giáp cộng 4% sát thương Kim.')},
  loivu:{a:'kim',b:'thuy',ic:'hk_loivu',c:'#9fe8ff',n:()=>i18n('hk.loivu.n','Lôi Vũ'),d:()=>i18n('hk.loivu.d','Chiêu Kim trúng quái đang chậm có 30% phóng sét nối sang tới 8 quái đang chậm quanh đó.')},
  camlo:{a:'thuy',b:'moc',ic:'hk_camlo',c:'#7bff9a',n:()=>i18n('hk.camlo.n','Cam Lộ'),d:()=>i18n('hk.camlo.d','Quái đóng băng chết thì mọc hoa hồi máu. Chiêu Mộc làm chậm lâu hơn.')},
};
const HK_ORDER=['phanlam','dungnham','kimthach','loivu','camlo'];
const hkHas=k=>!!(G&&G.hk&&G.hk[k]);
function hkOk(k){if(!G||!G.w||hkHas(k))return false;const H=HK[k];let a=false,b=false;
  for(const w in G.w){const e=WEAP[w]&&WEAP[w].el,l=G.w[w].lv;if(e===H.a&&l>=5)a=true;else if(e===H.b&&l>=3)b=true}return a&&b}

// ── Cơ Duyên
const CDE=['kim','moc','thuy','hoa','tho'],CDM=['kiem','tran','phu','the','linh'];
const elN=e=>EL[e].n,monN=m=>MON[m]?MON[m].n:m;
const CD={
  luc:{tier:1,cat:'st',n:()=>i18n('cd.luc.n','Tụ Lực'),d:()=>i18n('cd.luc.d','Sát thương +10%.')},
  doi:{tier:1,cat:'ut',n:()=>i18n('cd.doi.n','Thiên Cơ'),d:()=>i18n('cd.doi.d','+2 lượt đổi thẻ, +1 lượt phong ấn.'),f:()=>{G.rer+=2;G.ban+=1}},
  cap:{tier:1,cat:'ut',n:()=>i18n('cd.cap.n','Đốn Ngộ'),d:()=>i18n('cd.cap.d','Nhận ngay 2 cấp.'),f:()=>{G.pendLv+=2;G.lv+=2}},
  mau:{tier:1,cat:'st',n:()=>i18n('cd.mau.n','Cố Bản'),d:()=>i18n('cd.mau.d','Máu tối đa +20%, hồi đầy máu.'),f:()=>{G.cdHeal=1}},
  toc:{tier:1,cat:'st',n:()=>i18n('cd.toc.n','Phiêu Diêu'),d:()=>i18n('cd.toc.d','Tốc chạy +12%, hút linh khí +40%.')},
  hoi:{tier:1,cat:'st',n:()=>i18n('cd.hoi.n','Tĩnh Tâm'),d:()=>i18n('cd.hoi.d','Hồi chiêu −8%.')},
  lt:{tier:1,cat:'ut',n:()=>i18n('cd.lt.n','Linh Mạch'),d:()=>i18n('cd.lt.d','+150 linh thạch.'),f:()=>{G.lt+=150}},
  kn:{tier:1,cat:'st',n:()=>i18n('cd.kn.n','Ngộ Tính'),d:()=>i18n('cd.kn.d','Kinh nghiệm +20%.')},
  bao:{tier:2,cat:'st',n:()=>i18n('cd.bao.n','Phong Mang'),d:()=>i18n('cd.bao.d','Chí mạng +10%, sát thương chí mạng +50%.')},
  kiemhoi:{tier:2,cat:'mon',n:()=>i18n('cd.kiemhoi.n','Kiếm Hồi'),d:()=>i18n('cd.kiemhoi.d','Đạn Kiếm bay hết tầm thì quay về, chém thêm lần nữa.'),req:()=>dpMonT('kiem')>=1&&!(G.st&&G.st.kiemRet)},
  daitran:{tier:3,cat:'mon',n:()=>i18n('cd.daitran.n','Đại Trận Thiên Phú'),d:()=>i18n('cd.daitran.d','Mọi vùng Trận xuất hiện hai lần.'),rq:()=>i18n('cd.rq.tran','cần Trận 3'),req:()=>dpMonT('tran')>=2},
  vankiem:{tier:3,cat:'mon',n:()=>i18n('cd.vankiem.n','Vạn Kiếm Quy Tông'),d:()=>i18n('cd.vankiem.d','Công pháp Kiếm +1 đạn, xuyên thêm 1.'),rq:()=>i18n('cd.rq.kiem','cần Kiếm 3'),req:()=>dpMonT('kiem')>=2},
  phu:{tier:3,cat:'mon',n:()=>i18n('cd.phu.n','Phù Lục Chân Truyền'),d:()=>i18n('cd.phu.d','Vụ nổ của công pháp Phù to hơn 30%.'),rq:()=>i18n('cd.rq.phu','cần Phù 3'),req:()=>dpMonT('phu')>=2},
  the:{tier:3,cat:'mon',n:()=>i18n('cd.the.n','Kim Thân Bất Hoại'),d:()=>i18n('cd.the.d','Công pháp Thể rộng hơn 25%, nhận sát thương −10%.'),rq:()=>i18n('cd.rq.the','cần Thể 3'),req:()=>dpMonT('the')>=2},
  linh:{tier:3,cat:'mon',n:()=>i18n('cd.linh.n','Vạn Linh Triều Bái'),d:()=>i18n('cd.linh.d','Linh thú mạnh hơn 40%, công pháp Linh hồi chiêu nhanh hơn 15%.'),rq:()=>i18n('cd.rq.linh','cần Linh 3'),req:()=>dpMonT('linh')>=2},
  hoa:{tier:3,cat:'el',n:()=>i18n('cd.hoa.n','Hỏa Ngục'),d:()=>i18n('cd.hoa.d','Hiệu ứng cháy gây sát thương gấp đôi.'),rq:()=>i18n('cd.rq.hoa','cần Hỏa 4'),req:()=>dpElT('hoa')>=2},
  bang:{tier:3,cat:'el',n:()=>i18n('cd.bang.n','Vạn Niên Hàn'),d:()=>i18n('cd.bang.d','Chỉ cần trúng 2 lần là đóng băng quái đang chậm.'),rq:()=>i18n('cd.rq.thuy','cần Thủy 4'),req:()=>dpElT('thuy')>=2},
  tho:{tier:3,cat:'el',n:()=>i18n('cd.tho.n','Bàn Thạch'),d:()=>i18n('cd.tho.d','Giáp +4.'),rq:()=>i18n('cd.rq.tho','cần Thổ 4'),req:()=>dpElT('tho')>=2},
  moc:{tier:3,cat:'el',n:()=>i18n('cd.moc.n','Trường Sinh'),d:()=>i18n('cd.moc.d','Hồi 1.5 máu mỗi giây.'),rq:()=>i18n('cd.rq.moc','cần Mộc 4'),req:()=>dpElT('moc')>=2},
  kim:{tier:3,cat:'el',n:()=>i18n('cd.kim.n','Kim Quang Phá Diệt'),d:()=>i18n('cd.kim.d','Sát thương chí mạng +60%.'),rq:()=>i18n('cd.rq.kim','cần Kim 4'),req:()=>dpElT('kim')>=2},
  ngutuong:{tier:3,cat:'el',n:()=>i18n('cd.ngutuong.n','Ngũ Hành Luân Chuyển'),d:()=>i18n('cd.ngutuong.d','Phản ứng Tương Sinh gây sát thương ×1.6.'),rq:()=>i18n('cd.rq.ngu','cần 4 hệ khác nhau'),req:()=>G.dp&&Object.keys(G.dp.el).filter(k=>G.dp.el[k]>0).length>=4},
};
// Ấn Hệ, Ấn Môn: đếm thêm 1
for(const e of CDE)CD['an_'+e]={tier:2,cat:'an',el:e,n:()=>i18nf('cd.anEl.n','Ấn {0}',elN(e)),d:()=>i18nf('cd.anEl.d','Đếm thêm 1 {0} cho mốc Hệ.',elN(e))};
for(const m of CDM)CD['an_'+m]={tier:2,cat:'an',mon:m,n:()=>i18nf('cd.anMon.n','Ấn {0}',monN(m)),d:()=>i18nf('cd.anMon.d','Đếm thêm 1 {0} cho mốc Môn.',monN(m))};
const cdHas=k=>!!(G&&G.cd&&G.cd[k]);
const CD_IC={1:'tg_cd1',2:'tg_cd2',3:'tg_cd3'};
const cdIcon=k=>{const c=CD[k];return c.el?'tg_'+c.el:c.mon?'tg_'+c.mon:CD_IC[c.tier]};
// trọng số Ấn: hệ/môn đang có, sắp qua mốc thì cao hơn
function cdWt(k){const c=CD[k];if(c.cat!=='an')return 1;const D=G.dp||{el:{},mon:{}};
  if(c.el){const n=(D.el[c.el]|0);if(!n)return 0.3;return EL_BP.includes(n+1)?3:1.5}
  const n=(D.mon[c.mon]|0);if(!n)return 0.2;return MON_BP.includes(Math.floor(n)+1)?2.5:1.2}
function cdRoll(nth){const W=[[60,40,10],[30,50,25],[15,45,45]][Math.min(2,nth-1)];
  const pool=Object.keys(CD).filter(k=>!cdHas(k)&&(!CD[k].req||CD[k].req()));const out=[],cats={};
  for(let i=0;i<3;i++){const ok=pool.filter(k=>!out.includes(k)&&(cats[CD[k].cat]|0)<2);if(!ok.length)break;
    const tiers=[1,2,3].filter(t=>ok.some(k=>CD[k].tier===t));let tot=tiers.reduce((s,t)=>s+W[t-1],0),r=rand()*tot,tier=tiers[0];for(const t of tiers){r-=W[t-1];if(r<=0){tier=t;break}}
    const cand=ok.filter(k=>CD[k].tier===tier);let ws=cand.reduce((s,k)=>s+cdWt(k),0),q=rand()*ws,pick=cand[0];for(const k of cand){q-=cdWt(k);if(q<=0){pick=k;break}}
    out.push(pick);cats[CD[pick].cat]=(cats[CD[pick].cat]|0)+1}
  return out.map(k=>({t:'cd',k}))}

// ── chỉ số
const _gsHK=gearStats;
gearStats=function(){const S=_gsHK();if(!G||!G.cd||G.over)return S;const C=G.cd,a=(k,v)=>{S[k]=(S[k]||0)+v};
  if(C.luc)a('dmg',0.1);if(C.mau)a('hp',0.2);if(C.toc){a('spd',0.12);a('mag',0.4)}if(C.hoi)a('cd',0.08);if(C.kn)a('xp',0.2);
  if(C.bao)a('crit',0.1);if(C.tho)a('armor',4);if(C.moc)a('regen',1.5);return S};
const _rcHKs=recompute;
recompute=function(){_rcHKs();if(!G||!G.st)return;const S=G.st,C=G.cd||{};
  if(C.bao)S.critM=(S.critM||2)+0.5;if(C.kim)S.critM=(S.critM||2)+0.6;
  if(C.kiemhoi)S.kiemRet=1;if(C.vankiem){S.kiemAmt=(S.kiemAmt||0)+1;S.kiemP=(S.kiemP||0)+1}
  if(C.phu)S.phuR=(S.phuR||1)*1.3;if(C.the)S.theR=(S.theR||1)*1.25;
  if(G.cdHeal){G.cdHeal=0;G.p.hp=G.p.mhp}};
const _phHK=petPower;petPower=function(){const b=_phHK();return cdHas('linh')?b*1.4:b};
const _ndHK=nhDmg;nhDmg=function(){const b=_ndHK();return cdHas('ngutuong')?b*1.6:b};
const _hpHK=hurtP;hurtP=function(d,src){return _hpHK(cdHas('the')?d*0.9:d,src)};

// ── chiêu: Đại Trận nhân đôi, Linh hồi nhanh, dung nham sau vụ nổ Hỏa
let hkDup=false;
const _fwHK=fireWeapon;
fireWeapon=function(k,w){let r=_fwHK(k,w);if(!G)return r;const m=W_MON[k];
  if(m==='tran'&&cdHas('daitran')&&!hkDup&&r>0.25)G.later.push({t:0.35,f:()=>{if(G.w[k]){hkDup=true;try{_fwHK(k,G.w[k])}finally{hkDup=false}}}});
  if(m==='linh'&&cdHas('linh')&&r)r*=0.85;return r};
const _exHK=explode;
explode=function(x,y,R,dmg,el,mini){_exHK(x,y,R,dmg,el,mini);if(!mini&&el==='hoa'&&hkHas('dungnham')&&rand()<0.5&&G.zones.length<90)
  G.zones.push({k:'lava',x,y,r:R*0.7,t:0,dur:2.5,dps:dmg*0.35,el:'tho',tick:0,src:'hopkich'})};

// ── hiệu ứng Hợp Kích khi trúng đòn
function hkBolt(e,base){const pts=[[e.x,e.y-e.r*0.5]],hit=new Set([e]);let cur=e;G.src='hopkich';
  for(let i=0;i<8;i++){let best=null,bd=110*110;forNear(cur.x,cur.y,110,t=>{if(hit.has(t)||t.dead||!(t.slowT>0))return;const d=(t.x-cur.x)**2+(t.y-cur.y)**2;if(d<bd){bd=d;best=t}});
    if(!best)break;hit.add(best);pts.push([best.x,best.y-best.r*0.5]);hurtE(best,base,'thuy',{rx:1});cur=best}
  if(pts.length>1){G.fx.push({k:'bolt',pts,t:0,dur:0.25});if(rand()<0.4)sfx('zap')}}
const _heHK=hurtE;
hurtE=function(e,dmg,el,o){o=o||{};if(!G||(!G.hk&&!G.cd)||e.dead)return _heHK(e,dmg,el,o);const H=G.hk||{},C=G.cd||{};
  if(H.phanlam&&el==='hoa'&&e.rootT>0)dmg*=1.4;
  if(H.dungnham&&el==='tho')dmg*=1.2;
  if(H.kimthach&&el==='kim')dmg*=1+0.04*Math.max(0,G.st.armor||0);
  const r=_heHK(e,dmg,el,o);if(o.rx)return r;const D=(G.dpLastD||dmg*G.st.dmg),raw=D/Math.max(0.1,G.st.dmg),src=G.src;
  if(H.phanlam&&el==='moc'&&e.rootT>0&&!e.dead){const dps=D*0.08;if(!e.burn||e.burn.dps<dps)e.burn={t:3,dps,tk:0.5}}
  if(H.kimthach&&el==='tho'&&rand()<0.2&&G.pr.length<260){const o0=rand()*TAU;for(let i=0;i<3;i++){const an=o0+i/3*TAU;
    G.pr.push({k:'sword',x:e.x,y:e.y-e.r*0.5,vx:Math.cos(an)*230,vy:Math.sin(an)*230,dmg:raw*0.5,el:'kim',pierce:3,life:0.5,r:4,hit:[e],gold:1,rx:1,src:'hopkich'})}}
  if(H.loivu&&el==='kim'&&e.slowT>0&&rand()<0.3){hkBolt(e,raw*0.45);G.src=src}
  if(H.camlo&&el==='moc'&&!e.dead)e.slowT=Math.max(e.slowT||0,1.8);
  if(C.hoa&&e.burn&&!e.burn.x2){e.burn.dps*=2;e.burn.x2=1}
  if(C.bang&&el==='thuy'&&e.wet===1&&!e.d.boss)e.wet=2;
  return r};

// ── Cam Lộ: hoa hồi máu
const _keHK=killE;
killE=function(e){const fr=!e.dead&&(e.frozen>0||(e.frzT||0)>0);_keHK(e);if(!G)return;
  if(fr&&hkHas('camlo')){G.hkF=G.hkF||[];if(G.hkF.length<14)G.hkF.push({x:e.x,y:e.y,t:0})}
  if(e.d&&e.d.boss&&!G.tower&&!G.kiep&&(G.cdB|0)<2&&G.t<RUN_T){G.cdB=(G.cdB|0)+1;G.cdQ=(G.cdQ|0)+1}};
function hkFlowers(dt){if(!G.hkF||!G.hkF.length)return;const P=G.p;
  for(const f of G.hkF){f.t+=dt;if(!P.dead&&Math.hypot(P.x-f.x,P.y-f.y)<18){f.t=99;const h=2+G.realm*0.6;P.hp=Math.min(P.mhp,P.hp+h);
    if(G.nums.length<70)G.nums.push({x:P.x,y:P.y-30,v:'+'+h.toFixed(1),t:0,c:'#6dff8a'});burstP(f.x,f.y-4,8,['#7bff9a','#ffffff','#ffd0f0'],{spd:50,life:0.4})}}
  G.hkF=G.hkF.filter(f=>f.t<9)}
const _muHK=mapUnder;
mapUnder=function(){_muHK();if(!G||!G.hkF)return;for(const f of G.hkF){const a=Math.min(1,f.t*3,(9-f.t)/1.5),b=Math.sin(G.t*4+f.x)*0.8;
  glow(f.x,f.y-3,10,'#a6ffb8',0.3*a);if(SPR.st_sprout1)fxD('st_sprout1',f.x,f.y-5+b,13,{alpha:a});if(SPR.fx_petals)fxD('fx_petals',f.x,f.y-9+b,9,{alpha:a*0.9})}};

// ── mỗi khung: hàng đợi Cơ Duyên, hoa
const _uwHK=updateWeapons;
updateWeapons=function(dt){_uwHK(dt);if(!G)return;try{hkFlowers(dt);
  if(!G.cdT&&!G.tower&&!G.kiep&&G.t>=150){G.cdT=1;G.cdQ=(G.cdQ|0)+1}}catch(e){console.error(e)}};
const _hudHK=hud;
hud=function(dt){_hudHK(dt);if(G&&G.cdQ>0&&!G.paused&&!G.over&&!G.p.dead&&!G.bt&&!G.cine&&!cards)openCoDuyen()};
function openCoDuyen(){const cs=cdRoll((G.cdN|0)+1);G.cdQ--;if(!cs.length)return;G.cdN=(G.cdN|0)+1;
  G.paused=true;G.pendLv++;G.cdNow=1;banMode=false;cards=cs;
  $('luTitle').textContent=i18nf('cd.title','Cơ Duyên {0}/3',G.cdN);renderCards();show('lvup');sfx('chest');lvLock=performance.now()+450}

// ── thẻ
const _rollHK=rollCards;
rollCards=function(excl){const out=_rollHK(excl);if(!G||(out.length===1&&out[0].t==='e'))return out;
  const av=HK_ORDER.filter(k=>hkOk(k)&&!(excl&&excl.some(c=>c.t==='hk'&&c.k===k)));if(!av.length)return out;
  G.hkMiss=(G.hkMiss|0)+1;if(rand()<0.6||G.hkMiss>=2){G.hkMiss=0;let i=out.findIndex(c=>c.t==='heal'||c.t==='lt');if(i<0)i=out.length-1;if(out[i]&&out[i].t==='e')i=0;
    out[i]={t:'hk',k:av[(rand()*av.length)|0]}}return out};
const _acHK=applyCard;
applyCard=function(c){if(c.t==='hk'){G.hk=G.hk||{};G.hk[c.k]=1;const H=HK[c.k];
    flash('#e8c8ff',0.5);shake(0.3);G.fx.push({k:'pillar',x:G.p.x,y:G.p.y,t:0,dur:2,c:H.c});announce(i18nf('hk.ann','Hợp Kích · {0}!',H.n()),'realm');
    SAVE.hkSeen=SAVE.hkSeen||{};if(!SAVE.hkSeen[c.k]){SAVE.hkSeen[c.k]=1;saveSave()}recompute();sfx('realm');if(typeof buzz==='function')buzz([30,40,60]);return}
  if(c.t==='cd'){G.cd=G.cd||{};G.cd[c.k]=1;G.cdNow=0;const C=CD[c.k];if(C.f)C.f();
    SAVE.cdSeen=SAVE.cdSeen||{};if(!SAVE.cdSeen[c.k]){SAVE.cdSeen[c.k]=1;saveSave()}
    flash(C.tier===3?'#e8c8ff':C.tier===2?'#fff0b0':'#ffffff',0.35);recompute();sfx('realm');return}
  _acHK(c)};
const _rcdHK=renderCards;
renderCards=function(){const sp=[];if(cards)cards.forEach((c,i)=>{if(c.t==='hk'||c.t==='cd'){sp.push([i,c]);cards[i]={t:'lt'}}});
  try{_rcdHK()}finally{for(const [i,c] of sp)cards[i]=c}
  const bs=$('luCards').children;
  for(const [i,c] of sp){const b=bs[i];if(!b)continue;
    if(c.t==='hk'){const H=HK[c.k];b.className='card3 hkc';
      b.innerHTML=`<img src="${iconURL(H.ic)}"><div class="ct"><b>${H.n()}<i class="new hk">${i18n('hk.tag','Hợp Kích')}</i></b><small><span style="color:${EL[H.a].d}">${EL[H.a].n}</span> → <span style="color:${EL[H.b].d}">${EL[H.b].n}</span> · ${i18n('hk.noSlot','không chiếm ô')}</small><p>${H.d()}</p></div>`}
    else{const C=CD[c.k];b.className='card3 cdc cd'+C.tier;const tn=[0,i18n('cd.t1','Phàm'),i18n('cd.t2','Linh'),i18n('cd.t3','Tiên')][C.tier];
      b.innerHTML=`<img src="${iconURL(cdIcon(c.k))}"><div class="ct"><b>${C.n()}<i class="new cdt">${tn}</i></b><small>${i18n('cd.tag','Cơ Duyên')}${C.rq?' · '+C.rq():''}</small><p>${C.d()}</p></div>`}}
  if(G&&G.cdNow){$('luTools').hidden=true;$('luSub').textContent=i18n('cd.sub','Cơ duyên đến · chọn 1, định hình cả ván')}};
(function(){const st=document.createElement('style');st.textContent=`
.card3.hkc{border-color:#a86bff!important;background:linear-gradient(#f8f0ff,#ead8ff)!important;box-shadow:0 3px 0 #7a3ad0,0 0 14px #c79bff!important}
.new.hk{background:#8a4ae0!important}
.card3.cdc.cd1{border-color:#a9b4c2!important;background:linear-gradient(#ffffff,#eef2f6)!important;box-shadow:0 3px 0 #7d8896!important}
.card3.cdc.cd2{border-color:#e0b040!important;background:linear-gradient(#fffbe8,#fff0b8)!important;box-shadow:0 3px 0 #c08a20,0 0 10px #ffe48a!important}
.card3.cdc.cd3{border-color:#a86bff!important;background:linear-gradient(#fbf4ff,#ecdcff)!important;box-shadow:0 3px 0 #7a3ad0,0 0 14px #c79bff!important}
.new.cdt{background:#6a7a8a!important}.cd2 .new.cdt{background:#c08a20!important}.cd3 .new.cdt{background:#8a4ae0!important}`;document.head.appendChild(st)})();
// biểu tượng nhỏ trong ô: Hợp Kích và Cơ Duyên đã có, hiện ở dpHud
const _nrHK=newRun;newRun=function(...a){const r=_nrHK(...a);if(G){G.hk={};G.cd=null;G.hkF=[];G.cdQ=0;G.cdN=0;G.cdB=0;G.cdT=0;G.cdNow=0}return r};

// ── Bí Kíp: trang Hợp Kích và Cơ Duyên
const _bkHK=buildBikip;
buildBikip=function(){_bkHK();const L=$('bkList'),S=SAVE.hkSeen||{},C=SAVE.cdSeen||{};
  L.appendChild(elx('div','osec',i18nf('bk.hk','Hợp Kích ({0}/5)',HK_ORDER.filter(k=>S[k]).length)));
  for(const k of HK_ORDER){const H=HK[k],ok=S[k];L.appendChild(elx('div','bkrow bkkv'+(ok?' seen':''),`<img src="${iconURL(H.ic)}" alt=""><div class="bke"><b style="color:${EL[H.b].d}">${EL[H.a].n} → ${EL[H.b].n} · ${H.n()}</b><p>${H.d()}</p><i>${ok?i18n('ui.ui3.daLinhNgo','Đã lĩnh ngộ'):i18nf('bk.hkReq','Cần công pháp {0} cấp 5 và công pháp {1} cấp 3',EL[H.a].n,EL[H.b].n)}</i></div>`))}
  const ks=Object.keys(CD).filter(k=>!CD[k].el&&!CD[k].mon);
  L.appendChild(elx('div','osec',i18nf('bk.cd','Cơ Duyên ({0}/{1}) · lúc 2:30 và sau boss phút 5, phút 10',ks.filter(k=>C[k]).length,ks.length)));
  for(const k of ks){const c=CD[k],ok=C[k];L.appendChild(elx('div','bkrow bkkv'+(ok?' seen':''),`<img src="${iconURL(CD_IC[c.tier])}" alt=""><div class="bke"><b>${c.n()}</b><p>${c.d()}${c.rq?' ('+c.rq()+')':''}</p></div>`))}
  L.appendChild(elx('div','dbs',`<span>${i18n('bk.anhm','Ấn Hệ, Ấn Môn: đếm thêm 1 cho mốc, cứu một ván xấu bài')}</span>`))};
