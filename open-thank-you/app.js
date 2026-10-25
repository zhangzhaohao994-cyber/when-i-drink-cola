'use strict';
const audio=document.querySelector('#audio'),heroPlay=document.querySelector('#hero-play'),statusText=document.querySelector('#status'),mainCaption=document.querySelector('#caption-main'),translation=document.querySelector('#caption-translation'),roleCaption=document.querySelector('#caption-role'),sectionNow=document.querySelector('#section-now'),seek=document.querySelector('#seek'),elapsed=document.querySelector('#elapsed'),progress=document.querySelector('#wave-progress'),wave=document.querySelector('.wave-wrap');
let track=null,lastKey='';const people=[...document.querySelectorAll('[data-person]')];
const format=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;
function resizeWave(){wave.style.setProperty('--wave-width',`${wave.clientWidth}px`)}resizeWave();window.addEventListener('resize',resizeWave);
fetch('assets/track-v2.json').then(r=>{if(!r.ok)throw Error('track');return r.json()}).then(d=>{track=d;update()}).catch(()=>{statusText.textContent='字幕暂时未加载，音乐仍可播放。刷新页面可重试。'});
function update(){const t=audio.currentTime||0;seek.value=t;elapsed.textContent=format(t);progress.style.width=`${Math.min(100,t/204*100)}%`;if(!track)return;
 const e=track.events.find(e=>t>=e.start&&t<e.end);const key=e?.key||'instrumental';
 if(key!==lastKey){lastKey=key;people.forEach(p=>p.classList.toggle('active',p.dataset.person===e?.person));if(e){mainCaption.textContent=e.text;translation.textContent=e.translation;roleCaption.textContent=e.person?`${e.role_zh} / ${e.role_en}`:'LIVE LYRICS / 同步字幕'}else{mainCaption.textContent=t===0?'OPEN，Thank you。':'器乐段';translation.textContent=t===0?'Thank you for being here.':'Instrumental';roleCaption.textContent='LIVE LYRICS / 同步字幕'}}
 const s=[...track.sections].reverse().find(s=>t>=s.start);if(s)sectionNow.textContent=s.label;
}
function requestPlay(){audio.play().catch(()=>{statusText.textContent='暂时无法播放，请使用音频控件重试或下载完整 MP3。'})}
function seekTo(t,play){t=Math.max(0,Math.min(203.9,Number(t)));if(audio.readyState>=1)audio.currentTime=t;else{audio.addEventListener('loadedmetadata',()=>{audio.currentTime=t;update()},{once:true});audio.load()}if(play)requestPlay();else update()}
heroPlay.addEventListener('click',()=>audio.paused?requestPlay():audio.pause());
document.querySelectorAll('[data-seek]').forEach(b=>b.addEventListener('click',()=>seekTo(b.dataset.seek,true)));
seek.addEventListener('input',()=>seekTo(seek.value,false));audio.addEventListener('timeupdate',update);audio.addEventListener('seeked',update);
audio.addEventListener('play',()=>{heroPlay.textContent='Ⅱ 暂停音乐';heroPlay.setAttribute('aria-pressed','true')});
audio.addEventListener('pause',()=>{heroPlay.textContent='▶ 播放闭幕音乐';heroPlay.setAttribute('aria-pressed','false');statusText.textContent=audio.ended?'OPEN，Thank you。谢谢每一位。':'已暂停。'});
audio.addEventListener('playing',()=>{statusText.textContent='正在播放 · OPEN Thank You / 姓名旋律版 / Techno'});audio.addEventListener('waiting',()=>{statusText.textContent='正在加载音频…'});audio.addEventListener('error',()=>{statusText.textContent='暂时无法播放，可刷新重试或下载完整 MP3。'});
audio.addEventListener('ended',()=>{mainCaption.textContent='OPEN，Thank you。';translation.textContent='Thank you to every artist, our curator, and the whole team.';roleCaption.textContent='THANK YOU / 谢谢';people.forEach(p=>p.classList.remove('active'))});
