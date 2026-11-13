'use strict';
// ───────────────────────── Phế Tích: Bí cảnh có bia đá khắc mảnh ký ức. Đọc đủ 6 mảnh thành trọn một chương.
BC_NAME.phetich=i18n('bc.phetich','Phế Tích');
for(const m in KYUC){const C=KYUC[m];C.ch=i18n('ky.'+m+'.ch',C.ch);C.m.forEach((F,i)=>{F[0]=i18n('ky.'+m+'.'+(i+1)+'.ten',F[0]);F[1]=i18n('ky.'+m+'.'+(i+1)+'.nd',F[1])})}
function kySave(){if(!SAVE.ky)SAVE.ky={};return SAVE.ky}
const kyGot=(m,i)=>!!(kySave()[m]&&kySave()[m][i]);
const kyLeft=m=>!!KYUC[m]&&KYUC[m].m.some((_,i)=>!kyGot(m,i));
function kyNext(m){const L=KYUC[m];if(!L)return -1;for(let i=0;i<L.m.length;i++)if(!kyGot(m,i))return i;return -1}
function ptSetup(){const B=G.bc,C=WORLD/2,m=G.mapId,n=Math.min(2,KYUC[m].m.filter((_,i)=>!kyGot(m,i)).length);B.tabs=[];
  for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*0.9;B.tabs.push(pzAdd({k:'pz',part:'kytab',x:C+Math.cos(a)*140,y:C+Math.sin(a)*100,spr:'p_tablet',r:8,read:0,hold:0}))}
  for(let i=0;i<3;i++){const a=rand()*TAU;spawnEnemy(rollType(),C+Math.cos(a)*190,C+Math.sin(a)*140,{elite:i===0?1:0})}
  announce(i18n('bc.ptG','Phế tích đổ nát… có chữ khắc trên bia đá'),'good')}
function ptTick(dt){const B=G.bc;for(const t of B.tabs){if(t.read)continue;if(pzD(t)<24){t.hold+=dt;if(t.hold>0.8){t.read=1;const m=G.mapId,i=kyNext(m);if(i<0)continue;kySave()[m]=kySave()[m]||{};kySave()[m][i]=1;saveSave();sfx('realm');kyShow(m,i,true)}}else t.hold=0}
  if(!B.done&&B.tabs.every(t=>t.read)){B.done=1;announce(i18n('bc.ptX','Đã đọc hết bia. Đi vào cổng để quay về'),'good')}}
// khung đọc (dừng trận khi đang đọc)
function kyShow(m,i,isNew){const L=KYUC[m],F=L.m[i],box=$('kyM');if(!box)return;const done=L.m.every((_,j)=>kyGot(m,j));
  $('kyCh').textContent=L.ch;$('kyT').textContent=`${i+1}/6 · ${F[0]}`;$('kyB').textContent=F[1];
  $('kyN').textContent=isNew?(done?i18n('ky.tron','Trọn chương! Ký ức đã ghép đủ'):i18nf('ky.con','Mảnh ký ức mới · còn {0} mảnh của chương này',L.m.filter((_,j)=>!kyGot(m,j)).length)):'';
  box.hidden=false;if(G&&!G.over){G.kyPause=!G.paused;G.paused=true}}
function kyClose(){$('kyM').hidden=true;if(G&&G.kyPause){G.paused=false;G.kyPause=false}}
on('kyClose',kyClose);
const _doKY=drawObs;drawObs=function(o){if(o.part==='kytab'){drawS('p_tablet',o.x,o.y+1,{sc:0.7});if(!o.read){glow(o.x,o.y-22,16,'#fff6c0',0.4+Math.sin(G.t*3)*0.2);if(rand()<0.1)vp(o.x+(rand()-.5)*14,o.y-20,{vy:-12,life:0.8,s:1.4,c:'#fff6c0'})}
  if(o.hold>0){ctx.save();ctx.translate(o.x,o.y);ctx.scale(1,0.5);ring(0,0,16,'#ffd45a',2,0.3+o.hold);ctx.restore()}return}_doKY(o)};
// Bí Kíp: mục Mảnh ký ức, bấm vào mảnh đã có để đọc lại
const _bkKY=buildBikip;
buildBikip=function(){_bkKY();const L=$('bkList');let tot=0,got=0;for(const m of KYUC_ORDER)for(let i=0;i<6;i++){tot++;if(kyGot(m,i))got++}
  L.appendChild(elx('div','osec',i18nf('bk.ky','Mảnh ký ức ({0}/{1})',got,tot)));
  for(const m of KYUC_ORDER){const C=KYUC[m],n=C.m.filter((_,i)=>kyGot(m,i)).length,row=elx('div','bkrow'+(n?' seen':''),`<div class="bke"><b>${n?C.ch:'???'}</b><small>${MAPS[m]?MAPS[m].n:C.noi||''} · ${n}/6</small><div class="kyrow"></div></div>`);
    const R=row.querySelector('.kyrow');C.m.forEach((F,i)=>{const b=document.createElement('button');b.className='kyb'+(kyGot(m,i)?' on':'');b.textContent=kyGot(m,i)?F[0]:'?';b.disabled=!kyGot(m,i);b.onclick=()=>kyShow(m,i,false);R.appendChild(b)});L.appendChild(row)}};
