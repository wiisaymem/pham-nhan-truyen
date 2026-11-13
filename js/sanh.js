'use strict';
// ───────────────────────── SẢNH TÔNG MÔN (js/sanh.js), từ 1.0.77. Kent chọn hướng A (tranh cuộn ban ngày) ngày 12/11/2026.
// Sảnh là một CẢNH: tranh tông môn trên núi (assets/sanh_a.webp, nguồn tools/art_src/sanh_a.jpg, vẽ bằng Google Flow), mỗi hệ thống là một nơi bấm vào được.
// • Mặc định BẬT từ 1.0.78 (Kent duyệt 12/11/2026). Xem sảnh cũ: thêm ?sanh=0 vào địa chỉ (bot kiểm thử bấm nút sảnh cũ phải dùng cờ này).
// • Màn dọc (và màn rộng đủ cao): tranh dọc. Màn ngang thấp (điện thoại xoay ngang, từ 1.0.79): tranh ngang assets/sanh_a_ngang.webp bên trái, bảng điều khiển bên phải.
// • Thẻ sảnh cũ (#menu .card) vẫn còn trong trang, chỉ bị ẩn: mỗi nơi trong cảnh bấm hộ nút cũ tương ứng, nên mọi luồng cũ chạy y nguyên.
// • SANH_NOI: nơi trong cảnh. x,y theo điểm ảnh của tranh dọc 384×688; nx,ny theo tranh ngang 688×384; nut = nút cũ; mo = mã mở khóa trong DD_MO (bỏ trống = luôn mở).
//   Thêm nơi mới: thêm một dòng vào đây (và chữ Anh tmon.noi.<mã> trong js/lang/en.js).
// • Khóa mở, việc đang làm, tên bậc lấy từ Đạo Đồ qua window.DD (js/daodo.js).
const SANH_MACDINH=true;
const SANH_NOI={
  tower:{n:'Thông Thiên Tháp',ic:'tower',x:222,y:104,nx:338,ny:58,nut:'towerB',mo:'tower',go:['tower']},
  dp:{n:'Động Phủ',ic:'cave',x:282,y:150,nx:612,ny:70,nut:'dpB',mo:'dp',go:['dp']},
  lib:{n:'Tàng Kinh Các',ic:'scroll',x:96,y:198,nx:515,ny:136,nut:'bkB',mo:'bk',go:['bk']},
  forge:{n:'Lò Luyện Bảo',ic:'chest',x:300,y:288,nx:352,ny:166,nut:'gearB',mo:'gear',go:['gear']},
  pet:{n:'Linh Thú Viên',ic:'paw',x:104,y:374,nx:560,ny:346,nut:'petB',mo:'pet',go:['pet']},
  bia:{n:'Bia Phong Vân',ic:'trophy',x:252,y:372,nx:318,ny:304,nut:'lbB',mo:'lb',go:[]},
  gate:{n:'Sơn Môn · Thiên Kiếp',ic:'sword',x:270,y:468,nx:150,ny:122,nut:'playB',mo:'',go:['play','tl']},
  vein:{n:'Địa Mạch · Trấn Ấn Lộ',ic:'bagua',x:112,y:572,nx:84,ny:258,nut:'hdB',mo:'tran',go:['tran','mua']},
};
(function(){
  if(typeof DD==='undefined')return;
  const qs=new URLSearchParams(location.search).get('sanh');
  try{if(qs==='1')localStorage.setItem('vktt_sanh','1');else if(qs==='0')localStorage.removeItem('vktt_sanh')}catch(e){}
  let on=SANH_MACDINH;try{if(localStorage.getItem('vktt_sanh')==='1')on=true}catch(e){}
  if(qs==='0')on=false;if(!on)return;
  for(const k in SANH_NOI)SANH_NOI[k].n=i18n('tmon.noi.'+k,SANH_NOI[k].n);
  const css=document.createElement('style');
  css.textContent=`#sanhV{display:none}
#menu.sanh{padding:0;overflow:hidden;background:#17301f;display:block}#menu.sanh[hidden]{display:none}#menu.sanh>.card{display:none}
#menu.sanh #sanhV{display:block;position:relative;width:min(100vw,500px);height:100%;overflow:hidden;background:linear-gradient(#6ec3f2 0%,#a9e0f7 40%,#2c5a36 78%,#17301f 100%);font-family:var(--font);font-weight:700;color:#fff2d2;-webkit-tap-highlight-color:transparent;user-select:none}
#sanhBg{position:absolute;left:50%;top:0;transform:translateX(-50%);background:url(assets/sanh_a.webp) center/100% 100%;image-rendering:pixelated}
#sanhBg .sfx{position:absolute;pointer-events:none;mix-blend-mode:screen}#sanhV:not(.ngang) .sfx-ngang,#sanhV.ngang .sfx-doc{display:none}
.sfx-lua{background:radial-gradient(closest-side,rgba(255,190,90,.85),rgba(255,120,40,.35) 55%,rgba(255,120,40,0));animation:sfxL 1.3s steps(4) infinite alternate}
.sfx-hang{background:radial-gradient(closest-side,rgba(190,110,255,.6),rgba(140,70,230,.28) 60%,rgba(140,70,230,0));animation:sfxL 2.6s steps(6) infinite alternate}
.sfx-den{background:radial-gradient(closest-side,rgba(255,220,130,.8),rgba(255,200,100,0));animation:sfxL 1.9s steps(3) infinite alternate}
.sfx-thac{background:repeating-linear-gradient(180deg,rgba(255,255,255,.55) 0 3px,rgba(255,255,255,0) 3px 9px);background-size:100% 18px;animation:sfxT .7s steps(6) infinite;opacity:.6}
@keyframes sfxL{from{opacity:.35}to{opacity:1}}@keyframes sfxT{to{background-position:0 18px}}
#sanhV .smay{position:absolute;left:-90px;width:44px;height:10px;background:#fff;opacity:.8;pointer-events:none;box-shadow:10px -8px 0 0 #fff,26px -6px 0 -1px #fff,-10px 4px 0 -2px #fff,38px 4px 0 -2px #fff,14px 6px 0 0 #eaf6ff;animation:sfxM linear infinite}
@keyframes sfxM{from{margin-left:0}to{margin-left:calc(100vw + 180px)}}
#sanhV.ngang .smay{display:none}
@media (prefers-reduced-motion:reduce){#sanhBg .sfx,#sanhV .smay,#sanhV .splq.cur{animation:none}}
#sanhV .sh{position:absolute;left:0;right:0;pointer-events:none}#sanhV .sh.t{top:0;height:110px;background:linear-gradient(rgba(10,20,30,.55),rgba(10,20,30,0))}#sanhV .sh.b{bottom:0;height:260px;background:linear-gradient(rgba(10,24,14,0),rgba(10,24,14,.85) 55%,#17301f)}
#sanhV button{font:inherit;color:inherit;border:0;cursor:pointer;margin:0}
#sanhV img{image-rendering:pixelated}
.spx{box-shadow:0 -3px 0 var(--e),0 3px 0 var(--e),-3px 0 0 var(--e),3px 0 0 var(--e),0 7px 0 rgba(0,0,0,.35)}
#sanhTop{position:absolute;left:12px;right:12px;top:max(12px,env(safe-area-inset-top));height:52px;background:#3b2416;--e:#f1c453;display:flex;align-items:center;padding:0 6px;gap:8px}
#sanhAva{width:40px;height:40px;flex:none;background:#5a3a22;outline:2px solid #f1c453;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:0}#sanhAva canvas{width:40px;height:40px}
#sanhWho{flex:1;min-width:0;line-height:1.1;text-align:left;background:none;padding:0}#sanhWho b{display:block;font-size:15px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#sanhWho span{font-size:11.5px;color:#f1c453;white-space:nowrap}
#sanhPips{display:flex;gap:2px;margin-top:3px}#sanhPips i{width:13px;height:5px;background:#5a3a22}#sanhPips i.on{background:#f1c453}#sanhPips i.now{background:linear-gradient(90deg,#f1c453 var(--f,0%),#5a3a22 var(--f,0%))}
#sanhLt{display:flex;align-items:center;gap:4px;background:#5a3a22;padding:3px 8px 3px 4px;font-size:15px;font-weight:800;flex:none}#sanhLt img{width:20px;height:20px}
#sanhSet{flex:none;width:30px;height:30px;background:#5a3a22;font-size:17px;line-height:30px;padding:0;color:#f1c453}
#sanhSide{position:absolute;left:12px;top:calc(max(12px,env(safe-area-inset-top)) + 64px);display:flex;flex-direction:column;gap:9px;align-items:flex-start}
#sanhSide button{position:relative;text-shadow:0 1px 0 rgba(0,0,0,.55);background:rgba(59,36,22,.92);--e:#8a5a30;box-shadow:0 -2px 0 var(--e),0 2px 0 var(--e),-2px 0 0 var(--e),2px 0 0 var(--e),0 5px 0 rgba(0,0,0,.35);padding:4px 8px;font-size:12.5px;font-weight:800;white-space:nowrap}#sanhSide button b{color:#ffe07a}
#sanhFoot{position:absolute;right:12px;bottom:calc(150px + env(safe-area-inset-bottom));display:flex;gap:8px}#sanhFoot button{background:rgba(20,30,24,.72);padding:2px 7px;font-size:11px;font-weight:700;color:#e8e0c8;box-shadow:0 0 0 1px rgba(241,196,83,.55)}
#sanhSide button i,.splq i{position:absolute;right:-5px;top:-5px;width:10px;height:10px;background:#ff4d4d;box-shadow:0 0 0 2px #fff}
#sanhV .splq{position:absolute;display:flex;align-items:center;gap:4px;background:#6b4424;--e:#8a5a30;box-shadow:0 -2px 0 var(--e),0 2px 0 var(--e),-2px 0 0 var(--e),2px 0 0 var(--e),0 5px 0 rgba(0,0,0,.4);padding:3px 7px 3px 4px;font-size:13px;font-weight:800;white-space:nowrap;line-height:1.1;text-align:left;text-shadow:0 1px 0 rgba(0,0,0,.55)}
#sanhV .splq img{width:18px;height:18px;object-fit:contain;flex:none}#sanhV .splq small{display:block;font-size:10px;font-weight:700;color:#f1c453}
#sanhV .splq.lock{background:rgba(30,34,40,.84);--e:rgba(120,130,140,.9);color:#c9d0d6}
#sanhV .splq.cur{background:#c8402a;--e:#f1c453;color:#fff;font-size:14px;padding:5px 9px 5px 5px;z-index:2;animation:sanhB 1s steps(1) infinite}#sanhV .splq.cur::after{content:'';position:absolute;left:50%;bottom:-13px;margin-left:-6px;border:6px solid transparent;border-top-color:#f1c453}
@keyframes sanhB{0%,49%{transform:none}50%,100%{transform:translateY(-3px)}}
.splq:active,#sanhGo:active,#sanhNav button:active,#sanhSide button:active{filter:brightness(1.25)}
#sanhQ{position:absolute;left:12px;right:12px;bottom:calc(74px + env(safe-area-inset-bottom));background:#f6e7c3;--e:#f1c453;color:#4a2c14;padding:7px 10px 9px;display:flex;align-items:center;gap:10px;text-align:left}
#sanhQ .q{flex:1;min-width:0;line-height:1.15}#sanhQ .q small{display:block;font-size:11px;letter-spacing:.6px;text-transform:uppercase;color:#c8402a;font-weight:800}#sanhQ .q b{display:block;font-size:16px;font-weight:800}#sanhQ .q span{font-size:12px;opacity:.82}
#sanhQ .bar{height:5px;background:rgba(120,90,40,.28);margin-top:4px}#sanhQ .bar i{display:block;height:100%;background:#c8402a}
#sanhGo{flex:none;background:#c8402a;color:#fff!important;font-size:16px;font-weight:800;padding:9px 14px;box-shadow:0 -2px 0 #f1c453,0 2px 0 #f1c453,-2px 0 0 #f1c453,2px 0 0 #f1c453,0 5px 0 rgba(0,0,0,.35)}
#sanhQ.ok{background:#e4f7dc}#sanhQ.ok #sanhGo{background:#1f8f58;animation:ddG 1.1s ease-in-out infinite}#sanhQ.ok .q small{color:#1f8f58}#sanhQ.ok .bar i{background:#1f8f58}
#sanhNav{position:absolute;left:0;right:0;bottom:0;height:calc(62px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:#3b2416;border-top:3px solid #f1c453;display:flex}
#sanhNav button{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;background:none;font-size:12px;font-weight:800;opacity:.66;position:relative;padding:0}#sanhNav img{width:24px;height:24px;object-fit:contain}
#sanhNav button.on{opacity:1;background:#5a3a22}#sanhNav button.on::before{content:'';position:absolute;top:-3px;left:18%;right:18%;height:3px;background:#c8402a}
#sanhVer{position:absolute;right:14px;top:calc(max(12px,env(safe-area-inset-top)) + 60px);font:13px var(--px);color:rgba(255,255,255,.75);text-shadow:0 1px 0 rgba(0,0,0,.5)}
/* màn ngang thấp (điện thoại xoay ngang): tranh ngang bên trái, bảng điều khiển 180px bên phải */
#menu.sanh #sanhV.ngang{width:100vw;background:linear-gradient(#6ec3f2 0%,#bfe6f5 55%,#3f8a3c 80%,#2c5a36 100%)}
#sanhV.ngang #sanhBg{background-image:url(assets/sanh_a_ngang.webp)}
#sanhV.ngang::before{content:'';position:absolute;right:0;top:0;bottom:0;width:180px;background:#3b2416;border-left:3px solid #f1c453;z-index:2}
#sanhV.ngang .sh{display:none}
#sanhV.ngang #sanhTop,#sanhV.ngang #sanhSide,#sanhV.ngang #sanhQ,#sanhV.ngang #sanhNav{z-index:3;left:auto}
#sanhV.ngang #sanhTop{right:8px;top:max(6px,env(safe-area-inset-top));width:164px;height:auto;flex-wrap:wrap;row-gap:5px;padding:0;background:none;box-shadow:none}
#sanhV.ngang #sanhWho{flex:0 0 116px}#sanhV.ngang #sanhWho b{font-size:14px}#sanhV.ngang #sanhWho span{font-size:10.5px}#sanhV.ngang #sanhPips i{width:10px}
#sanhV.ngang #sanhLt{flex:1;font-size:14px}#sanhV.ngang #sanhSet{width:28px;height:26px;line-height:26px}
#sanhV.ngang #sanhSide{right:8px;top:calc(max(6px,env(safe-area-inset-top)) + 90px);width:164px;flex-direction:row;flex-wrap:wrap;gap:7px 9px}#sanhV.ngang #sanhSide button{padding:2px 6px;font-size:11px;background:#5a3a22}
#sanhV.ngang #sanhQ{right:10px;width:160px;bottom:calc(92px + env(safe-area-inset-bottom));flex-direction:column;align-items:stretch;gap:5px;padding:5px 7px 7px}#sanhV.ngang #sanhQ .q b{font-size:13.5px}#sanhV.ngang #sanhQ .q span{font-size:11px}#sanhV.ngang #sanhQ .q small{font-size:10px}
#sanhV.ngang #sanhGo{padding:4px 10px;font-size:14px;text-align:center}
#sanhV.ngang #sanhNav{right:0;width:177px;height:calc(80px + env(safe-area-inset-bottom));flex-wrap:wrap;border-top:2px solid #8a5a30}#sanhV.ngang #sanhNav button{flex:0 0 50%;height:40px;flex-direction:row;gap:5px;font-size:11.5px}#sanhV.ngang #sanhNav img{width:18px;height:18px}#sanhV.ngang #sanhNav button.on::before{display:none}
#sanhV.ngang #sanhFoot{right:190px;bottom:6px}#sanhV.ngang #sanhVer{right:190px;top:4px}
#sanhV.ngang .splq{font-size:12.5px}
`;
  document.head.appendChild(css);
  const M=$('menu'),V=document.createElement('div');V.id='sanhV';
  V.innerHTML=`<div id="sanhBg"></div><div class="sh t"></div><div class="sh b"></div><div id="sanhPl"></div>
<div id="sanhTop" class="spx"><button id="sanhAva"></button><button id="sanhWho"><b></b><span></span><div id="sanhPips"></div></button><div id="sanhLt"><img alt=""><span></span></div><button id="sanhSet" aria-label="${i18n('ui.html.caiDat','Cài đặt')}">≡</button></div>
<div id="sanhVer"></div><div id="sanhSide"></div><div id="sanhFoot"></div>
<div id="sanhQ" class="spx"><div class="q"><small></small><b></b><span></span><div class="bar"><i></i></div></div><button id="sanhGo"></button></div>
<div id="sanhNav"><button class="on" data-t="home"><img alt="">${i18n('tmon.nav.home','Tông Môn')}</button><button data-t="tusi"><img alt="">${i18n('tmon.nav.tusi','Tu Sĩ')}</button><button data-t="kho"><img alt="">${i18n('tmon.nav.kho','Kho')}</button><button data-t="dd"><img alt="">${i18n('dd.ten','Đạo Đồ')}</button></div>`;
  M.appendChild(V);M.classList.add('sanh');
  // ── chuyển động của cảnh (từ 1.0.85): lửa lò, hang tím, thác, mây. Toạ độ theo điểm ảnh của từng tranh; thêm / sửa trong SANH_FX.
  //    [loại, x, y, rộng, cao] · loại: lua (quầng cam), hang (quầng tím), thac (vệt nước chảy), den (đèn lồng chập chờn)
  const SANH_FX={doc:[384,688,[['lua',292,330,46,40],['hang',110,624,84,66],['thac',183,178,10,62],['thac',214,300,9,34],['thac',318,386,10,40],['thac',455,470,0,0],['den',62,232,12,12],['den',160,232,12,12],['den',178,268,12,12]]],
                 ngang:[688,384,[['lua',346,214,44,36],['hang',68,306,86,72],['thac',37,128,10,48],['thac',400,236,9,22],['thac',483,346,14,40],['den',466,180,10,10],['den',560,180,10,10],['den',466,222,10,10],['den',560,222,10,10]]]};
  {const B=V.querySelector('#sanhBg');for(const m in SANH_FX){const [w,h,L]=SANH_FX[m];for(const [t,x,y,fw,fh] of L){if(!fw)continue;const e=document.createElement('i');e.className='sfx sfx-'+t+' sfx-'+m;
      e.style.cssText=`left:${(x-fw/2)/w*100}%;top:${(y-fh/2)/h*100}%;width:${fw/w*100}%;height:${fh/h*100}%;animation-delay:-${(x*7+y*3)%23/10}s`;B.appendChild(e)}}
    for(let i=0;i<3;i++){const c=document.createElement('i');c.className='smay';c.style.cssText=`top:${[7,15,24][i]}%;animation-duration:${[70,95,120][i]}s;animation-delay:-${[10,50,85][i]}s;transform:scale(${[1,0.7,1.25][i]})`;V.insertBefore(c,V.querySelector('.sh'))}}

  const click=id=>{const b=$(id);if(b)b.click()},snd=()=>{if(typeof audioInit==='function')audioInit();sfx('click')};
  const lockMsg=k=>{const q=DD.first(k);toast(q?i18nf('tmon.khoa','Chưa mở. Làm xong việc: {0}',DD.tit(q)):i18n('tmon.khoa2','Chưa mở'))};
  // ── kích thước tranh: giữ đúng tỉ lệ, vừa chiều ngang hoặc vừa phần cao phía trên thanh dưới
  let sw=0,sh=0;
  let ng=false,ox=0,oy=0;
  function fit(){if(!V.clientHeight)return;ng=innerWidth>innerHeight&&innerHeight<=560;V.classList.toggle('ngang',ng);const W=V.clientWidth,H=V.clientHeight,B=$('sanhBg');V.style.marginLeft=Math.floor((innerWidth-W)/2)+'px';   // canh giữa theo điểm ảnh nguyên (lệch nửa điểm là nhòe chữ)   // đổi kiểu trước rồi mới đo
    if(ng){const aw=W-180,ct=Math.min(aw/1376,H/768),k=Math.min(Math.max(aw/1376,H/768),ct*1.16);sw=1376*k;sh=768*k;ox=(aw-sw)/2;oy=(H-sh)/2;B.style.clipPath=`inset(0 ${Math.max(0,-ox)}px 0 0)`}   // phủ kín tối đa, cắt mép không quá 16%
    else{sh=Math.max(Math.min(W/0.558,H-96),H-150);sw=sh*0.558;ox=(W-sw)/2;oy=0;B.style.clipPath=''}
    B.style.width=sw+'px';B.style.height=sh+'px';B.style.left=ox+'px';B.style.top=oy+'px';B.style.transform='none';place()}
  function place(){const W=ng?V.clientWidth-183:V.clientWidth;for(const e of $('sanhPl').children){const N=SANH_NOI[e.dataset.k];let x=ox+(ng?N.nx/688:N.x/384)*sw,y=oy+(ng?N.ny/384:N.y/688)*sh;const hw=e.offsetWidth/2+6;x=Math.max(hw,Math.min(W-hw,x));if(ng)y=Math.max(14,Math.min(V.clientHeight-16,y));e.style.left=Math.round(x-e.offsetWidth/2)+'px';e.style.top=Math.round(y-e.offsetHeight/2)+'px'}}   // đặt theo điểm ảnh nguyên, không dùng transform, để chữ không bị nhòe
  addEventListener('resize',()=>{if(!M.hidden)fit()});
  // ── vẽ
  function draw(){const q=DD.cur(),b=DD.bac(),ok=q&&DD.done(q);
    // thanh trên
    const av=$('sanhAva');av.innerHTML='';av.appendChild(portrait(CHARS[selChar]&&charUnlocked(selChar)?selChar:'lamphong',80));
    const nm=typeof cloudSt!=='undefined'&&cloudSt.name?cloudSt.name:i18n('tmon.vodanh','Đạo hữu');
    $('sanhWho').querySelector('b').textContent=nm;$('sanhWho').querySelector('span').textContent=i18nf('tmon.bac','Đạo Đồ · Bậc {0} {1}',b,DD_BAC[b-1].n);
    const inB=DD_Q.filter(x=>x.b===b),i0=q?DD_Q.indexOf(q):DD_Q.length,dn=inB.filter(x=>DD_Q.indexOf(x)<i0).length,f=q?Math.round((dn+(ok?1:Math.min(1,DD.val(q)/DD.need(q))*0.9))/inB.length*100):100;
    $('sanhPips').innerHTML=DD_BAC.map((_,i)=>`<i class="${i+1<b?'on':i+1===b?'now':''}"${i+1===b?` style="--f:${f}%"`:''}></i>`).join('');
    $('sanhLt').querySelector('img').src=iconURL('lt');$('sanhLt').querySelector('span').textContent=(SAVE.lt|0).toLocaleString('vi-VN');
    $('sanhVer').textContent=(document.querySelector('#menu .ver')||{textContent:''}).textContent.trim();
    // nơi trong cảnh
    const P=$('sanhPl');P.innerHTML='';
    for(const k in SANH_NOI){const N=SANH_NOI[k];if(!$(N.nut))continue;const open=!N.mo||DD.open(N.mo),cur=open&&q&&!ok&&N.go.includes(q.go),e=document.createElement('button');
      e.className='splq'+(open?'':' lock')+(cur?' cur':'');e.dataset.k=k;
      e.innerHTML=`<img alt="" src="${iconURL(open?N.ic:'lock')}"><span>${N.n}${open?'':`<small>${i18nf('tmon.bacmo','Bậc {0}',DD.moAt(N.mo))}</small>`}</span>`;   // không gắn chấm đỏ lên nơi: linh thạch bế quan nhận ở nút "Bế quan +N" cạnh trái
      e.onclick=()=>{snd();if(open)click(N.nut);else lockMsg(N.mo)};P.appendChild(e)}
    // nút cạnh: nhiệm vụ ngày, bế quan, góp ý
    const S=$('sanhSide');S.innerHTML='';const side=(html,f)=>{const e=document.createElement('button');e.innerHTML=html;e.onclick=()=>{snd();f()};S.appendChild(e);return e};
    if(DD.open('dq'))side(i18n('tmon.nv','Nhiệm vụ ngày')+(typeof dqClaimable==='function'&&dqClaimable()?'<i></i>':''),()=>click('dqB'));
    if(DD.open('dp')&&typeof bqPending==='function'){const p=bqPending();if(p.lt>0)side(i18n('tmon.bq','Bế quan')+` <b>+${p.lt}</b>`,()=>click('bqB'))}
    const F=$('sanhFoot');F.innerHTML='';const foot=(t,id)=>{if(!$(id))return;const e=document.createElement('button');e.textContent=t;e.onclick=()=>{snd();click(id)};F.appendChild(e)};
    foot(i18n('gy.fb.nut','Góp Ý'),'fbB');foot(i18n('gy.ts.nut','Thử App Android'),'tsB');
    // việc tiếp theo
    const Q=$('sanhQ'),go=$('sanhGo');Q.className='spx'+(ok?' ok':'');const T=Q.querySelector('.q');
    if(!q){T.children[0].textContent=i18n('tmon.muctieu','Mục tiêu mùa này');T.children[1].textContent=i18nf('dd.mua','Mục tiêu: Trấn Ấn Lộ tầng {0}',(typeof muaBest==='function'?muaBest():0)+1);T.children[2].textContent=i18n('dd.mua2','Đạo Đồ đã trọn · đi sâu hơn trong mùa này');T.children[3].firstChild.style.width='100%';go.textContent=i18n('tmon.di','Đi')}
    else{const p=DD.prog(q);T.children[0].textContent=ok?i18n('dd.xong','Việc đã xong'):i18n('tmon.viec','Việc tiếp theo');T.children[1].textContent=DD.tit(q);T.children[2].textContent=(p&&!ok?p+' · ':'')+i18n('dd.thuong','thưởng')+' '+DD.rew(q);
      T.children[3].firstChild.style.width=Math.min(100,DD.val(q)/DD.need(q)*100)+'%';go.textContent=ok?i18n('tmon.nhan','Nhận'):i18n('tmon.di','Đi')}
    const nv=$('sanhNav').children,IC=['cave','p_yin','chest','scroll'];for(let i=0;i<4;i++)nv[i].firstChild.src=iconURL(IC[i]);
    fit()}
  $('sanhGo').onclick=()=>{snd();DD.act()};$('sanhQ').querySelector('.q').onclick=()=>{snd();DD.screen()};
  $('sanhWho').onclick=()=>{snd();DD.screen()};$('sanhAva').onclick=()=>{snd();if(typeof gyName==='function')gyName(false)};$('sanhSet').onclick=()=>{snd();click('setB')};
  for(const e of $('sanhNav').children)e.onclick=()=>{const t=e.dataset.t;if(t==='home')return;snd();
    if(t==='tusi')buildSelect();else if(t==='dd')DD.screen();else if(DD.open('gear'))click('gearB');else lockMsg('gear')};
  const _bmS=buildMenu;buildMenu=function(){_bmS();try{draw()}catch(e){console.error(e)}};
  window.sanhDraw=draw;
})();
