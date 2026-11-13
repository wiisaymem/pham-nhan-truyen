'use strict';
// ───────────────────────── TRẤN ẤN LỘ · GIAO DIỆN TRONG TRẬN (js/tranan/ui.js)
// Nút ĐÁNH và Chiêu 2, lớp phủ #hdOv (chọn ấn, bảng chiêu, hướng dẫn lần đầu, "có gì mới", cảnh kết chương V).
if(TA){
  const {AN,W2}=TA,hdSkill2=()=>TA.skill2(),hdApply=()=>TA.apply();
  const css=document.createElement('style');
  css.textContent=`#hdOv{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(11,7,20,.88);padding:16px;box-sizing:border-box}
#hdOv{overflow-y:auto}#hdOv[hidden]{display:none}
@media (orientation:landscape) and (max-height:560px){#hdOv{flex-flow:row wrap;align-content:center;justify-content:center;gap:8px;padding:8px}#hdOv h2{flex-basis:100%;font-size:19px;margin:0}#hdOv h2 small{display:inline;margin-left:8px}.hdc{width:min(46vw,380px);padding:8px 10px;font-size:13px}.hdc img{width:36px;height:36px}.hdc b{font-size:15px}#hdLbl{top:60px!important}
  .hdm #hdAtk{width:72px;height:72px}.cdb{width:52px;height:52px}#tkB{width:56px;height:56px}}#hdOv h2{margin:0 0 4px;font:800 24px var(--font);color:#f3e2ff;text-shadow:2px 2px 0 #2a1050;text-align:center}#hdOv h2 small{display:block;font-size:13px;color:#c9b8ff;font-weight:700}
.hdc{width:min(92vw,380px);display:flex;gap:12px;align-items:center;text-align:left;padding:12px 14px;border-radius:14px;border:3px solid #b48cff;background:linear-gradient(#fbf6ff,#eadcff);font:700 14px var(--font);color:#3a2460;box-shadow:0 4px 0 #2a1050;cursor:pointer}
.hdc:active{transform:translateY(2px);box-shadow:0 2px 0 #2a1050}.hdc img{width:44px;height:44px;image-rendering:pixelated;flex:none}.hdc b{display:block;font-size:17px;color:#2a1050}.hdc i{font-style:normal;color:#8a5ad0;font-size:12px;margin-left:6px}
.hdc em{display:block;font-style:normal;color:#b8501a;font-size:12.5px;margin-top:3px}.hdc.door{border-color:#e0a83a;background:linear-gradient(#fffbe0,#ffe9b8);color:#5a3a08}.hdc.door b{color:#5a2a00}
#hdLbl{position:absolute;left:0;right:0;top:46px;text-align:center;font:800 13px var(--font);color:#e8dcff;text-shadow:1px 1px 0 #2a1050;pointer-events:none;display:none}
#hdAtk,#hd2B{display:none}.hdm #hdLbl{display:block}.hdm #slots{visibility:hidden}.cdb::before{content:attr(data-n);position:absolute;left:0;right:0;top:4px;z-index:2;font:800 8.5px var(--font);color:#fff;text-shadow:1px 1px 0 #000,-1px 0 0 #000;text-align:center;pointer-events:none}.cdb img{margin-top:9px!important}#hdTier{display:flex;gap:8px;align-items:center;justify-content:center;margin:6px 0;font:800 15px var(--font);color:#5a3a08}#hdTier button{width:40px;height:36px;border-radius:9px;border:2px solid #c8901a;background:#fff1c8;font:800 18px var(--font);color:#5a3a08}#hdTier small{display:block;font-size:11px;color:#8a6a3a;font-weight:700}#coiB small{font-weight:700}
.hdm #hdAtk{display:block;pointer-events:auto;flex:none;width:82px;height:82px;border-radius:50%;border:3px solid #fff;background:radial-gradient(circle,#ff7a5a 0,#c8302a 70%);box-shadow:0 3px 0 rgba(0,0,0,.5);font:800 17px var(--font);color:#fff;text-shadow:1px 1px 0 #5a0a0a;padding:0;touch-action:none;-webkit-tap-highlight-color:transparent}
.hdm #hdAtk.on{transform:scale(.93);filter:brightness(1.2)}.hdm #hd2B{display:block;margin-right:104px;margin-bottom:-50px}
.hdm #cdBox{bottom:calc(max(8px,env(safe-area-inset-bottom)) + 96px)}.hdm #burstB{width:60px!important;height:60px!important}`;
  document.head.appendChild(css);
  const ov=document.createElement('div');ov.id='hdOv';ov.hidden=true;document.body.appendChild(ov);
  const lbl=document.createElement('div');lbl.id='hdLbl';$('hud').appendChild(lbl);
  const atk=document.createElement('button');atk.id='hdAtk';atk.textContent=i18n('hd.danh','ĐÁNH');$('bot').appendChild(atk);
  const b2=document.createElement('button');b2.id='hd2B';b2.className='cdb';b2.innerHTML='<img alt=""><i></i><b></b>';$('cdBox').insertBefore(b2,$('cdBox').firstChild);
  const hold=v=>e=>{e.stopPropagation();e.preventDefault();TA.hold=v;atk.classList.toggle('on',v);if(v){if(typeof audioInit==='function')audioInit();try{atk.setPointerCapture(e.pointerId)}catch(_){}}};
  atk.addEventListener('pointerdown',hold(true));atk.addEventListener('pointerup',hold(false));atk.addEventListener('pointercancel',hold(false));atk.addEventListener('lostpointercapture',()=>{TA.hold=false;atk.classList.remove('on')});
  b2.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();hdSkill2()});
  addEventListener('keydown',e=>{if(!G||!G.hd||e.repeat)return;if(e.code==='KeyJ')TA.hold=true;else if(e.code==='KeyU'||e.code==='KeyI')hdSkill2()});
  addEventListener('keyup',e=>{if(e.code==='KeyJ')TA.hold=false});
  const card=(cls,ic,title,tag,desc,f)=>{const b=document.createElement('button');b.className='hdc '+cls;b.innerHTML=`<img src="${iconURL(ic)}" alt=""><span><b>${title}${tag?`<i>${tag}</i>`:''}</b>${desc}</span>`;b.onclick=()=>{sfx('click');f()};return b};
  function showBoons(){
    const H=G.hd;G.paused=true;ov.innerHTML=`<h2>${i18n('hd.chonan','Chọn một ấn')}<small>${i18n('hd.tinhanh2','Hạ tinh anh, nhận một ấn cho tới hết tầng này')}</small></h2>`;
    const L=AN.slice().sort(()=>rand()-.5).slice(0,3);
    for(const a of L){const lv=H.b[a.id]|0;ov.appendChild(card('',a.ic,a.n(),lv?i18nf('hd.cap','cấp {0} → {1}',lv,lv+1):i18n('hd.moi','mới'),a.d()+bmSynText(a.id),()=>{H.b[a.id]=lv+1;bmSyn(H.b);if(a.id==='moc'){recompute();const P=G.p;P.hp=Math.min(P.mhp,P.hp+Math.ceil(P.mhp*0.22))}else recompute();hdApply();sfx('levelup');ov.hidden=true;G.paused=false}))}
    ov.hidden=false;
  }
  function kyTake(i){const S=kySave();(S.tranan||(S.tranan={}))[i]=1;saveSave()}
  function showEnding(){
    kyTake(5);G.paused=true;const F=KYUC.tranan.m[5];
    ov.innerHTML=`<h2>${KYUC.tranan.ch}<small>6/6 · ${F[0]}</small></h2><div class="hdc" style="cursor:default;display:block;line-height:1.5;font-size:15px">${F[1]}</div>`;
    ov.appendChild(card('door','seal',i18n('hd.ketthuc','Ngày mai'),'','',()=>{ov.hidden=true;G.paused=false;endRun(true)}));ov.hidden=false;sfx('realm');
  }
  // ── bảng "có gì mới": hiện một lần cho người đã từng chơi
  const NEWS='1.0.70';
  function showNews(){
    ov.innerHTML=`<h2>${i18n('tin.ten','Có gì mới')}<small>${i18n('tin.phu','Bản cập nhật lớn')}</small></h2>`;
    const L=[['trophy',i18n('tin.6','Xếp hạng mùa và biến dị'),i18n('tin.6d','Trấn Ấn Lộ có bảng xếp hạng mùa trên máy chủ, thưởng linh thạch cuối mùa theo hạng Đồng tới Thiên. Từ tầng 4 mỗi tầng mang biến dị riêng; tầng cao rơi Pháp Bảo hai dòng phụ. Độ khó đã chỉnh lại để leo được xa hơn.')],
      ['cave',i18n('tin.5','Hai chế độ tách riêng'),i18n('tin.5d','Thiên Kiếp chơi như trước: không cây kỹ năng, luôn dùng kho Pháp Bảo Thường. Trấn Ấn Lộ có khu riêng ở sảnh: chọn cõi, tầng, Bản Mệnh Đồ và kho Pháp Bảo của mùa ở đó.')],
      ['seal',i18n('tin.1','Trấn Ấn Lộ'),i18n('tin.1e','Chế độ hành động leo tầng vô hạn: mỗi tầng một hầm ngục 5 phút, tự tay Đánh, lướt, tung chiêu. Chọn cõi Mùa giải (reset mỗi 3 tháng, kho đồ riêng) hoặc Thường.')],
      ['p_yin',i18n('tin.2','Bản Mệnh Đồ'),i18n('tin.2e','Cây kỹ năng cho cả 6 tu sĩ, mỗi người 3 lối chơi. Lên cấp ở Trấn Ấn Lộ để nhận điểm; mỗi nút nâng được nhiều bậc.')],
      ['scroll',i18n('tin.4','Ký Ức chương V'),i18n('tin.4e','Sáu mảnh ký ức mới, nhận khi vượt các tầng 1, 3, 5, 7, 9; đoạn kết ở tầng 10.')]];
    for(const [ic,n,d] of L){const c=card('',ic,n,'',d,()=>{});c.style.cursor='default';ov.appendChild(c)}
    ov.appendChild(card('door','cave',i18n('tin.ok','Đã hiểu'),'','',()=>{ov.hidden=true}));ov.hidden=false}
  // ── hướng dẫn lần đầu vào chuyến
  function showHelp(){
    if(!SAVE.talHelp){SAVE.talHelp=1;saveSave();G.paused=true;
      ov.innerHTML=`<h2>${i18n('hd.ten2','Trấn Ấn Lộ')}<small>${i18n('hd.hd0b','Leo tầng vô hạn · mỗi tầng 5 phút · hạ quái cho đầy tiến độ, rồi hạ thủ lĩnh')}</small></h2>`;
      const L=[['sword',i18n('hd.hd1','ĐÁNH'),i18n('hd.hd1d','Giữ nút để đánh liên hoàn, tự ngắm yêu quái gần nhất. Đòn cuối chuỗi mạnh nhất. (phím J)')],
        ['p_boot',i18n('hd.hd2','Thân pháp'),i18n('hd.hd2d','Lướt né theo hướng đang chạy, bất tử trong lúc lướt. (phím K hoặc Shift)')],
        ['kiemkhi',i18n('hd.hd3','Tuyệt kỹ và Chiêu 2'),i18n('hd.hd3d','Hai chiêu mạnh có hồi chiêu. (phím L và U)')],
        ['seal',i18n('hd.hd4b','Lên cấp và leo tầng'),i18n('hd.hd4be','Hạ quái được kinh nghiệm. Lên cấp được điểm kỹ năng, cộng ở Bản Mệnh Đồ (màn Trấn Ấn Lộ). Hạ tinh anh được chọn 1 ấn. Thắng kịp giờ thì mở tầng cao hơn.')]];
      for(const [ic,n,d] of L){const c=card('',ic,n,'',d,()=>{});c.style.cursor='default';ov.appendChild(c)}
      ov.appendChild(card('door','cave',i18n('hd.hd5','Xuống địa mạch'),'','',()=>{ov.hidden=true;G.paused=false}));ov.hidden=false}
    else setTimeout(()=>{if(G&&G.hd&&!G.over)announce(i18n('hd.goiy2','Tìm các bầy yêu quái · đầy tiến độ thì thủ lĩnh ra'),'good')},1500)
  }
  // bảng giải thích 5 nút của từng tu sĩ
  const MV={
    lamphong:['Chém 3 nhát ở tầm gần, nhát cuối rộng và mạnh.','Lướt chém xuyên qua yêu quái.','Kiếm Khí Trảm: ba sóng kiếm bay xuyên yêu quái.'],
    linhnhi:['Ném đan tầm xa; viên thứ ba mạnh hơn và hồi chút máu.','Lướt và hồi 3% máu.','Vạn Đằng Phược: vùng dây leo trói yêu quái, hồi 12% máu.'],
    hanbang:['Bắn băng tiễn xuyên yêu quái và làm chậm.','Lướt, làm chậm yêu quái chạm phải.','Băng Phong Vạn Lý: nón băng phía trước, đóng băng yêu quái.'],
    loichan:['Đấm 3 quyền nặng ở tầm gần, quyền cuối hất văng.','Húc văng yêu quái, cuối đường giẫm chấn động.','Kim Chung Chấn: bất hoại ngắn rồi chấn văng cả vùng quanh người.'],
    modung:['Phóng bùa lửa tầm xa; đòn thứ ba ném 3 lá.','Dịch chuyển xa, để lại lá bùa nổ.','Bạo Viêm Phù: 5 lá bùa bay ra rồi nổ.'],
    bachho:['Vuốt 4 nhát rất nhanh ở tầm gần.','Lướt được 2 lần liên tiếp.','Hồ Ảnh Liên Trảm: dịch chuyển chém liên tiếp tới 5 yêu quái.']};
  function showMoves(ch){const M=MV[ch]||MV.lamphong,W=WEAP[W2[ch]||'phikiem'],tr=(i,v)=>i18n('hd.mv.'+ch+'.'+i,v);
    ov.innerHTML=`<h2>${CHARS[ch].n}<small>${i18n('hd.mv.phu','Năm nút trong Trấn Ấn Lộ. Nâng thêm ở Bản Mệnh Đồ.')}</small></h2>`;
    const L=[['sword',i18n('hd.hd1','ĐÁNH'),tr(0,M[0])+' '+i18n('hd.mv.giu','Giữ nút để đánh liên tục, tự ngắm.')],['p_boot',i18n('hd.hd2','Thân pháp'),tr(1,M[1])+' '+i18n('hd.mv.bt','Bất tử trong lúc lướt.')],
      [CDX.tkOf?(TKIC[ch]||'kiemkhi'):'kiemkhi',i18n('hd.mv.tk','Tuyệt kỹ'),tr(2,M[2])],[W.ic,i18n('hd.mv.c2','Chiêu 2')+' · '+W.n,i18n('hd.mv.c2d','Công pháp bản môn, bấm tay; mạnh dần theo tầng.')],['burst',i18n('hd.mv.bp','Bộc Phát'),i18n('hd.mv.bpd','Đầy thanh thì bấm: đại chiêu quét cả màn hình.')]];
    for(const [ic,n,d] of L){const c=card('',ic,n,'',d,()=>{});c.style.cursor='default';ov.appendChild(c)}
    ov.appendChild(card('door','cave',i18n('tin.ok','Đã hiểu'),'','',()=>{ov.hidden=true}));ov.hidden=false}
  const TKIC={lamphong:'kiemkhi',linhnhi:'vine',hanbang:'ice',loichan:'bell',modung:'talisman',bachho:'hohoa'};
  Object.assign(TA,{ov,card,b2,NEWS,showBoons,showEnding,kyTake,showNews,showHelp,showMoves});
}
