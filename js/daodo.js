'use strict';
// ───────────────────────── ĐẠO ĐỒ · XỬ LÝ (js/daodo.js), từ 1.0.76. Dữ liệu và cách thêm việc: js/daodo_data.js.
// Dùng chung cho mọi chế độ. Tắt hẳn để thử: thêm ?dd=0 vào địa chỉ.
// • Lưu: SAVE.dd = {i: số việc đã NHẬN THƯỞNG (cũng là vị trí việc đang làm), leg: 1 nếu là người chơi từ bản cũ (mọi nơi giữ mở), mig: báo gộp một lần}
// • ddOpen(mã): nơi đó đã mở chưa. Sảnh chỉ hiện nút của nơi đã mở (ddGate); màn Trấn Ấn Lộ gọi ddGate() sau khi vẽ (js/tranan/sanh.js).
// • Sảnh: khung #ddBox có đúng một nút chính #ddGo ("Tiếp tục: …" hoặc "Nhận thưởng: …") và nút #ddMore mở màn lộ trình #ddScr.
// • Màn kết trận: khối #ovDD cho biết tiến độ việc đang làm và có nút đi tiếp.
// • Số liệu: mỗi lần nhận thưởng gửi track('dd',{q,i,b}) để biết người chơi dừng ở việc nào.
const DD_ON=typeof DD_Q!=='undefined'&&new URLSearchParams(location.search).get('dd')!=='0';
if(DD_ON){
  for(let i=0;i<DD_BAC.length;i++){const B=DD_BAC[i];B.n=i18n('dd.b.'+(i+1)+'.n',B.n);B.s=i18n('dd.b.'+(i+1)+'.s',B.s)}
  for(const k in DD_MO){DD_MO[k].n=i18n('dd.mo.'+k+'.n',DD_MO[k].n);DD_MO[k].d=i18n('dd.mo.'+k+'.d',DD_MO[k].d)}
  for(const q of DD_Q)q.t=i18n('dd.q.'+q.id,q.t);
  // ── thước đo: đọc thẳng từ dữ liệu lưu, nên người chơi cũ được tính ngay
  const sum=o=>Object.values(o||{}).reduce((a,b)=>a+(b|0),0),mx=(o,f)=>Math.max(0,...Object.values(o||{}).map(f));
  const DD_VAL={
    best:()=>SAVE.best|0, up:()=>sum(SAVE.up), realm:()=>SAVE.bestRealm|0, tl:()=>sum(SAVE.tl),
    eq:()=>Object.keys((SAVE.gear&&SAVE.gear.eq)||{}).length,
    glv:()=>Math.max(0,...((SAVE.gear&&SAVE.gear.items)||[]).map(i=>i.lv|0)),
    ai:()=>aiSave().best|0, dq:()=>SAVE.dq&&SAVE.dq.loginGot?1:0, pet:()=>mx(petSave().lv,v=>v|0), tw:()=>towerSave().best|0,
    ta:()=>Math.max(mx(SAVE.thg&&SAVE.thg.ch,c=>c.best|0),DD_VAL.mua()),
    mua:()=>Math.max(mx(SAVE.mua&&SAVE.mua.ch,c=>c.best|0),...((SAVE.mua&&SAVE.mua.hist)||[]).map(h=>h.best|0)),
    bm:()=>mx(SAVE.thg&&SAVE.thg.ch,c=>sum(c.tree))+mx(SAVE.mua&&SAVE.mua.ch,c=>sum(c.tree)),
  };
  // nút ở sảnh ứng với từng nơi (mã trong DD_MO)
  const DD_NUT={dp:['dpB','bqB'],gear:['gearB'],bk:['bkB'],dq:['dqB'],lb:['lbB'],pet:['petB'],tower:['towerB'],tran:['modeTran'],mua:['coiB','taMua','taLb']};
  const need=q=>q.n||1,val=q=>{try{return DD_VAL[q.v]()|0}catch(e){return 0}},done=q=>val(q)>=need(q);
  const tit=q=>q.t.replace('{0}',q.f==='t'?i18nf('dd.phut','{0} phút',need(q)/60):need(q));
  const prog=q=>need(q)<2?'':q.f==='t'?mmss(Math.min(val(q),need(q)))+' / '+mmss(need(q)):Math.min(val(q),need(q))+'/'+need(q);
  const moL=q=>!q.mo?[]:Array.isArray(q.mo)?q.mo:[q.mo];
  const rew=q=>[q.lt?'+'+q.lt+' ◈':'',q.thao?'+'+q.thao+' '+i18n('mat.thao','Linh Thảo'):'',q.thiet?'+'+q.thiet+' '+i18n('mat.thiet','Tinh Thiết'):'',q.gear?i18n('dd.r.gear','1 Pháp Bảo'):''].filter(Boolean).join(' · ');
  function give(q){let it=null;if(q.lt)SAVE.lt+=q.lt;if(q.thao&&typeof matAdd==='function')matAdd('thao',q.thao);if(q.thiet&&typeof matAdd==='function')matAdd('thiet',q.thiet);
    if(q.gear){const g=SAVE.gear||(SAVE.gear={items:[],eq:{},nid:1});it={id:g.nid++,k:pick(GEAR_KEYS),r:rollRarity(q.gear),lv:1};g.items.push(it)}return it}   // luôn vào kho Thường
  function ddS(){let S=SAVE.dd;if(S)return S;
    S=SAVE.dd={i:0,leg:(SAVE.runs|0)>0?1:0};
    if(S.leg){let n=0,lt=0;while(S.i<DD_Q.length&&done(DD_Q[S.i])){const q=DD_Q[S.i];give(q);lt+=q.lt|0;n++;S.i++}if(n)S.mig={n,lt}}   // người chơi cũ: gộp các việc đã đạt
    else{const H=SAVE.hd||(SAVE.hd={});H.dp=H.dq=1}   // thẻ hướng dẫn cũ của Động Phủ / Nhiệm vụ: nay do Đạo Đồ dẫn
    return S}
  const cur=()=>DD_Q[ddS().i]||null;
  const bac=()=>{const q=cur();return q?q.b:DD_BAC.length};
  const ddOpen=k=>{const S=ddS();if(S.leg)return true;for(let i=0;i<S.i;i++)if(moL(DD_Q[i]).includes(k))return true;return false};
  const moAt=k=>{const q=DD_Q.find(q=>moL(q).includes(k));return q?q.b:1};   // bậc đang làm khi nơi này mở
  window.ddOpen=ddOpen;
  // ── giao diện
  const css=document.createElement('style');
  css.textContent=`.dd{border:2px solid #c9962e;border-radius:12px;background:linear-gradient(#fff6d8,#ffe9b0);padding:6px 8px 8px;margin:6px 0}
.ddh{display:flex;align-items:center;justify-content:space-between;font:800 13.5px var(--font);color:#8a4a10}.ddh button{font:700 12.5px var(--font);color:#0f5a48;background:#e8fff6;border:2px solid #1d8f77;border-radius:9px;padding:2px 9px}
.ddp{display:flex;gap:3px;margin:5px 0 6px}.ddp i{flex:1;height:7px;border-radius:4px;background:#ecd9a8}.ddp i.on{background:linear-gradient(#ffcf4a,#e08a1a)}.ddp i.now{background:linear-gradient(90deg,#e08a1a var(--f,0%),#ecd9a8 var(--f,0%))}
#ddGo{margin:0;font-size:18px;line-height:1.2;padding:9px 8px}#ddGo small{display:block;font-size:12.5px;font-weight:700;opacity:.85}#ddGo.ok{background:linear-gradient(#b9ffd9,#3fd08a);border-color:#0f6a48;box-shadow:0 4px 0 #0f6a48;color:#064a30;animation:ddG 1.1s ease-in-out infinite}
@keyframes ddG{50%{filter:brightness(1.12)}}
#menu.ddon .sub{display:none}#menu.ddon #playB{font-size:17px;padding:7px 10px}#menu.ddon #hdB{font-size:17px;padding:7px 10px}
#ddPop{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(30,40,70,.6)}#ddPop[hidden]{display:none}
#ddPop .card{text-align:center}#ddPop h2{margin:0 0 2px}#ddPop .ddq{font:700 15px var(--font);color:var(--ink2);margin:0 0 8px}#ddPop .ddr{font:800 17px var(--font);color:#a8601a;margin:6px 0}
#ddPop .ddm{border:2px solid #1d8f77;background:#effff9;border-radius:10px;padding:6px 8px;margin:8px 0;text-align:left;font-size:14px;line-height:1.4;color:#0f4a3a}#ddPop .ddm b{display:block;font-size:15.5px}
#ddPop .ddb{border:2px solid #c9962e;background:#fff3cf;border-radius:10px;padding:8px;margin:8px 0;font-size:14.5px;line-height:1.5;color:var(--ink)}#ddPop .ddb b{display:block;font-size:19px;color:#b8301a;margin-bottom:3px}
#ddList{margin:6px 0}.ddr9{border:2px solid #e8c98a;border-radius:10px;padding:6px 8px;margin:6px 0;background:rgba(255,250,235,.6)}.ddr9.now{border-color:#c9962e;background:#fff3cf}.ddr9.lock{opacity:.62}
.ddr9 h3{margin:0;font:800 15.5px var(--font);color:#8a4a10;display:flex;justify-content:space-between}.ddr9 h3 small{font-size:12px;color:var(--ink2);font-weight:700}.ddr9 .mo{font-size:12.5px;color:#0f5a48;font-weight:700}
.ddq1{display:flex;gap:6px;align-items:baseline;font-size:13.5px;line-height:1.35;margin:3px 0;color:var(--ink)}.ddq1 i{font-style:normal;flex:none;width:16px;text-align:center;font-weight:800;color:#b9a070}.ddq1.ok{color:var(--ink2)}.ddq1.ok i{color:#1d8f77}.ddq1.cur{font-weight:800}.ddq1.cur i{color:#e08a1a}.ddq1 small{margin-left:auto;flex:none;color:var(--ink2);font-weight:700}
#ovDD{border:2px solid #c9962e;border-radius:10px;background:#fff3cf;padding:6px 8px;margin:8px 0;font-size:14px;line-height:1.35;color:var(--ink)}#ovDD b{color:#8a4a10}#ovDD .taxp2{height:6px;border-radius:4px;background:#ecd9a8;overflow:hidden;margin:4px 0}#ovDD .taxp2 i{display:block;height:100%;background:linear-gradient(#ffcf4a,#e08a1a)}#ovDD .btn{margin:6px 0 0;font-size:16px;padding:7px}#ovDD.ok{border-color:#1d8f77;background:#effff9}
@media (orientation:portrait) and (max-height:720px){#menu.ddon #logoC{display:none}}
@media (orientation:landscape) and (max-height:560px){.dd{margin:0 0 4px;padding:4px 6px 6px}#ddGo{font-size:15px;padding:6px}.ddp{margin:3px 0 4px}#menu.ddon #logoC{display:none}#menu.ddon h1{font-size:21px;line-height:1.05}#ddGo small{font-size:11.5px}#ddScr .card{width:min(700px,100%)}}`;
  document.head.appendChild(css);
  const box=elx('div','dd',`<div class="ddh"><span id="ddBac"></span><button id="ddMore">${i18n('dd.lotrinh','Lộ trình')}</button></div><div class="ddp" id="ddPips"></div><button id="ddGo" class="btn"></button>`);box.id='ddBox';
  $('bqB').insertAdjacentElement('beforebegin',box);$('menu').classList.add('ddon');
  const scr=elx('div','screen bg',`<div class="card"><h2>${i18n('dd.ten','Đạo Đồ')}</h2><p class="sub">${i18n('dd.phu','Con đường tu hành của đạo hữu. Làm xong việc đang sáng để đi tiếp.')}</p><div id="ddList"></div><button id="ddBack" class="btn alt">${i18n('ui.html.quayLai','Quay lại')}</button></div>`);
  scr.id='ddScr';scr.hidden=true;$('select').insertAdjacentElement('afterend',scr);SCREENS.push('ddScr');
  const pop=elx('div','','<div class="card"></div>');pop.id='ddPop';pop.hidden=true;document.body.appendChild(pop);
  const ovd=elx('div','');ovd.id='ovDD';$('ovMenu').closest('.row').insertAdjacentElement('beforebegin',ovd);
  // ── khóa mở ở sảnh và ở màn Trấn Ấn Lộ
  function ddGate(){for(const k in DD_NUT){const ok=ddOpen(k);for(const id of DD_NUT[k]){const e=$(id);if(e)e.hidden=!ok}}
    const tr=$('modeTran');if(tr&&!$('hdB'))tr.hidden=true;
    for(const r of document.querySelectorAll('#menu .row,#tran .row'))if(r.children.length)r.hidden=[...r.children].every(c=>c.hidden);
    if(!ddOpen('mua')&&SAVE.coi==='mua')SAVE.coi='thuong'}
  window.ddGate=ddGate;
  // ── đi tới nơi làm việc
  function ddGoTo(g,q){
    if(g==='play'||g==='tl'){if(q&&q.v==='ai'&&typeof aiUnlocked==='function'){const S=aiSave(),n=Math.min(need(q),S.best+1);S.sel=n}buildSelect();if(g==='tl')toast(i18n('dd.go.tl','Bấm nút Tu Luyện dưới chân dung tu sĩ'))}
    else if(g==='dp')buildDongPhu();
    else if(g==='tran'||g==='mua'){if(g==='mua'&&typeof coiSet==='function'&&ddOpen('mua'))coiSet('mua');const b=$('hdB');if(b)b.click();else buildSelect()}
    else{const b=$({gear:'gearB',pet:'petB',dq:'dqB',tower:'towerB',bk:'bkB'}[g]);if(b)b.click()}}
  // ── nhận thưởng
  function ddClaim(){const S=ddS(),q=cur();if(!q||!done(q))return false;const b0=q.b,it=give(q);S.i++;const nx=cur(),up=!nx||nx.b>b0,mo=moL(q);
    if(typeof hdSave==='function'){if(mo.includes('dp'))hdSave().dp=1;if(mo.includes('dq'))hdSave().dq=1}
    saveSave();sfx(up?'realm':'coin');if(typeof track==='function')track('dd',{q:q.id,i:S.i,b:bac()});
    const C=pop.firstChild,B=nx?DD_BAC[nx.b-1]:null;
    let h=`<h2>${i18n('dd.xong','Việc đã xong')}</h2><p class="ddq">${tit(q)}</p><div class="ddr">${rew(q)}${it?' <small>('+GRAR[it.r].n+' · '+GEAR[it.k].n+')</small>':''}</div>`;
    if(up&&nx)h+=`<div class="ddb"><b>${i18nf('dd.len','Đạo Đồ · Bậc {0}: {1}',nx.b,B.n)}</b>${B.s}</div>`;   // truyện trước, rồi mới tới thứ được mở
    for(const k of mo)h+=`<div class="ddm"><b>${i18nf('dd.mo','Mở: {0}',DD_MO[k].n)}</b>${DD_MO[k].d}</div>`;
    if(!nx)h+=`<div class="ddb"><b>${i18n('dd.het','Đã đi hết Đạo Đồ')}</b>${i18n('dd.het2','Từ đây mục tiêu là tầng sâu hơn của mỗi mùa giải.')}</div>`;
    const g=mo.map(k=>DD_MO[k].go).find(Boolean);
    h+=`<div class="row">${g?`<button id="ddSee" class="btn alt">${i18nf('dd.toi','Tới {0}',DD_MO[mo.find(k=>DD_MO[k].go)].n)}</button>`:''}<button id="ddOk" class="btn">${i18n('dd.tiep','Tiếp')}</button></div>`;
    C.innerHTML=h;pop.hidden=false;
    $('ddOk').onclick=()=>{sfx('click');pop.hidden=true;buildMenu()};
    if(g)$('ddSee').onclick=()=>{sfx('click');pop.hidden=true;buildMenu();ddGoTo(g)};
    return true}
  // nút chính: nhận thưởng nếu việc đã xong, không thì đi làm
  function ddAct(){const q=cur();if(!q){ddGoTo(ddOpen('mua')?'mua':'tran');return}if(!ddClaim())ddGoTo(q.go,q)}
  // ── vẽ khung ở sảnh
  function ddDraw(){const S=ddS(),q=cur(),b=bac(),go=$('ddGo');
    $('ddBac').textContent=i18nf('dd.bac','Đạo Đồ · Bậc {0}: {1}',b,DD_BAC[b-1].n);
    const inB=DD_Q.filter(x=>x.b===b),dn=inB.filter(x=>DD_Q.indexOf(x)<S.i).length,f=q?Math.round((dn+(done(q)?1:Math.min(1,val(q)/need(q))*0.9))/inB.length*100):100;
    $('ddPips').innerHTML=DD_BAC.map((_,i)=>`<i class="${i+1<b?'on':i+1===b?'now':''}"${i+1===b?` style="--f:${f}%"`:''}></i>`).join('');
    if(!q){const t=(typeof muaBest==='function'?muaBest():0)+1;go.className='btn';go.innerHTML=i18nf('dd.mua','Mục tiêu: Trấn Ấn Lộ tầng {0}',t)+`<small>${i18n('dd.mua2','Đạo Đồ đã trọn · đi sâu hơn trong mùa này')}</small>`}
    else if(done(q)){go.className='btn ok';go.innerHTML=i18n('dd.nhan','Nhận thưởng')+`<small>${tit(q)} · ${rew(q)}</small>`}
    else{const p=prog(q);go.className='btn';go.innerHTML=i18n('dd.tieptuc','Tiếp tục')+': '+tit(q)+`<small>${p?p+' · ':''}${i18n('dd.thuong','thưởng')} ${rew(q)}</small>`}
    if(S.mig){const m=S.mig;delete S.mig;saveSave();setTimeout(()=>toast(i18nf('dd.gop','Đạo Đồ ghi nhận {0} việc đạo hữu đã làm: +{1} linh thạch',m.n,m.lt)),900)}}
  // ── màn lộ trình
  function ddScreen(){const S=ddS(),b=bac(),L=$('ddList');L.innerHTML='';
    DD_BAC.forEach((B,i)=>{const n=i+1,qs=DD_Q.filter(q=>q.b===n),mo=Object.keys(DD_MO).filter(k=>moAt(k)===n).map(k=>DD_MO[k].n);
      const r=elx('div','ddr9'+(n===b?' now':n>b?' lock':''),`<h3><span>${i18nf('dd.bacN','Bậc {0} · {1}',n,B.n)}</span><small>${n<b?i18n('dd.da','đã qua'):n===b?i18n('dd.dang','đang ở đây'):i18nf('dd.viec','{0} việc',qs.length)}</small></h3>${mo.length?`<div class="mo">${i18nf('dd.momo','Mở trong bậc này: {0}',mo.join(', '))}</div>`:''}`);
      if(n===b)for(const q of qs){const j=DD_Q.indexOf(q),ok=j<S.i,c=j===S.i;r.appendChild(elx('div','ddq1'+(ok?' ok':c?' cur':''),`<i>${ok?'✓':c?'▸':'·'}</i><span>${tit(q)}</span><small>${c?(prog(q)||''):''}</small>`))}
      L.appendChild(r)});
    show('ddScr');const nw=L.querySelector('.now');if(nw)nw.scrollIntoView({block:'center'})}
  // ── màn kết trận
  function ddOver(){const q=cur();if(!q){ovd.hidden=true;return}ovd.hidden=false;const ok=done(q),p=prog(q);ovd.className=ok?'ok':'';
    ovd.innerHTML=`<b>${i18n('dd.ten','Đạo Đồ')}</b> · ${tit(q)}${ok?' · '+i18n('dd.xong2','đã xong'):p?' · '+p:''}<div class="taxp2"><i style="width:${Math.min(100,val(q)/need(q)*100)}%"></i></div>${ok||q.go!=='play'?`<button class="btn${ok?'':' alt'}">${ok?i18n('dd.nhan','Nhận thưởng')+' · '+rew(q):i18n('dd.lam','Làm việc này')}</button>`:''}`;   // việc làm ngay trong trận thì nút "Chơi lại" sẵn có là đủ
    const bt=ovd.querySelector('button');if(bt)bt.onclick=()=>{sfx('click');G=null;buildMenu();ddAct()}}
  // ── nối vào game
  $('ddGo').addEventListener('click',()=>{if(typeof audioInit==='function')audioInit();sfx('click');ddAct()});
  $('ddMore').addEventListener('click',()=>{sfx('click');ddScreen()});$('ddBack').addEventListener('click',()=>{sfx('click');buildMenu()});
  const _bmDD=buildMenu;buildMenu=function(){_bmDD();try{ddGate();ddDraw()}catch(e){console.error(e)}};
  const _ovDD=showOver;showOver=function(){_ovDD();try{ddOver()}catch(e){console.error(e)}};
  Object.assign(window,{ddS,ddAct,ddClaim,ddScreen,ddCur:cur});   // cho công cụ kiểm thử
  window.DD={cur,bac,done,val,need,tit,prog,rew,moAt,open:ddOpen,act:ddAct,screen:ddScreen,first:k=>DD_Q.find(q=>moL(q).includes(k))};   // cho sảnh tông môn (js/sanh.js)
}
