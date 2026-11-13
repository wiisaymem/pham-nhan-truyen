'use strict';
// ───────────────────────── màn hình phụ: Thông Thiên Tháp, Pháp Bảo, Linh Thú, Xếp Hạng, đồng bộ đám mây
let towerNext=0;
const elx=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
function buzz(ms){if(SAVE.opt.vib===0||!navigator.vibrate)return;try{navigator.vibrate(ms)}catch(e){}}

// ── biểu tượng pháp bảo vẽ bằng code (pixel 16x16, tô theo màu món)
const GICON={};
function gearIcon(k){
  if(GICON[k])return GICON[k];
  {const m=SPR['ic_g_'+k];if(m&&ATLAS){const r=m.r,S=Math.max(r[2],r[3])+2,c=mk(S,S);c.getContext('2d').drawImage(ATLAS,r[0],r[1],r[2],r[3],((S-r[2])/2)|0,((S-r[3])/2)|0,r[2],r[3]);return GICON[k]=c}}const g=GEAR[k],c=mk(32,32),x=c.getContext('2d');x.scale(2,2);const R=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)},C=g.c,D='#5a3a1a';
  if(g.s==='kiem'){for(let i=0;i<9;i++)R(3+i,12-i,2,2,i>6?'#ffffff':C);R(2,10,5,2,'#ffcf3a');R(4,8,2,6,'#ffcf3a');R(1,13,3,2,D)}
  else if(g.s==='bao'){R(4,3,8,2,C);R(3,5,10,8,C);R(5,5,6,1,'#ffffff');R(7,5,2,8,'#ffffff88');R(3,12,3,2,D);R(10,12,3,2,D)}
  else if(g.s==='boi'){x.fillStyle=C;x.beginPath();x.arc(8,9,5,0,TAU);x.fill();x.fillStyle='#ffffff';x.beginPath();x.arc(8,9,2,0,TAU);x.fill();R(7,1,2,4,'#d42a2a');R(6,13,4,2,'#d42a2a')}
  else{R(4,4,8,8,C);R(5,5,6,6,'#ffffff55');R(6,7,4,2,'#d42a2a');R(7,6,2,4,'#d42a2a');R(3,12,10,2,D)}
  return GICON[k]=c;
}
function gearCell(it,sel){const R=GRAR[it.r],b=elx('button','gi');b.style.setProperty('--gc',R.c);
  const ic=gearIcon(it.k),cc=mk(ic.width,ic.height);cc.getContext('2d').drawImage(ic,0,0);b.appendChild(cc);
  b.appendChild(elx('span','',`${GEAR[it.k].n.split(' ').slice(0,2).join(' ')}`));b.appendChild(elx('small','',`${R.n} · ${it.lv}`));
  if(Object.values(gearSave().eq).includes(it.id))b.classList.add('eqd');
  if(it.r<4&&gearMates(it).length>=2)b.appendChild(elx('span','mg','▲'));
  if(sel)b.classList.add('sel');return b}

