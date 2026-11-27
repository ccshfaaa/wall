import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const canvas = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#eee9dc');
scene.fog = new THREE.Fog('#eee9dc', 17, 34);
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

scene.add(new THREE.HemisphereLight('#fffdf5', '#737064', 2.15));
const key = new THREE.DirectionalLight('#fff8e9', 3.1);
key.position.set(-5, 10, 7);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.radius = 8;
scene.add(key);
const fill = new THREE.DirectionalLight('#d8ddd5', 1.05);
fill.position.set(6, 5, -7);
scene.add(fill);

function makeWashTexture(base, pigments, seed, size=512) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  let state = seed >>> 0;
  const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i=0; i<420; i++) {
    const x=random()*size, y=random()*size, r=8+random()*58;
    const color=pigments[Math.floor(random()*pigments.length)];
    const wash=ctx.createRadialGradient(x,y,r*.08,x,y,r);
    wash.addColorStop(0, `${color}25`); wash.addColorStop(.62, `${color}15`); wash.addColorStop(1, `${color}00`);
    ctx.fillStyle=wash; ctx.beginPath(); ctx.ellipse(x,y,r*(.55+random()),r*(.35+random()*.7),random()*Math.PI,0,Math.PI*2); ctx.fill();
  }
  for(let i=0;i<65;i++) {
    const x=random()*size,y=random()*size;
    ctx.strokeStyle=`${pigments[Math.floor(random()*pigments.length)]}20`;
    ctx.lineWidth=.5+random()*3; ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x+random()*36-18,y+random()*18-9,x+random()*64-32,y+random()*26-13); ctx.stroke();
  }
  const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace; texture.wrapS=texture.wrapT=THREE.RepeatWrapping; texture.anisotropy=4; return texture;
}
const ink = new THREE.MeshStandardMaterial({ color: '#343833', roughness: 1 });
const darkInk = new THREE.MeshStandardMaterial({ color: '#202621', roughness: 1 });
const greyInk = new THREE.MeshStandardMaterial({ color: '#72766d', roughness: 1 });
const paper = new THREE.MeshStandardMaterial({ map:makeWashTexture('#f7f3e8',['#c7c0ad','#d8d1bf','#eee7d8'],17), roughness:1 });
const wallMat = new THREE.MeshStandardMaterial({ map:makeWashTexture('#e8e2d4',['#bdb6a6','#d2cabc','#f5f0e4'],29), roughness:1 });
const dryBrush = new THREE.MeshStandardMaterial({ color:'#777b72', roughness:1, transparent:true, opacity:.2, depthWrite:false });
const robe = new THREE.MeshStandardMaterial({ map:makeWashTexture('#5b635d',['#28342f','#879087','#c0bcae'],43), roughness:1 });
const robeLight = new THREE.MeshStandardMaterial({ map:makeWashTexture('#949486',['#53594f','#c3bfae','#e1d9c8'],61), roughness:1 });
const skin = new THREE.MeshStandardMaterial({ color: '#c4aa8d', roughness: 1 });
const groundMat = new THREE.MeshStandardMaterial({ map:makeWashTexture('#dcd6c8',['#a9aa9d','#c3bdae','#eee9dd'],79), roughness:1 });
const stoneLight = new THREE.MeshStandardMaterial({ color:'#c7c4b8', roughness:1 });
const root = new THREE.Group();
scene.add(root);

function mesh(geometry, material, parent=root, x=0, y=0, z=0) {
  const m = new THREE.Mesh(geometry, material); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function box(w,h,d,mat,parent=root,x=0,y=0,z=0) { return mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z); }
