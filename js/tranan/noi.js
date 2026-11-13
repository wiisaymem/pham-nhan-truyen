'use strict';
// ───────────────────────── TRẤN ẤN LỘ · ĐIỂM NỐI (js/tranan/noi.js)
// MỌI chỗ Trấn Ấn Lộ móc vào engine chung nằm trong file này. Mỗi dòng bọc một hàm của engine và chỉ đổi hành vi khi G.hd có mặt
// (đang trong chuyến Trấn Ấn Lộ); ở chế độ Thiên Kiếp các hàm chạy y như gốc. Muốn biết chế độ mới đụng gì vào chế độ cũ: đọc file này là đủ.
if(TA){
  const {C,RR,b2}=TA;
  // newRun: lượt kế tiếp là Trấn Ấn Lộ (TA.next do sanh.js bật) thì dựng tầng
  const _newRunHD=newRun;
  newRun=function(a,b,c,d){
    _newRunHD(a,b,c,d);
    if(TA.next){TA.next=false;TA.init()}
    document.body.classList.toggle('hdm',!!G.hd);resize();
  };
  // recompute: ấn Sát / Mộc và máu theo cấp
  const _recHD=recompute;
  recompute=function(){_recHD();if(!G.hd)return;const H=G.hd,P=G.p;G.st.crit+=0.07*(H.b.sat|0);
    const m=Math.round(P.mhp*1.3*(1+0.12*(H.b.moc|0))*(1+0.02*((H.lvNow||1)-1)));if(m>P.mhp)P.hp+=m-P.mhp;P.mhp=m};   // Trấn Ấn Lộ: máu gốc ×1,3 (đánh tay phải chịu đòn nhiều hơn); mỗi cấp +2% máu, +4% sát thương (H.pow)
  // killE: tiến độ, kinh nghiệm, ấn từ tinh anh
  const _killHD=killE;killE=function(e){const was=e.dead;_killHD(e);if(G&&G.hd&&!was&&e.dead)TA.kill(e)};
  // updateSpawns: thay hẳn vòng sinh quái theo giờ bằng vòng của tầng · không Thiên Kiếp · ngọc kinh nghiệm thành linh thạch · ấn Thổ giảm sát thương · bỏ lời chào của Thiên Kiếp
  const _spHD=updateSpawns;updateSpawns=function(dt){if(G.hd)TA.update(dt);else _spHD(dt)};
  const _kiepHD=startKiep;startKiep=function(){if(G&&G.hd)return;_kiepHD()};
  const _gemHD=dropGem;dropGem=function(x,y,v){if(G.hd){G.hd.lt+=v*0.08;return}_gemHD(x,y,v)};
  const _hurtHD=hurtP;hurtP=function(dmg,src){if(G.hd){dmg*=Math.pow(0.86,G.hd.b.tho|0);if(TA.ATK[G.ch]&&TA.ATK[G.ch].m)dmg*=0.8}_hurtHD(dmg,src)};   // tu sĩ đánh gần (Lâm Phong, Lôi Chấn, Bạch Hồ) chịu ít hơn 20% sát thương vì phải áp sát
  const _annHD=announce;announce=function(t,k){if(G&&G.hd&&(t===i18n('tb.batdau','Sống sót 15 phút, rồi vượt Thiên Kiếp')||(k==='title'&&G.hd.room===0)))return;_annHD(t,k)};
  // updatePlayer: chậm lại khi đang ra đòn, không ra khỏi hầm
  const _upHD=updatePlayer;
  updatePlayer=function(dt){
    if(!G.hd)return _upHD(dt);const H=G.hd,P=G.p,sl=H.at.slow>0;
    if(sl){H.at.slow-=dt;const x=INPUT.x,y=INPUT.y;INPUT.x*=0.45;INPUT.y*=0.45;_upHD(dt);INPUT.x=x;INPUT.y=y}else _upHD(dt);
    const dx=P.x-C,dy=P.y-C,d=Math.hypot(dx,dy),m=RR-34;if(d>m){P.x=C+dx/d*m;P.y=C+dy/d*m}   // lùi vào 34 để thân người không bị vách tối che
  };
  // endRun / showOver / hud: kết tầng, màn kết, nhãn tầng + đồng hồ + thanh kinh nghiệm
  const _endHD=endRun;endRun=function(win){if(!G||!G.hd)return _endHD(win);TA.end(win)};
  const _ovHD=showOver;
  showOver=function(){_ovHD();if(!G||!G.hd)return;const H=G.hd;
    const c=muaCh(G.ch);$('ovTitle').textContent=G.win?i18nf('hd.ket.thang2','Vượt Tầng {0}!',H.tier):H.timeout?i18n('hd.ket.hetgio','Hết Giờ'):i18n('hd.ket.thua','Gục Ngã Giữa Địa Mạch');
    $('ovSub').textContent=i18nf('hd.ket.phu3','{0} · cấp {1}{2} · +{3} kinh nghiệm',coiName(),c.lv,c.lv>H.lv0?' (+'+(c.lv-H.lv0)+')':'',Math.round(H.xp))+(G.win?' · '+i18nf('hd.ket.mo','mở tầng {0}',H.tier+1):'')};
  const _hudHD=hud;
  hud=function(dt){_hudHD(dt);if(!G||!G.hd)return;const H=G.hd,c=muaCh(G.ch),tm=Math.max(0,H.time|0);
    $('hdLbl').textContent=i18nf('hd.lbl','Tầng {0} · {1} · {2}',H.tier,((tm/60)|0)+':'+String(tm%60).padStart(2,'0'),H.st==='boss'||H.st==='won'?i18n('hd.lbl.boss','Thủ lĩnh'):i18nf('hd.lbl.td','Tiến độ {0}%',Math.min(100,Math.floor(H.prog/H.need*100))));$('hdLbl').style.color=tm<30?'#ff9aa8':'';
    if(typeof setW==='function')setW('xpF',c.xp/muaNeed(c.lv));const rl=$('realm');if(rl){rl.textContent=i18nf('hd.cap2','Cấp {0}',c.lv);rl.style.color='#ffe48a'}
    const w=G.hd.w2;b2.style.setProperty('--p',Math.max(0,w.t/w.cd)*100+'%');b2.classList.toggle('rdy',w.t<=0)};
  // nhiệm vụ hằng ngày, tên nguồn sát thương, thẻ hướng dẫn của Thiên Kiếp không hiện trong chuyến
  if(typeof DQ_POOL!=='undefined')DQ_POOL.hd={t:i18n('nv.hd2','Vượt {0} tầng Trấn Ấn Lộ'),n:[1,3]};
  if(typeof SRC_N!=='undefined')SRC_N.danh=[i18n('hd.danh2','Đánh'),'sword'];
  if(typeof hdShow==='function'){const _hs=hdShow;hdShow=function(k,p){if(G&&G.hd)return;_hs(k,p)}}   // thẻ hướng dẫn của chế độ cũ không hiện ở đây
  // sảnh: về sảnh là rời khu Trấn Ấn Lộ; báo hết mùa; bảng "có gì mới". Từ kho Pháp Bảo mở trong khu này thì quay về màn Trấn Ấn Lộ.
  const _menuHD=buildMenu;buildMenu=function(){if(TA.gearBack){TA.gearBack=false;return TA.sanh()}TA.in=false;const M=muaSave();TA.lbl();_menuHD();
    if(M.moi){const m=M.moi;delete M.moi;saveSave();TA.showHet(m)}
    if(SAVE.news!==TA.NEWS){const old=(SAVE.runs|0)>0;SAVE.news=TA.NEWS;saveSave();if(old&&TA.ov.hidden)TA.showNews()}};
  // màn Pháp Bảo: ghi rõ đang xem kho nào
  const _gearHD=buildGear;buildGear=function(){_gearHD();const h=document.querySelector('#phapbao h2');if(!h)return;let s=h.querySelector('small');if(!s){s=document.createElement('small');s.style.cssText='display:block;font-size:13px;color:#7a4ae0';h.appendChild(s)}
    s.textContent=tranKho()?i18n('ta.kho.mua2','Kho của Mùa giải · chỉ dùng trong Trấn Ấn Lộ'):i18n('ta.kho.thg2','Kho Thường · dùng cho cả hai chế độ')};
  // "Chơi lại" ở màn kết của một chuyến Trấn Ấn Lộ: về màn Trấn Ấn Lộ, không về màn chọn của Thiên Kiếp
  const _selHD=buildSelect;buildSelect=function(){if(TA.in)return TA.sanh();_selHD()};
}
