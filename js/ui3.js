'use strict';
// ───────────────────────── hỗ trợ lên cấp và tiến hóa: chỉ số rõ ràng, gợi ý thần thông, đổi thẻ, phong ấn, Bí Kíp
const STL={cd:[i18n('ui.ui3.hoiChieu','Hồi chiêu'),'s',-1],n:[i18n('ui.ui3.soLuong','Số lượng'),'',1],dmg:[i18n('ui.ui3.satThuong','Sát thương'),'',1],pierce:[i18n('ui.ui3.xuyen','Xuyên'),'',1],r:[i18n('ui.ui3.phamVi','Phạm vi'),'',1],ch:[i18n('ui.ui3.soLanNay','Số lần nảy'),'',1],
  slow:[i18n('ui.ui3.lamCham','Làm chậm'),'s',1],dps:[i18n('ui.ui3.sietGiay','Siết/giây'),'',1],dur:[i18n('ui.ui3.thoiGian','Thời gian'),'s',1],per:[i18n('ui.ui3.vongXoay','Vòng xoay'),'s',-1],kb:[i18n('ui.ui3.dayLui','Đẩy lùi'),'',1],kill:[i18n('ui.ui3.hutHon','Hút hồn'),'%',1],tick:[i18n('ui.ui3.chemNhip','Chém/nhịp'),'',1]};
