'use strict';
// ───────────────────────── Tiếng ra chiêu của chế độ đánh tay và nút Thân pháp / Tuyệt kỹ (1.0.75)
// Mẫu CC0 từ freesound.org (danh sách trong README), cắt sẵn trong assets/sfx4.mp3 bằng ffmpeg (bỏ khoảng lặng đầu, chuẩn hóa âm lượng).
// SFX4_MAP: mã → [bắt đầu (giây), độ dài, âm lượng]. Gọi như mọi tiếng khác: sfx('a_kiem'). Mỗi lần phát đổi cao độ ±6% cho đỡ lặp.
// Chưa tải xong file hoặc máy không phát được thì rơi về tiếng tổng hợp cũ (bảng SFX4_FALL).
// THÊM TIẾNG: ghép thêm vào sfx4.mp3, thêm một dòng vào SFX4_MAP (và SFX4_FALL nếu là mã mới), rồi ghi nguồn vào README.
const SFX4_MAP={"a_kiem": [0.0, 0.4333, 0.5], "a_kiem3": [0.7333, 0.3497, 0.55], "a_quyen": [1.383, 0.5964, 0.55], "a_quyen3": [2.2794, 0.45, 0.6], "a_trao": [3.0294, 0.3439, 0.5], "a_dan": [3.6733, 0.6, 0.4], "a_bang": [4.5733, 0.5, 0.5], "a_bua": [5.3733, 0.8, 0.42], "a_tu": [6.4733, 0.7515, 0.55], "dash": [7.5248, 0.4117, 0.45], "tk_kiem": [8.2365, 1.4, 0.6], "tk_hoi": [9.9365, 1.233, 0.5], "no": [11.4695, 1.4, 0.55], "tk_ho": [13.1695, 1.8, 0.6], "roar": [15.2695, 1.2952, 0.5], "warn": [16.8648, 0.4664, 0.4]};
const SFX4_FALL={a_kiem:'sword',a_kiem3:'sword',a_quyen:'stone',a_quyen3:'stone',a_trao:'sword',a_dan:'vine',a_bang:'ice',a_bua:'tali',a_tu:'sword',dash:'wing',tk_kiem:'sword',tk_hoi:'vine',no:'boom',tk_ho:'sword',roar:'roar',warn:'sense'};
const SFX4_GAP={a_kiem:0.07,a_trao:0.07,a_dan:0.09,a_bang:0.09,a_bua:0.09,no:0.12,roar:0.6,warn:0.4,dash:0.1};
let SFX4BUF=null;const s4Last={};
function s4Load(){if(SFX4BUF||!AC)return;SFX4BUF=1;fetch('assets/sfx4.mp3?v='+VER).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(buf=>{SFX4BUF=buf}).catch(()=>{SFX4BUF=null})}
function sfx4(k){if(!AC||!SAVE.opt.sfx)return true;s4Load();const c=SFX4_MAP[k];if(!c||!SFX4BUF||SFX4BUF===1)return false;
  const now=AC.currentTime;if(now-(s4Last[k]||0)<(SFX4_GAP[k]||0.05))return true;s4Last[k]=now;
  try{const s=AC.createBufferSource(),g=AC.createGain();s.buffer=SFX4BUF;s.playbackRate.value=0.94+rand()*0.12;g.gain.value=c[2];s.connect(g);g.connect(sfxBus);s.start(0,c[0],c[1]+0.02)}catch(e){}return true}
{const _sfxS4=sfx;sfx=function(k){if(SFX4_MAP[k]){if(sfx4(k))return;return _sfxS4(SFX4_FALL[k]||k)}return _sfxS4(k)};
 const _aiS4=audioInit;audioInit=function(){_aiS4();s4Load()};}
