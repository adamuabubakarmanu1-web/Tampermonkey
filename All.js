// ==UserScript==
// @name         Socialearning - IG + FB Ultra Fast Clean
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Instagram & Facebook fast auto tasks with switch + username
// @match        https://socialearning.org/*
// @match        https://www.instagram.com/*
// @match        https://*.facebook.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
'use strict';

GM_addStyle(`
#taskSwitchBtn,#igUserBtn{
 position:fixed;
 right:10px;
 z-index:99999;
 color:#fff;
 border-radius:50%;
 width:45px;
 height:45px;
 font-size:22px;
 border:2px solid white;
 cursor:pointer;
 display:flex;
 align-items:center;
 justify-content:center;
}
#taskSwitchBtn{top:50%;background:#28a745;}
#igUserBtn{top:35%;background:#007bff;}

#taskMenu{
 position:fixed;
 top:50%;
 right:70px;
 transform:translateY(-50%);
 background:#000;
 color:#fff;
 padding:10px;
 border-radius:10px;
 display:none;
 z-index:99999;
}
#taskMenu div{padding:6px 10px;cursor:pointer;}
#taskMenu div:hover{background:#444;}
`);

const switchBtn=document.createElement("button");
switchBtn.id="taskSwitchBtn";
switchBtn.innerHTML="⚙️";
document.body.appendChild(switchBtn);

const igBtn=document.createElement("button");
igBtn.id="igUserBtn";
igBtn.innerHTML="👤";
document.body.appendChild(igBtn);

const menu=document.createElement("div");
menu.id="taskMenu";
menu.innerHTML=`<div id="igOpt">📸 Instagram</div><div id="fbOpt">📘 Facebook</div>`;
document.body.appendChild(menu);

switchBtn.onclick=()=>menu.style.display=menu.style.display==="block"?"none":"block";

document.getElementById("igOpt").onclick=()=>{
 GM_setValue("active_task","instagram");
 location.reload();
};

document.getElementById("fbOpt").onclick=()=>{
 GM_setValue("active_task","facebook");
 location.reload();
};

igBtn.onclick=()=>{
 let u=prompt("Saka EXACT Instagram Username:",GM_getValue("stored_ig_user",""));
 if(u) GM_setValue("stored_ig_user",u.trim());
};

let mode=GM_getValue("active_task","instagram");
const url=location.href;


// ================= INSTAGRAM =================

if(mode==="instagram"){

if(url.includes("/earner/available/tasks") && !url.includes("filter_social_media=2")){
 location.replace("https://socialearning.org/earner/available/tasks?filter_social_media=2");
 return;
}

if(url.includes("/earner/available/tasks")){
 const fast=setInterval(()=>{
  const b=[...document.querySelectorAll("a,button")]
  .find(x=>x.textContent.trim().toLowerCase()=="view task");
  if(b){
   clearInterval(fast);
   GM_setValue("ig_state","pending");
   b.click();
  }
 },100);
}

if(url.includes("/earner/update/tasks/view/")){
 const loop=setInterval(()=>{
  const s=document.querySelector("select[name='username']")||document.querySelector("select");
  const v=[...document.querySelectorAll("a")].find(b=>b.textContent.includes("View Job"));
  const sub=document.querySelector("#submit_btn")||document.querySelector('button[type="submit"]');
  const st=GM_getValue("ig_state","idle");

  if(v && st==="pending"){
   GM_setValue("ig_state","opened");
   window.open(v.href,"_blank");
  }

  if(s && st==="completed"){
   let saved=GM_getValue("stored_ig_user","");
   for(let i=0;i<s.options.length;i++){
    if(s.options[i].text.trim()===saved){
     s.selectedIndex=i;
     s.dispatchEvent(new Event("change"));
     clearInterval(loop);
     GM_setValue("ig_state","idle");
     sub.click();
     break;
    }
   }
  }
 },150);
}

if(location.hostname.includes("instagram.com")){
 const scan=setInterval(()=>{
  const btns=[...document.querySelectorAll("button")];

  if(btns.some(b=>["Following","Requested","Kuna biyo","An aika buƙata"].includes(b.innerText))){
   clearInterval(scan);
   GM_setValue("ig_state","completed");
   window.close();
  }else{
   const f=btns.find(b=>b.innerText=="Follow"||b.innerText=="Biyo");
   if(f) f.click();
  }
 },120);
}

}


// ================= FACEBOOK =================

if(mode==="facebook"){

if(url.includes("/earner/available/tasks") && !url.includes("filter_social_media=5")){
 location.replace("https://socialearning.org/earner/available/tasks?filter_social_media=5");
 return;
}

if(url.includes("/earner/available/tasks")){
 const b=[...document.querySelectorAll("a,button")]
 .find(x=>x.textContent.trim().toLowerCase()=="view task");
 if(b){
  GM_setValue("fb_state","start");
  b.click();
 }
}

if(url.includes("/earner/update/tasks/view/")){
 const loop=setInterval(()=>{
  const st=GM_getValue("fb_state","idle");
  const v=[...document.querySelectorAll("a")].find(b=>b.textContent.includes("View Job"));
  const s=document.querySelector("select[name='username']")||document.querySelector("select");
  const f=document.querySelector("input[type='file']");
  const sub=document.querySelector('button[type="submit"]')||document.querySelector('.btn-primary');

  if(v && st==="start"){
   GM_setValue("fb_state","working");
   window.open(v.href,"_blank");
  }

  if(s && s.selectedIndex<=0){
   s.selectedIndex=1;
   s.dispatchEvent(new Event("change",{bubbles:true}));
  }

  if((st==="working"||st==="completed") && f && f.files.length>0){
   clearInterval(loop);
   GM_setValue("fb_state","idle");
   setTimeout(()=>{
    sub.disabled=false;
    sub.click();
   },1000);
  }
 },250);
}

if(url.includes("facebook.com")){
 let done=false;

 const scan=setInterval(()=>{
  const els=[...document.querySelectorAll('div[role="button"],span,i,a[role="button"]')];

  if(els.some(e=>["Following","Liked","Requested","Friends"].includes(e.innerText.trim()))){
   clearInterval(scan);
   setTimeout(()=>{
    GM_setValue("fb_state","completed");
    window.close();
   },3000);
   return;
  }

  if(!done){
   const t=els.find(e=>["Follow","Like","Add Friend"].includes(e.innerText.trim()));
   if(t){
    t.click();
    done=true;
   }
  }
 },120);
}

}

})();
