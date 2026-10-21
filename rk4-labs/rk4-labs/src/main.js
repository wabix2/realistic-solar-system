import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {G,KMS,MS,DATA,N,M} from "./bodies.js";
import {Sim} from "./integrators.js";
import {TP} from "./testparticles.js";
import {runSelfTests} from "./selftests.js";
/* ================= RENDER ================= */
let scene,camera,renderer,controls,meshes=[],trails=[],sims={},hist={},focusIdx=0,frame=0,novaOn=false,belt,beltPts,comet,cometMesh,cometTrail,glow,moons=[],TRAIL=400,tcount=0;
const COL={euler:"#ff5566",verlet:"#55ff88",rk4:"#00f2fe",rk45:"#ffb000"},ctrlEl=id=>document.getElementById(id);
const kf=r=>ctrlEl("scale").value=="1"?250:420/Math.sqrt(Math.max(r,1e-9));
const place=(px,py,pz,out)=>{const k=kf(Math.hypot(px,py,pz));return out.set(px*k,py*k,pz*k)};
function tex(c,t){const k=document.createElement("canvas");k.width=256;k.height=128;const g=k.getContext("2d");g.fillStyle="#"+c.toString(16).padStart(6,"0");g.fillRect(0,0,256,128);
if(t=="g")for(let y=0;y<128;y+=3){g.fillStyle=`rgba(${Math.random()<.5?"255,255,255":"0,0,0"},${Math.random()*.28})`;g.fillRect(0,y,256,3+Math.random()*7)}
else for(let i=0;i<220;i++){g.fillStyle=`rgba(${Math.random()<.5?"255,255,255":"0,0,0"},${Math.random()*.22})`;g.beginPath();g.arc(Math.random()*256,Math.random()*128,Math.random()*14,0,7);g.fill()}
return new THREE.CanvasTexture(k)}
function init(){scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,1,400000);camera.position.set(0,3500,6500);
renderer=new THREE.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true});renderer.setSize(innerWidth,innerHeight);document.body.appendChild(renderer.domElement);
controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
const sp=[];for(let i=0;i<15000;i++)sp.push((Math.random()-.5)*300000,(Math.random()-.5)*300000,(Math.random()-.5)*300000);
const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.Float32BufferAttribute(sp,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.5,transparent:true,opacity:.8})));
DATA.forEach((d,i)=>{ctrlEl("focus").add(new Option(i?d[0]:"Sun (Center)",i));
const m=new THREE.Mesh(new THREE.SphereGeometry(d[9],40,40),i?new THREE.MeshPhongMaterial({map:tex(d[8],d[10]),shininess:5}):new THREE.MeshBasicMaterial({color:d[8]}));scene.add(m);meshes.push(m);
const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(TRAIL*3),3));g.setDrawRange(0,0);
const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:d[8],transparent:true,opacity:.5}));l.frustumCulled=false;scene.add(l);trails.push(l)});
const ring=new THREE.Mesh(new THREE.RingGeometry(48,84,64),new THREE.MeshBasicMaterial({color:0xcdbb88,side:2,transparent:true,opacity:.6}));ring.rotation.x=-Math.PI/2+.45;meshes[6].add(ring);
const gc=document.createElement("canvas");gc.width=gc.height=128;const gg=gc.getContext("2d"),gr=gg.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,"rgba(255,230,150,1)");gr.addColorStop(.25,"rgba(255,180,60,.45)");gr.addColorStop(1,"rgba(255,120,0,0)");gg.fillStyle=gr;gg.fillRect(0,0,128,128);
glow=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(gc),blending:THREE.AdditiveBlending,depthWrite:false}));glow.scale.set(520,520,1);scene.add(glow);
// visual moons: Moon + Galilean moons (display-only circular orbits, slowed for visibility)
[[3,30,.0748,4,0xcccccc],[5,70,.00485,5,0xffee99],[5,92,.0097,5,0xddeeff],[5,118,.0196,7,0xbbaa99],[5,148,.0457,7,0x887766]].forEach(([p,r,P,s,c])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(s,16,16),new THREE.MeshPhongMaterial({color:c}));scene.add(m);moons.push({p,r,P,m})});
// asteroid belt: 4000 test particles, 2.1-3.3 AU
belt=new TP(4000);for(let i=0;i<4000;i++){const a=2.1+Math.random()*1.2,th=Math.random()*6.283,v=Math.sqrt(G/a)*(1+(Math.random()-.5)*.06),y=(Math.random()-.5)*.12;belt.p.set([a*Math.cos(th),y,a*Math.sin(th)],3*i);belt.v.set([-v*Math.sin(th),0,v*Math.cos(th)],3*i)}
const bg=new THREE.BufferGeometry();bg.setAttribute("position",new THREE.BufferAttribute(new Float32Array(12000),3));beltPts=new THREE.Points(bg,new THREE.PointsMaterial({color:0xaa9988,size:3,sizeAttenuation:false}));beltPts.frustumCulled=false;scene.add(beltPts);
comet=new TP(1);comet.alive=0;cometMesh=new THREE.Mesh(new THREE.SphereGeometry(7,12,12),new THREE.MeshBasicMaterial({color:0x99ffff}));cometMesh.visible=false;scene.add(cometMesh);
const cg=new THREE.BufferGeometry();cg.setAttribute("position",new THREE.BufferAttribute(new Float32Array(900),3));cg.setDrawRange(0,0);cometTrail=new THREE.Line(cg,new THREE.LineBasicMaterial({color:0x99ffff}));cometTrail.frustumCulled=false;scene.add(cometTrail);
scene.add(new THREE.PointLight(0xffffff,2.2,0,0),new THREE.AmbientLight(0x1a1a30));reset();animate()}
function reset(){MS.forEach(m=>{sims[m]=new Sim(m);hist[m]=[]});sims.dt=parseFloat(ctrlEl("dt").value);novaOn=false;meshes[0].scale.setScalar(1);tcount=0;trails.forEach(t=>t.geometry.setDrawRange(0,0));comet.alive=0;cometMesh.visible=false;cometTrail.geometry.setDrawRange(0,0)}
function launch(){const th=Math.random()*6.283,r=25,v=Math.sqrt(G/r)*.12;comet.p.set([r*Math.cos(th),(Math.random()-.5)*8,r*Math.sin(th)]);comet.v.set([-v*Math.sin(th),0,v*Math.cos(th)]);comet.alive=1;cometMesh.visible=true;cometTrail.geometry.setDrawRange(0,0);comet.tc=0;closeMenu()}
function animate(){requestAnimationFrame(animate);const steps=+ctrlEl("warp").value,dt=sims.dt,cur=sims[ctrlEl("method").value],rk=sims.rk4;
for(let s=0;s<steps;s++){for(const m of MS)sims[m].step(dt);belt.step(rk,dt);if(comet.alive)comet.step(rk,dt)}
for(let i=0;i<N;i++)place(cur.x[3*i],cur.x[3*i+1],cur.x[3*i+2],meshes[i].position);glow.position.copy(meshes[0].position);
for(const o of moons){const a=2*Math.PI*cur.t/(o.P*40),pp=meshes[o.p].position;o.m.position.set(pp.x+o.r*Math.cos(a),pp.y,pp.z+o.r*Math.sin(a))}
const bp=beltPts.geometry.attributes.position.array;for(let i=0;i<4000;i++)place(belt.p[3*i],belt.p[3*i+1],belt.p[3*i+2],_v),bp[3*i]=_v.x,bp[3*i+1]=_v.y,bp[3*i+2]=_v.z;beltPts.geometry.attributes.position.needsUpdate=true;
if(comet.alive){place(comet.p[0],comet.p[1],comet.p[2],cometMesh.position);if(frame%2==0){const ca=cometTrail.geometry.attributes.position.array,c=comet.tc=Math.min(comet.tc+1,300);ca.copyWithin(3,0,(c-1)*3);ca[0]=cometMesh.position.x;ca[1]=cometMesh.position.y;ca[2]=cometMesh.position.z;cometTrail.geometry.attributes.position.needsUpdate=true;cometTrail.geometry.setDrawRange(0,c)}
if(Math.hypot(comet.p[0]-rk.x[0],comet.p[1]-rk.x[1],comet.p[2]-rk.x[2])<.03){comet.alive=0;cometMesh.visible=false;glow.scale.set(1500,1500,1)}}   // collision: comet is absorbed by the Sun
glow.scale.x=glow.scale.y=Math.max(520,glow.scale.x*.97);
if(frame%3==0){const c=tcount=Math.min(tcount+1,TRAIL);trails.forEach((t,i)=>{const p=t.geometry.attributes.position.array;p.copyWithin(3,0,(c-1)*3);p[0]=meshes[i].position.x;p[1]=meshes[i].position.y;p[2]=meshes[i].position.z;t.geometry.attributes.position.needsUpdate=true;t.geometry.setDrawRange(0,c)})}
if(frame%10==0){for(const m of MS){const s=sims[m];hist[m].push(Math.log10(Math.max(Math.abs((s.energy()-s.E0)/s.E0),1e-14)));if(hist[m].length>240)hist[m].shift()}plot();telem(cur)}
if(novaOn){meshes[0].scale.addScalar(.1);if(meshes[0].scale.x>6)reset()}
controls.target.lerp(meshes[focusIdx].position,.05);controls.update();renderer.render(scene,camera);frame++}
const _v=new THREE.Vector3();
function plot(){const c=ctrlEl("plot"),g=c.getContext("2d"),W=c.width,H=c.height;g.clearRect(0,0,W,H);g.font="16px sans-serif";
for(let e=0;e>=-14;e-=2){const y=-e/14*(H-10)+5;g.strokeStyle="#222";g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();g.fillStyle="#666";g.fillText("1e"+e,4,y-2)}
for(const m of MS){g.strokeStyle=COL[m];g.lineWidth=2;g.beginPath();hist[m].forEach((v,i)=>{const x=i/240*W,y=-v/14*(H-10)+5;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()}}
function telem(s){const i=focusIdx,d=Math.hypot(s.x[3*i],s.x[3*i+1],s.x[3*i+2]),v=Math.hypot(s.v[3*i],s.v[3*i+1],s.v[3*i+2])*KMS;
ctrlEl("tName").textContent=DATA[i][0];ctrlEl("tInfo").innerHTML=`t = ${s.t.toFixed(2)} yr (J2000 + t)<br>distance from origin: ${d.toFixed(3)} AU<br>speed: ${v.toFixed(2)} km/s<br>|&Delta;L/L&#8320;| ${Math.abs((s.ang()-s.L0)/s.L0).toExponential(1)} (${s.method})`}
/* ================= UI ================= */
function labTab(t){astro.style.display=t=="astro"?"block":"none";chem.style.display=t=="chem"?"block":"none";tAstro.className="tab "+(t=="astro"?"on-astro":"");tChem.className="tab "+(t=="chem"?"on-chem":"")}
function sunColor(c){meshes[0].material.color.setHex(+c)}
function team(s){ctrlEl("team").style.display=s?"block":"none";if(s)closeMenu()}
function mobile(){[ctrl,lab_].forEach(p=>p.classList.toggle("show"));mtoggle.textContent=mtoggle.textContent=="MENU"?"CLOSE":"MENU"}
function closeMenu(){if(innerWidth<=768){[ctrl,lab_].forEach(p=>p.classList.remove("show"));mtoggle.textContent="MENU"}}
const lab_=ctrlEl("lab");addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});


function setFocus(v){focusIdx=+v}
function nova(){novaOn=true}
function tests(){ctrlEl("res").textContent=runSelfTests().join("\n")}
Object.assign(window,{labTab,reset,launch,team,tests,mobile,closeMenu,sunColor,setFocus,nova});
init();
