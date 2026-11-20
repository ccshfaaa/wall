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
scene.add(key);
const fill = new THREE.DirectionalLight('#d8ddd5', 1.05);
fill.position.set(6, 5, -7);
scene.add(fill);

const ink = new THREE.MeshStandardMaterial({ color: '#343833', roughness: 1 });
const darkInk = new THREE.MeshStandardMaterial({ color: '#202621', roughness: 1 });
const greyInk = new THREE.MeshStandardMaterial({ color: '#72766d', roughness: 1 });
const paper = new THREE.MeshStandardMaterial({ color: '#f7f3e8', roughness: 1 });
const wallMat = new THREE.MeshStandardMaterial({ color: '#e8e2d4', roughness: 1 });
const robe = new THREE.MeshStandardMaterial({ color: '#5b635d', roughness: 1 });
const robeLight = new THREE.MeshStandardMaterial({ color: '#949486', roughness: 1 });
const skin = new THREE.MeshStandardMaterial({ color: '#c4aa8d', roughness: 1 });
const groundMat = new THREE.MeshStandardMaterial({ color: '#dcd6c8', roughness: 1 });
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

// Softly raised, ink-wash display ground, with a fixed scenic arrangement.
mesh(new THREE.CylinderGeometry(5.55,5.75,.32,96),groundMat,root,0,-.18,0);
mesh(new THREE.CylinderGeometry(5.56,5.56,.025,96),paper,root,0,-.005,0);
const ground = mesh(new THREE.CircleGeometry(5.5,96),groundMat,root,0,.012,0); ground.rotation.x=-Math.PI/2;
// Brush-like pale washes across the ground.
for(let i=0;i<9;i++) {
  const wash=mesh(new THREE.CircleGeometry(.7+(i%3)*.32,32),new THREE.MeshBasicMaterial({color:i%2?'#bdbbae':'#c9c6b9',transparent:true,opacity:.09,depthWrite:false}),root,-2.7+i*.66,.022,-1.8+(i%4)*.66);
  wash.rotation.x=-Math.PI/2; wash.scale.set(1.3,.4,1);
}
// Distant layered mountains form a quiet wraparound backdrop.
function mountain(x,z,w,h,mat, lean=0) {
  const g=new THREE.ConeGeometry(w,h,5,1); const m=mesh(g,mat,root,x,h/2-.12,z); m.rotation.y=lean; m.rotation.z=.025*(x%2?1:-1); return m;
}
const mist=new THREE.MeshBasicMaterial({color:'#d8d7cc',transparent:true,opacity:.5,depthWrite:false});
for(let i=0;i<15;i++) {
  const a=(i/15)*Math.PI*2, r=7.4;
  const x=Math.sin(a)*r, z=Math.cos(a)*r-0.2;
  mountain(x,z,1.2+(i%4)*.38,1.9+(i%3)*.55,mist,a);
  mountain(x*.93,z*.93,.65+(i%3)*.26,1.1+(i%2)*.45,i%3===0?greyInk:paper,a+.3);
}
// Bamboo thicket behind the characters.
for(const [x,z,h] of [[-2.9,-1.9,3.15],[-2.45,-2.5,3.6],[-1.85,-2.9,3.25],[-3.45,-2.8,2.7],[2.9,-2.9,3.1],[3.45,-2.35,3.5],[2.45,-3.15,2.8]]) {
  const lean=(x<0?-.12:.1);
  const pts=[]; for(let j=0;j<=6;j++) pts.push([x+lean*j/6,j*h/6,z]);
  inkLine(pts,.043,darkInk);
  for(let j=1;j<6;j++) {
    const yy=j*h/6; inkLine([[x+lean*j/6-.09,yy,z],[x+lean*j/6+.09,yy,z]],.025,ink);
  }
  for(let j=2;j<6;j+=2) leafCluster(x+lean*j/6,h*j/6,z,j);
}

// Daoist temple on the left rear side; connected wall runs toward the teaching scene.
const temple = new THREE.Group(); root.add(temple); temple.position.set(-2.65,0,-1.0); temple.rotation.y=.55;
box(2.15,1.55,1.45,paper,temple,0,.83,-.15);
box(1.25,.52,.1,ink,temple,0,1.13,.6);
for(const x of [-.78,.78]) box(.12,1.22,.14,ink,temple,x,.7,.68);
// tiled sloped roof, eaves, ridge
const roofMat=new THREE.MeshStandardMaterial({color:'#4a5049',roughness:1});
const roof=mesh(new THREE.ConeGeometry(1.65,.62,4),roofMat,temple,0,1.9,-.12); roof.rotation.y=Math.PI/4; roof.scale.z=.7;
box(3.25,.09,.1,darkInk,temple,0,1.65,.04);
for(let i=-4;i<=4;i++) box(.07,.12,.12,greyInk,temple,i*.31,1.57,.12);
// Temple side corridor, making the wall visibly continuous with the structure.
box(2.55,1.65,.28,wallMat,root,-.72,.81,.7);
box(.13,1.9,.42,ink,root,-1.96,.95,.7);
box(.13,1.9,.42,ink,root,.53,.95,.7);
box(2.8,.12,.48,greyInk,root,-.72,1.77,.7);
// Connection buttress hides the joint between wall and hall.
box(.72,1.7,.75,wallMat,root,-1.91,.83,.15);

