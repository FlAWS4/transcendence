import {mountBrandWordmark} from './viewer-wordmark.mjs';
const element=document.querySelector('#wordmark'),brand=document.querySelector('#brand');
const wordmark=mountBrandWordmark({element,brandLink:brand});
const buttons=[...document.querySelectorAll('[data-awards]')];
function describe(){
 const target=element.dataset.wordmarkTarget;
 for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.awards===(target==='AWARDS'?'true':'false')));
 document.querySelector('#status').textContent=`42 ${target} — ${element.dataset.wordmarkPhase==='settled'?'au repos':'transition en cours'}`;
}
for(const button of buttons)button.addEventListener('click',()=>{wordmark.setAwards(button.dataset.awards==='true');describe();});
brand.addEventListener('click',event=>{event.preventDefault();wordmark.setAwards(false);describe();});
const observer=new MutationObserver(describe);observer.observe(element,{attributes:true,attributeFilter:['data-wordmark-phase','data-wordmark-target']});
const theme=document.querySelector('#theme');theme.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';theme.setAttribute('aria-pressed',String(dark));theme.textContent=dark?'Passer en clair':'Passer en sombre';});
describe();
