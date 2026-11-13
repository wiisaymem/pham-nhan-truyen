'use strict';
// ───────────────────────── Độ khó kiểu Diablo 3 (05/11/2026): chọn lúc nhập trận, chồng lên hệ số của Ải.
// 4 bậc đầu mở sẵn; Luyện Ngục I–VI mở dần: thắng (độ kiếp thành công) ở bậc trước thì mở bậc sau.
// Bậc càng cao: yêu quái nhiều máu, đánh đau, tinh anh xuất hiện nhiều hơn; đổi lại linh thạch, đồ hiếm và điểm xếp hạng tăng.
// Không áp cho Thông Thiên Tháp (tháp có tầng và phép riêng).
const DK_LN=['I','II','III','IV','V','VI'];
const DOKHO=[
  {id:'pham', n:()=>i18n('dk.pham','Phàm Nhân'), hp:1,   dmg:1,    lt:1,   rar:0,    el:1},
  {id:'khotu',n:()=>i18n('dk.khotu','Khổ Tu'),   hp:1.7, dmg:1.3,  lt:1.6, rar:0.04, el:1.5},
  {id:'maluyen',n:()=>i18n('dk.maluyen','Ma Luyện'),hp:2.8,dmg:1.7,lt:2.4, rar:0.08, el:2},
  {id:'thienma',n:()=>i18n('dk.thienma','Thiên Ma'),hp:4.5,dmg:2.2,lt:3.4, rar:0.12, el:2.5},
  ...DK_LN.map((r,i)=>({id:'ln'+(i+1),n:()=>i18nf('dk.ln','Luyện Ngục {0}',r),ln:1,
    hp:+(4.5*Math.pow(1.5,i+1)).toFixed(2),dmg:+(2.2*Math.pow(1.22,i+1)).toFixed(2),lt:+(3.4+0.9*(i+1)).toFixed(1),rar:Math.min(0.4,0.12+0.04*(i+1)),el:2.5+0.5*(i+1)}))];
const DK_OPEN=4;   // số bậc mở sẵn
function dkSave(){if(!SAVE.dk)SAVE.dk={sel:0,best:-1};return SAVE.dk}
const dkUnlocked=i=>i<DK_OPEN||i<=dkSave().best+1;
const dkScore=i=>1+0.25*i;   // điểm xếp hạng nhân theo bậc
// ── áp vào trận
const _newRunDK=newRun;
newRun=function(charId,mapId,towerF,aiN){
  _newRunDK(charId,mapId,towerF,aiN);
  const S=dkSave();if(!dkUnlocked(S.sel))S.sel=0;
  G.dk=G.ai?S.sel:0;G.dkE=1;
  if(G.ai&&G.dk>0){const D=DOKHO[G.dk],A=G.ai;
    A.hp*=D.hp;A.boss*=D.hp;A.dmg*=D.dmg;A.lt*=D.lt;A.rar=Math.min(0.85,(A.rar||0)+D.rar);G.dkE=D.el}
};
const _startGameDK=startGame;
startGame=function(){_startGameDK();if(G&&G.dk>0)setTimeout(()=>announce(i18nf('dk.vao','Độ khó: {0}',DOKHO[G.dk].n()),DOKHO[G.dk].ln?'bad':'realm'),2600)};
function dkEnd(win){   // gọi từ endRun (game.js) trước khi hiện bảng kết quả
  const S=dkSave(),i=G.dk|0;if(!win||i<=S.best)return;S.best=i;const nx=i+1;
  if(nx<DOKHO.length&&nx>=DK_OPEN){const m=i18nf('dk.mo','Mở độ khó {0}!',DOKHO[nx].n());G.unlockMsg=G.unlockMsg?G.unlockMsg+' · '+m:m}
}
// ── chọn độ khó ở màn chọn tu sĩ
function buildDK(){
  const row=$('dkRow'),info=$('dkInfo');if(!row)return;row.innerHTML='';const S=dkSave();if(!dkUnlocked(S.sel))S.sel=0;
  DOKHO.forEach((D,i)=>{const op=dkUnlocked(i),b=document.createElement('button');
    b.className='dkb'+(i===S.sel?' on':'')+(op?'':' locked')+(D.ln?' ln':'');b.textContent=D.n();
    if(!op)b.title=i18nf('dk.khoa','Thắng ở {0} để mở',DOKHO[i-1].n());
    b.onclick=()=>{sfx('click');if(!op){toast(i18nf('dk.khoa','Thắng ở {0} để mở',DOKHO[i-1].n()));return}S.sel=i;saveSave();buildDK()};row.appendChild(b)});
  const D=DOKHO[S.sel],pc=v=>Math.round((v-1)*100);
  info.innerHTML=S.sel===0?i18n('dk.info0','Yêu quái bình thường, không có thưởng thêm.')
    :i18nf('dk.info','Yêu quái: máu ×{0}, sát thương ×{1}, tinh anh ×{2}<br>Thưởng: linh thạch +{3}%, đồ hiếm +{4}%, điểm xếp hạng +{5}%',
      D.hp,D.dmg,D.el,pc(D.lt),Math.round(D.rar*100),pc(dkScore(S.sel)));
  const cur=row.querySelector('.on');if(cur&&cur.scrollIntoView)try{cur.scrollIntoView({block:'nearest',inline:'center'})}catch(e){}
}
const _buildSelectDK=buildSelect;
buildSelect=function(){_buildSelectDK();buildDK()};