const fmtS=(k,v)=>k==='kill'?Math.round(v*100):(Math.round(v*100)/100);
function statDiff(k,lv){
  const W=WEAP[k];
  if(!lv){const s=W.s(1);return Object.keys(STL).filter(x=>s[x]!==undefined).slice(0,3).map(x=>`<span class="sd">${STL[x][0]} <b>${fmtS(x,s[x])}${STL[x][1]}</b></span>`).join('')}
  const a=W.s(lv),b=W.s(lv+1),out=[];
  for(const x in STL){if(a[x]===undefined||a[x]===b[x])continue;const up=(b[x]-a[x])*STL[x][2]>0;
    out.push(`<span class="sd ${up?'up':'dn'}">${STL[x][0]} ${fmtS(x,a[x])}→<b>${fmtS(x,b[x])}${STL[x][1]}</b></span>`)}
  return out.join('');
}
function evoHint(c){
  if(c.t==='w'){const E=EVO[c.k],w=G.w[c.k],lv=w?w.lv:0,nl=c.t==='w'?lv+1:lv,hasP=!!G.pass[E.p]||(typeof dpElT==='function'&&dpElT(WEAP[c.k].el)>=2);
    if(w&&w.evo)return'';
    const okL=nl>=5;
    return i18nf('ui.ui3.cap5','<div class="eh">✦ {0}: <span class="{1}">cấp 5 {2}</span> + <span class="{3}">{4} {5}</span>{6}</div>',E.n,okL?'ok':'no',okL?'✓':'✗',hasP?'ok':'no',PASS[E.p].n,hasP?'✓':'✗',okL&&hasP?i18n('ui.ui3.sanSang',' <i>sẵn sàng!</i>'):'')}
  if(c.t==='p'){const ks=WEAP_ORDER.filter(k=>EVO[k].p===c.k);if(!ks.length)return'';const k=ks[0],w=G.w[k];
    if(w&&w.evo)return'';
    return w?i18nf('ui.ui3.giupTienHoa','<div class="eh hot">✦ Giúp {0} tiến hóa → {1}{2}</div>',WEAP[k].n,EVO[k].n,w.lv>=5?i18n('ui.ui3.sanSang',' <i>sẵn sàng!</i>'):i18nf('ui.ui3.canCap5Dang',' (cần cấp 5, đang {0})',w.lv))
            :i18nf('ui.ui3.tienHoaCho','<div class="eh">✦ Tiến hóa cho {0}</div>',WEAP[k].n)}
  return'';
}
let banMode=false;
function canBan(c){return (c.t==='w'&&!G.w[c.k])||(c.t==='p'&&!G.pass[c.k])}
function renderCards(){
  const box=$('luCards'); box.innerHTML='';
  cards.forEach((c,i)=>{const b=document.createElement('button');b.className='card3';let n,desc,tag='',el=null,lvT='',extra='';
    if(c.t==='e'){const W=WEAP[c.k],E=EVO[c.k];n=E.n;desc=E.d;el=W.el;tag=i18n('ui.ui3.thanThong','<i class="new evo">Thần thông</i>');lvT=`${W.n} + ${PASS[E.p].n}`;b.classList.add('evoc')}
    else if(c.t==='w'){const W=WEAP[c.k],lv=G.w[c.k]?G.w[c.k].lv:0;n=W.n;desc=W.d[lv];el=W.el;tag=lv?'':i18n('ui.ui3.moi','<i class="new">Mới</i>');lvT=lv?i18nf('ui.ui3.cap','Cấp {0} → {1}',lv,lv+1):i18n('ui.ui3.congPhap','Công pháp');extra=`<div class="sds">${statDiff(c.k,lv)}</div>`+evoHint(c)+(typeof nhHint==='function'?nhHint(c.k):'')}
    else if(c.t==='p'){const Pp=PASS[c.k],lv=G.pass[c.k]|0;n=Pp.n;desc=Pp.d;tag=lv?'':i18n('ui.ui3.moi','<i class="new">Mới</i>');lvT=lv?i18nf('ui.ui3.tamPhapCap','Tâm pháp · cấp {0} → {1}',lv,lv+1):i18n('ui.ui3.tamPhap','Tâm pháp');extra=evoHint(c);if(/hot/.test(extra))b.classList.add('hint')}
    else if(c.t==='heal'){n=i18n('ui.ui3.linhDan','Linh Đan');desc=i18n('ui.ui3.hoi30Mau','Hồi 30% máu.');lvT=i18n('ui.ui3.danDuoc','Đan dược')}
    else{n=i18n('ui.ui3.linhThach','Linh Thạch');desc=i18n('ui.ui3.25LinhThach','+25 linh thạch.');lvT=i18n('ui.ui3.taiNguyen','Tài nguyên')}
    const pips=c.t==='w'||c.t==='p'?(()=>{const lv=c.t==='w'?(G.w[c.k]?G.w[c.k].lv:0):(G.pass[c.k]|0);return `<span class="cpip">${'◆'.repeat(lv)}<em>◆</em>${'◇'.repeat(Math.max(0,4-lv))}</span>`})():'';
    b.innerHTML=`<img src="${iconURL(cardIcon(c))}"><div class="ct"><b>${n}${tag}</b><small>${lvT}${el?` · <span style="color:${EL[el].d}">${EL[el].n}</span>`:''} ${pips}</small><p>${desc}</p>${extra}</div>`;
    if(banMode){if(canBan(c))b.classList.add('banable');else b.classList.add('noban')}
    b.onclick=()=>banMode?banCard(i):pickCard(i); box.appendChild(b)});
  const one=cards.length===1&&cards[0].t==='e';
  $('luTools').hidden=one;
  $('luRer').innerHTML=i18nf('ui.ui3.doiThe','<img class="bi" src="{0}" alt="">Đổi thẻ ({1})',iconURL('bagua'),G.rer); $('luRer').disabled=G.rer<=0||banMode;
  $('luBan').innerHTML=`<img class="bi" src="${iconURL('seal')}" alt="">`+(banMode?i18n('ui.ui3.huyPhongAn','Hủy phong ấn'):i18nf('ui.ui3.phongAn','Phong ấn ({0})',G.ban)); $('luBan').disabled=G.ban<=0&&!banMode;
  $('luSub').textContent=banMode?i18n('ui.ui3.chonTheMoiDe','Chọn thẻ Mới để phong ấn, không xuất hiện lại trong trận'):(G.chestNow?i18n('ui.ui3.chon1PhanThuong','Chọn 1 phần thưởng'):i18nf('ui.ui3.chon1Trong','{0} · chọn 1 trong {1}',REALMS[G.realm].n,cards.length));
}
function openLevelUp(){
  G.paused=true; const chest=G.chestOpen; G.chestNow=chest; banMode=false;
  cards=rollCards(); G.chestOpen=false;
  $('luTitle').textContent=chest?i18n('ui.ui3.baoRuong','Bảo Rương'):i18nf('ui.ui3.lenCap','Lên cấp {0}',G.lv-G.pendLv+1);
  renderCards(); show('lvup'); sfx(chest?'chest':'level');
  lvLock=performance.now()+350;
}
function rerollCards(){if(!cards||G.rer<=0)return;G.rer--;cards=rollCards(cards);sfx('pick');renderCards();lvLock=performance.now()+250}
function banCard(i){const c=cards[i];if(!canBan(c)||G.ban<=0){toast(i18n('ui.ui3.chiPhongAnDuoc','Chỉ phong ấn được thẻ Mới'));return}
  G.ban--;G.banned[c.k]=1;banMode=false;
  const rep=rollCards(cards).find(x=>!cards.some(y=>y.t===x.t&&y.k===x.k))||{t:'lt'};cards[i]=rep;sfx('click');renderCards();lvLock=performance.now()+250}

