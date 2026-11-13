'use strict';
// ───────────────────────── Nguyên liệu và Tu Luyện nhân vật (cày kiểu Archero)
// Linh Thảo: tu luyện từng nhân vật. Tinh Thiết: luyện pháp bảo từ cấp 5 trở lên. Hình: tools/art_src/mats.png (Google Flow).
const MAT={thao:{n:'Linh Thảo',ic:'m_thao'},thiet:{n:'Tinh Thiết',ic:'m_thiet'}};
for(const k in MAT)MAT[k].n=i18n('mat.'+k,MAT[k].n);
function matSave(){if(!SAVE.mat)SAVE.mat={thao:0,thiet:0};return SAVE.mat}
function matAdd(k,v){if(!v)return;matSave()[k]=(matSave()[k]|0)+v;if(G&&G.matG)G.matG[k]=(G.matG[k]|0)+v}
const matIc=k=>`<img class="bi" src="${iconURL(MAT[k].ic)}" alt="">`;
// ── Tu luyện: 10 cấp mỗi nhân vật
const TL_MAX=10;
function tlSave(){if(!SAVE.tl)SAVE.tl={};return SAVE.tl}
const tlLv=ch=>tlSave()[ch]|0;
const tlCost=lv=>({lt:120*(lv+1),thao:2+lv*2});
function tlUp(ch){const lv=tlLv(ch);if(lv>=TL_MAX)return false;const c=tlCost(lv),M=matSave();if(SAVE.lt<c.lt||(M.thao|0)<c.thao)return false;SAVE.lt-=c.lt;M.thao-=c.thao;tlSave()[ch]=lv+1;saveSave();return true}
const tlBonus=lv=>({dmg:lv*0.03,hp:lv*0.04});
const _rcTL=recompute;
recompute=function(){const P=G.p,h0=P.hp,m0=P.mhp;_rcTL();const L=tlLv(G.ch);if(!L)return;const B=tlBonus(L);G.st.dmg*=1+B.dmg;
  const nm=Math.round(P.mhp*(1+B.hp));P.hp=Math.min(nm,m0?h0+Math.max(0,nm-m0):nm);P.mhp=nm};
const _nrTL=newRun;newRun=function(...a){const r=_nrTL(...a);G.matG={thao:0,thiet:0};const L=tlLv(G.ch);if(L>=5)G.rer+=1;if(L>=10){const w=CHARS[G.ch].w;if(G.w[w])G.w[w].lv=Math.max(G.w[w].lv,2)}recompute();G.p.hp=G.p.mhp;return r};
// ── nguồn nguyên liệu
const _erTL=endRun;
endRun=function(win){const was=G&&G.over;_erTL(win);if(was||!G)return;
  if(G.tower){if(win){matAdd('thiet',2);matAdd('thao',2)}}
  else{const mins=Math.min(G.t,RUN_T)/60,A=G.ai||{n:1},m=1+(A.n-1)*0.15;matAdd('thao',Math.round((Math.floor(mins/2)+(G.bossKills|0)*2+(win?6:0))*m));matAdd('thiet',Math.round(((G.bossKills|0)+(win?3:0))*m))}
  saveSave()};
const _boTL=bcOpen;bcOpen=function(c){_boTL(c);if(rand()<0.4){const v=2+((rand()*3)|0);matAdd('thao',v);G.nums.push({x:c.x,y:c.y-40,v:'+'+v+' '+MAT.thao.n,t:0,c:'#7bff9a'})}};
const _kvTL=bcKV;bcKV=function(){_kvTL();matAdd('thao',4)};
const _b2TL=bc2Tick;bc2Tick=function(dt){const was=G.bc&&G.bc.done;_b2TL(dt);if(G.bc&&G.bc.done&&!was&&G.bc.ty==='dau')matAdd('thiet',3)};
// ── luyện pháp bảo từ cấp 5 cần Tinh Thiết
const thietNeed=it=>it.lv>=5?it.lv-4:0;
const _glTL=gearLevel;
gearLevel=function(it){const n=thietNeed(it),M=matSave();if(n&&(M.thiet|0)<n){toast(i18nf('mat.thieu','Cần {0} Tinh Thiết để luyện tiếp (đang có {1})',n,M.thiet|0));return false}const ok=_glTL(it);if(ok&&n){M.thiet-=n;saveSave()}return ok};
const _bgTL=buildGear;
buildGear=function(){_bgTL();const sub=$('gbLt');if(!sub)return;const p=sub.parentElement;let m=$('gbMat');if(!m){m=document.createElement('span');m.id='gbMat';p.appendChild(m)}const M=matSave();
  m.innerHTML=` · ${matIc('thiet')}<b>${M.thiet|0}</b> <small>${i18n('mat.gbgoi','(luyện từ cấp 5 cần Tinh Thiết)')}</small>`};
// ── màn chọn nhân vật: ô Tu Luyện
const _selTL=buildSelect;
buildSelect=function(){_selTL();const box=$('cdInfo');if(!box)return;const id=selChar,L=tlLv(id),B=tlBonus(L),M=matSave(),d=document.createElement('div');d.className='kvbox';d.style.borderColor='#7bc96a';
  const c=tlCost(L);d.innerHTML=`<small>${i18nf('tl.tieude','Tu Luyện · cấp {0}/{1}',L,TL_MAX)}</small><p>${i18nf('tl.bonus','Máu +{0}% · Sát thương +{1}%',Math.round(B.hp*100),Math.round(B.dmg*100))}${L>=5?' · '+i18n('tl.p5','+1 đổi thẻ'):''}${L>=10?' · '+i18n('tl.p10','công pháp đầu khởi đầu cấp 2'):''}</p>
    <p style="font-size:11px;color:#5a6a4a">${matIc('thao')} ${MAT.thao.n}: <b>${M.thao|0}</b> · ${matIc('thiet')} ${MAT.thiet.n}: <b>${M.thiet|0}</b>${L<5?' · '+i18n('tl.moc5','cấp 5: thêm 1 lần đổi thẻ'):L<10?' · '+i18n('tl.moc10','cấp 10: công pháp đầu cấp 2'):''}</p>`;
  if(L<TL_MAX){const b=document.createElement('button');b.className='btn sm';b.innerHTML=`${c.lt} ◈ + ${c.thao} ${matIc('thao')}`;b.disabled=SAVE.lt<c.lt||(M.thao|0)<c.thao;b.onclick=e=>{e.stopPropagation();if(tlUp(id)){sfx('realm');toast(i18nf('tl.len','{0} tu luyện lên cấp {1}!',CHARS[id].n,L+1));buildSelect()}};d.appendChild(b)}
  box.appendChild(d)};
// ── màn kết thúc: nguyên liệu nhận được
const _soTL=showOver;
showOver=function(){_soTL();const g=G&&G.matG;if(!g)return;const box=$('ovGear');if(!box)return;let el=$('ovMat');if(!el){el=document.createElement('p');el.id='ovMat';el.className='sub';box.parentElement.insertBefore(el,box)}
  el.innerHTML=(g.thao||g.thiet)?`${matIc('thao')} +${g.thao|0} ${MAT.thao.n} · ${matIc('thiet')} +${g.thiet|0} ${MAT.thiet.n}`:''};