function cylinder(rt,rb,h,mat,parent=root,x=0,y=0,z=0,segments=12) { return mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat,parent,x,y,z); }
function sphere(rx,ry,rz,mat,parent=root,x=0,y=0,z=0) { const m = mesh(new THREE.SphereGeometry(1,16,12),mat,parent,x,y,z); m.scale.set(rx,ry,rz); return m; }
function inkLine(points, radius=.018, material=ink, parent=root) {
  const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return mesh(new THREE.TubeGeometry(curve, Math.max(12, points.length*5), radius, 5, false), material, parent);
}
function coneBetween(a,b,r,mat,parent=root, radial=8) {
  const va=new THREE.Vector3(...a), vb=new THREE.Vector3(...b), delta=vb.clone().sub(va);
  const obj=mesh(new THREE.CylinderGeometry(r*.72,r,delta.length(),radial),mat,parent);
  obj.position.copy(va.add(vb).multiplyScalar(.5)); obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()); return obj;
}
function leafCluster(x,y,z,seed=0) {
  for(let i=0;i<5;i++) {
    const a=(i/5)*Math.PI*2+seed, len=.34+(i%2)*.12;
    inkLine([[x,y,z],[x+Math.cos(a)*len*.55,y+.09,z+Math.sin(a)*len*.55],[x+Math.cos(a)*len,y+.18,z+Math.sin(a)*len]], .012, i%2?greyInk:darkInk);
    sphere(.035,.11,.025,i%2?greyInk:ink,root,x+Math.cos(a)*len*.86,y+.16,z+Math.sin(a)*len*.86).rotation.z=-Math.cos(a)*.5;
  }
}

// A broad ink-wash ground keeps the scene connected to the distant mountains.
mesh(new THREE.CylinderGeometry(22,22.2,.32,128),groundMat,root,0,-.18,0);
mesh(new THREE.CylinderGeometry(22.01,22.01,.025,128),paper,root,0,-.005,0);
const ground = mesh(new THREE.CircleGeometry(21.95,128),groundMat,root,0,.012,0); ground.rotation.x=-Math.PI/2;
// Brush-like pale washes across the ground.
for(let i=0;i<9;i++) {
  const wash=mesh(new THREE.CircleGeometry(.7+(i%3)*.32,32),new THREE.MeshBasicMaterial({color:i%2?'#bdbbae':'#c9c6b9',transparent:true,opacity:.09,depthWrite:false}),root,-2.7+i*.66,.022,-1.8+(i%4)*.66);
  wash.rotation.x=-Math.PI/2; wash.scale.set(1.3,.4,1);
}
// Distant layered mountains form a quiet wraparound backdrop.
function mountain(x,z,w,h,mat, lean=0) {
  const shape=new THREE.Shape();
  shape.moveTo(-w,0); shape.lineTo(-w*.76,h*.26); shape.quadraticCurveTo(-w*.55,h*.48,-w*.34,h*.42);
  shape.lineTo(-w*.12,h*.71); shape.quadraticCurveTo(w*.02,h*.84,w*.18,h*.62);
  shape.lineTo(w*.43,h*.9); shape.quadraticCurveTo(w*.55,h*.95,w*.66,h*.55);
  shape.quadraticCurveTo(w*.83,h*.35,w,h*.24); shape.lineTo(w,0); shape.closePath();
  const m=mesh(new THREE.ShapeGeometry(shape,16),mat,root,x,-.12,z); m.rotation.y=lean; m.castShadow=false; m.receiveShadow=false; return m;
}
const mist=new THREE.MeshBasicMaterial({map:makeWashTexture('#deddd3',['#a9aba3','#c4c5bc','#f3f0e7'],97),transparent:true,opacity:.56,depthWrite:false,side:THREE.DoubleSide});
for(let i=0;i<15;i++) {
  const a=(i/15)*Math.PI*2, r=7.4;
  const x=Math.sin(a)*r, z=Math.cos(a)*r-0.2;
  mountain(x,z,1.2+(i%4)*.38,1.9+(i%3)*.55,mist,a);
  mountain(x*.93,z*.93,.65+(i%3)*.26,1.1+(i%2)*.45,i%3===0?greyInk:paper,a+.3);
}
// Bamboo thicket behind the characters.
for(const [index,[x,z,h]] of [[-2.9,-1.9,3.15],[-2.45,-2.5,3.6],[-1.85,-2.9,3.25],[-3.45,-2.8,2.7],[2.9,-2.9,3.1],[3.45,-2.35,3.5],[2.45,-3.15,2.8]].entries()) {
  const lean=(x<0?-.12:.1), bend=(index%2?-.09:.1)*(x<0?1:-1);
  const stemX=t=>x+lean*t+bend*Math.sin(t*Math.PI);
  const pts=[]; for(let j=0;j<=6;j++) pts.push([stemX(j/6),j*h/6,z]);
  inkLine(pts,.043,darkInk);
  for(let j=1;j<6;j++) {
    const yy=j*h/6, nodeX=stemX(j/6); inkLine([[nodeX-.09,yy,z],[nodeX+.09,yy,z]],.025,ink);
  }
  for(let j=2;j<6;j+=2) leafCluster(stemX(j/6),h*j/6,z,j+index*.7);
}