// ── HUD: ô công pháp sáng lên khi đủ điều kiện tiến hóa
const _buildSlots=buildSlots;
buildSlots=function(){_buildSlots();if(!G)return;const ws=$('wSlots').children,wk=Object.keys(G.w);G.evoAnn=G.evoAnn||{};
  wk.forEach((k,i)=>{const w=G.w[k],ready=!w.evo&&w.lv>=5&&(typeof dpEvoOk==='function'?dpEvoOk(k):G.pass[EVO[k].p]);if(ws[i])ws[i].classList.toggle('ready',!!ready);
    if(ready&&!G.evoAnn[k]){G.evoAnn[k]=1;announce(i18nf('tb.tienhoa','{0} đủ điều kiện tiến hóa!',WEAP[k].n),'good');if(!G.pendLv)G.evoHint=k}})};

// ── tạm dừng: ghi rõ điều kiện tiến hóa
const _buildPause=buildPause;
buildPause=function(){_buildPause();const L=$('pList'),rows=L.children;let i=0;
  for(const k in G.w){const w=G.w[k],E=EVO[k],r=rows[i++];if(!r||w.evo)continue;const hp=!!G.pass[E.p];
    const d=elx('div','pevo',i18nf('ui.ui3.cap52','✦ {0}: <span class="{1}">cấp 5</span> + <span class="{2}">{3}</span>',E.n,w.lv>=5?'ok':'no',hp?'ok':'no',PASS[E.p].n));r.after(d)}};

