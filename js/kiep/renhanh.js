'use strict';
// ───────────────────────── Đạo Pháp giai đoạn 5: rẽ nhánh ở cấp 3
// Công pháp lên cấp 3 thì chọn 1 trong 2 nhánh theo Môn: một nhánh rộng/nhiều, một nhánh tập trung/mạnh.
// Nhánh nhân trực tiếp vào chỉ số WEAP[k].s(lv), nên dòng mô tả sinh từ đúng chỉ số công pháp đó có.

const BR_N={kiem:[['Vạn Kiếm','Myriad Swords'],['Nhất Kiếm','Single Sword']],tran:[['Quảng Trận','Wide Array'],['Tụ Trận','Focused Array']],
  phu:[['Liên Phù','Chain Talisman'],['Bạo Phù','Blast Talisman']],the:[['Cương Thể','Iron Body'],['Cuồng Thể','Berserk Body']],linh:[['Quần Linh','Spirit Swarm'],['Linh Vương','Spirit King']]};
const DMGK=['dmg','dps','tick','boom'],AREAK=['r','R','rng'];
// mỗi nhánh: danh sách [khóa, phép, giá trị]; '*' nhân, '+' cộng, '-' trừ (giữ tối thiểu 1)
const BR_M={
  // A rộng/nhiều: thắng khi đánh bầy. B tập trung: thắng khi đánh boss. Hệ số đo bằng bài thử 20 giây (bầy 60 con / 1 boss), 10/2026
  kiem:[[['n','+',2],['b','+',2],['ch','+',1],['pierce','+',1],[DMGK,'*',0.85]],[[DMGK,'*',1.5],['pierce','+',2],['n','-',1],['r','*',1.3]]],
  tran:[[[AREAK,'*',1.35],['dur','*',1.2],[DMGK,'*',0.85]],[[AREAK,'*',0.95],[DMGK,'*',1.6]]],
  phu:[[['cd','*',0.8],['every','*',0.75],['n','+',1],[DMGK,'*',0.85]],[[DMGK,'*',1.35],[AREAK,'*',1.2],['cd','*',1.25]]],
  the:[[[AREAK,'*',1.3],['kb','*',1.5],['n','+',1]],[[DMGK,'*',1.45],[AREAK,'*',0.95]]],
  linh:[[['n','+',1],['cd','*',0.8],['kill','*',1.4],[DMGK,'*',0.9]],[[DMGK,'*',1.35],['dur','*',1.3],['n','-',1],['heal','*',1.5]]],
};
// ngoại lệ: công pháp không có chỉ số số lượng/sát thương thì nhánh chung thành thuần trừ
const BR_X={hanbangthuong:[[['cd','*',0.6],[DMGK,'*',0.9]],null],
  mithuat:[[['n','+',2],['hit','*',1.15]],[['hit','*',1.3],['dur','*',1.2]]],
  linhmoc:[null,[[DMGK,'*',1.6]]],
  thienloitru:[[['n','+',1],['dur','*',1.2],[DMGK,'*',0.85]],null],
  sonnhac:[null,[[DMGK,'*',1.6]]],
  phonghoa:[[['every','*',0.8],[AREAK,'*',1.2],[DMGK,'*',0.85]],[[DMGK,'*',1.6]]],
  hoavu:[[[AREAK,'*',1.3],['dur','*',1.2],[DMGK,'*',0.9]],null],
  thachthuong:[null,[[DMGK,'*',1.6],['b','+',1]]],
  hoangtho:[null,[[DMGK,'*',1.5]]]};
function brMods(k,b){const x=BR_X[k];if(x&&x[b])return x[b];const m=W_MON[k];return m&&BR_M[m]?BR_M[m][b]:null}
function brApply(s,k,b){const M=brMods(k,b);if(!M)return s;const done={};
  for(const [ks,op,v] of M){for(const key of [].concat(ks)){if(typeof s[key]!=='number'||done[key])continue;done[key]=1;
    if(op==='*')s[key]=s[key]*v;else if(op==='+')s[key]=s[key]+v;else if(op==='-'){if(s[key]<=1)continue;s[key]=Math.max(1,s[key]-v)}}}
  return s}
// mô tả: chỉ ghi những gì thật sự đổi trên công pháp này
const BR_L={n:['số lượng','count'],dmg:['sát thương','damage'],dps:['sát thương','damage'],tick:['sát thương','damage'],boom:['sát thương nổ','blast damage'],
  r:['phạm vi','area'],R:['phạm vi','area'],rng:['tầm','range'],cd:['hồi chiêu','cooldown'],pierce:['xuyên','pierce'],dur:['thời gian','duration'],
  kb:['đẩy lùi','knockback'],every:['nhịp nổ','blast interval'],kill:['ngưỡng hút hồn','soul-snatch threshold'],b:['nảy','bounces'],ch:['nảy','jumps'],heal:['hồi máu','healing']};
