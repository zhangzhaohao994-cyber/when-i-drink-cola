'use strict';
const audio=document.querySelector('#audio'),heroPlay=document.querySelector('#hero-play'),statusText=document.querySelector('#status'),mainCaption=document.querySelector('#caption-main'),translation=document.querySelector('#caption-translation'),roleCaption=document.querySelector('#caption-role'),sectionNow=document.querySelector('#section-now'),seek=document.querySelector('#seek'),elapsed=document.querySelector('#elapsed'),progress=document.querySelector('#wave-progress'),wave=document.querySelector('.wave-wrap');
let track=null,lastKey='',preview=null,completedPreview=null,previewTimer=null;
const people=[...document.querySelectorAll('[data-person]')];
const format=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;
function resizeWave(){wave.style.setProperty('--wave-width',`${wave.clientWidth}px`)}resizeWave();window.addEventListener('resize',resizeWave);
fetch('assets/track-v3.json').then(r=>{if(!r.ok)throw Error('track');return r.json()}).then(d=>{track=d;update()}).catch(()=>{statusText.textContent='字幕暂时未加载，音乐仍可播放。刷新页面可重试。'});
function stopPreviewTimer(){if(previewTimer!==null){clearInterval(previewTimer);previewTimer=null}}
function showCompletedPreview(p){mainCaption.textContent=`${p.zh}，谢谢你。`;translation.textContent=`${p.en}, thank you.`;roleCaption.textContent='姓名感谢 / Name + thank you';statusText.textContent='中英文感谢试听已结束。';people.forEach(b=>b.classList.toggle('active',b.dataset.person===p.id));lastKey=`preview-${p.id}`}
function checkPreviewEnd(){if(preview&&!audio.paused&&audio.currentTime>=preview.end){completedPreview=preview;preview=null;stopPreviewTimer();audio.pause();showCompletedPreview(completedPreview);return true}return false}
function startPreviewTimer(){stopPreviewTimer();if(preview)previewTimer=setInterval(checkPreviewEnd,50)}
function clearPreview(){preview=null;completedPreview=null;stopPreviewTimer();lastKey=''}
function update(){const t=audio.currentTime||0;seek.value=t;elapsed.textContent=format(t);progress.style.width=`${Math.min(100,t/204*100)}%`;if(checkPreviewEnd())return;if(completedPreview&&audio.paused)return;if(!track)return;
 const e=track.events.find(e=>t>=e.start&&t<e.end),key=e?.key||'instrumental';
 if(key!==lastKey){lastKey=key;people.forEach(p=>p.classList.toggle('active',p.dataset.person===e?.person));if(e){mainCaption.textContent=e.text;translation.textContent=e.translation;roleCaption.textContent=e.person?`${e.role_zh} / ${e.role_en}`:'LIVE LYRICS / 同步字幕'}else{mainCaption.textContent=t===0?'Open，谢谢你。':'器乐段';translation.textContent=t===0?'Open, thanks.':'Instrumental';roleCaption.textContent='LIVE LYRICS / 同步字幕'}}
 const s=[...track.sections].reverse().find(s=>t>=s.start);if(s)sectionNow.textContent=s.label;
}
function requestPlay(){audio.play().catch(()=>{stopPreviewTimer();statusText.textContent='暂时无法播放，请使用音频控件重试或下载完整 MP3。'})}
function seekTo(t,play){t=Math.max(0,Math.min(203.9,Number(t)));if(audio.readyState>=1)audio.currentTime=t;else{audio.addEventListener('loadedmetadata',()=>{audio.currentTime=t;update()},{once:true});audio.load()}if(play)requestPlay();else update()}
heroPlay.addEventListener('click',()=>{clearPreview();audio.paused?requestPlay():audio.pause()});
document.querySelectorAll('[data-seek]').forEach(b=>b.addEventListener('click',()=>{clearPreview();if(b.dataset.person){preview={id:b.dataset.person,zh:b.querySelector('.person-zh').textContent,en:b.querySelector('.person-en').textContent,end:Number(b.dataset.previewEnd)};startPreviewTimer()}seekTo(b.dataset.seek,true)}));
seek.addEventListener('input',()=>{clearPreview();seekTo(seek.value,false)});audio.addEventListener('timeupdate',update);audio.addEventListener('seeked',update);
audio.addEventListener('play',()=>{if(completedPreview)clearPreview();heroPlay.textContent='Ⅱ 暂停音乐';heroPlay.setAttribute('aria-pressed','true');startPreviewTimer()});
audio.addEventListener('pause',()=>{stopPreviewTimer();heroPlay.textContent='▶ 播放闭幕音乐';heroPlay.setAttribute('aria-pressed','false');if(completedPreview)showCompletedPreview(completedPreview);else statusText.textContent=audio.ended?'Open，谢谢你。Open, thanks.':'已暂停。'});
audio.addEventListener('playing',()=>{statusText.textContent=preview?'正在试听 · 中文姓名＋谢谢你 / English name + thank you':'正在播放 · Open 谢谢你 / Open thanks'});
audio.addEventListener('waiting',()=>{statusText.textContent='正在加载音频…'});audio.addEventListener('error',()=>{stopPreviewTimer();statusText.textContent='暂时无法播放，可刷新重试或下载完整 MP3。'});
audio.addEventListener('ended',()=>{clearPreview();mainCaption.textContent='Open，谢谢你。';translation.textContent='Open, thanks.';roleCaption.textContent='THANK YOU / 谢谢';people.forEach(p=>p.classList.remove('active'))});