// Daoist temple on the left rear side; connected wall runs toward the teaching scene.
const temple = new THREE.Group(); root.add(temple); temple.position.set(-2.65,0,-1.0); temple.rotation.y=.55;
box(2.15,1.55,1.45,paper,temple,0,.83,-.15);
box(1.25,.52,.1,ink,temple,0,1.13,.6);
for(const x of [-.78,.78]) box(.12,1.22,.14,ink,temple,x,.7,.68);
// tiled sloped roof, eaves, ridge
const roofMat=new THREE.MeshStandardMaterial({map:makeWashTexture('#4a5049',['#242b28','#788077','#b4b2a5'],113),roughness:1});
roofMat.side=THREE.DoubleSide;
const roofGeo=new THREE.BufferGeometry();
roofGeo.setAttribute('position',new THREE.Float32BufferAttribute([
  -1.48,1.7,-1.02, 1.48,1.7,-1.02, 1.48,1.7,1.02, -1.48,1.7,1.02,
  -.78,2.22,-.55, .78,2.22,-.55, .78,2.22,.55, -.78,2.22,.55
],3));
roofGeo.setIndex([3,2,6,3,6,7, 0,1,5,0,5,4, 0,3,7,0,7,4, 1,2,6,1,6,5]);
roofGeo.computeVertexNormals();
mesh(roofGeo,roofMat,temple);
box(1.58,.035,1.12,roofMat,temple,0,2.22,0);
box(3.05,.09,.11,darkInk,temple,0,1.7,1.01);
box(3.05,.09,.11,darkInk,temple,0,1.7,-1.01);
box(.11,.09,1.95,darkInk,temple,-1.47,1.7,0);
box(.11,.09,1.95,darkInk,temple,1.47,1.7,0);
inkLine([[-.78,2.23,-.55],[.78,2.23,-.55]],.035,darkInk,temple);
for(let i=-5;i<=5;i++) {
  const x=i*.22;
  inkLine([[x,1.73,1.04],[x*.54,2.2,.57]],.009,greyInk,temple);
  inkLine([[x,1.73,-1.04],[x*.54,2.2,-.57]],.009,greyInk,temple);
}
// Temple side corridor, making the wall visibly continuous with the structure.
box(2.55,1.65,.28,wallMat,root,-.72,.81,.7);
box(.13,1.9,.42,ink,root,-1.96,.95,.7);
box(.13,1.9,.42,ink,root,.53,.95,.7);
box(2.8,.12,.48,greyInk,root,-.72,1.77,.7);
// Connection buttress hides the joint between wall and hall.
box(.72,1.7,.75,wallMat,root,-1.91,.83,.15);
// Sparse dry-brush marks sit near the edges so the wall stays open behind Wang Qi.
const wallFaceZ=.848;
for(const [x,shift] of [[-1.86,0],[-1.56,.04]]) {
  inkLine([[x,.3,wallFaceZ],[x+.02,.45+shift,wallFaceZ],[x-.02,.63+shift,wallFaceZ],[x+.015,.82+shift,wallFaceZ],[x,.98,wallFaceZ]],.009,dryBrush);
}
inkLine([[-1.96,.38,wallFaceZ],[-1.87,.41,wallFaceZ],[-1.79,.39,wallFaceZ]],.012,dryBrush);