BR_L.hit=['sát thương khi bị mê','charmed damage'];
function brDesc(k,b){const M=brMods(k,b);if(!M)return'';const base=WEAP[k].s(3),en=CUR_LANG==='en',out=[],seen={};
  for(const [ks,op,v] of M){for(const key of [].concat(ks)){if(typeof base[key]!=='number')continue;const L=BR_L[key];if(!L||seen[L[0]])continue;
    if(op==='-'&&base[key]<=1)continue;seen[L[0]]=1;
    out.push(op==='*'?`${L[en?1:0]} ${v>1?'+':'−'}${Math.round(Math.abs(v-1)*100)}%`:`${op==='+'?'+':'−'}${v} ${L[en?1:0]}`);break}}
  const t=out.join(', ');return t.charAt(0).toUpperCase()+t.slice(1)+'.'}
const brName=(k,b)=>{const m=W_MON[k],en=CUR_LANG==='en';return BR_N[m]?BR_N[m][b][en?1:0]:''};

// gói WEAP[k].s: chỉ số đổi theo nhánh của công pháp đang cầm
for(const k in WEAP){const W=WEAP[k];if(!W||typeof W.s!=='function'||W.s.br)continue;const o=W.s;
  W.s=function(lv){const s=Object.assign({},o(lv));const w=G&&G.w&&G.w[k];if(w&&w.br!==undefined&&lv>=3)brApply(s,k,w.br);return s};W.s.br=1}

// lên cấp 3 → hàng đợi chọn nhánh
const _acBR=applyCard;
applyCard=function(c){if(c.t==='br'){const w=G.w[c.k];if(w){w.br=c.b;G.fx.push({k:'pillar',x:G.p.x,y:G.p.y,t:0,dur:1.4,c:EL[WEAP[c.k].el].c||'#ffd45a'});
    SAVE.brSeen=SAVE.brSeen||{};SAVE.brSeen[c.k+c.b]=1;saveSave()}recompute();sfx('realm');return}
  _acBR(c);if(c.t==='w'&&G.w[c.k]&&G.w[c.k].lv===3&&G.w[c.k].br===undefined&&brMods(c.k,0)){G.brQ=G.brQ||[];if(!G.brQ.includes(c.k))G.brQ.push(c.k)}};
// chọn nhánh ngay sau thẻ vừa chọn: chen vào pickCard
const _pcBR=pickCard;
pickCard=function(i){_pcBR(i);if(G&&G.brQ&&G.brQ.length&&!cards&&!G.over)openBranch()};
function openBranch(){const k=G.brQ.shift();if(!G.w[k]||G.w[k].br!==undefined)return;
  G.paused=true;G.pendLv++;G.brNow=1;banMode=false;cards=[{t:'br',k,b:0},{t:'br',k,b:1}];
  $('luTitle').textContent=i18nf('br.title','{0} · rẽ nhánh',WEAP[k].n);renderCards();show('lvup');sfx('level');lvLock=performance.now()+400}
const _rcBR=renderCards;
renderCards=function(){const sp=[];if(cards)cards.forEach((c,i)=>{if(c.t==='br'){sp.push([i,c]);cards[i]={t:'lt'}}});
  try{_rcBR()}finally{for(const [i,c] of sp)cards[i]=c}
  const bs=$('luCards').children;
  for(const [i,c] of sp){const b=bs[i];if(!b)continue;const W=WEAP[c.k],m=W_MON[c.k];b.className='card3 brc';
    b.innerHTML=`<img src="${iconURL(W.ic)}"><div class="ct"><b>${brName(c.k,c.b)}<i class="new br">${i18n('br.tag','Nhánh')} ${c.b?'B':'A'}</i></b><small>${W.n} · ${typeof tgI==='function'?tgI(m):''}${MON[m]?MON[m].n:''}</small><p>${brDesc(c.k,c.b)}</p></div>`}
  if(sp.length){$('luTools').hidden=true;$('luSub').textContent=i18n('br.sub','Chọn hướng tu luyện cho công pháp này, không đổi lại được')}
  // thẻ nâng cấp của công pháp đã rẽ nhánh: ghi tên nhánh
  if(cards&&G&&G.w)cards.forEach((c,i)=>{if(c.t!=='w')return;const w=G.w[c.k];if(!w||w.br===undefined)return;const sm=bs[i]&&bs[i].querySelector('small');if(sm&&!sm.dataset.br){sm.dataset.br=1;sm.insertAdjacentHTML('afterbegin',`<span class="brn">${brName(c.k,w.br)}</span> · `)}})};
const _apBR=applyCard;applyCard=function(c){if(c.t==='br'){G.brNow=0}_apBR(c)};
(function(){const st=document.createElement('style');st.textContent=`
.card3.brc{border-color:#3aa88a!important;background:linear-gradient(#f2fffa,#d8f6ea)!important;box-shadow:0 3px 0 #23806a,0 0 10px #9ff0d4!important}
.new.br{background:#23806a!important}.brn{color:#23806a;font-weight:700}`;document.head.appendChild(st)})();
const _nrBR=newRun;newRun=function(...a){const r=_nrBR(...a);if(G)G.brQ=[];return r};
// Bí Kíp: số nhánh đã thử
const _bkBR=buildBikip;
buildBikip=function(){_bkBR();const S=SAVE.brSeen||{},n=Object.keys(S).length,tot=Object.keys(WEAP).filter(k=>brMods(k,0)).length*2;
  $('bkList').appendChild(elx('div','dbs',`<span>${i18nf('br.bk','Rẽ nhánh cấp 3 đã thử: {0}/{1}',n,tot)}</span>`))};