// ── Pháp Bảo
let gSel=null;
function buildGear(){
  const gs=gearSave();$('gbLt').textContent=SAVE.lt;
  const eq=$('gbEq');eq.innerHTML='';
  for(const s of GSLOT){const it=gItem(gs.eq[s.id]);if(it){const b=gearCell(it,gSel===it.id);b.onclick=()=>{sfx('click');gSel=it.id;buildGear()};eq.appendChild(b)}else eq.appendChild(elx('div','gi empty',i18nf('ui.ui2.trong','{0}<br><small>trống</small>',s.n)))}
  const S=gearStats();$('gbSum').textContent=i18n('ui.ui2.tong','Tổng: ')+(Object.keys(S).filter(k=>S[k]>0).map(k=>statTxt(k,S[k])).join(' · ')||i18n('ui.ui2.chuaMacPhapBao','chưa mặc pháp bảo'));
  const det=$('gbDet');det.innerHTML='';const it=gSel&&gItem(gSel);
  if(it){const g=GEAR[it.k],R=GRAR[it.r],d=elx('div','gdet');d.style.setProperty('--gc',R.c);
    const eqd=Object.values(gs.eq).includes(it.id), cost=lvCost(it), mates=gearMates(it).length;
    d.appendChild(elx('div','',i18nf('ui.ui2.capO','<b style="color:{0}">{1}</b> · {2} · cấp {3}/{4} · ô {5}<br>{6}{7}',R.c,g.n,R.n,it.lv,R.max,GSLOT.find(s=>s.id===g.s).n,statTxt(g.st,gVal(it)),(g.st2?' · '+statTxt(g.st2,gVal(it,false)):'')+(typeof bmPhuText==='function'&&bmPhuText(it)?'<br><span style="color:#8a5ad0">'+bmPhuText(it)+'</span>':''))));
    const row=elx('div','row');
    const bE=elx('button','btn sm',eqd?i18n('ui.ui2.dangMac','Đang mặc'):i18n('ui.ui2.mac','Mặc'));bE.disabled=eqd;bE.onclick=()=>{gearEquip(it);sfx('pick');buildGear()};
    const BI=n=>`<img class="bi" src="${iconURL(n)}" alt="">`;
    const bL=elx('button','btn sm',it.lv>=R.max?i18n('ui.ui2.toiDa','Tối đa'):i18nf('ui.ui2.luyen','{0}Luyện {1} ◈',BI('forge'),cost));bL.disabled=it.lv>=R.max||SAVE.lt<cost;bL.onclick=()=>{if(gearLevel(it)){sfx('level');buildGear()}};
    const bM=elx('button','btn sm',it.r>=4?i18n('ui.ui2.thienPham','Thiên phẩm'):i18nf('ui.ui2.ghep3','{0}Ghép ({1}/3)',BI('merge'),mates+1));bM.disabled=it.r>=4||mates<2;bM.onclick=()=>{const n=gearMerge(it);if(n){gSel=n.id;if(typeof chestReveal==='function')chestReveal(n,()=>buildGear(),{merge:1});else{sfx('realm');buildGear()}}};
    const bS=elx('button','btn sm alt',i18nf('ui.ui2.phanGiai','{0}Phân giải +{1}',BI('salvage'),salvageVal(it)));bS.disabled=eqd;bS.onclick=e=>{if(!armed(bS,i18n('ui.ui2.bamLanNuaDe','Bấm lần nữa để phân giải')))return;const v=gearSalvage(it);if(v){sfx('pick');gSel=null;buildGear()}};
    row.append(bE,bL,bM,bS);d.appendChild(row);det.appendChild(d)}
  {const q=$('gbQuick'),n=gearQuickPlan();q.innerHTML=n?i18nf('ui.ui2.ghepNhanh','<img class="bi" src="{0}" alt="">Ghép nhanh · {1} lần',iconURL('merge'),n):i18n('ui.ui2.ghepNhanh0','Chưa có bộ 3 để ghép');q.disabled=!n;
    q.onclick=()=>{if(!armed(q,i18nf('ui.ui2.ghepNhanhXacNhan','Bấm lần nữa: ghép {0} lần',n)))return;const L=gearQuickMerge();if(!L.length)return;
      const best=L.slice().sort((a,b)=>b.r-a.r||b.lv-a.lv)[0],by={};for(const it of L)by[it.r]=(by[it.r]||0)+1;
      const txt=Object.keys(by).sort((a,b)=>b-a).map(r=>`${by[r]} ${GRAR[r].n}`).join(', ');gSel=best.id;
      const done=()=>{buildGear();toast(i18nf('ui.ui2.ghepNhanhXong','Ghép {0} lần · nhận {1}',n,txt))};
      if(typeof chestReveal==='function')chestReveal(best,done,{merge:1});else{sfx('realm');done()}}}
  const inv=$('gbInv');inv.innerHTML='';
  const items=gs.items.slice().sort((a,b)=>b.r-a.r||GSLOT.findIndex(s=>s.id===GEAR[a.k].s)-GSLOT.findIndex(s=>s.id===GEAR[b.k].s)||b.lv-a.lv);
  for(const i of items){const b=gearCell(i,gSel===i.id);b.onclick=()=>{sfx('click');gSel=i.id;buildGear()};inv.appendChild(b)}
  if(!items.length)inv.appendChild(elx('div','help',i18n('ui.ui2.chuaCoPhapBao','Chưa có pháp bảo. Hạ boss, vượt tháp hoặc mở Bảo Hạp để nhận.')));
  $('gbBuy').disabled=SAVE.lt<CHEST_COST;
  show('phapbao');
}
function showGearGet(list){if(!list.length)return;toast(i18n('ui.ui2.nhan','Nhận: ')+list.map(it=>`${GEAR[it.k].n} (${GRAR[it.r].n})`).join(', '))}
function showOverGear(){const box=$('ovGear');box.innerHTML='';const L=G.gearDrops||[];if(!L.length)return;for(const it of L)box.appendChild(gearCell(it,false))}

// ── Linh Thú
function petCanvas(k,sz=44){const D=PETS[k],c=mk(sz,sz),x=c.getContext('2d');x.imageSmoothingEnabled=false;const key=`e_${D.spr}_idle0`,m=SPR[key];
  if(m&&ATLAS){const t=ATLAS,r=m.r,s=Math.min(sz/r[2],sz/r[3])*0.9;x.drawImage(t,r[0],r[1],r[2],r[3],(sz-r[2]*s)/2,(sz-r[3]*s)/2,r[2]*s,r[3]*s)}return c}
