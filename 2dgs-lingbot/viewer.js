import {sampleTour,timeAtFrame,easeInOut} from '../calm-tour.mjs?v=calm1';
import * as THREE from 'three';
import {installDalgu} from './dalgu-office.js?v=lock2';
let dalgu;
const DEFAULT_START=65;
import {OrbitControls} from '../vendor/OrbitControls.js';
import {loadModel} from './model-loader.js?v=lingbot1';
const $=s=>document.querySelector(s),status=$('#status');
const renderer=new THREE.WebGLRenderer({antialias:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x121922);renderer.domElement.tabIndex=0;renderer.domElement.style.outline='none';renderer.domElement.addEventListener('pointerdown',()=>renderer.domElement.focus());document.body.prepend(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.querySelector('#loading').classList.remove('hidden');document.querySelector('#progress').textContent='그래픽 연결이 끊겼어요. 다른 3D 탭을 닫고 새로고침해 주세요.';});
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(56.51,innerWidth/innerHeight,.05,120),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.1;controls.minDistance=.08;controls.maxDistance=80;controls.screenSpacePanning=true;

let tourSamples=[],tourTime=0,tourRate=0,tourElapsed=0,tourBlendDuration=1.2,tourStartP=new THREE.Vector3(),tourStartQ=new THREE.Quaternion(),tourStartFov=56.51;
let frames=[],poses=[],tour=false,t=DEFAULT_START,ready=false,previous=performance.now();const keys=new Set();let drawUntil=performance.now()+8000;controls.addEventListener('change',()=>drawUntil=performance.now()+700);
function stop(){tour=false;tourRate=0;drawUntil=performance.now()+700;controls.enabled=!dalgu?.active;$('#tour').textContent='▶ 편안한 투어';}
function poseAt(i){const a=poses[Math.floor(i)],b=poses[Math.min(Math.floor(i)+1,poses.length-1)],u=i-Math.floor(i);camera.position.lerpVectors(a.p,b.p,u);camera.quaternion.slerpQuaternions(a.q,b.q,u);const dir=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);controls.target.copy(camera.position).addScaledVector(dir,2);$('#timeline').value=String(Math.round(i));$('#frameLabel').textContent=`${Math.round(i)+1} / ${frames.length}`;}
function applyTour(blend=1){const {a,b,u,index}=sampleTour(tourSamples,tourTime);camera.position.lerpVectors(a.p,b.p,u);camera.quaternion.slerpQuaternions(a.q,b.q,u);if(blend<1){camera.position.lerpVectors(tourStartP,camera.position,blend);camera.quaternion.slerpQuaternions(tourStartQ,camera.quaternion,blend);}camera.fov=THREE.MathUtils.lerp(tourStartFov,56.51,blend);camera.updateProjectionMatrix();controls.target.copy(camera.position).addScaledVector(camera.getWorldDirection(new THREE.Vector3()),2);t=index;$('#timeline').value=String(Math.round(t));$('#frameLabel').textContent=`${Math.round(t)+1} / ${frames.length}`;}
function beginTour(){if(!ready||!tourSamples.length)return;if(tour){stop();return;}const wasWalk=dalgu?.active;const p=camera.position.clone(),q=camera.quaternion.clone(),fov=camera.fov;dalgu?.exit();if(wasWalk){camera.position.copy(p);camera.quaternion.copy(q);camera.fov=fov;}tourTime=timeAtFrame(tourSamples,t);tourStartP.copy(camera.position);tourStartQ.copy(camera.quaternion);tourStartFov=camera.fov;const {a,b,u}=sampleTour(tourSamples,tourTime),targetP=new THREE.Vector3().lerpVectors(a.p,b.p,u),targetQ=new THREE.Quaternion().slerpQuaternions(a.q,b.q,u);tourBlendDuration=Math.max(1.2,tourStartQ.angleTo(targetQ)/THREE.MathUtils.degToRad(22)*1.875,tourStartP.distanceTo(targetP)/.55*1.875);tourRate=0;tourElapsed=0;tour=true;controls.enabled=false;$('#tour').textContent='Ⅱ 투어 정지';}
function advanceTour(dt){tourElapsed+=dt;if(tourElapsed<tourBlendDuration){applyTour(easeInOut(tourElapsed/tourBlendDuration));return;}const remaining=tourSamples.at(-1).t-tourTime,targetRate=+$('#speed').value;const endEase=Math.min(1,Math.sqrt(Math.max(0,remaining)/1.5));tourRate+=(targetRate*endEase-tourRate)*(1-Math.exp(-dt/.8));tourTime=Math.min(tourSamples.at(-1).t,tourTime+dt*tourRate);applyTour();if(remaining<.002){tourTime=tourSamples.at(-1).t;applyTour();stop();}}
function jump(i){stop();t=Math.min(i,poses.length-1);if(dalgu?.active){dalgu.spawn(t);$('#timeline').value=String(t);$('#frameLabel').textContent=`${t+1} / ${frames.length}`;return;}poseAt(t);controls.update();}
function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=dalgu?.active?75:56.51;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}addEventListener('resize',resize);resize();
$('#togglePanel').onclick=()=>{const closed=$('#panel').classList.toggle('hidden');$('#togglePanel').textContent=closed?'메뉴 열기':'메뉴 접기';};
$('#tour').onclick=beginTour;$('#home').onclick=()=>jump(DEFAULT_START);$('#timeline').oninput=e=>jump(+e.target.value);$('#speed').oninput=e=>$('#speedLabel').textContent=e.target.value+'×';document.querySelectorAll('[data-frame]').forEach(b=>b.onclick=()=>jump(+b.dataset.frame));
renderer.domElement.addEventListener('pointerdown',stop);renderer.domElement.addEventListener('wheel',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();keys.clear();}});addEventListener('blur',()=>keys.clear());
addEventListener('keydown',e=>{if(dalgu?.active)return;if(e.key==='Escape')stop();if(['INPUT','BUTTON'].includes(document.activeElement?.tagName))return;keys.add(e.key.toLowerCase());if('wasdqe'.includes(e.key.toLowerCase())){stop();e.preventDefault();}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
function animate(now){const dt=Math.min((now-previous)/1000,.05);previous=now;if(ready){if(dalgu?.active){dalgu.tick(dt);}else if(tour){advanceTour(dt);}else{const v=new THREE.Vector3(),f=camera.getWorldDirection(new THREE.Vector3()),r=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);if(keys.has('w'))v.add(f);if(keys.has('s'))v.sub(f);if(keys.has('d'))v.add(r);if(keys.has('a'))v.sub(r);if(keys.has('e'))v.y+=1;if(keys.has('q'))v.y-=1;if(v.lengthSq()){v.normalize().multiplyScalar(dt*(keys.has('shift')?5:1.5)*+$('#speed').value);camera.position.add(v);controls.target.add(v);}controls.update();}}if(ready)renderer.render(scene,camera);requestAnimationFrame(animate);}requestAnimationFrame(animate);
try{
 frames=await(await fetch('../cameras.json')).json();poses=frames.map(f=>{const m=new THREE.Matrix4().set(...f.pose.flat()).multiply(new THREE.Matrix4().makeScale(1,-1,-1));return{p:new THREE.Vector3().setFromMatrixPosition(m),q:new THREE.Quaternion().setFromRotationMatrix(m)}});const calm=await(await fetch('../calm-tour.json?v=calm1')).json();tourSamples=calm.samples.map(s=>({...s,p:new THREE.Vector3().fromArray(s.p),q:new THREE.Quaternion().fromArray(s.q)}));$('#timeline').max=poses.length-1;poseAt(DEFAULT_START);
 const mesh=await loadModel(scene,renderer,camera,$('#progress'));ready=true;drawUntil=performance.now()+10000;status.textContent='LingBot → 2DGS · Office 01';const meta=mesh.userData.officeMeta;$('#details').textContent=`LingBot 초기화 · 2DGS · ${meta.iteration.toLocaleString()}회 · ${(meta.downloadBytes/1e6).toFixed(2)} MB · 고정 포즈 · 560 학습 / 40 검증`;
 window.officeViewer={ready:true,camera,controls,renderer,scene,mesh,frames,jump,stop,setWalkIndex(i){t=i;$('#timeline').value=String(i);$('#frameLabel').textContent=`${i+1} / ${frames.length}`;},redraw(){drawUntil=performance.now()+1500;},get currentIndex(){return t;},get tour(){return tour;},get dalgu(){return dalgu;}};
 try{
  dalgu=await installDalgu(window.officeViewer);
  const params=new URLSearchParams(location.search),start=Number(params.get('start')||DEFAULT_START);
  jump(Number.isFinite(start)?THREE.MathUtils.clamp(Math.round(start),0,poses.length-1):DEFAULT_START);
  dalgu.enter(!params.has('walk')||params.get('walk')==='follow');
  window.officeViewer.redraw();
 }catch(e){console.error(e);$('#error').textContent='달구 모드를 불러오지 못했어요: '+e.message;}
 finally{$('#loading').classList.add('hidden');}
}catch(e){console.error(e);$('#progress').textContent='불러오지 못했습니다: '+e.message;$('#error').textContent=e.message;status.textContent='로딩 오류';}



