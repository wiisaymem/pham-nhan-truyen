'use strict';
// ───────────────────────── sảnh: mây trôi, hoa rơi, chuyển cảnh, hiệu ứng nút, cảnh mở Bảo Hạp

// ── trời ở sảnh: mây và cánh hoa (mỗi màn nền .bg có một lớp riêng)
function skyLayer(){
  const s=document.createElement('div');s.className='skyl';s.setAttribute('aria-hidden','true');
  for(let i=0;i<6;i++){const c=document.createElement('i');c.className='cl';const w=70+Math.random()*90;
    c.style.cssText=`top:${4+Math.random()*30}%;width:${w}px;height:${w*0.32}px;animation-duration:${38+Math.random()*40}s;animation-delay:-${Math.random()*60}s;opacity:${0.55+Math.random()*0.4}`;s.appendChild(c)}
  for(let i=0;i<14;i++){const p=document.createElement('b');p.className='pt';
    p.style.cssText=`left:${Math.random()*100}%;animation-duration:${9+Math.random()*9}s,${2.5+Math.random()*2}s;animation-delay:-${Math.random()*18}s,-${Math.random()*3}s;transform:scale(${0.6+Math.random()*0.8})`;s.appendChild(p)}
  return s}
function initSky(){for(const el of document.querySelectorAll('.screen.bg'))if(!el.querySelector('.skyl'))el.prepend(skyLayer())}

// ── chuyển cảnh: thẻ trượt nhẹ khi đổi màn
const _show=show;
show=function(id){const prev=SCREENS.find(s=>!$(s).hidden);_show(id);if(!id||id===prev)return;const el=$(id);if(!el)return;
  el.classList.remove('enter');void el.offsetWidth;el.classList.add('enter')};

// ── gợn sóng khi bấm nút
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.btn,.card3,.gi');if(!b||b.disabled)return;
  const r=b.getBoundingClientRect(),s=document.createElement('span');s.className='rip';const d=Math.max(r.width,r.height)*1.4;
  s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;b.appendChild(s);setTimeout(()=>s.remove(),600)},{passive:true});

