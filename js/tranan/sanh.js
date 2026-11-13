'use strict';
// ───────────────────────── TRẤN ẤN LỘ · SẢNH RIÊNG (js/tranan/sanh.js), tách khỏi màn chọn của Thiên Kiếp từ 1.0.67
// • Cửa ở sảnh chính: nút #hdB trong khung #modeTran (index.html).
// • Màn riêng #tran: chọn tu sĩ → cõi chơi (Mùa giải / Thường) → tầng → Bản Mệnh Đồ, bảng chiêu, kho Pháp Bảo của cõi → Xuống địa mạch.
//   Màn chọn của Thiên Kiếp (#select: ải, độ khó) không còn nút nào của chế độ này, và ngược lại.
// • tranKho(): kho Pháp Bảo đang dùng. Chỉ trả kho của mùa khi đang ở trong khu Trấn Ấn Lộ (TA.in) VÀ đang chọn cõi Mùa giải;
//   mọi trường hợp khác (kể cả toàn bộ chế độ Thiên Kiếp) dùng kho Thường SAVE.gear. Hàm gearSave() trong js/meta.js hỏi hàm này.
if(TA){
  const {ov,card,b2,W2}=TA;
  window.tranKho=()=>TA.in&&coi()==='mua'?muaSave().gear:null;
  const css=document.createElement('style');
  css.textContent=`#tran .sub{margin:2px 0 8px}#taInfo{font-size:13.5px;line-height:1.45}.taxp{height:7px;border-radius:4px;background:#e8d6ae;overflow:hidden;margin:5px 0 2px}.taxp i{display:block;height:100%;background:linear-gradient(90deg,#b48cff,#7a4ae0)}
#taBd{font:700 12.5px var(--font);color:#5a2a9a;text-align:center;margin:0 0 6px}#taBd b{color:#b8301a}#taBd small{display:block;font-weight:600;color:#7a5ab0}#tran .chr small{font-size:11px;font-weight:700;color:#7a4ae0}#tran .btn.alt{font-size:15px;padding:8px 10px}#tran #coiB{flex:1}#tran #taMua{flex:none;width:44px;padding:8px 0}#tran .tac2 .row{margin:6px 0}#tran .chr{padding:4px 2px}#tran h2{margin:0 0 2px}#tran .tago{position:sticky;bottom:-1px;margin:6px 0 0;padding:6px 0 2px;z-index:2}#tran .tago .btn{white-space:nowrap;font-size:17px;padding:10px 6px}#tran #bmB{margin:0}#tran #bmB i{font-style:normal;background:#e0483a;color:#fff;border-radius:9px;padding:0 6px;margin-left:5px;font-size:12px}
.mode{border:2px solid #e8c98a;border-radius:14px;padding:4px 8px 8px;margin:8px 0;background:rgba(255,250,235,.55)}.mode .mlbl{font:800 12.5px var(--font);color:#a8401a;margin:2px 0 4px;text-align:center}#modeTran{border-color:#b48cff;background:rgba(244,236,255,.6)}#modeTran .mlbl{color:#5a2a9a}
#hdB small{display:block}#hdB{background:linear-gradient(#c9a8ff,#8a5ae0);border-color:#4a2a8a;color:#fff;text-shadow:1px 1px 0 #2a1050}
@media (orientation:landscape) and (max-height:560px){#tran .card{display:grid;grid-template-columns:1.25fr 1fr;column-gap:14px;align-items:start}#tran .sub{display:none}#tran h2,#tran #taChars,#tran .cd{grid-column:1}#tran .tac2{grid-column:2;grid-row:1/6}#tran h2{margin:0}.mode{margin:4px 0;padding:2px 6px 6px}}`;
  document.head.appendChild(css);
  // ── cửa ở sảnh chính
  const btn=document.createElement('button');btn.id='hdB';btn.className='btn';
  const box=$('modeTran');if(box){box.hidden=false;box.appendChild(btn)}else $('playB').insertAdjacentElement('afterend',btn);
  const lbl=()=>{const b=muaBest();btn.innerHTML=i18n('ta.vao','Xuống Địa Mạch')+` <small>${b?i18nf('hd.kyluc2','cao nhất tầng {0}',b):i18n('ta.moi','mới')} · ${coi()==='mua'?i18n('mua.ten.mua','Mùa giải'):i18n('mua.coi.thg','Thường')}</small>`};
  // ── màn riêng
  const scr=document.createElement('div');scr.id='tran';scr.className='screen bg';scr.hidden=true;
  scr.innerHTML=`<div class="card wide"><h2>${i18n('hd.ten2','Trấn Ấn Lộ')}</h2><p class="sub">${i18n('ta.phu','Tự tay đánh, lướt, tung chiêu · leo tầng vô hạn · cày cấp và Pháp Bảo')}</p>
<div id="taChars" class="chars"></div><div class="cd"><b id="taName"></b><div id="taInfo"></div></div>
<div class="tac2"><div class="row"><button id="coiB" class="btn alt"></button><button id="taMua" class="btn alt" title="${i18n('mua.gt','Mùa giải là gì?')}">?</button></div><div id="hdTier"></div><div id="taBd"></div>
<div class="row"><button id="bmB" class="btn alt"></button><button id="taGear" class="btn alt"></button></div>
<div class="row"><button id="taLb" class="btn alt">${i18n('bxh.ten','Xếp hạng mùa')}</button><button id="hdMoves" class="btn alt">${i18n('ta.chieu','Xem chiêu')}</button></div>
<div class="row tago"><button id="taBack" class="btn alt">${i18n('ui.html.quayLai','Quay lại')}</button><button id="taGo" class="btn">${i18n('hd.hd5','Xuống địa mạch')}</button></div></div></div>`;
  $('select').insertAdjacentElement('afterend',scr);SCREENS.push('tran');
  function sanh(){
    TA.in=true;if(!CHARS[selChar]||!charUnlocked(selChar))selChar='lamphong';
    const bx=$('taChars');bx.innerHTML='';
    for(const id of CHAR_ORDER){const Cc=CHARS[id],ok=charUnlocked(id),b=document.createElement('button');b.className='chr'+(id===selChar?' on':'')+(ok?'':' locked');
      b.appendChild(portrait(id,46));const s=document.createElement('span');s.textContent=Cc.n;b.appendChild(s);
      const l=document.createElement('small');l.textContent=ok?i18nf('hd.cap2','Cấp {0}',muaCh(id).lv):i18nf('ui.ui.linhThach','{0} linh thạch',Cc.lock);b.appendChild(l);
      b.onclick=()=>{sfx('click');if(!ok){if(SAVE.lt>=Cc.lock){if(armed(b,i18n('ui.ui.bamLanNuaDe','Bấm lần nữa để mở'))){SAVE.lt-=Cc.lock;SAVE.unl[id]=1;saveSave();selChar=id}else return}else{toast(i18nf('ui.ui.canLinhThachHoac','Cần {0} linh thạch (hoặc độ kiếp thành công)',Cc.lock));return}}else selChar=id;TA.tier=0;sanh()};
      bx.appendChild(b)}
    const c=muaCh(selChar),mx=(c.best|0)+1;if(!TA.tier||TA.tier>mx)TA.tier=mx;
    $('taName').textContent=CHARS[selChar].n+' · '+i18nf('hd.cap2','Cấp {0}',c.lv);
    $('taInfo').innerHTML=`<div class="taxp"><i style="width:${Math.min(100,c.xp/muaNeed(c.lv)*100)}%"></i></div>${c.lv>=MUA_LV?i18n('ta.max','Đã đạt cấp tối đa'):i18nf('ta.xp','Kinh nghiệm {0}/{1}',Math.floor(c.xp),muaNeed(c.lv))} · ${c.best?i18nf('hd.kyluc2','cao nhất tầng {0}',c.best):i18n('ta.chua','chưa vượt tầng nào')}`;
    $('coiB').innerHTML=i18n('mua.nut','Cõi chơi')+': <small>'+coiName()+'</small>';
    const row=$('hdTier'),draw=()=>{row.innerHTML=`<button>−</button><span>${i18nf('ta.tang','Tầng {0}',TA.tier)}<small>${i18nf('hd.caonhat','mở tới tầng {0}',mx)}</small></span><button>+</button>`;const B=row.querySelectorAll('button');B[0].onclick=()=>{TA.tier=Math.max(1,TA.tier-1);sfx('click');draw()};B[1].onclick=()=>{TA.tier=Math.min(mx,TA.tier+1);sfx('click');draw()};$('taBd').innerHTML=`<b>${i18n('tl.ten','Thủ lĩnh')}:</b> ${TA.bossText(TA.tier)}<br>`+TA.bdText(TA.tier)};draw();
    $('taGear').innerHTML=i18n('ui.html.phapBao','Pháp Bảo')+` <small>· ${coi()==='mua'?i18n('mua.ten.mua','Mùa giải'):i18n('mua.coi.thg','Thường')}</small>`;
    if(typeof bmBadge==='function')bmBadge();if(coi()==='mua')TA.bxhGui();
    const tg=scr.querySelector('.tago');if(!tg.style.background)tg.style.background=getComputedStyle(scr.querySelector('.card')).backgroundColor;
    if(typeof ddGate==='function')ddGate();   // Đạo Đồ: cõi Mùa giải và bảng xếp hạng mùa chỉ hiện khi đã mở (js/daodo.js)
    show('tran');if(typeof musicMode==='function')musicMode('menu');
  }
  $('coiB').addEventListener('click',()=>{sfx('click');coiSet(coi()==='mua'?'thuong':'mua');TA.tier=0;lbl();toast(coi()==='mua'?i18n('mua.sang.mua','Mùa giải: bắt đầu từ cấp 1, kho Pháp Bảo riêng của mùa. Hết mùa đồ chuyển về Thường.'):i18n('mua.sang.thg','Thường: cấp và Pháp Bảo giữ mãi, không reset.'));sanh()});
  $('bmB').addEventListener('click',()=>{sfx('click');if(typeof bmOpen==='function')bmOpen(selChar)});
  $('hdMoves').addEventListener('click',()=>{sfx('click');TA.showMoves(selChar)});
  $('taGear').addEventListener('click',()=>{sfx('click');TA.gearBack=true;gSel=null;buildGear()});   // nút Quay lại của kho sẽ về màn này (xem buildMenu trong noi.js)
  $('taLb').addEventListener('click',()=>{sfx('click');TA.showLb()});$('taMua').addEventListener('click',()=>{sfx('click');TA.showMua()});
  $('taBack').addEventListener('click',()=>{sfx('click');buildMenu()});
  // ── vào chuyến
  const go=()=>{if(typeof audioInit==='function')audioInit();TA.in=true;TA.next=true;startGame();
    b2.firstChild.src=iconURL(WEAP[W2[G.ch]||'phikiem'].ic);b2.dataset.n=i18n('hd.mv.c2','Chiêu 2');G.annQ.length=0;announce(i18nf('hd.ten3','TRẤN ẤN LỘ · TẦNG {0}',G.hd.tier),'title');
    if(G.hd.bd.length)setTimeout(()=>{if(G&&G.hd)announce(i18n('bd.ten','Biến dị')+': '+G.hd.bd.map(a=>i18n('bd.'+a.id,a.n)).join(' · '),'boss')},2600);
    TA.showHelp()};
  $('taGo').addEventListener('click',()=>{sfx('click');go()});
  btn.addEventListener('click',()=>{sfx('click');TA.tier=0;sanh()});
  lbl();
  Object.assign(TA,{sanh,go,lbl});
  window.hdGo=go;   // cho công cụ kiểm thử
}
