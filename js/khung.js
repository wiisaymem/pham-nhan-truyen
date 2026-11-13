'use strict';
// ───────────────────────── BỘ KHUNG CHUNG (js/khung.js), từ 1.0.81: mọi màn con mặc cùng một bộ áo với sảnh tông môn.
// Chỉ bật khi sảnh tông môn bật (#menu có lớp "sanh"); ?sanh=0 thì mọi thứ về kiểu cũ.
// QUY TẮC HÌNH ẢNH (dùng lại khi làm màn mới, đừng tự đặt màu khác):
//   gỗ đậm  #3b2416  thanh tiêu đề, thanh dưới, nền thông báo          gỗ vừa  #5a3a22 / #6b4424  nút phụ, ô trong thanh
//   vàng    #f1c453  viền bậc thang, chữ tiêu đề                         giấy    #f6e7c3  nền tấm nội dung; ô con #fff6dc viền #c9a25a
//   đỏ son  #c8402a  nút chính, việc đang làm                            mực     #4a2c14  chữ trên giấy; chữ phụ #8a6a48
//   xanh ngọc #1f8f58  "đã xong / nhận thưởng"
//   • Không bo góc. Viền là 4 bóng đổ lệch 2–3px (lớp .spx trong js/sanh.js) nên góc khuyết kiểu pixel.
//   • Tiêu đề canh trái trong thanh gỗ dính trên đầu tấm, có nút ‹ quay lại. Nút "Quay lại" cũ ở cuối màn bị ẩn (vẫn được bấm hộ).
//   • Ba loại nút: đỏ son = việc chính của màn (mỗi màn một nút: Nhập Trận, Xuống địa mạch, Chơi lại, Bảo Hạp, Tiếp); vàng = mua / nâng cấp / nhận; gỗ (.btn.alt) = việc phụ.
//   • Không dùng emoji; biểu tượng lấy từ atlas qua iconURL().
// Không đụng: thẻ chọn khi lên cấp trong trận (#lvup), HUD trong trận, lớp phủ của Trấn Ấn Lộ (#hdOv) và Bản Mệnh Đồ.
(function(){
  const M=document.getElementById('menu');if(!M||!M.classList.contains('sanh'))return;
  document.body.classList.add('tm');
  const G_='#f1c453',px=(n,c)=>`0 -${n}px 0 ${c},0 ${n}px 0 ${c},-${n}px 0 0 ${c},${n}px 0 0 ${c}`;
  const S='body.tm .screen:not(#lvup):not(#menu)',C=`${S} .card,body.tm #ddPop .card,body.tm #gyO .card`;
  const css=document.createElement('style');
  css.textContent=`
body.tm .screen.bg:not(#menu){background:linear-gradient(rgba(34,22,12,.80),rgba(16,26,16,.92)),url(assets/sanh_a.webp) center top/cover #1c120a}
@media (orientation:landscape) and (max-height:560px){body.tm .screen.bg:not(#menu){background:linear-gradient(rgba(34,22,12,.80),rgba(16,26,16,.92)),url(assets/sanh_a_ngang.webp) center/cover #1c120a}}
body.tm .screen.dim{background:rgba(18,14,10,.66)}
${C}{background:#f6e7c3;border:0;border-radius:0;box-shadow:${px(3,G_)},0 9px 0 rgba(0,0,0,.4);padding:0 14px 14px;color:#4a2c14}
${S} .card>h2,body.tm #ddPop .card>h2,body.tm #gyO .card>h2{position:sticky;top:0;z-index:5;margin:0 -14px 10px;padding:9px 12px 8px;min-height:42px;background:#3b2416;color:${G_};font-size:19px;line-height:1.25;text-align:left;border-bottom:3px solid ${G_};text-shadow:none}
${S} .card.kcb>h2{padding-left:48px}
${S} .card>h2 small{color:#e8d6a8}
${S} .card>h2.win{background:#1f6a44}
.kbar{position:sticky;top:0;height:0;z-index:6;margin:0 -14px}.kbar button{position:absolute;left:7px;top:6px;width:32px;height:30px;background:#5a3a22;color:${G_};border:0;font:800 22px/28px var(--font);padding:0;box-shadow:${px(2,'#8a5a30')}}.kbar button:active{filter:brightness(1.3)}
body.tm .kbk{display:none!important}
${S} .sub,body.tm #ddPop .ddq{text-align:left;color:#8a6a48;font-size:13.5px;line-height:1.4;margin:2px 0 10px}
${S} .btn,body.tm #ddPop .btn,body.tm #gyO .btn{border:0;background:#f1c453;color:#4a2c14;text-shadow:none;box-shadow:${px(2,'#a8741c')},0 6px 0 rgba(0,0,0,.3)}
${S} :is(#goB,#taGo,#ovAgain,#gbBuy),body.tm #ddPop #ddOk,body.tm #gyO .btn:not(.alt),body.tm #ovDD.ok .btn{background:#c8402a;color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.35);box-shadow:${px(2,G_)},0 6px 0 rgba(0,0,0,.3)}
${S} .btn:active,body.tm #ddPop .btn:active{transform:translateY(3px);filter:brightness(1.08)}
${S} .btn.alt,body.tm #ddPop .btn.alt,body.tm #gyO .btn.alt{background:#6b4424;color:#fff2d2;box-shadow:${px(2,'#8a5a30')},0 6px 0 rgba(0,0,0,.3)}
${S} .btn:disabled{background:#a59a86;color:#f1ead8;filter:none;opacity:.85;box-shadow:${px(2,'#857a66')},0 6px 0 rgba(0,0,0,.18);text-shadow:none}
${S} .btn small{color:inherit;opacity:.85}
${S} .chr,${S} .cd,${S} .mode{background:#fff6dc;border-color:#c9a25a}
${S} .chr.on{border-color:#c8402a;box-shadow:0 0 0 2px #c8402a}
body.tm .cl,body.tm .bg:not(#menu)::before{display:none}
${S} .seg button,${S} .dkb{border:2px solid #c9a25a;background:#fff6dc;color:#4a2c14;box-shadow:none}
${S} .seg button.on,${S} .dkb.on{background:#6b4424;border-color:#3b2416;color:#fff2d2;box-shadow:none}
${S} .dkb.ln.on{background:#c8402a;border-color:#8a2416;color:#fff}
${S} input[type=checkbox],${S} input[type=range]{accent-color:#c8402a}
${S} .dqrow{background:#fff6dc;border-color:#c9a25a}${S} .dqrow.done{border-color:#1f8f58;background:#e4f7dc}
${S} .lt{color:#1f8f58}
body.tm #toast{left:50%;bottom:auto;top:calc(max(12px,env(safe-area-inset-top)) + 70px);background:#3b2416;color:#fff2d2;border:0;border-radius:0;box-shadow:${px(3,G_)},0 8px 0 rgba(0,0,0,.35);padding:7px 14px;font-size:15px;font-weight:700;z-index:70}
body.tm #ddPop .ddm{border-color:#1f8f58;background:#e4f7dc}body.tm #ddPop .ddb{border-color:#c9962e;background:#fff6dc}body.tm #ddPop .ddr{color:#c8402a}
body.tm .ddr9{background:#fff6dc;border-color:#c9a25a}body.tm .ddr9.now{background:#fff0c4;border-color:#c8402a}
body.tm #ovDD{background:#fff6dc;border-color:#c9a25a}body.tm #ovDD.ok{background:#e4f7dc;border-color:#1f8f58}
`;
  css.textContent+=`
/* màn chọn tu sĩ: ba thẻ thay cho một cột dài (từ 1.0.82) */
.ktabs{position:sticky;top:45px;z-index:4;display:flex;margin:-10px -14px 10px;background:#5a3a22;border-bottom:2px solid #3b2416}
.ktabs button{flex:1;border:0;background:none;color:#e8d6a8;font:800 14.5px var(--font);padding:8px 2px 7px;opacity:.72;position:relative}
.ktabs button.on{opacity:1;color:#fff2d2;background:#6b4424}.ktabs button.on::after{content:'';position:absolute;left:14%;right:14%;bottom:-2px;height:3px;background:#c8402a}
#select[data-tab=ts] [data-kt]:not([data-kt~=ts]),#select[data-tab=ht] [data-kt]:not([data-kt~=ht]),#select[data-tab=ai] [data-kt]:not([data-kt~=ai]){display:none!important}
${S} .cd{background:none;border:0;padding:0;margin:8px 0 0}#select[data-tab=ht] #cdInfo>br{display:none}
${S} .kvbox,${S} .ultbox{background:#fff6dc;border:2px solid #c9a25a!important;margin-top:8px}${S} .kvbox>small{color:#8a4a10;font-size:13px}
${S} .dpl{background:#fff0c4;border:2px solid #c9a25a}
${S} .mapb{border-color:#c9a25a}${S} .mapb.on{border-color:#c8402a;box-shadow:0 0 0 2px #c8402a}
${S} .lbl{color:#8a4a10}
#select .kfoot{position:sticky;bottom:-14px;z-index:4;margin:10px -14px -14px;padding:7px 14px 14px;background:#f6e7c3;border-top:2px solid #c9a25a}
#select .kfoot .ksum{display:block;width:100%;border:0;background:none;text-align:left;font:700 13px var(--font);color:#8a6a48;padding:0 0 6px}#select .kfoot .ksum b{color:#4a2c14}
#select .kfoot .btn{margin:0}
#select[data-tab=ht] #cdInfo{font-size:0}#select[data-tab=ht] #cdInfo .kvbox{font-size:13px}
@media (orientation:landscape) and (max-height:560px){#select .kfoot{display:flex!important;align-items:center;gap:12px;padding:6px 14px 12px;bottom:-10px;margin:8px -14px -10px}#select .kfoot .ksum{flex:1;padding:0}#select .kfoot .btn{width:auto;flex:none;padding:7px 30px;font-size:17px}.ktabs button{padding:5px 2px 4px}}
`;
  document.head.appendChild(css);
  // ── KHUNG VẼ (từ 1.0.86): Kent thấy khung vẽ bằng code quá vuông. Khung, bảng tiêu đề và nút giờ là hình vẽ (assets/ui_*.webp, nguồn tools/art_src/ui_kit.jpg, Google Flow),
  //    kéo giãn kiểu 9 mảnh bằng border-image nên dùng được cho mọi cỡ. Khối này đè lên các luật vuông ở trên; muốn về kiểu vuông thì bỏ cả khối.
  //    panel = tấm giấy viền gỗ · plaque = bảng tiêu đề gỗ viền vàng · red / gold / wood / jade = bốn loại nút · slot = ô kem viền gỗ
  const U=n=>`url(assets/ui_${n}.webp)`,BT=(n,w)=>`background:none;box-shadow:none;border:${w}px solid transparent;border-image:${U(n)} 46 fill/${w}px`;
  css.textContent+=`
${C}{background:none;box-shadow:none;border:22px solid transparent;border-image:${U('panel')} 92 fill/22px;padding:0 3px 3px;filter:drop-shadow(0 8px 0 rgba(0,0,0,.35))}
${S} .card>h2,body.tm #ddPop .card>h2,body.tm #gyO .card>h2{margin:0 -6px 10px;min-height:0;padding:1px 2px;background:#f3e3c2;border:11px solid transparent;border-left-width:20px;border-right-width:20px;border-image:${U('plaque')} 50 62 fill/11px 20px;font-size:18px;text-align:center}
${S} .card.kcb>h2{padding-left:2px}${S} .card>h2.win{border-image-source:${U('jade')};border-image-slice:46 fill;color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.4)}
.kbar{margin:0 -6px}.kbar button{left:12px;top:8px;width:30px;height:28px;line-height:26px;background:#2c1a0e;border-radius:8px;box-shadow:0 0 0 2px #f1c453}
.ktabs{top:48px;margin:-4px -3px 10px;border-radius:8px;overflow:hidden;border:0}
#select .kfoot,body.tm #over .kfoot2{bottom:-3px;margin:10px -3px -3px;padding:7px 3px 3px;background:#f3e3c2;border-top:2px solid #d9c08a}
body.tm #over .kfoot2{margin-top:auto}
${S} .btn,body.tm #ddPop .btn,body.tm #gyO .btn{${BT('gold',11)};padding:1px 4px;color:#4a2c14;text-shadow:0 1px 0 rgba(255,255,255,.35)}
${S} :is(#goB,#taGo,#ovAgain,#gbBuy),body.tm #ddPop #ddOk,body.tm #gyO .btn:not(.alt),${S} #twList .twrow.now .btn{${BT('red',11)};color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.4)}
${S} .btn.alt,body.tm #ddPop .btn.alt,body.tm #gyO .btn.alt{${BT('wood',11)};color:#fff2d2;text-shadow:0 1px 0 rgba(0,0,0,.4)}
body.tm #over #ovDD#ovDD.ok .btn{${BT('jade',11)};color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.4)}
${S} .btn.sm,${S} .uprow .btn,${S} .ptrow .btn,${S} .twrow .btn{border-width:8px;padding:0 4px}
${S} .btn:active,body.tm #ddPop .btn:active{transform:translateY(2px);filter:brightness(.9);box-shadow:none}
${S} .btn:disabled{${BT('wood',11)};filter:grayscale(1) brightness(1.25);opacity:.7;color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.35)}
${S} .btn.sm:disabled,${S} .uprow .btn:disabled,${S} .ptrow .btn:disabled,${S} .twrow .btn:disabled{border-width:8px}
${S} .card :is(.uprow,.ptrow,.twrow,.kvbox,.ultbox,.dpl,.chr,.mapb,.dkb,.dqrow,.ddr9,.ovs,#ovLoot,#ovDet,#ovDD,.dh,.kic,.kfl,.bkrow,.lbrow,.seg button,.ptrow canvas,.dbs span),body.tm #ddPop :is(.ddm,.ddb){border-radius:9px!important}
#twList{border-left:0;margin-left:26px}${S} #twList .twrow{border-left:2px solid #c9a25a;margin:0 0 6px}${S} #twList .twrow.now{border-left-color:#c8402a;box-shadow:none}#twList .kfl{left:-28px}
${S} #ptList .ptrow canvas.lk{background:none;box-shadow:none}${S} #ptList .ptrow .btn{min-width:70px}
body.tm #tran .tago{background:#f3e3c2!important;bottom:-3px;margin:8px -3px -3px;padding:7px 3px 3px;border-top:2px solid #d9c08a}
body.tm #toast{background:none;box-shadow:none;border:10px solid transparent;border-left-width:20px;border-right-width:20px;border-image:${U('plaque')} 50 62 fill/10px 20px;padding:0 2px;filter:drop-shadow(0 5px 0 rgba(0,0,0,.3))}
/* sảnh */
body.tm #sanhV:not(.ngang) #sanhTop{background:none;box-shadow:none;border:11px solid transparent;border-left-width:18px;border-right-width:18px;border-image:${U('plaque')} 50 62 fill/11px 18px;height:62px;padding:0;left:8px;right:8px;filter:drop-shadow(0 5px 0 rgba(0,0,0,.3))}
body.tm #sanhAva{border-radius:8px;background:#2c1a0e}body.tm #sanhLt,body.tm #sanhSet{border-radius:8px;background:#2c1a0e}body.tm #sanhPips i{border-radius:2px}
body.tm #sanhV .splq{${BT('wood',7)};padding:0 4px 0 1px;filter:drop-shadow(0 3px 0 rgba(0,0,0,.35))}
body.tm #sanhV .splq.cur{${BT('red',8)};padding:1px 5px 1px 1px}
body.tm #sanhV .splq.lock{${BT('wood',7)};filter:grayscale(.85) brightness(.86) drop-shadow(0 3px 0 rgba(0,0,0,.35));color:#fff}body.tm #sanhV .splq.lock small{color:#ffe9a8}
body.tm #sanhSide button{${BT('wood',7)};padding:0 4px;filter:drop-shadow(0 3px 0 rgba(0,0,0,.35))}
body.tm #sanhSide button i,body.tm #sanhV .splq i{border-radius:50%;right:-9px;top:-9px}
body.tm #sanhQ{background:none;box-shadow:none;border:13px solid transparent;border-image:${U('slot')} 44 fill/13px;padding:0 2px;filter:drop-shadow(0 6px 0 rgba(0,0,0,.3))}
body.tm #sanhQ.ok{background:none}body.tm #sanhQ .bar,body.tm #sanhQ .bar i{border-radius:3px}
body.tm #sanhGo{${BT('red',10)};padding:2px 8px}body.tm #sanhQ.ok #sanhGo{${BT('jade',10)};padding:2px 8px}
body.tm #sanhFoot button{border-radius:7px}
body.tm #sanhNav button.on::before{display:none}
body.tm #sanhV:not(.ngang) #sanhNav{left:6px;right:6px;bottom:calc(5px + env(safe-area-inset-bottom));height:62px;padding:0;background:none;border:9px solid transparent;border-left-width:16px;border-right-width:16px;border-image:${U('plaque')} 50 62 fill/9px 16px;filter:drop-shadow(0 4px 0 rgba(0,0,0,.3))}
body.tm #sanhV:not(.ngang) #sanhNav button{opacity:.78}body.tm #sanhV:not(.ngang) #sanhNav button.on{${BT('wood',7)};opacity:1;margin:-3px 0;padding:0}
body.tm #sanhV:not(.ngang) #sanhQ{bottom:calc(78px + env(safe-area-inset-bottom))}body.tm #sanhV:not(.ngang) #sanhFoot{bottom:calc(158px + env(safe-area-inset-bottom))}
body.tm #sanhV.ngang #sanhNav{border-top:0;padding:0 4px 4px;width:176px}body.tm #sanhV.ngang #sanhNav button.on{${BT('wood',6)};padding:0}body.tm #sanhV.ngang #sanhNav button{white-space:nowrap;font-size:10.5px;gap:3px}body.tm #sanhV.ngang #sanhNav img{width:16px;height:16px}
/* dải danh hiệu, thẻ chuyển trang */
body.tm #over #ovTitleBox .dh{background:none;border:10px solid transparent;border-left-width:18px;border-right-width:18px;border-image:${U('plaque')} 50 62 fill/10px 18px;padding:0 2px;border-radius:0!important}
.ktabs{background:#dcc592;padding:3px;gap:3px;border-radius:12px;overflow:visible}.ktabs button{color:#6b4424;opacity:1;border-radius:9px;padding:5px 2px}.ktabs button.on{${BT('wood',7)};padding:0 2px;color:#fff2d2;text-shadow:0 1px 0 rgba(0,0,0,.4)}.ktabs button.on::after{display:none}
${S} .seg button.on,${S} .dkb.on{${BT('wood',7)};padding:0 6px;color:#fff2d2;text-shadow:0 1px 0 rgba(0,0,0,.4)}${S} .dkb.ln.on{${BT('red',7)};padding:0 6px}
/* thông báo nổi ở sảnh ngang: nằm gọn trên phần cảnh, không đè giữa màn */
@media (orientation:landscape) and (max-height:560px){body.tm:has(#menu.sanh:not([hidden])) #toast{left:calc(50% - 90px);top:auto;bottom:34px;font-size:13px;max-width:calc(100vw - 230px)}}
body.tm #sanhV.ngang::before{border-radius:16px 0 0 16px}
body.tm #sanhV.ngang #sanhNav button.on{margin:0;border-radius:8px}
body.tm #sanhV.ngang #sanhQ{border-width:9px;padding:0 1px;gap:3px;bottom:calc(88px + env(safe-area-inset-bottom))}body.tm #sanhV.ngang #sanhQ .bar{display:none}body.tm #sanhV.ngang #sanhGo{border-width:7px;padding:0 6px}
body.tm #sanhV.ngang #sanhSide{gap:5px 6px}body.tm #sanhV.ngang #sanhSide button{border-width:5px;padding:0 2px;font-size:10.5px;background:none}
`;
  // nút ‹ ở thanh tiêu đề bấm hộ nút "Quay lại" cũ của màn đó
  function dress(){for(const bk of document.querySelectorAll('.screen:not(#lvup):not(#menu) .card [id$="Back"]')){const card=bk.closest('.card');if(!card||card.classList.contains('kcb'))continue;const h=card.querySelector(':scope>h2');if(!h)continue;
    const bar=document.createElement('div');bar.className='kbar';const b=document.createElement('button');b.textContent='‹';b.setAttribute('aria-label',bk.textContent.trim());b.onclick=()=>bk.click();bar.appendChild(b);h.insertAdjacentElement('beforebegin',bar);
    card.classList.add('kcb');bk.classList.add('kbk');const r=bk.closest('.row');if(r&&r.children.length===1)r.classList.add('kbk')}}
  // ── màn chọn tu sĩ chia ba thẻ. buildSelect dựng lại ruột mỗi lần bấm nên phải gắn nhãn lại sau mỗi lần (file này nạp sau cùng nên bọc ngoài cùng).
  const SEL=document.getElementById('select');
  if(SEL&&typeof buildSelect==='function'){
    const card=SEL.querySelector('.card'),h=card.querySelector(':scope>h2'),tabs=document.createElement('div');tabs.className='ktabs';
    const T=[['ts',i18n('khung.tab.ts','Tu Sĩ')],['ht',i18n('khung.tab.ht','Hành Trang')],['ai',i18n('khung.tab.ai','Ải và Độ khó')]];
    const setTab=t=>{SEL.dataset.tab=t;for(const b of tabs.children)b.classList.toggle('on',b.dataset.t===t);card.scrollTop=0};
    for(const [t,n] of T){const b=document.createElement('button');b.dataset.t=t;b.textContent=n;b.onclick=()=>{if(typeof sfx==='function')sfx('click');setTab(t)};tabs.appendChild(b)}
    h.insertAdjacentElement('afterend',tabs);
    const foot=card.querySelector('#goB').closest('.row');foot.classList.add('kfoot');const sum=document.createElement('button');sum.className='ksum';sum.onclick=()=>setTab('ai');foot.insertAdjacentElement('afterbegin',sum);foot.style.display='block';
    const tag=()=>{const k=(e,t)=>{if(e)e.dataset.kt=t};k(document.getElementById('chars'),'ts');k(card.querySelector('.cd'),'ts ht');k(document.getElementById('cdName'),'ts');
      for(const e of document.getElementById('cdInfo').children){const bc=e.style&&e.style.borderColor||'';k(e,e.classList.contains('kvbox')&&!/123, ?201, ?106/.test(bc)?'ht':'ts')}   // Kỳ Vật và Cánh sang thẻ Hành Trang; Tu Luyện (viền lục) ở lại thẻ Tu Sĩ
      for(const e of card.querySelectorAll(':scope>.lbl,:scope>#maps,:scope>#dkRow,:scope>#dkInfo'))k(e,'ai');
      const A=aiSave(),sp=aiSpec(A.sel||1),dk=document.querySelector('#dkRow .dkb.on');
      sum.innerHTML=`<b>${CHARS[selChar].n}</b> · ${i18nf('khung.ai','Ải {0}',sp.n)} ${MAPS[sp.map].n}${dk?' · '+dk.textContent.trim():''} <span style="float:right">${i18n('khung.doi','đổi ›')}</span>`};
    const _bs=buildSelect;buildSelect=function(){const was=!SEL.hidden;_bs();if(SEL.hidden)return;try{tag();if(!was||!SEL.dataset.tab)setTab('ts')}catch(e){console.error(e)}};
    card.addEventListener('click',()=>setTimeout(()=>{if(!SEL.hidden)try{tag()}catch(e){}},0));   // đổi ải / độ khó không dựng lại cả màn: gắn nhãn và cập nhật dòng tóm tắt
    window.khungTab=setTab;
  }
  // ── màn kết trận (từ 1.0.83): kết quả → thứ thu được → việc tiếp theo; số liệu chi tiết thu vào một mục mở ra được. Nút dính ở đáy.
  (function(){const O=document.getElementById('over');if(!O||typeof showOver!=='function')return;const card=O.querySelector('.card'),$$=id=>document.getElementById(id);
    const loot=document.createElement('div');loot.id='ovLoot';loot.innerHTML=`<div class="kl">${i18n('khung.thu','Thu được')}</div>`;$$('ovStats').insertAdjacentElement('afterend',loot);
    for(const id of ['ovUnlock','ovMat','ovGear'])if($$(id))loot.appendChild($$(id));
    const det=document.createElement('details');det.id='ovDet';det.innerHTML=`<summary>${i18n('khung.chitiet','Chi tiết trận')}</summary>`;det.appendChild($$('ovMore'));
    const row=$$('ovMenu').closest('.row');row.classList.add('kfoot2');row.insertAdjacentElement('beforebegin',det);
    det.addEventListener('toggle',()=>{if(det.open&&G&&typeof drawKillChart==='function'){for(const i of det.querySelectorAll('.bar i'))if(i.dataset.w)i.style.width=i.dataset.w+'%';drawKillChart()}});
    const _so=showOver;showOver=function(){_so();try{det.open=false;card.scrollTop=0;
      const dd=$$('ovDD');if(dd)loot.insertAdjacentElement('afterend',dd);   // việc tiếp theo nằm ngay dưới phần thu được
      loot.hidden=!['ovUnlock','ovMat','ovGear'].some(id=>$$(id)&&$$(id).textContent.trim())}catch(e){console.error(e)}};
    const st=document.createElement('style');st.textContent=`
body.tm #over .card{display:flex;flex-direction:column}
body.tm #ovTitleBox{margin:0 0 8px}body.tm #ovTitleBox .dh{background:#3b2416;color:#fff2d2;box-shadow:none;border:0;padding:6px 10px;text-align:left;display:grid;grid-template-columns:auto 1fr;column-gap:8px;align-items:baseline;position:relative}
body.tm #ovTitleBox .dh small{color:#f1c453;font-size:10.5px;letter-spacing:.6px;grid-row:1}body.tm #ovTitleBox .dh b{color:#fff2d2;font-size:17px;text-shadow:none;grid-row:1}body.tm #ovTitleBox .dh p{grid-column:1/3;margin:0;font-size:12px;color:#e8d6a8}
body.tm #ovTitleBox .dh i{position:absolute;right:8px;top:6px;background:#c8402a;color:#fff;font-style:normal;font-size:10.5px;padding:0 5px}
body.tm #ovTitleBox .dbs span{background:#fff6dc;border:2px solid #c9a25a;color:#4a2c14}
body.tm #over .ovs{gap:0;margin:0 0 8px;border:2px solid #c9a25a;background:#fff6dc}body.tm #over .ovs div{background:none;border:0;border-right:1px solid #e3cf9c;border-bottom:1px solid #e3cf9c;padding:5px 2px}body.tm #over .ovs div:nth-child(3n){border-right:0}body.tm #over .ovs div:nth-last-child(-n+3){border-bottom:0}
body.tm #over .ovs small{font-size:11px;color:#8a6a48}body.tm #over .ovs b{font-size:19px;color:#4a2c14}
#ovLoot{border:2px solid #c9a25a;background:#fff6dc;padding:5px 8px 7px;margin:0 0 8px}#ovLoot .kl,#ovDet summary{font:800 11px var(--font);letter-spacing:.6px;text-transform:uppercase;color:#c8402a}
#ovLoot p{text-align:left;margin:2px 0;font-size:13.5px}#ovLoot #ovGear{margin-top:5px}
body.tm #ovDD{margin:0 0 8px}body.tm #over #ovDD#ovDD.ok .btn{background:#1f8f58;color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.35);box-shadow:${px(2,G_)},0 6px 0 rgba(0,0,0,.3)}
#ovDet{border:2px solid #c9a25a;background:#fff6dc;padding:6px 8px;margin:0 0 8px}#ovDet summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;color:#8a4a10}#ovDet summary::after{content:'+';font-size:15px;line-height:1}#ovDet[open] summary::after{content:'−'}#ovDet summary::-webkit-details-marker{display:none}
body.tm #over .kfoot2{position:sticky;bottom:-14px;z-index:4;margin:auto -14px -14px;padding:8px 14px 14px;background:#f6e7c3;border-top:2px solid #c9a25a}body.tm #over .kfoot2 .btn{margin:0}
`;document.head.appendChild(st)})();
  // ── Động Phủ, Thông Thiên Tháp, Linh Thú có hình (từ 1.0.84). Hình lấy từ atlas sẵn có, không thêm file.
  //    DP_IC: icon cho từng dòng nâng cấp của Động Phủ (mã trong DONGPHU ở js/data.js → tên icon cho iconURL). Thêm dòng nâng cấp mới thì thêm vào đây.
  const DP_IC={hp:'p_heart',dmg:'p_sword',crit:'p_bolt',cd:'p_yin',area:'array',armor:'p_shield',regen:'heal',spd:'p_boot',mag:'p_magnet',xp:'p_moon',burst:'burst',luck:'lt',reroll:'merge',ban:'seal'};
  const sprC=(key,sz)=>{const c=mk(sz,sz),x=c.getContext('2d');x.imageSmoothingEnabled=false;const m=SPR[key];if(m&&ATLAS){const r=m.r,k=Math.min(sz/r[2],sz/r[3])*0.92;x.drawImage(m.img||ATLAS,r[0],r[1],r[2],r[3],(sz-r[2]*k)/2,(sz-r[3]*k)/2,r[2]*k,r[3]*k)}return c};
  if(typeof buildDongPhu==='function'){const _b=buildDongPhu;buildDongPhu=function(){_b();try{const R=document.querySelectorAll('#dpList .uprow'),K=Object.keys(DONGPHU);
    R.forEach((r,i)=>{const im=document.createElement('img');im.className='kic';im.alt='';im.src=iconURL(DP_IC[K[i]]||'cave');r.prepend(im);if(upLv(K[i])>=DONGPHU[K[i]].max)r.classList.add('max')})}catch(e){console.error(e)}}}
  if(typeof buildTower==='function'){const _b=buildTower;buildTower=function(){_b();try{const ts=towerSave(),next=ts.best+1,f0=Math.max(1,next-2);
    document.querySelectorAll('#twList .twrow').forEach((r,i)=>{const f=f0+i,T=towerSpec(f),E=ENEMY[T.boss];r.classList.add(f<next?'done':f===next?'now':'lock');
      const box=document.createElement('div');box.className='kfl';box.appendChild(sprC('e_'+E.spr+'_idle0',48));const n=document.createElement('b');n.textContent=f;box.appendChild(n);r.prepend(box)})}catch(e){console.error(e)}}}
  if(typeof buildPets==='function'){const _b=buildPets;buildPets=function(){_b();try{const eq=petSave().eq;
    document.querySelectorAll('#ptList .ptrow').forEach((r,i)=>{const k=PET_KEYS[i];if(k&&k===eq)r.classList.add('eq');const c=r.querySelector('canvas');if(c&&!(k&&petLv(k)))c.classList.add('lk');if(c&&k&&petLv(k)){const big=petCanvas(k,72);big.style.filter=c.style.filter;c.replaceWith(big)}})}catch(e){console.error(e)}}}
  css.textContent+=`
#dpList{display:grid;grid-template-columns:1fr 1fr;gap:8px}
${S} #dpList .uprow{display:grid;grid-template-columns:40px 1fr;grid-template-rows:auto auto;gap:4px 8px;align-items:start;padding:7px;background:#fff6dc;border:2px solid #c9a25a}
${S} #dpList .uprow.max{border-color:#1f8f58;background:#eef7e2}
#dpList .kic{width:40px;height:40px;image-rendering:pixelated;background:#3b2416;padding:4px;box-shadow:0 0 0 2px #c9a25a;object-fit:contain}
${S} #dpList .uprow>div{min-width:0}${S} #dpList .uprow b{font-size:14px;line-height:1.1;display:block}${S} #dpList .dplv{font-size:11px;color:#8a6a48}${S} #dpList .uprow small{font-size:11.5px;line-height:1.2}
${S} #dpList .dpbar{max-width:none;height:5px;background:#e3cf9c}${S} #dpList .dpbar i{background:#c8402a}
${S} #dpList .uprow .btn{grid-column:1/3;width:100%;margin:2px 0 0;padding:4px 6px;font-size:15px}
@media (orientation:landscape) and (max-height:560px){#dpList{grid-template-columns:repeat(4,1fr)}}
#twList{display:flex;flex-direction:column-reverse;gap:0;border-left:6px solid #5a3a22;margin-left:22px;padding-left:0}
${S} #twList .twrow{position:relative;border:2px solid #c9a25a;border-left:0;background:#fff6dc;margin:0 0 -2px;padding:6px 8px 6px 34px;min-height:64px}
#twList .kfl{position:absolute;left:-31px;top:50%;margin-top:-28px;width:56px;height:56px;background:#3b2416;box-shadow:0 0 0 2px #c9a25a;display:flex;align-items:center;justify-content:center;flex:none}
#twList .kfl canvas{width:48px;height:48px;image-rendering:pixelated}#twList .kfl b{position:absolute;right:-7px;bottom:-7px;min-width:20px;height:20px;line-height:20px;text-align:center;background:#f1c453;color:#3b2416;font-size:12px;font-weight:800;padding:0 3px}
${S} #twList .twrow.now{background:#fff0c4;border-color:#c8402a;z-index:1;box-shadow:-2px 0 0 #c8402a}#twList .twrow.now .kfl{box-shadow:0 0 0 2px #c8402a}
${S} #twList .twrow.now .btn{background:#c8402a;color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.35);box-shadow:${px(2,G_)},0 5px 0 rgba(0,0,0,.3)}
${S} #twList .twrow.done{background:#eef7e2}#twList .twrow.done .kfl b{background:#1f8f58;color:#fff}
#twList .twrow.lock{opacity:.6}#twList .twrow.lock .kfl canvas{filter:brightness(.25)}
${S} #ptList .ptrow{border:2px solid #c9a25a;background:#fff6dc;margin:0 0 6px;padding:7px;align-items:flex-start}
${S} #ptList .ptrow canvas{width:72px;height:72px;background:#3b2416;box-shadow:0 0 0 2px #c9a25a;flex:none}
${S} #ptList .ptrow canvas.lk{background:#d9c79a}
${S} #ptList .ptrow.eq{border-color:#c8402a;background:#fff0c4}${S} #ptList .ptrow.eq canvas{box-shadow:0 0 0 2px #c8402a}
${S} #ptList .ptrow b{font-size:15px}${S} #ptList .ptrow .btn{padding:5px 10px;font-size:14px;min-width:86px}
`;
  dress();
  const _sh=show;show=function(id){_sh(id);try{dress()}catch(e){}};   // màn dựng sau (Trấn Ấn Lộ, Đạo Đồ…) cũng được mặc áo
})();