// ── cảnh mở Bảo Hạp
let CF=null;
function chestReveal(it,onDone,opt={}){
  const ov=document.createElement('div');ov.id='chestFx';const c=document.createElement('canvas');ov.appendChild(c);
  const info=document.createElement('div');info.className='cfi';ov.appendChild(info);document.body.appendChild(ov);
  const dpr=Math.min(2,devicePixelRatio||1),W=innerWidth,H=innerHeight;c.width=W*dpr;c.height=H*dpr;const x=c.getContext('2d');x.scale(dpr,dpr);x.imageSmoothingEnabled=false;
  const R=GRAR[it.r],col=R.c,g=GEAR[it.k],chest=new Image();chest.src=iconURL('box');const gi=gearIcon(it.k);
  const P=[],cx=W/2,cy=H*0.46;let t0=performance.now(),opened=false,done=false,last=t0;
  const emit=(n,spd,cols,life=1.2,up=0)=>{for(let i=0;i<n;i++){const a=Math.random()*TAU,s=spd*(0.3+Math.random()*0.9);P.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-up,l:life*(0.5+Math.random()*0.7),m:0,s:2+Math.random()*3,c:cols[(Math.random()*cols.length)|0]})}P.forEach(p=>p.m=p.m||p.l)};
  CF={ov};
  function frame(now){if(done)return;const t=(now-t0)/1000,dt=Math.min(0.05,(now-last)/1000);last=now;x.clearRect(0,0,W,H);
    // nền tối + quầng theo phẩm
    x.fillStyle=`rgba(12,6,28,${Math.min(0.82,t*2)})`;x.fillRect(0,0,W,H);
    const open=t>1.25;
    if(open&&!opened){opened=true;emit(70+it.r*30,260+it.r*60,[col,'#ffffff','#ffe680'],1.4);sfx(it.r>=3?'realm':'chest');if(typeof buzz==='function')buzz(it.r>=3?[40,40,120]:[30]);
      info.innerHTML=i18nf('ui.ui4.phamchamDeDong','<small style="color:{0}">{1}{2} phẩm</small><b>{3}</b><p>{4}</p><em>Chạm để đóng</em>',col,opt.merge?i18n('ui.ui4.ghepThanh','Ghép thành · '):'',R.n,g.n,gearDesc(it));info.classList.add('on');info.style.setProperty('--gc',col)}
    // tia sáng xoay
    if(open){const k=Math.min(1,(t-1.25)/0.4),n=10+it.r*3;x.save();x.translate(cx,cy);x.rotate(t*0.35);x.globalCompositeOperation='lighter';
      for(let i=0;i<n;i++){const a=i/n*TAU;x.globalAlpha=(i%2?0.12:0.22)*k*(0.6+it.r*0.12);x.fillStyle=i%2?'#ffffff':col;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a-0.07)*H,Math.sin(a-0.07)*H);x.lineTo(Math.cos(a+0.07)*H,Math.sin(a+0.07)*H);x.fill()}
      x.restore();x.globalAlpha=1;x.globalCompositeOperation='source-over';
      const gr=x.createRadialGradient(cx,cy,0,cx,cy,160);gr.addColorStop(0,col+'cc');gr.addColorStop(1,col+'00');x.fillStyle=gr;x.globalCompositeOperation='lighter';x.fillRect(cx-160,cy-160,320,320);x.globalCompositeOperation='source-over'}
    // rương: rơi xuống, rung mạnh dần, rồi bật
    if(opt.merge&&!open){const k=Math.min(1,t/1.2),e=k*k;for(let i=0;i<3;i++){const a=i/3*TAU+t*(3+k*9),d=110*(1-e)+6,sz=64*(1-e*0.4),ox=cx+Math.cos(a)*d,oy=cy+Math.sin(a)*d*0.8;x.globalAlpha=0.9;x.drawImage(gi,ox-sz/2,oy-sz/2,sz,sz);x.globalAlpha=1;
        const gg=x.createRadialGradient(ox,oy,0,ox,oy,40);gg.addColorStop(0,col+'88');gg.addColorStop(1,col+'00');x.globalCompositeOperation='lighter';x.fillStyle=gg;x.fillRect(ox-40,oy-40,80,80);x.globalCompositeOperation='source-over';
        if(Math.random()<0.6)P.push({x:ox,y:oy,vx:0,vy:0,l:0.4,m:0.4,s:2.5,c:col})}}
    else if(!opt.merge&&(!open||t<1.6)){const drop=Math.min(1,t/0.35),bounce=drop<1?0:Math.abs(Math.sin((t-0.35)*10))*Math.max(0,0.5-(t-0.35))*16;
      const sh=t>0.5&&!open?Math.sin(t*(40+t*30))*(t-0.5)*9:0,sz=120*(open?1+(t-1.25)*1.5:1),y=cy-(1-drop)*H*0.6-bounce+(open?(t-1.25)*60:0);
      x.globalAlpha=open?Math.max(0,1-(t-1.25)/0.35):1;
      if(t>0.5&&!open){const gg=x.createRadialGradient(cx,cy,0,cx,cy,110);gg.addColorStop(0,col+'aa');gg.addColorStop(1,col+'00');x.globalAlpha=Math.min(1,(t-0.5)*1.4);x.fillStyle=gg;x.fillRect(cx-110,cy-110,220,220);x.globalAlpha=1;
        if(Math.random()<0.5)P.push({x:cx+(Math.random()-.5)*90,y:cy+30,vx:(Math.random()-.5)*20,vy:-60-Math.random()*60,l:0.7,m:0.7,s:2,c:col})}
      if(chest.complete)x.drawImage(chest,cx-sz/2+sh,y-sz/2,sz,sz);x.globalAlpha=1}
    if(open&&t<1.45){x.globalAlpha=1-(t-1.25)/0.2;x.fillStyle='#ffffff';x.fillRect(0,0,W,H);x.globalAlpha=1}
    // vật phẩm bay lên
    if(open){const k=Math.min(1,(t-1.3)/0.5),e=1-(1-k)**3,sz=96*e*(1+Math.sin(t*3)*0.03),iy=cy-30*e;
      x.save();x.translate(cx,iy);x.rotate(Math.sin(t*2)*0.06);x.fillStyle='#0008';x.strokeStyle=col;x.lineWidth=4;x.beginPath();x.roundRect(-sz*0.62,-sz*0.62,sz*1.24,sz*1.24,16);x.fill();x.stroke();
      x.drawImage(gi,-sz/2,-sz/2,sz,sz);x.restore();
      if(it.r>=3&&Math.random()<0.35)P.push({x:cx+(Math.random()-.5)*W,y:-10,vx:0,vy:120+Math.random()*80,l:3,m:3,s:2.5,c:it.r>=4?'#ffe680':col,star:1})}
    // hạt
    x.globalCompositeOperation='lighter';
    for(const p of P){p.l-=dt;p.vx*=Math.exp(-1.8*dt);p.vy=p.vy*Math.exp(-1.8*dt)+(p.star?0:60*dt);p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.l<=0)continue;x.globalAlpha=Math.min(1,p.l/p.m*1.5);x.fillStyle=p.c;
      if(p.star){x.fillRect(p.x-0.6,p.y-p.s*2,1.2,p.s*4);x.fillRect(p.x-p.s*2,p.y-0.6,p.s*4,1.2)}else x.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}
    x.globalAlpha=1;x.globalCompositeOperation='source-over';for(let i=P.length-1;i>=0;i--)if(P[i].l<=0)P.splice(i,1);
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
  const close=()=>{if(!opened)return;done=true;ov.classList.add('out');setTimeout(()=>{ov.remove();CF=null},250);onDone&&onDone()};
  ov.addEventListener('click',close);sfx('click');
}
function gearDesc(it){const g=GEAR[it.k],L=[];const f=(st,v)=>`${STAT_N[st]||st} +${st==='armor'||st==='regen'?Math.round(v*10)/10:Math.round(v*1000)/10+'%'}`;
  L.push(f(g.st,gVal(it,true)));if(g.st2)L.push(f(g.st2,gVal(it,false)));return L.join(' · ')}