// ── Bí Kíp: tra cứu tiến hóa
function buildBikip(){
  const L=$('bkList');L.innerHTML='';const seen=SAVE.evoSeen||{};let n=0;
  for(const k of WEAP_ORDER){const W=WEAP[k],E=EVO[k],P=PASS[E.p],ok=!!seen[k];if(ok)n++;
    const r=elx('div','bkrow'+(ok?' seen':''),`<div class="bkf"><img src="${iconURL(W.ic)}"><small>${W.n}</small></div><b class="pl">+</b><div class="bkf"><img src="${iconURL(P.ic)}"><small>${P.n}</small></div><b class="pl">→</b>
      <div class="bke"><b>${E.n}</b><small style="color:${EL[W.el].d}">${EL[W.el].n}</small><p>${E.d}</p><i>${ok?i18n('ui.ui3.daLinhNgo','Đã lĩnh ngộ'):i18n('ui.ui3.chuaLinhNgo','Chưa lĩnh ngộ')}</i></div>`);L.appendChild(r)}
  $('bkSub').textContent=i18nf('ui.ui3.daLinhNgoThan','Đã lĩnh ngộ {0}/{1} thần thông · công pháp cấp 5 + tâm pháp tương ứng, mở bảo rương boss hoặc chọn thẻ Thần thông',n,WEAP_ORDER.length);
  {const C=SAVE.combos||{},n=NH_ORDER.filter(a=>C[NH[a].k]).length;L.appendChild(elx('div','osec',i18nf('ui.ui3.nguHanhTuongSinh','Ngũ hành tương sinh ({0}/5)',n)));
    for(const a of NH_ORDER){const R=NH[a],ok=C[R.k];L.appendChild(elx('div','bkrow'+(ok?' seen':''),`<div class="bke"><b style="color:${R.c}">${EL[R.a].n} → ${EL[R.b].n} · ${R.n}</b><p>${R.d}</p><i>${ok?i18n('ui.ui3.daLinhNgo','Đã lĩnh ngộ'):i18n('ui.ui3.chuaLinhNgoTrung','Chưa lĩnh ngộ: trúng chiêu hành ')+EL[R.a].n+i18n('ui.ui3.roiChieuHanh',' rồi chiêu hành ')+EL[R.b].n}</i></div>`))}}
  const T=Object.keys(SAVE.titles||{});L.appendChild(elx('div','osec',i18nf('ui.ui3.danhHieuDaDat','Danh hiệu đã đạt ({0})',T.length)));
  L.appendChild(elx('div','dbs',T.length?T.map(t=>`<span>${t}</span>`).join(''):i18n('ui.ui3.chuaCoKetThuc','<span>Chưa có, kết thúc một trận để nhận danh hiệu</span>')));
  show('bikip');
}
function wire3(){
  SCREENS.push('bikip');
  on('luRer',rerollCards); on('luBan',()=>{if(!cards)return;banMode=!banMode;renderCards()});
  on('bkB',buildBikip); on('bkBack',buildMenu);
}
const _wire2=wire2; wire2=function(){_wire2();wire3()};

// ── biểu tượng Flow trên các nút ở sảnh và màn lên cấp
const BTN_IC={gbBuy:'box',towerB:'tower',gearB:'chest',petB:'paw',dpB:'cave',lbB:'trophy',bkB:'scroll'};
function decorBtns(){if(!ATLAS)return;for(const id in BTN_IC){const b=$(id);if(!b||b.dataset.ic)continue;b.dataset.ic=1;const im=document.createElement('img');im.className='bi';im.src=iconURL(BTN_IC[id]);im.alt='';b.prepend(im)}}
const _buildMenu=buildMenu; buildMenu=function(){_buildMenu();decorBtns()};

