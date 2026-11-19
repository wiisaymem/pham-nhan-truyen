'use strict';
// Thú Nuôi: additive collection. Existing pets, quest rewards and vntt1 fields stay intact.
(()=>{
const tiers=['Phàm Thú','Linh Thú','Huyền Thú','Thần Thú'];
const defs=[
 {k:'pn_nhatho',n:'Nhất Vĩ Hồ',tails:1,t:0,c:'#7f95a6',b:.01},
 {k:'pn_songho',n:'Song Vĩ Hồ',tails:2,t:0,c:'#9bafbf',b:.01},
 {k:'pn_tamho',n:'Tam Vĩ Hồ',tails:3,t:1,c:'#6aafe0',b:.03},
 {k:'pn_nguho',n:'Ngũ Vĩ Hồ',tails:5,t:2,c:'#f1c453',b:.05},
 {k:'pn_thatho',n:'Thất Vĩ Hồ',tails:7,t:2,c:'#ffd678',b:.05},
 {k:'cuuviho',n:'Cửu Vĩ Hồ Con',tails:9,t:3,c:'#ffb0e8',b:.08}
];
const byKey=Object.fromEntries(defs.map(d=>[d.k,d]));
const legacyTiers={linhho:0,kimbuc:1,thanhlong:2,huyenquy:2,kimquy:2,ngugiong:2,chimlac:2};
for(const [k,t] of Object.entries(legacyTiers))byKey[k]={k,n:PETS[k].n,t,c:PETS[k].gc,b:[.01,.03,.05,.08][t]};
const collection=()=>PET_KEYS.map(k=>byKey[k]).filter(Boolean);
const EGG_COST=180,REFUND=45;
const pool=[{end:7000,keys:['pn_nhatho','pn_songho']},{end:9300,keys:['pn_tamho']},{end:9950,keys:['pn_nguho','pn_thatho']},{end:10000,keys:['cuuviho']}];
function eggSave(){if(!SAVE.pnPets)SAVE.pnPets={eggs:0,last:null};return SAVE.pnPets}
function random(){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}
function roll(r=random(),q=random()){const p=pool.find(p=>r*10000<p.end)||pool[3];return p.keys[Math.min(p.keys.length-1,Math.floor(q*p.keys.length))]}
function canAct(){return visibleGame()&&(!G||G.over)}
function buyEgg(){if(!canAct()||SAVE.lt<EGG_COST)return false;SAVE.lt-=EGG_COST;eggSave().eggs++;saveSave();return true}
function hatch(){if(!canAct()||eggSave().eggs<1)return null;const k=roll(),dup=petLv(k)>0;eggSave().eggs--;if(dup)SAVE.lt+=REFUND;else petSave().lv[k]=1;const result={k,dup,at:Date.now()};eggSave().last=result;saveSave();return result}
let page='pets',revealing=false;
for(const d of defs.slice(0,5)){PETS[d.k]={n:d.n,spr:d.k,gc:d.c,cost:0,uniq:1,q:'Ấp Trứng Linh Thú trong Cửa Hàng.',fly:0,d:'Đồng hành nhặt đồ, đào bảo; tăng '+Math.round(d.b*100)+'% sát thương và máu tối đa cho chủ.'};PET_KEYS.push(d.k)}
// Use the same additive gear-stat inputs already consumed by recompute(). No permanent stat writes.
const oldStats=gearStats;gearStats=function(){const s=oldStats(),ps=petSave(),d=byKey[ps.eq];if(d&&petLv(d.k)>0){s.dmg=(s.dmg||0)+d.b;s.hp=(s.hp||0)+d.b}return s};
// Generate once from the ACTUAL pcv atlas frames; preserve Cửu Vĩ's source and renderer unchanged.
// Original pet art is side-on: four walk frames and horizontal mirroring, NOT a four-direction sheet.
let ready=false;
function sprites(){if(ready||!ATLAS||!SPR.e_pcv_walk0)return;ready=true;
 const originals=Object.keys(SPR).filter(k=>k.startsWith('e_pcv_'));
 for(const d of defs.slice(0,5))for(const key of originals){const m=SPR[key],r=m.r,w=r[2],h=r[3],base=mk(w,h),bx=base.getContext('2d');bx.imageSmoothingEnabled=false;bx.drawImage(m.img||ATLAS,r[0],r[1],w,h,0,0,w,h);
  const img=bx.getImageData(0,0,w,h),a=img.data,col=d.c.match(/\w\w/g).map(v=>parseInt(v,16));
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if((x<w*.47&&y<h*.66)||(x>w*.85&&y<h*.45)){a[i+3]=0;continue}if(!a[i+3])continue;const max=Math.max(a[i],a[i+1],a[i+2]),min=Math.min(a[i],a[i+1],a[i+2]);if(max-min>15&&max>45){const lum=(a[i]*.3+a[i+1]*.59+a[i+2]*.11)/255;for(let j=0;j<3;j++)a[i+j]=Math.round(col[j]*(.35+lum*.8))}}
  bx.putImageData(img,0,0);const c=mk(w,h),x=c.getContext('2d');x.imageSmoothingEnabled=false;
  // Pixel tail fans behind the unchanged head/body; count and pose consistent for every frame.
  const frame=Number(key.slice(-1))||0,sway=Math.sin(frame*Math.PI/2)*.06;
  for(let i=0;i<d.tails;i++){const angle=(d.tails===1?-2.35:-3.05+i/(d.tails-1)*1.55)+sway,rx=w*.43,ry=h*.67,len=w*(d.tails>3?.34:.39),tipx=rx+Math.cos(angle)*len,tipy=ry+Math.sin(angle)*len;
   const steps=Math.ceil(len);for(let s=steps;s>=0;s--){const q=s/steps,px=Math.round(rx+(tipx-rx)*q),py=Math.round(ry+(tipy-ry)*q),rad=Math.max(1,Math.round(Math.sin(q*Math.PI)*1.4+1));x.fillStyle='#30283d';x.fillRect(px-rad,py-rad,rad*2+1,rad*2+1);x.fillStyle=q>.8?'#e7edf3':d.c;x.fillRect(px-rad+1,py-rad+1,Math.max(1,rad*2-1),Math.max(1,rad*2-1))}}
  x.drawImage(base,0,0);SPR[key.replace('pcv',d.k)]={...m,img:c,r:[0,0,w,h]};
 }
}
const oldLoad=loadArt;loadArt=function(cb){return oldLoad(()=>{sprites();cb()})};sprites();
const oldCanvas=petCanvas;petCanvas=function(k,sz=44){if(!k.startsWith('pn_'))return oldCanvas(k,sz);sprites();const c=mk(sz,sz);paint(c,k,0,1);return c};
function paint(c,k,fr,face){const d=PETS[k],m=SPR['e_'+d.spr+'_walk'+fr],x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);if(!m||!ATLAS)return;const r=m.r,s=Math.min(c.width/r[2],c.height/r[3])*.9;x.imageSmoothingEnabled=false;x.save();if(face<0){x.translate(c.width,0);x.scale(-1,1)}x.drawImage(m.img||ATLAS,r[0],r[1],r[2],r[3],(c.width-r[2]*s)/2,(c.height-r[3]*s)/2,r[2]*s,r[3]*s);x.restore()}
const E=(tag,cl,text)=>{const e=document.createElement(tag);if(cl)e.className=cl;if(text!==undefined)e.textContent=text;return e};
function shopIcon(){const s=paw();s.innerHTML='<path fill="#6aafe0" d="M2 7h12v8H2z"/><path fill="#f1c453" d="M1 3h14v5H1z"/><path fill="#e95b56" d="M2 1h3v6H2zm6 0h3v6H8zm6 2h2v4h-2z"/><path fill="#fff6dc" d="M4 10h4v5H4zm6 0h3v3h-3z"/>';return s}
function paw(){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 16 16');s.setAttribute('width','24');s.setAttribute('height','24');s.setAttribute('aria-hidden','true');s.innerHTML='<g fill="#f1c453"><path d="M4 9h8v5H4zM6 7h4v2H6z"/><path fill="#6aafe0" d="M1 4h3v4H1zM5 1h3v4H5zM9 1h3v4H9zM13 4h3v4h-3z"/></g>';s.style.imageRendering='pixelated';return s}
const overlay=E('div','screen bg pn-pets-overlay');overlay.id='pn-pets';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','pn-pets-heading');
const card=E('section','pn-card card'),title=E('h2','pn-native-title'),heading=E('span');heading.id='pn-pets-heading';heading.append(paw(),E('span','','THÚ NUÔI'));const close=E('button','','×');close.id='pn-pets-close';close.type='button';close.setAttribute('aria-label','Đóng Thú Nuôi');title.append(heading,close);const body=E('main');body.id='pn-pets-body';card.append(title,body);overlay.append(card);document.body.append(overlay);
// Copy the live tab's CSS rules, including future theme updates, instead of designing a different frame.
const skin=E('style');document.head.append(skin);
function copySkin(){let out='';function walk(rules){for(const r of rules){if(r.selectorText&&r.cssText.includes('#pn-modal'))out+=r.cssText.replaceAll('#pn-modal','#pn-pets').replaceAll('#pn-body','#pn-pets-body').replaceAll('#pn-heading','#pn-pets-heading').replaceAll('#pn-close','#pn-pets-close');else if(r.cssRules){const before=out;out='';walk(r.cssRules);const nested=out;out=before;if(nested)out+=r.cssText.slice(0,r.cssText.indexOf('{')+1)+nested+'}'}}}for(const st of document.styleSheets){if(st.ownerNode===skin)continue;try{walk(st.cssRules)}catch(e){}}skin.textContent=out}
const css=E('style');css.textContent='.pn-pets-overlay{position:fixed!important;inset:0!important;z-index:9999!important}.pn-pets-overlay[hidden]{display:none!important}.pn-pets-overlay .pn-pet-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.pn-pets-overlay .pn-pet-item{min-width:0;margin:0;padding:8px;overflow-wrap:anywhere}.pn-pets-overlay .pn-pet-item canvas{display:block;width:100%;height:78px;object-fit:contain;image-rendering:pixelated}.pn-pets-overlay .pn-pet-item b,.pn-pets-overlay .pn-pet-item small{display:block}.pn-pets-overlay .pn-pet-item button{width:100%;margin-top:7px}.pn-pets-overlay .pn-pet-item p{font-size:12px}.pn-pets-overlay .pn-pet-current{display:flex;align-items:center;gap:10px}.pn-pets-overlay .pn-pet-current canvas{width:90px;height:78px;flex:none;image-rendering:pixelated}.pn-pets-overlay .pn-pet-current div{min-width:0}.pn-pets-overlay .pn-pet-tools{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0}.pn-pets-overlay .pn-pet-tools button{flex:1;min-width:42px}.pn-pets-overlay #pn-pets-body{overflow:auto;min-height:0}.pn-pets-overlay #pn-pets-heading{display:flex;align-items:center;gap:7px}.pn-pets-overlay #pn-pets-close{flex:none}.pn-pet-egg{text-align:center;padding:14px}.pn-pet-hatching{animation:pn-pet-crack .14s steps(2) 6}@keyframes pn-pet-crack{0%{transform:translateX(-3px) rotate(-8deg)}100%{transform:translateX(3px) rotate(8deg)}}.pn-pet-nav-button{min-width:0!important;white-space:nowrap}.pn-pet-nav-button svg{width:24px;height:24px;flex:none}.pn-pet-nav-button .pn-pet-nav-label{font:inherit}@media(max-height:560px){.pn-pet-nav{height:120px!important}.pn-pet-nav-button{height:40px!important;flex-direction:row!important}.pn-pet-nav-button svg{width:16px;height:16px}}';document.head.append(css);
let previous=null,raf=0,dir=1,auto=true,started=0;
function drawShop(){body.replaceChildren();liveCanvases.length=0;const s=eggSave();body.append(E('p','','Linh thạch: '+(SAVE.lt|0).toLocaleString('vi-VN')),E('h3','','Trứng Linh Thú · 180 ◈'),E('p','','Một loại trứng, đủ bốn phẩm cấp. Mỗi lần ấp là một lượt ngẫu nhiên độc lập.'),E('p','','Phàm 70% · Linh 23% · Huyền 6,5% · Thần 0,5%.'),E('small','','Nhất Vĩ 35% · Song Vĩ 35% · Tam Vĩ 23% · Ngũ Vĩ 3,25% · Thất Vĩ 3,25% · Cửu Vĩ 0,5%.'),E('p','','Thú trùng hoàn 45 linh thạch; không mất thú hay cấp cũ. Cửu Vĩ vẫn có thể mở miễn phí bằng Ẩn Nhiệm.'),E('p','','Trứng đang có: '+s.eggs));
 const egg=E('div','pn-pet-egg');egg.setAttribute('aria-hidden','true');egg.innerHTML='<svg viewBox="0 0 16 20" width="64" height="80" shape-rendering="crispEdges"><path fill="#f1c453" d="M6 0h4v2h2v3h2v4h2v7h-2v2h-2v2H4v-2H2v-2H0V9h2V5h2V2h2z"/><path fill="#fff6dc" d="M6 3h4v2h2v5h2v5h-2v2H4v-2H2v-5h2V5h2z"/><path fill="#6aafe0" d="M5 7h3v3H5zm4 6h3v3H9z"/></svg>';body.append(egg);
 const buy=E('button','','Mua 1 trứng · '+EGG_COST+' ◈');buy.type='button';buy.disabled=SAVE.lt<EGG_COST;buy.onclick=()=>{if(buyEgg())drawShop()};const b=E('button','','Ấp 1 trứng');b.type='button';b.disabled=s.eggs<1;b.onclick=()=>{const result=hatch();if(!result)return;revealing=true;buy.disabled=true;b.disabled=true;egg.classList.add('pn-pet-hatching');const announce=E('p','pn-pet-note','Trứng đang nở…');announce.setAttribute('role','status');body.append(announce);setTimeout(()=>{revealing=false;if(overlay.hidden||page!=='shop')return;drawShop()},850)};body.append(buy,b);
 if(s.last&&!revealing){const d=byKey[s.last.k];if(d){const row=E('div','pn-row pn-pet-current'),c=mk(100,88);c.dataset.pet=d.k;liveCanvases.push(c);row.append(c,E('p','',d.n+' · '+tiers[d.t]+(s.last.dup?' · Đã sở hữu: hoàn '+REFUND+' ◈':' · Đã gia nhập bộ sưu tập!')));row.setAttribute('role','status');body.append(row)}}const view=E('button','','Xem Thú Nuôi');view.type='button';view.onclick=()=>open('pets');body.append(view)
}

const liveCanvases=[];
function visibleGame(){return !document.body.classList.contains('pn-locked')}
function notify(text){let n=body.querySelector('.pn-pet-note');if(!n){n=E('p','pn-pet-note');n.setAttribute('role','status');body.prepend(n)}n.textContent=text}
function draw(){body.replaceChildren();liveCanvases.length=0;const ps=petSave(),eq=ps.eq,owned=collection().filter(d=>petLv(d.k)>0),current=PETS[eq]&&petLv(eq)>0;
 const lead=E('div','pn-row pn-pet-current');if(current){const c=mk(100,88);c.dataset.pet=eq;lead.append(c);liveCanvases.push(c);const t=E('div');t.append(E('b','',PETS[eq].n),E('small','','Đang đồng hành · Cấp '+petLv(eq)+'/'+PET_MAX));lead.append(t)}else lead.append(E('p','','Chưa có thú nuôi đồng hành. Chọn một linh hồ bên dưới để kết duyên.'));body.append(lead,E('p','','Linh thạch: '+(SAVE.lt|0).toLocaleString('vi-VN')+' · Một thú đồng hành mỗi lần.'));
 if(!owned.length)body.append(E('p','','Bộ sưu tập thú nuôi còn trống. Cửu Vĩ mở bằng Ẩn Nhiệm hoặc trứng Thần Thú.'));
 const tools=E('div','pn-pet-tools');for(const [label,f] of [['←',()=>{dir=-1;auto=false}],['→',()=>{dir=1;auto=false}],['Tự xoay',()=>{auto=true}]]){const b=E('button','',label);b.type='button';b.onclick=f;tools.append(b)}body.append(tools);
 const grid=E('div','pn-pet-grid');for(const d of collection()){const lv=petLv(d.k),row=E('article','pn-row pn-pet-item'+(eq===d.k&&lv?' pn-me':''));row.dataset.pet=d.k;const c=mk(132,88);c.dataset.pet=d.k;liveCanvases.push(c);row.append(c,E('b','',d.n),E('small','',tiers[d.t]+(d.tails?' · '+d.tails+' đuôi':'')),E('p','','+'+Math.round(d.b*100)+'% sát thương, +'+Math.round(d.b*100)+'% máu tối đa khi đồng hành.'),E('small','',lv?'Cấp '+lv+'/'+PET_MAX+' · Nâng cấp ở Linh Thú Viên.':'Chưa sở hữu'));
  row.append(E('p','',PETS[d.k].d));if(lv)row.append(E('small','',lv>=PET_MAX?'Đã đạt cấp tối đa.':'Nâng cấp kế tiếp: '+petCost(lv)+' ◈ (Linh Thú Viên)'));
  if(lv){const b=E('button','',eq===d.k?'Đang đồng hành':'Đồng hành');b.type='button';b.disabled=eq===d.k;b.onclick=()=>{if(!visibleGame())return;if(G&&!G.over){notify('Đổi thú ở sảnh sau khi kết thúc trận.');return}petSave().eq=d.k;saveSave();draw()};row.append(b)}
  else if(d.k.startsWith('pn_')){const b=E('button','','Tìm trứng ở Cửa Hàng');b.type='button';b.onclick=()=>open('shop');row.append(b)}
  else {if(PETS[d.k].uniq){const count=d.k==='cuuviho'&&typeof bcLog==='function'?' ('+Math.min(5,bcLog().pz.ho|0)+'/5)':'';row.append(E('p','',PETS[d.k].q+count))}else row.append(E('small','','Linh thú gốc · Linh Thú Viên'));row.append(E('small','',PETS[d.k].d))}grid.append(row)}body.append(grid,E('small','','Bonus cộng vào hệ chỉ số trang bị, không cộng dồn nhiều thú. Có hiệu lực từ trận kế tiếp. Cửu Vĩ giữ nguyên ba hồ hỏa và đường mở khóa cũ.'));
 const legacy=E('button','','Linh Thú Viên · thú cũ / nâng cấp');legacy.type='button';legacy.onclick=()=>{dismiss();buildPets()};body.append(legacy)
}
function animate(now){if(overlay.hidden)return;const tick=Math.floor((now-started)/160),face=auto?(Math.floor(tick/8)%2?-1:1):dir;for(const c of liveCanvases){const k=c.dataset.pet;if(PETS[k])paint(c,k,tick%4,face);c.dataset.frame=String(tick%4);c.dataset.face=String(face)}raf=requestAnimationFrame(animate)}
function open(tab='pets'){if(!visibleGame()||revealing)return;page=tab;previous=document.activeElement;heading.replaceChildren(page==='shop'?shopIcon():paw(),E('span','',page==='shop'?'CỬA HÀNG':'THÚ NUÔI'));copySkin();sprites();if(page==='shop')drawShop();else draw();overlay.hidden=false;started=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(animate);close.focus()}
function dismiss(){revealing=false;overlay.hidden=true;cancelAnimationFrame(raf);previous?.focus()}
close.onclick=dismiss;overlay.addEventListener('click',e=>{if(e.target===overlay)dismiss()});overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();dismiss()}if(e.key==='Tab'){const a=[...overlay.querySelectorAll('button:not(:disabled)')];if(e.shiftKey&&document.activeElement===a[0]){e.preventDefault();a.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===a.at(-1)){e.preventDefault();a[0].focus()}}});
function nav(){const n=document.getElementById('sanhNav');if(!n||n.querySelector('.pn-pet-nav-button'))return;let after=n.querySelector('[data-t="kho"]');for(const [id,label] of [['pets','Thú Nuôi'],['shop','Cửa Hàng']]){const b=E('button','pn-pet-nav-button');b.type='button';b.dataset.t='pn-'+id;b.append(id==='shop'?shopIcon():paw(),E('span','pn-pet-nav-label',label));b.onclick=()=>open(id);if(after)after.after(b);else n.append(b);after=b}n.classList.add('pn-pet-nav');dispatchEvent(new Event('resize'))}
// Append AFTER the original four nav icons are refreshed: their existing index-based code stays untouched.
const oldMenu=buildMenu;buildMenu=function(){document.querySelectorAll('.pn-pet-nav-button').forEach(b=>b.remove());const v=oldMenu.apply(this,arguments);nav();return v};if(typeof window.sanhDraw==='function'){const oldDraw=window.sanhDraw;window.sanhDraw=function(){document.querySelectorAll('.pn-pet-nav-button').forEach(b=>b.remove());const v=oldDraw.apply(this,arguments);nav();return v}}nav();
})();