const FXO=[['auto',i18n('ui.ui4.tuDong','Tự động')],[2,'Cao'],[1,i18n('ui.ui4.vua','Vừa')],[0,i18n('ui.ui4.thap','Thấp')]];
function buildFxOpt(){const box=$('optFx');if(!box)return;box.innerHTML='';const cur=SAVE.opt.fxq??'auto';
  for(const [v,n] of FXO){const b=document.createElement('button');b.textContent=n;if(String(v)===String(cur))b.classList.add('on');
    b.onclick=()=>{SAVE.opt.fxq=v;saveSave();fxqInit();resize();sfx('click');buildFxOpt()};box.appendChild(b)}
  $('fxNow').textContent=FXAUTO?i18nf('ui.ui4.dang','(đang: {0})',[i18n('ui.ui4.thap','Thấp'),i18n('ui.ui4.vua','Vừa'),'Cao'][FXQ]):''}
function buildLangOpt(){const box=$('optLang');if(!box)return;box.innerHTML='';
  const dev=/[?&]lang=dev/.test(location.search);
  for(const [l,n] of LANG_LIST){const cov=i18nCoverage(l);if(cov<0.5&&!dev&&l!==CUR_LANG)continue;const b=document.createElement('button');b.innerHTML=n+(cov<0.95?` <small>${Math.round(cov*100)}%</small>`:'');if(l===CUR_LANG)b.classList.add('on');
    b.onclick=()=>{if(l===CUR_LANG)return;sfx('click');setLang(l)};box.appendChild(b)}
  box.parentElement.style.display=box.children.length<2?"none":""}
