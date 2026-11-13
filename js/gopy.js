'use strict';
// ───────────────────────── Góp ý, đăng ký thử app Android, đặt đạo hiệu lần đầu (10/2026)
// Gửi lên /api/feedback và /api/tester (functions/api/[[path]].js, bảng feedback/testers trong D1).
const GY_APP=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
const gyVer=()=>{const v=document.querySelector('#menu .ver');return v?v.textContent.replace(/[^\d.]/g,''):''};
(function(){const st=document.createElement('style');st.textContent=`
#gyO{z-index:60}#gyO .card{display:grid;gap:8px}#gyO h2{margin:0;text-align:center}
#gyO textarea,#gyO input[type=text],#gyO input[type=email]{width:100%;padding:8px 10px;border:2px solid #e8c98a;border-radius:10px;font:16px var(--font);background:#fff;color:var(--ink)}
#gyO textarea{min-height:120px;resize:vertical}
#gyO .gyk{display:flex;gap:6px}#gyO .gyk button{flex:1;padding:7px 4px;border:2px solid #1d8f77;border-radius:10px;background:#e8fff6;color:#0f5a48;font:800 15px var(--font)}
#gyO .gyk button.on{background:#1d8f77;color:#fff}
#gyO .help{font-size:14px;color:var(--ink2);margin:0;text-align:center}#gyO .err{color:#c8202a;font-size:14px;text-align:center;min-height:18px}
#gyO .nmr{display:flex;gap:6px}#gyO .nmr input{flex:1}#gyO .nmr button{width:48px;border:2px solid #e0a83a;border-radius:10px;background:#fff6dc;font-size:22px}
#gyO .gyc{text-align:center;font-weight:800;color:#0f5a48}
#menu .gyrow .btn{font-size:16px;padding:8px 6px}
#mName{display:block;text-align:center;font-size:15px;color:var(--ink2);margin:-4px 0 6px;cursor:pointer}#mName b{color:#7a4a10}`;document.head.appendChild(st)})();
function gyOpen(build){let o=$('gyO');if(!o){o=document.createElement('div');o.id='gyO';o.className='screen dim enter';document.body.appendChild(o)}
  o.innerHTML='';const c=elx('div','card');o.appendChild(c);o.hidden=false;build(c);return c}
function gyClose(){const o=$('gyO');if(o)o.hidden=true}

// ── tên gợi ý (Hán Việt vừa phải)
const GY_HO=['Lâm','Tô','Lạc','Vân','Bạch','Hàn','Lý','Trần','Diệp','Mộc','Thạch','Phong','Nguyễn','Đoàn','Hoàng','Mạc'];
const GY_TEN=['Phong','Vân','Tuyết','Kiếm','Nguyệt','Thanh','Minh','Dao','Hà','Sơn','Linh','Thiên','Hải','Vũ','Lam','An','Khê','Trúc','Hiên','Tâm'];
const gyRand=()=>{const r=a=>a[(Math.random()*a.length)|0];return r(GY_HO)+' '+r(GY_TEN)+(Math.random()<0.4?' '+r(GY_TEN):'')};

// ── đặt đạo hiệu: lần đầu mở game, hoặc chạm vào tên ở sảnh
function gyName(first){gyOpen(c=>{
  c.appendChild(elx('h2','',first?i18n('gy.nm.t1','Chào mừng đạo hữu'):i18n('gy.nm.t2','Đổi đạo hiệu')));
  c.appendChild(elx('p','help',i18n('gy.nm.sub','Đạo hiệu hiện trên bảng xếp hạng và khi đồng bộ đám mây.')));
  const r=elx('div','nmr'),inp=document.createElement('input');inp.type='text';inp.maxLength=18;inp.placeholder=i18n('gy.nm.ph','Nhập đạo hiệu');
  inp.value=cloudSt.nameSet?cloudSt.name:'';const dc=elx('button','','🎲');dc.title=i18n('gy.nm.rand','Gợi ý ngẫu nhiên');dc.onclick=()=>{inp.value=gyRand();err.textContent=''};
  r.append(inp,dc);c.appendChild(r);const err=elx('div','err','');c.appendChild(err);
  const ok=elx('button','btn',first?i18n('gy.nm.go','Bắt đầu tu tiên'):i18n('gy.nm.save','Lưu'));c.appendChild(ok);
  if(!first){const bk=elx('button','btn alt',i18n('ui.html.quayLai','Quay lại'));bk.onclick=gyClose;c.appendChild(bk)}
  const done=()=>{const n=inp.value.replace(/[\u0000-\u001f<>]/g,'').trim();
    if(n.length<2){err.textContent=i18n('gy.nm.short','Đạo hiệu cần ít nhất 2 ký tự');return}
    cloudSt.name=n.slice(0,18);cloudSt.nameSet=1;cloudKeep();if(cloudOn())cloudPush(true);gyClose();gyMenuName();
    if(first)toast(i18nf('gy.nm.hi','Chào {0}, chúc đạo hữu sớm phi thăng!',cloudSt.name));if(typeof track==='function')track('name',{first:!!first})};
  ok.onclick=done;inp.onkeydown=e=>{if(e.key==='Enter')done()};
  setTimeout(()=>{if(!first)inp.focus()},50)})}