// ── màn kết thúc: danh hiệu, sát thương từng công pháp, biểu đồ hạ yêu, chỉ số phụ
const SRC_N={tuongsinh:[i18n('ui.ui3.tuongSinh','Tương Sinh'),'p_yin'],burst:[i18n('ui.ui3.bocPhat','Bộc Phát'),'burst'],pet:[i18n('ui.ui3.linhThu','Linh Thú'),'paw'],dotpha:[i18n('ui.ui3.dotPha','Đột Phá'),'p_yin'],kiep:[i18n('ui.ui3.thienLoi','Thiên Lôi'),'bolt'],khac:[i18n('ui.ui3.khac','Khác'),'lt']};
const W_TITLE={phikiem:'Ngự Kiếm Tiên',hoacau:'Hỏa Diệm Chân Nhân',loichuong:'Lôi Thần Chưởng',bangtien:'Băng Phách Tiễn Thủ',dangman:'Mộc Linh Sứ Giả',thothuan:'Bàn Thạch Hộ Pháp',kimchung:'Kim Chung Thánh Tăng',holo:'Hồ Lô Tán Tiên',phuchu:'Phù Lục Tông Sư',kiemtran:'Trận Pháp Đại Sư'};
function runTitles(){
  const tt=G.t,tot=Object.values(G.dmgBy).reduce((a,b)=>a+b,0)||1,top=Object.entries(G.dmgBy).filter(([k])=>WEAP[k]).sort((a,b)=>b[1]-a[1])[0];
  const evo=Object.values(G.w).filter(w=>w.evo).length, T=G.tower, L=[];
  const D=(k,n,d,p,...a)=>L.push([k,i18nf(k,n,...a),i18nf(k+'.lydo',d,...a),p]);
  if(G.win&&G.hd)D('dh.tranan','Trấn Ấn Nhân','Tự tay vá một điểm phong ấn dưới địa mạch',95);
  if(G.win&&!T&&!G.hd)D('dh.phithang','Phi Thăng Tiên Nhân','Vượt Cửu Cửu Thiên Kiếp, phi thăng tiên giới',100);
  if(G.win&&T)D('dh.chinhphuc','Chinh Phục Tầng {0}','Trảm boss trấn tháp',90,T.f);
  if(G.kills>=5000)D('dh.vanyeu','Vạn Yêu Đồ Diệt','Hạ {0} yêu quái trong một trận',80,G.kills);
  if(evo>=3)D('dh.thanthong','Thần Thông Quảng Đại','Lĩnh ngộ {0} thần thông',75,evo);
  if(G.bossKills>=2)D('dh.tramyeu','Trảm Yêu Vương','Trảm {0} boss',70,G.bossKills);
  if(top&&top[1]/tot>0.5)L.push(['dh.'+top[0],W_TITLE[top[0]],i18nf('dh.cp.lydo','{0} gây {1}% sát thương',WEAP[top[0]].n,Math.round(top[1]/tot*100)),60]);
  if(tt>300&&G.taken<tt*0.6)D('dh.batdiet','Bất Diệt Kim Thân','Gần như không trầy xước',55);
  if(G.realm>=4)D('dh.hoathan','Hóa Thần Đại Năng','Đạt cảnh giới {0}',50,REALMS[4].n);
  if(G.kills>=1500)D('dh.truyeu','Trừ Yêu Hiệp Khách','Hạ {0} yêu quái',40,G.kills);
  if(tt<120&&!G.win&&!G.hd)D('dh.tanthu','Tân Thủ Nhập Môn','Mới bước chân vào tu tiên giới',10);
  if(!L.length)D('dh.tantu','Tán Tu Giang Hồ','Đạo dài dằng dặc, cứ bước tiếp',5);
  return L.sort((a,b)=>b[3]-a[3]).map(x=>[x[1],x[2],x[3],x[0]]);
}
function drawKillChart(){
  const c=$('ktC');if(!c)return;const dpr=Math.min(2,devicePixelRatio||1),W=c.clientWidth||300,H=92;c.width=W*dpr;c.height=H*dpr;const x=c.getContext('2d');x.scale(dpr,dpr);
  const n=Math.max(4,Math.ceil(G.t/30)),mx=Math.max(1,...Array.from(G.kt,v=>v||0)),bw=(W-24)/n;x.clearRect(0,0,W,H);
  x.strokeStyle='#ecd3a0';x.lineWidth=1;for(let i=0;i<=2;i++){const y=8+(H-26)*i/2;x.beginPath();x.moveTo(20,y);x.lineTo(W-2,y);x.stroke()}
  x.fillStyle='#a08050';x.font='9px sans-serif';x.textAlign='right';x.fillText(mx,18,11);x.fillText('0',18,H-16);
  const dur=900,t0=performance.now();
  function frame(now){if(!G)return;const k=Math.min(1,(now-t0)/dur);x.clearRect(21,0,W,H-17);   // rời màn kết trước khi biểu đồ chạy xong thì dừng vẽ
    for(let i=0;i<n;i++){const v=(G.kt[i]||0)*Math.min(1,Math.max(0,k*n*0.35-i*0.3+0.3)),h=(H-26)*v/mx,bx=22+i*bw,col=i*30<300?'#5ee05a':i*30<600?'#4cc3ff':i*30<900?'#ffb02e':'#b39bff';
      x.fillStyle=col;x.fillRect(bx,H-18-h,Math.max(1,bw-1.5),h);x.fillStyle='rgba(255,255,255,.45)';x.fillRect(bx,H-18-h,Math.max(1,bw-1.5),Math.min(2,h))}
    for(const [bt,id] of (G.bossT||[])){const bx=22+bt/30*bw;x.fillStyle='#ff3d6e';x.beginPath();x.moveTo(bx,6);x.lineTo(bx+4,0);x.lineTo(bx-4,0);x.fill();x.fillRect(bx-0.5,6,1,H-24)}
    x.fillStyle='#a08050';x.textAlign='center';for(let m=0;m<=G.t/60;m+=Math.max(1,Math.ceil(G.t/60/6)))x.fillText(m+'p',22+m*2*bw,H-5);
    if(k<1)requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
}
const _showOver=showOver;
showOver=function(){
  _showOver();
  const L=runTitles(),[t0,d0]=L[0];SAVE.titles=SAVE.titles||{};const isNew=!SAVE.titles[t0];SAVE.titles[t0]=1;if(isNew)saveSave();
  $('ovTitleBox').innerHTML=i18nf('ui.ui3.danhHieu','<div class="dh"><small>DANH HIỆU</small><b>{0}</b><p>{1}</p>{2}</div>',t0,d0,isNew?i18n('ui.ui3.moi2','<i>Mới</i>'):'')+(L.length>1?`<div class="dbs">${L.slice(1,4).map(x=>`<span title="${x[1]}">${x[0]}</span>`).join('')}</div>`:'');
  const tot=Object.values(G.dmgBy).reduce((a,b)=>a+b,0)||1,rows=Object.entries(G.dmgBy).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const fmt=v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(0)+'k':v>=1e3?(v/1e3).toFixed(1)+'k':Math.round(v);
  let h=i18n('ui.ui3.satThuongTheoCong','<div class="osec">Sát thương theo công pháp</div>');
  rows.forEach(([k,v],i)=>{const W=WEAP[k],w=G.w[k],nm=W?(w&&w.evo?EVO[k].n:W.n):(SRC_N[k]||[k])[0],ic=W?W.ic:(SRC_N[k]||[0,'lt'])[1],col=W?EL[W.el].c:'#c8a8ff',pct=v/tot*100,ki=G.killBy[k]||0;
    h+=i18nf('ui.ui3.haS','<div class="dmr"><img src="{0}" alt=""><b>{1}{2}</b><em>{3} · {4}% · {5} hạ · {6}/s</em><div class="bar"><i style="background:{7}" data-w="{8}"></i></div></div>',iconURL(ic),nm,w&&w.evo?' ★':'',fmt(v),pct.toFixed(0),ki,fmt(v/Math.max(1,G.t)),col,(v/rows[0][1]*100).toFixed(1))});
  h+=i18n('ui.ui3.yeuQuaiBiHa','<div class="osec">Yêu quái bị hạ mỗi 30 giây <small style="color:#ff3d6e">▼ boss</small></div><canvas id="ktC"></canvas>');
  h+=i18nf('ui.ui3.donManhNhatsatThuong','<div class="ex3"><div><small>Đòn mạnh nhất</small><b>{0}</b></div><div><small>Sát thương nhận</small><b>{1}</b></div><div><small>Linh khí thu</small><b>{2}</b></div>\n    <div><small>Tổng sát thương</small><b>{3}</b></div><div><small>Thần thông</small><b>{4}</b></div><div><small>Sát thương/giây</small><b>{5}</b></div></div>',fmt(G.maxHit),fmt(G.taken),fmt(G.xpTot||0),fmt(tot),Object.values(G.w).filter(w=>w.evo).length,fmt(tot/Math.max(1,G.t)));
  $('ovMore').innerHTML=h;
  requestAnimationFrame(()=>{for(const i of $('ovMore').querySelectorAll('.bar i'))i.style.width=i.dataset.w+'%';drawKillChart()});
};