function buildPets(){
  const ps=petSave();$('ptLt').textContent=SAVE.lt;const L=$('ptList');L.innerHTML='';
  for(const k of PET_KEYS){const D=PETS[k],lv=petLv(k),row=elx('div','ptrow');row.appendChild(petCanvas(k));
    if(!lv)row.lastChild.style.filter='brightness(.35)';
    row.appendChild(elx('div','',`<b>${D.n}</b>${lv?i18nf('ui.ui2.cap',' · cấp {0}/{1}',lv,PET_MAX):''}<small>${D.d}</small>`));
    if(!lv){const b=elx('button','btn',`${D.cost} ◈`);b.disabled=SAVE.lt<D.cost;b.onclick=()=>{if(petBuy(k)){sfx('chest');buildPets()}};row.appendChild(b)}
    else{const be=elx('button','btn alt',ps.eq===k?i18n('ui.ui2.dangDan','Đang dẫn'):i18n('ui.ui2.dan','Dẫn'));be.disabled=ps.eq===k;be.onclick=()=>{ps.eq=k;saveSave();sfx('pick');buildPets()};
      const bu=elx('button','btn',lv>=PET_MAX?i18n('ui.ui2.toiDa','Tối đa'):`+1 · ${petCost(lv)} ◈`);bu.disabled=lv>=PET_MAX||SAVE.lt<petCost(lv);bu.onclick=()=>{if(petUp(k)){sfx('level');buildPets()}};
      const col=elx('div','');col.style.display='grid';col.style.gap='4px';col.style.flex='none';col.append(be,bu);row.appendChild(col)}
    L.appendChild(row)}
  show('linhthu');
}

// ── Thông Thiên Tháp
function buildTower(){
  const ts=towerSave(),next=ts.best+1,L=$('twList');L.innerHTML='';
  for(let f=Math.max(1,next-2);f<=next+3;f++){const T=towerSpec(f),row=elx('div','twrow'),done=f<=ts.best;
    row.appendChild(elx('div','',i18nf('ui.ui2.tangYeuQuaiMau','<b>Tầng {0}</b> · {1}<small>{2}: {3} · yêu quái ×{4} máu · thưởng {5} ◈ + pháp bảo{6}</small>',f,ENEMY[T.boss].n,T.mod.n,T.mod.d,T.hp.toFixed(2),T.lt,f%5===0?' ×2':'')));
    const b=elx('button','btn',done?i18n('ui.ui2.danhLai','Đánh lại'):f===next?'Leo':i18n('ui.ui2.khoa','Khóa'));b.disabled=f>next;b.onclick=()=>{sfx('click');towerNext=f;buildSelect()};row.appendChild(b);L.appendChild(row)}
  show('thap');
}

// ── Xếp hạng
async function buildLb(){
  const L=$('lbList');L.innerHTML=i18n('ui.ui2.dangTai','<p class="help">Đang tải…</p>');show('bxh');
  if(!cloudOn()){L.innerHTML=i18n('ui.ui2.bangXepHangCo','<p class="help">Bảng xếp hạng có trên bản web tutien.kentjuno.com và app Android.</p>');return}
  try{const r=await cloudLb();L.innerHTML='';
    if(!r.rows.length)L.appendChild(elx('p','help',i18n('ui.ui2.homNayChuaAi','Hôm nay chưa ai có điểm. Vào trận để đứng đầu!')));
    r.rows.forEach((v,i)=>{const row=elx('div','lbrow'+(v.me?' me':''),`<span>${i+1}. ${v.name.replace(/</g,'')}${v.me?i18n('ui.ui2.ban',' (bạn)'):''}</span><small>${CHARS[v.ch]?CHARS[v.ch].n:''} · ${REALMS[v.waves]?REALMS[v.waves].n:''}</small><b>${v.score}</b>`);L.appendChild(row)});
    if(r.me&&r.me.rank>20)L.appendChild(elx('p','help',i18nf('ui.ui2.hangCuaBanDiem','Hạng của bạn: {0}/{1} · {2} điểm',r.me.rank,r.total,r.me.score)));
    L.appendChild(elx('p','help',i18nf('ui.ui2.daoHuuCoDiem','{0} đạo hữu có điểm hôm nay · Tên của bạn: {1} (đổi trong Cài đặt)',r.total,cloudSt.name)));
  }catch(e){L.innerHTML=i18n('ui.ui2.khongTaiDuocBang','<p class="help">Không tải được bảng xếp hạng (cần mạng).</p>')}
}