function gyMenuName(){let s=$('mName');const m=$('menu');if(!m)return;
  if(!s){s=document.createElement('span');s.id='mName';s.onclick=()=>gyName(false);const st=m.querySelector('.stat');st.parentNode.insertBefore(s,st)}
  s.innerHTML=i18nf('gy.nm.lbl','Đạo hiệu: {0} ✎',`<b>${cloudSt.name.replace(/[<>&]/g,'')}</b>`);
  const who=$('sanhWho');if(who){const b=who.querySelector('b');if(b)b.textContent=cloudSt.name}}

// ── góp ý
function gyFeedback(){let kind='gopy';gyOpen(c=>{
  c.appendChild(elx('h2','',i18n('gy.fb.t','Góp Ý')));
  c.appendChild(elx('p','help',i18n('gy.fb.sub','Gặp lỗi, muốn thêm gì, hay chỉ muốn khen? Mọi góp ý đều được đọc.')));
  const k=elx('div','gyk');for(const [id,lb] of [['loi',i18n('gy.fb.loi','Báo lỗi')],['gopy',i18n('gy.fb.gopy','Góp ý')],['khen',i18n('gy.fb.khen','Khen')]]){
    const b=elx('button',id===kind?'on':'',lb);b.onclick=()=>{kind=id;[...k.children].forEach(x=>x.classList.toggle('on',x===b))};k.appendChild(b)}
  c.appendChild(k);
  const ta=document.createElement('textarea');ta.maxLength=1000;ta.placeholder=i18n('gy.fb.ph','Viết góp ý ở đây…');c.appendChild(ta);
  const ct=document.createElement('input');ct.type='text';ct.maxLength=80;ct.placeholder=i18n('gy.fb.lh','Email/Facebook để nhận trả lời (tùy chọn)');c.appendChild(ct);
  const err=elx('div','err','');c.appendChild(err);
  const r=elx('div','row'),bk=elx('button','btn alt',i18n('ui.html.quayLai','Quay lại')),go=elx('button','btn',i18n('gy.gui','Gửi'));r.append(bk,go);c.appendChild(r);bk.onclick=gyClose;
  go.onclick=async()=>{const msg=ta.value.trim();if(msg.length<3){err.textContent=i18n('gy.fb.ngan','Viết thêm chút nữa nha');return}
    if(!cloudOn()){err.textContent=i18n('gy.offline','Chưa kết nối được máy chủ, thử lại sau nha');return}
    go.disabled=true;err.textContent='';
    try{await api('/feedback',{method:'POST',body:{id:cloudSt.id,name:cloudSt.name,kind,msg,contact:ct.value.trim(),ver:gyVer(),plat:GY_APP?'android':'web',lang:(typeof CUR_LANG!=='undefined'?CUR_LANG:''),ua:navigator.userAgent.slice(0,160),
      info:{runs:SAVE.runs||0,wins:SAVE.wins||0,w:innerWidth,h:innerHeight,fx:typeof FXQ!=='undefined'?FXQ:null}}});
      gyClose();toast(i18n('gy.fb.ok','Đã gửi góp ý. Cảm ơn đạo hữu!'))}
    catch(e){go.disabled=false;err.textContent=e.status===429?i18n('gy.nhieu','Gửi hơi nhiều rồi, nghỉ chút rồi gửi tiếp nha'):i18n('gy.offline','Chưa kết nối được máy chủ, thử lại sau nha')}}})}