// Wang Qi, facing the wall. Stylized solid forms keep the scene readable from orbit.
const wang = new THREE.Group(); root.add(wang); wang.position.set(.05,0,1.45);
cylinder(.33,.44,.92,robe,wang,0,.72,0,10).scale.z=.68;
const wangHead=new THREE.Group(); wang.add(wangHead); wangHead.position.set(0,1.32,-.01); wangHead.rotation.y=2.45;
sphere(.18,.2,.18,skin,wangHead,0,0,0);
// His body leans toward the wall while he glances back in comic alarm.
cylinder(.045,.07,.19,darkInk,wangHead,0,.2,0,8);
// reaching arm and hand toward wall
coneBetween([-.23,1.03,-.04],[-.48,1.1,-.47],.085,robe,wang);
coneBetween([-.48,1.1,-.47],[-.46,1.1,-.83],.055,skin,wang,7);
coneBetween([.23,1.03,-.02],[.42,1.08,-.43],.09,robe,wang);
coneBetween([.42,1.08,-.43],[.4,1.08,-.72],.055,skin,wang,7);
// trousers, boots
for(const x of [-.14,.14]) { cylinder(.075,.11,.42,ink,wang,x,.22,0,8); box(.16,.1,.28,darkInk,wang,x,.06,-.07); }
// A narrow sash and dry-brush folds give the plain robe a readable silhouette.
const wangSash=mesh(new THREE.TorusGeometry(.3,.018,6,32),darkInk,wang,0,.68,0);
wangSash.rotation.x=Math.PI/2; wangSash.scale.z=.72;
inkLine([[-.16,.91,-.24],[-.21,.65,-.28],[-.13,.34,-.31]],.009,greyInk,wang);
inkLine([[.13,.89,-.24],[.17,.62,-.28],[.1,.35,-.31]],.009,greyInk,wang);
inkLine([[-.24,.75,-.23],[-.09,.68,-.3],[.08,.71,-.3],[.23,.78,-.23]],.008,greyInk,wang);
// expressive eyes, raised brows and an open mouth on the turned head
for(const x of [-.065,.065]) {
  sphere(.035,.033,.02,paper,wangHead,x,.02,-.155);
  sphere(.014,.021,.012,darkInk,wangHead,x,.018,-.177);
  inkLine([[x-.04,.09,-.15],[x,.12,-.17],[x+.04,.09,-.15]],.014,darkInk,wangHead);
}
sphere(.025,.035,.026,skin,wangHead,0,-.025,-.185);
sphere(.038,.05,.022,darkInk,wangHead,0,-.105,-.164);
sphere(.018,.023,.012,skin,wangHead,0,-.101,-.181);
sphere(.065,.08,.065,darkInk,wangHead,0,.17,.015);

// Taoist teacher is staged a quarter turn from the opening view, visible after orbiting.
const taoist = new THREE.Group(); root.add(taoist); taoist.position.set(.15,0,-.8); taoist.rotation.y=-Math.PI/2; taoist.scale.set(.84,.84,.84);
cylinder(.37,.46,1.05,robeLight,taoist,0,.73,0,10).scale.z=.72;
const taoistHead=new THREE.Group(); taoist.add(taoistHead); taoistHead.position.set(0,1.43,0);
sphere(.2,.21,.2,skin,taoistHead,0,0,0);
cylinder(.08,.2,.2,darkInk,taoistHead,0,.21,0,9); cylinder(.19,.24,.055,ink,taoistHead,0,.13,0,12);
mesh(new THREE.SphereGeometry(.13,16,10,0,Math.PI*2,0,Math.PI/2),darkInk,taoistHead,0,.31,0);
for(const x of [-.07,.07]) {
  sphere(.028,.026,.017,paper,taoistHead,x,.015,-.175);
  sphere(.012,.018,.01,darkInk,taoistHead,x,.014,-.192);
  inkLine([[x-.035,.07,-.16],[x,.085,-.19],[x+.035,.07,-.16]],.012,darkInk,taoistHead);
}
coneBetween([-.08,-.05,-.12],[0,-.4,-.17],.09,greyInk,taoistHead,7);
inkLine([[-.12,-.075,-.15],[-.055,-.105,-.19],[0,-.09,-.2],[.055,-.105,-.19],[.12,-.075,-.15]],.018,darkInk,taoistHead);
inkLine([[-.025,-.15,-.19],[0,-.29,-.19],[.025,-.15,-.19]],.008,paper,taoistHead);
// sleeves and beard
coneBetween([-.32,1.0,0],[-.46,.76,-.18],.11,robeLight,taoist);
coneBetween([.32,1.0,0],[.5,1.05,-.1],.11,robeLight,taoist);
for(const x of [-.15,.15]) { cylinder(.08,.11,.42,darkInk,taoist,x,.22,0,8); box(.17,.09,.27,darkInk,taoist,x,.06,-.04); }
// gently lifted hand, as if indicating the secret
sphere(.07,.07,.07,skin,taoist,.52,1.07,-.1);
 sphere(.07,.065,.07,skin,taoist,-.47,.75,-.18);
