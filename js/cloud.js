'use strict';
// ───────────────────────── lưu đám mây + bảng xếp hạng + số liệu ẩn danh (Cloudflare Pages Functions + D1)
const CLOUD=(()=>{
  const h=typeof location!=='undefined'?location.hostname:'';
  if(typeof window!=='undefined'&&window.Capacitor)return 'https://tutien.kentjuno.com/api';
  if(/kentjuno\.com$|pages\.dev$/.test(h))return '/api';
  if(typeof location!=='undefined'&&/^(127\.0\.0\.1|localhost)$/.test(h)&&location.port==='8788')return '/api';
  return null;
})();
const CK='vntt_cloud';
let cloudSt={id:'',tok:'',name:'',last:0,err:''};
try{Object.assign(cloudSt,JSON.parse(localStorage.getItem(CK)||'{}'))}catch(e){}
function rid(n){const a='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789',b=new Uint8Array(n);if(typeof crypto!=='undefined'&&crypto.getRandomValues)crypto.getRandomValues(b);else for(let i=0;i<n;i++)b[i]=Math.random()*256|0;return [...b].map(x=>a[x%a.length]).join('')}
function cloudKeep(){try{localStorage.setItem(CK,JSON.stringify(cloudSt))}catch(e){}}
if(!cloudSt.id){cloudSt.id=rid(12);cloudSt.tok=rid(20);cloudSt.name=i18n('ui.cloud.daoHuu','Đạo hữu ')+rid(3).toUpperCase();cloudKeep()}
const cloudOn=()=>!!CLOUD;
async function api(path,opt={}){
  const r=await fetch(CLOUD+path,{method:opt.method||'GET',headers:opt.body?{'Content-Type':'application/json'}:undefined,body:opt.body?JSON.stringify(opt.body):undefined});
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok){const e=new Error(j.err||('http '+r.status));e.status=r.status;throw e}
  return j;
}
const saveProg=s=>s?((s.runs||0)*10+(s.wins||0)*100+((s.tower&&s.tower.best)||0)*30+Object.values(s.up||{}).reduce((a,b)=>a+b,0)*20):0;
let pushT=null, pushing=false;
function cloudQueue(){if(!CLOUD||cloudSt.paused)return;clearTimeout(pushT);pushT=setTimeout(cloudPush,4000)}
async function cloudPush(force){
  if(!CLOUD||pushing)return; if(force)delete cloudSt.paused; else if(cloudSt.paused)return; pushing=true;
  try{await api('/save',{method:'PUT',body:{id:cloudSt.id,tok:cloudSt.tok,data:SAVE,upd:SAVE.upd||Date.now(),name:cloudSt.name}});cloudSt.last=Date.now();cloudSt.err='';cloudKeep()}
  catch(e){cloudSt.err=e.status===409?'stale':'offline';if(e.status===409&&!force)cloudPull(true)}
  pushing=false;
}
function applyCloudSave(data){try{localStorage.setItem('vntt1',JSON.stringify(data))}catch(e){}SAVE=loadSave();if(!G&&typeof buildMenu==='function')buildMenu()}
async function cloudPull(quiet){
  if(!CLOUD)return;
  try{const r=await api(`/save?id=${cloudSt.id}&tok=${cloudSt.tok}`);
    if(r.data&&(r.upd||0)>(SAVE.upd||0)&&saveProg(r.data)>=saveProg(SAVE)){if(G)return;applyCloudSave(r.data);if(!quiet&&typeof toast==='function')toast(i18n('ui.cloud.daTaiTienTrinh','Đã tải tiến trình từ đám mây'))}
    else cloudQueue();
    if(r.name&&!cloudSt.nameSet){cloudSt.name=r.name;cloudKeep()}
  }catch(e){if(e.status===404)cloudQueue()}
}
const syncCode=()=>`${cloudSt.id}-${cloudSt.tok}`;
async function cloudLink(code){
  const m=/^\s*([A-Za-z0-9]{10,32})-([A-Za-z0-9]{10,32})\s*$/.exec(code||''); if(!m)return i18n('ui.cloud.maKhongDungDang','Mã không đúng dạng');
  try{const r=await api(`/save?id=${m[1]}&tok=${m[2]}`); if(!r.data)return i18n('ui.cloud.maNayChuaCo','Mã này chưa có dữ liệu');
    cloudSt.id=m[1];cloudSt.tok=m[2];if(r.name)cloudSt.name=r.name;cloudKeep();applyCloudSave(r.data);return ''}
  catch(e){return e.status===403||e.status===404?i18n('ui.cloud.khongTimThayMa','Không tìm thấy mã này'):i18n('ui.cloud.khongKetNoiDuoc','Không kết nối được máy chủ')}
}
function cloudSetName(n){n=String(n||'').replace(/[<>]/g,'').trim().slice(0,18);if(!n)return;cloudSt.name=n;cloudSt.nameSet=1;cloudKeep();cloudPush(true)}
async function cloudDelete(){
  try{await api('/save',{method:'DELETE',body:{id:cloudSt.id,tok:cloudSt.tok}})}catch(e){if(e.status!==404)return false}
  cloudSt={id:rid(12),tok:rid(20),name:cloudSt.name,last:0,err:'',paused:1};cloudKeep();return true}
function dayKey(){const t=new Date();return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')}
async function cloudScore(score,realm,ch){if(!CLOUD)return false;try{await api('/score',{method:'POST',body:{id:cloudSt.id,tok:cloudSt.tok,date:dayKey(),score,waves:realm,ch,name:cloudSt.name}});return true}catch(e){return false}}
async function cloudLb(){return api(`/lb?date=${dayKey()}&id=${cloudSt.id}`)}
let evQ=[];
function track(k,v){if(!CLOUD)return;evQ.push({k,v});if(evQ.length>=20)evFlush()}
function evFlush(){if(!CLOUD||!evQ.length)return;const ev=evQ.splice(0,30);
  try{const b=JSON.stringify({id:cloudSt.id,ev});if(navigator.sendBeacon)navigator.sendBeacon(CLOUD+'/ev',new Blob([b],{type:'text/plain'}));else fetch(CLOUD+'/ev',{method:'POST',body:b,keepalive:true})}catch(e){}}
if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden){evFlush();if(CLOUD){clearTimeout(pushT);cloudPush()}}});