// ── đăng ký thử app Android (chỉ hiện trên bản web)
function gyTester(){gyOpen(c=>{
  c.appendChild(elx('h2','',i18n('gy.ts.t','Thử App Android')));
  c.appendChild(elx('p','help',i18n('gy.ts.sub','App Android đang thử kín trên Google Play. Để lại Gmail (tài khoản dùng trên điện thoại Android), khi mở thử sẽ có thư mời gửi tới.')));
  const cnt=elx('div','gyc','');c.appendChild(cnt);
  if(cloudOn())api('/tester').then(r=>{if(r&&r.n!=null)cnt.textContent=i18nf('gy.ts.dem','Đã có {0} đạo hữu đăng ký',r.n)}).catch(()=>{});
  const em=document.createElement('input');em.type='email';em.maxLength=80;em.placeholder='ten@gmail.com';em.autocomplete='email';c.appendChild(em);
  const err=elx('div','err','');c.appendChild(err);
  c.appendChild(elx('p','help',i18n('gy.ts.rieng','Email chỉ dùng để mời thử app, không hiện công khai và không gửi quảng cáo.')));
  const r=elx('div','row'),bk=elx('button','btn alt',i18n('ui.html.quayLai','Quay lại')),go=elx('button','btn',i18n('gy.ts.dk','Đăng ký'));r.append(bk,go);c.appendChild(r);bk.onclick=gyClose;
  go.onclick=async()=>{const e=em.value.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){err.textContent=i18n('gy.ts.sai','Email chưa đúng');return}
    if(!/@(gmail|googlemail)\.com$/.test(e)&&!err.dataset.warn){err.dataset.warn=1;err.textContent=i18n('gy.ts.gmail','Google Play cần email của tài khoản Google. Nếu đây đúng là tài khoản Google thì bấm Đăng ký lần nữa.');return}
    if(!cloudOn()){err.textContent=i18n('gy.offline','Chưa kết nối được máy chủ, thử lại sau nha');return}
    go.disabled=true;
    try{const r=await api('/tester',{method:'POST',body:{email:e,id:cloudSt.id,name:cloudSt.name,lang:(typeof CUR_LANG!=='undefined'?CUR_LANG:'')}});
      try{localStorage.setItem('vktt_tester',e)}catch(_){}
      gyClose();toast(r.dup?i18n('gy.ts.dup','Email này đã đăng ký rồi, chờ thư mời nha'):i18n('gy.ts.ok','Đã đăng ký thử app. Cảm ơn đạo hữu!'))}
    catch(x){go.disabled=false;err.textContent=x.status===429?i18n('gy.nhieu','Gửi hơi nhiều rồi, nghỉ chút rồi gửi tiếp nha'):i18n('gy.offline','Chưa kết nối được máy chủ, thử lại sau nha')}}})}

// ── nút ở sảnh + hỏi tên lần đầu
(function(){const m=$('menu');if(!m)return;const set=$('setB');const row=set&&(set.closest('.row')||set);   // chèn ngay sau nút Cài đặt, luôn nằm TRONG thẻ sảnh
  const r=elx('div','row gyrow'),fb=elx('button','btn alt',i18n('gy.fb.nut','Góp Ý'));fb.id='fbB';fb.onclick=gyFeedback;r.appendChild(fb);
  if(!GY_APP){const ts=elx('button','btn alt',i18n('gy.ts.nut','Thử App Android'));ts.id='tsB';ts.onclick=gyTester;r.appendChild(ts)}
  if(row)row.parentNode.insertBefore(r,row.nextSibling);
  gyMenuName();
  if(!cloudSt.nameSet){const iv=setInterval(()=>{if(!m.hidden&&!G){clearInterval(iv);gyName(true)}},400)}
})();
// gợi ý hướng dẫn không chen lên trên hộp đặt tên / góp ý
if(typeof hdBusy==='function'){const _hdbGY=hdBusy;hdBusy=function(){const o=$('gyO');return (o&&!o.hidden)||_hdbGY()}}