// ── Đồng bộ đám mây trong Cài đặt
function buildCloud(){
  const b=$('cloudBox');b.innerHTML='';
  if(!cloudOn()){b.appendChild(elx('p','help',i18n('ui.ui2.luuDamMayVa','Lưu đám mây và bảng xếp hạng có trên bản web tutien.kentjuno.com và app Android.')));return}
  b.appendChild(elx('b','',i18n('ui.ui2.taiKhoanDongBo','Tài khoản & đồng bộ')));
  const nm=document.createElement('input');nm.type='text';nm.maxLength=18;nm.value=cloudSt.name;nm.placeholder=i18n('ui.ui2.daoHieuTrenBang','Đạo hiệu trên bảng xếp hạng');nm.onchange=()=>{cloudSetName(nm.value);toast(i18n('ui.ui2.daDoiDaoHieu','Đã đổi đạo hiệu'))};
  const lb=elx('label','',i18n('ui.ui2.daoHieu','Đạo hiệu'));lb.appendChild(nm);b.appendChild(lb);
  b.appendChild(elx('div','help',i18n('ui.ui2.maDongBoGiu','Mã đồng bộ (giữ bí mật). Nhập mã này ở máy khác để chơi tiếp cùng tiến trình:')));
  b.appendChild(elx('div','code',syncCode()));
  const st=elx('div','help',cloudSt.last?i18nf('ui.ui2.daLuuLenDam','Đã lưu lên đám mây lúc {0}',new Date(cloudSt.last).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})):i18n('ui.ui2.chuaLuuLenDam','Chưa lưu lên đám mây'));if(cloudSt.paused)st.textContent+=i18n('ui.ui2.dangTamDung',' · đang tạm dừng');
  const r1=elx('div','row'),cp=elx('button','btn alt',i18n('ui.ui2.saoChepMa','Sao chép mã')),sv=elx('button','btn alt',i18n('ui.ui2.luuNgay','Lưu ngay'));
  cp.onclick=async()=>{try{await navigator.clipboard.writeText(syncCode());toast(i18n('ui.ui2.daSaoChepMa','Đã sao chép mã'))}catch(e){toast(i18n('ui.ui2.giuLauVaoMa','Giữ lâu vào mã để sao chép'))}};
  sv.onclick=async()=>{saveSave();await cloudPush(true);buildCloud();toast(cloudSt.err?i18n('ui.ui2.chuaKetNoiDuoc','Chưa kết nối được'):i18n('ui.ui2.daLuu','Đã lưu'))};
  r1.append(cp,sv);b.append(r1,st);
  const inp=document.createElement('input');inp.type='text';inp.placeholder=i18n('ui.ui2.danMaDongBo','Dán mã đồng bộ từ máy khác');
  const lk=elx('button','btn alt',i18n('ui.ui2.dungMaNay','Dùng mã này'));lk.onclick=async()=>{if(!inp.value.trim())return;if(!armed(lk,i18n('ui.ui2.tienTrinhTrenMay','Tiến trình trên máy này sẽ bị thay. Bấm lần nữa để xác nhận')))return;const err=await cloudLink(inp.value);if(err)toast(err);else{toast(i18n('ui.ui2.daTaiTienTrinh','Đã tải tiến trình'));buildSettings(setBack)}};
  const r2=elx('div','row');r2.append(inp,lk);b.appendChild(r2);
  const r3=elx('div','row'),del=elx('button','btn alt',i18n('ui.ui2.xoaDuLieuMay','Xoá dữ liệu máy chủ')),pv=elx('button','btn alt',i18n('ui.ui2.quyenRiengTu','Quyền riêng tư'));
  del.onclick=async()=>{if(!armed(del,i18n('ui.ui2.bamLanNuaDe2','Bấm lần nữa để xoá vĩnh viễn')))return;const ok=await cloudDelete();toast(ok?i18n('ui.ui2.daXoaDamMay','Đã xoá. Đám mây tạm dừng tới khi bấm Lưu ngay'):i18n('ui.ui2.chuaKetNoiDuoc','Chưa kết nối được'));buildCloud()};
  pv.onclick=()=>{try{window.open('https://tutien.kentjuno.com/privacy.html','_blank')}catch(e){}};
  r3.append(del,pv);b.appendChild(r3);
}

function wire2(){
  on('towerB',buildTower); on('twBack',buildMenu);
  on('gearB',()=>{gSel=null;buildGear()}); on('gbBack',buildMenu);
  on('gbBuy',()=>{const it=buyChest();if(it){sfx('chest');gSel=it.id;toast(i18nf('ui.ui2.baoHap','Bảo Hạp: {0} · {1}',GEAR[it.k].n,GRAR[it.r].n));buildGear()}});
  on('petB',buildPets); on('ptBack',buildMenu);
  on('lbB',buildLb); on('lbBack',buildMenu);
  on('selBack',()=>{towerNext=0;buildMenu()});
}

// chọn nhân vật cho tầng tháp: đổi chữ nút
const _bSel=buildSelect;
buildSelect=function(){_bSel();$('goB').textContent=towerNext?i18nf('ui.ui2.leoTang','Leo Tầng {0}',towerNext):i18n('ui.ui2.nhapTran','Nhập Trận')};