// Wang Qi, facing the wall. Stylized solid forms keep the scene readable from orbit.
const wang = new THREE.Group(); root.add(wang); wang.position.set(.05,0,1.45); wang.rotation.y=Math.PI;
cylinder(.33,.44,.92,robe,wang,0,.72,0,10).scale.z=.68;
sphere(.18,.2,.18,skin,wang,0,1.32,-.01);
// topknot and cloth cap
cylinder(.045,.07,.19,darkInk,wang,0,1.52,-.01,8);
// reaching arm and hand toward wall
coneBetween([-.23,1.03,-.04],[-.48,1.12,-.42],.085,robe,wang);
coneBetween([-.48,1.12,-.42],[-.45,1.12,-.59],.055,skin,wang,7);
coneBetween([.23,1.03,-.02],[.35,.62,-.06],.09,robe,wang);
// trousers, boots
for(const x of [-.14,.14]) { cylinder(.075,.11,.42,ink,wang,x,.22,0,8); box(.16,.1,.28,darkInk,wang,x,.06,-.07); }
// expressive ink eyebrows and gaze
inkLine([[-.12,1.37,-.17],[-.045,1.39,-.18]],.018,darkInk,wang);
inkLine([[.045,1.39,-.18],[.12,1.37,-.17]],.018,darkInk,wang);

// Taoist teacher is staged a quarter turn from the opening view, visible after orbiting.
const taoist = new THREE.Group(); root.add(taoist); taoist.position.set(2.15,0,.05); taoist.rotation.y=-Math.PI/2;
cylinder(.37,.46,1.05,robeLight,taoist,0,.73,0,10).scale.z=.72;
sphere(.2,.21,.2,skin,taoist,0,1.43,0);
cylinder(.08,.2,.2,darkInk,taoist,0,1.64,0,9); cylinder(.19,.24,.055,ink,taoist,0,1.56,0,12);
// beard and sleeves
coneBetween([-.08,1.36,-.12],[0,1.02,-.17],.09,greyInk,taoist,7);
coneBetween([-.32,1.0,0],[-.46,.76,-.18],.11,robeLight,taoist);
coneBetween([.32,1.0,0],[.5,1.05,-.1],.11,robeLight,taoist);
for(const x of [-.15,.15]) { cylinder(.08,.11,.42,darkInk,taoist,x,.22,0,8); box(.17,.09,.27,darkInk,taoist,x,.06,-.04); }
// gently lifted hand, as if indicating the secret
sphere(.07,.07,.07,skin,taoist,.52,1.07,-.1);

// A few ink-stone accents ground the tableau.
for(const [x,z,s] of [[-1.4,2.8,.48],[1.35,-1.1,.36],[3.35,.45,.58],[-3.5,.65,.5]]) {
  sphere(s*.9,s*.48,s*.65,greyInk,root,x,.12,z);
  sphere(s*.55,s*.32,s*.42,paper,root,x+.12,.2,z-.04);
}

// Orbit-only camera: rotation and zoom enabled; panning is deliberately impossible.
const target=new THREE.Vector3(0,1.05,0);
const spherical=new THREE.Spherical(9.8,1.12,0.06);
let down=null, pointerId=null;
function updateCamera() { camera.position.setFromSpherical(spherical).add(target); camera.lookAt(target); }
updateCamera();
canvas.addEventListener('pointerdown', e=>{ down={x:e.clientX,y:e.clientY}; pointerId=e.pointerId; canvas.setPointerCapture(pointerId); });
canvas.addEventListener('pointermove', e=>{ if(!down||e.pointerId!==pointerId)return; const dx=e.clientX-down.x, dy=e.clientY-down.y; down={x:e.clientX,y:e.clientY}; spherical.theta-=dx*.006; spherical.phi=THREE.MathUtils.clamp(spherical.phi+dy*.005,.42,1.72); updateCamera(); });
function endDrag(){ down=null; pointerId=null; }
canvas.addEventListener('pointerup',endDrag); canvas.addEventListener('pointercancel',endDrag);
canvas.addEventListener('wheel',e=>{e.preventDefault(); spherical.radius=THREE.MathUtils.clamp(spherical.radius*Math.exp(e.deltaY*.001),5.7,15); updateCamera();},{passive:false});
document.querySelector('#reset-view').addEventListener('click',()=>{ spherical.theta=.06; spherical.phi=1.12; spherical.radius=9.8; updateCamera(); });

function resize() { const w=canvas.clientWidth,h=canvas.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.fov=35; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(canvas); resize();
function animate(){ requestAnimationFrame(animate); renderer.render(scene,camera); }
animate();
window.addEventListener('load',()=>setTimeout(()=>document.querySelector('#loader').classList.add('hidden'),250));