const taoistSash=mesh(new THREE.TorusGeometry(.29,.016,6,32),darkInk,taoist,0,.63,0);
taoistSash.rotation.x=Math.PI/2; taoistSash.scale.z=.72;
inkLine([[-.18,1.08,-.22],[-.12,.82,-.28],[-.22,.48,-.29]],.008,greyInk,taoist);
inkLine([[.18,1.08,-.22],[.12,.84,-.28],[.2,.5,-.29]],.008,greyInk,taoist);
inkLine([[-.27,.88,-.2],[-.08,.75,-.29],[.1,.79,-.29],[.28,.91,-.2]],.008,greyInk,taoist);

// A few ink-stone accents ground the tableau.
for(const [x,z,s] of [[-1.4,2.8,.48],[1.35,-1.1,.36],[3.35,.45,.58],[-3.5,.65,.5]]) {
  sphere(s*.9,s*.48,s*.65,greyInk,root,x,.12,z);
  const highlight=sphere(s*.43,s*.2,s*.34,stoneLight,root,x+.08,.19,z-.03);
  highlight.rotation.y=x*.17;
}

// Orbit-only camera: rotation and zoom enabled; panning is deliberately impossible.
const target=new THREE.Vector3(0,1.05,0);
const spherical=new THREE.Spherical(9.8,1.12,0.06);
const pointers=new Map();
let drag=null, pinchDistance=0;
function updateCamera() { camera.position.setFromSpherical(spherical).add(target); camera.lookAt(target); }
updateCamera();
function distanceBetweenPointers(){
  const [a,b]=pointers.values();
  return Math.hypot(a.x-b.x,a.y-b.y);
}
canvas.addEventListener('pointerdown', e=>{
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  canvas.setPointerCapture(e.pointerId);
  if(pointers.size===1) drag={id:e.pointerId,x:e.clientX,y:e.clientY};
  else if(pointers.size===2){ drag=null; pinchDistance=distanceBetweenPointers(); }
});
const caption=document.querySelector('.caption');
function updateCaption(){
  const sideView=Math.abs(Math.cos(spherical.theta))<.35;
  caption.textContent=sideView?'老道士袖手含笑，王七這才察覺身後有人。':'仙牆紋絲不動，王七探手一試。';
}
updateCaption();
canvas.addEventListener('pointermove', e=>{
  if(!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size>=2){
    const nextDistance=distanceBetweenPointers();
    if(pinchDistance>0&&nextDistance>0) spherical.radius=THREE.MathUtils.clamp(spherical.radius*pinchDistance/nextDistance,5.7,15);
    pinchDistance=nextDistance;
    updateCamera();
    return;
  }
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x, dy=e.clientY-drag.y;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY};
  spherical.theta-=dx*.006;
  spherical.phi=THREE.MathUtils.clamp(spherical.phi+dy*.005,.42,1.72);
  updateCamera(); updateCaption();
});
function endPointer(e){
  pointers.delete(e.pointerId);
  if(pointers.size===1){ const [id,p]=pointers.entries().next().value; drag={id,x:p.x,y:p.y}; }
  else if(pointers.size===0) drag=null;
  pinchDistance=pointers.size===2?distanceBetweenPointers():0;
}
canvas.addEventListener('pointerup',endPointer); canvas.addEventListener('pointercancel',endPointer);
canvas.addEventListener('wheel',e=>{e.preventDefault(); spherical.radius=THREE.MathUtils.clamp(spherical.radius*Math.exp(e.deltaY*.001),5.7,15); updateCamera();},{passive:false});
document.querySelector('#reset-view').addEventListener('click',()=>{ spherical.theta=.06; spherical.phi=1.12; spherical.radius=9.8; updateCamera(); updateCaption(); });

function resize() {
  const w=canvas.clientWidth,h=canvas.clientHeight;
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  const aspect=camera.aspect;
  camera.fov=aspect<16/9?THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(35)/2)*(16/9)/aspect)):35;
  camera.fov=Math.min(camera.fov,68);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas); resize();
function animate(){ requestAnimationFrame(animate); renderer.render(scene,camera); }
animate();
window.addEventListener('load',()=>setTimeout(()=>document.querySelector('#loader').classList.add('hidden'),250));