const _buildSettings=buildSettings; buildSettings=function(b){_buildSettings(b);buildFxOpt();buildLangOpt()};
function wire4(){
  initSky();
  on('bqB',()=>{const v=bqClaim();if(v){toast(i18nf('ui.bq.nhan','Bế quan thu được +{0} linh thạch',v));sfx('chest');buildMenu()}});
  const b=$('gbBuy'),nb=b.cloneNode(true);b.replaceWith(nb);
  on('gbBuy',()=>{if(CF)return;const it=buyChest();if(!it){toast(i18n('ui.ui4.chuaDuLinhThach','Chưa đủ linh thạch'));return}gSel=it.id;$('gbLt').textContent=SAVE.lt;chestReveal(it,()=>buildGear())});
}
const _wire2b=wire2; wire2=function(){_wire2b();wire4()};

// ── sảnh: nút Nhập Trận ghi Ải đang chọn, Bế Quan tích linh thạch
function buildBq(){const b=$('bqB');if(!b)return;const p=bqPending(),h=Math.floor(p.ms/3600000),m=Math.floor(p.ms/60000)%60;
  b.innerHTML=i18nf('ui.bq.nut','🧘 Bế quan {0}h{1}m · <b>+{2} ◈</b> <small>({3}/giờ, tối đa 12 giờ)</small>',h,String(m).padStart(2,'0'),p.lt,bqRate());b.classList.toggle('full',p.ms>=BQ_CAP);b.disabled=p.lt<1}
const _bm4=buildMenu; buildMenu=function(){_bm4();const S=aiSave();$('mAi').textContent=i18nf('ui.ai.menu','· Ải {0}',S.sel||1);buildBq()};
setInterval(()=>{if(!$('menu').hidden)buildBq()},30000);

// ── Đại chiêu: nút bộc phát mang biểu tượng riêng của tu sĩ, nâng cấp ở màn chọn tu sĩ
function setBurstIcon(){const b=$('burstB');if(!b||!G)return;const U=ULT[G.ch]||ULT.lamphong;let im=$('burstI');
  if(!im){im=document.createElement('img');im.id='burstI';im.alt='';b.appendChild(im);const s=b.querySelector('span');if(s)s.remove()}
  im.src=iconURL(U.emb);let lv=$('burstLv');if(!lv){lv=document.createElement('i');lv.id='burstLv';b.appendChild(lv)}lv.textContent='◆'.repeat(ultLv(G.ch))}
const _bs4=buildSlots; buildSlots=function(){_bs4();setBurstIcon()};
const _sel4=buildSelect;
buildSelect=function(){_sel4();const id=selChar,U=ULT[id];if(!U)return;const lv=ultLv(id),box=$('cdInfo');
  const d=document.createElement('div');d.className='ultbox';
  d.innerHTML=`<img src="${iconURL(U.emb)}" alt=""><div><b>${U.n}</b> <span class="pips">${'◆'.repeat(lv)}${'◇'.repeat(5-lv)}</span><small>${ultLvD(id,lv)}</small>${lv<5?`<small class="nx">${i18nf('ui.ult.next','Cấp {0}: {1}',lv+1,ultLvD(id,lv+1))}</small>`:''}</div>`;
  if(lv<5){const c=ULT_COST[lv+1],b=document.createElement('button');b.className='btn sm';b.textContent=`${c} ◈`;b.disabled=SAVE.lt<c;b.onclick=e=>{e.stopPropagation();if(ultUp(id)){sfx('realm');toast(i18nf('ui.ult.len','{0} lên cấp {1}!',U.n,lv+1));buildSelect()}};d.appendChild(b)}
  box.appendChild(d)};
