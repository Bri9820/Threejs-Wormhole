import * as THREE from 'three'
import { OrbitControls } from 'jsm/controls/OrbitControls.js'
import { OBJLoader } from "jsm/loaders/OBJLoader.js";
import spline from './spline.js';
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";
//setting up three js environmnet
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
//gives the scene a smother look
scene.fog = new THREE.FogExp2(0x000000, 0.3);
const camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

//post-processing
//create the glowing effect
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0.002;
bloomPass.strength = 3.5;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

//adds directional light which is the main light
const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
mainLight.position.set( 2, 2, 2);
scene.add(mainLight)

// //adds ambient light which shines on sides that don't get directional light
// const ambientLight = new THREE.AmbientLight();
// scene.add(ambientLight);

//create a line geometry from the spline
const points = spline.getPoints(100);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
// const material = new THREE.MeshBasicMaterial({color: 0xFF0000});

// const line = new THREE.Mesh(geometry, material);
// scene.add(line);

//create edges geometry


//make the tube
//path, number of segments (num of divisions along the lenght), radius, (num of divisions along the radius), is it closed or not
const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);

// const tube = new THREE.Mesh(tubeGeo, tubeMaterial);
// scene.add(tube);

//removes excess lines in tube wireframe
//gives a cleaner look
const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
const lineMat = new THREE.LineBasicMaterial({color: 0x0000FF});
const tubeLines = new THREE.LineSegments(edges, lineMat);
scene.add(tubeLines);

//function to loop the camera around inside the wireframe
function updateCamera(t){
    //take timestamp and reduce it
    //1/ 2000th
    const time = t * 0.2;
    const looptime = 10 * 1000;
    //grap a point along the spline
    //must have a a point between 0 and 1
    const p = (time % looptime) / looptime;
    //tell the camera to move to that postion
    const pos = tubeGeo.parameters.path.getPointAt(p);
    //lookAt a position slightly ahdead
    const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);
    camera.position.copy(pos);
    camera.lookAt(lookAt);
}   

//create boxes
const numBoxes = 55;
const boxSize = 0.075;
const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
for(let i = 0; i < numBoxes; i += 1){
    //setting up the box material
    const boxMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
    });
    //creating the actual boxes
    const box = new THREE.Mesh(boxGeo, boxMat);
    //grabbing a point along i / numboxes (all along the point evenly spaced)
    //offset slight by % 1
    const p = (i /numBoxes + Math.random() * 0.1) % 1;
    //grab position along that point
    const pos = tubeGeo.parameters.path.getPointAt(p);
    //offest a little bit of randomness
    pos.x += Math.random() - 0.4;
    pos.z += Math.random() - 0.4;
    //set box position
    box.position.copy(pos);
    const rote = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    //add rotation to the boxes
    box.rotation.set(rote.x, rote.y, rote.z);
    //create smoother boxes with less lines
    //same thing as the tube
    //multie colored as well
    const edges = new THREE.EdgesGeometry(boxGeo, 0.2);
    const color = new THREE.Color().setHSL(0.7 - p, 1, 0.5);
    const lineMat = new THREE.LineBasicMaterial({ color });
    const boxLines = new THREE.LineSegments(edges, lineMat);
    boxLines.position.copy(pos);
    //add rotation to the boxes
    boxLines.rotation.set(rote.x, rote.y, rote.z);
    // scene.add(box);
    scene.add(boxLines);
    //add boxes to the scene
    //scene.add(box);


}

//create techtrohedrons
const numTetra= 55;
const tetraSize = 0.075;
const tetraGeo = new THREE.TetrahedronGeometry(tetraSize);
for(let i = 0; i < numTetra; i += 1){
    //setting up the box material
    const tetraMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
    });
    //creating the actual boxes
    const tetrahedron = new THREE.Mesh(tetraGeo, tetraMat);
    //grabbing a point along i / numTetrahedrons (all along the point evenly spaced)
    //offset slight by % 1
    const p = (i /numTetra + Math.random() * 0.1) % 1;
    //grab position along that point
    const pos = tubeGeo.parameters.path.getPointAt(p);
    //offest a little bit of randomness
    pos.x += Math.random() - 0.4;
    pos.z += Math.random() - 0.4;
    //set tetrahedron position
    tetrahedron.position.copy(pos);
    const rote = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    //add rotation to the tetrahedron
    tetrahedron.rotation.set(rote.x, rote.y, rote.z);
    //create smoother tetrahedron with less lines
    //same thing as the tube
    //multie colored as well
    const edges = new THREE.EdgesGeometry(tetraGeo, 0.2);
    const color = new THREE.Color().setHSL(0.5 - p, 1, 0.5);
    const lineMat = new THREE.LineBasicMaterial({ color });
    const tetraLines = new THREE.LineSegments(edges, lineMat);
    tetraLines.position.copy(pos);
    //add rotation to the tetrahedron
    tetraLines.rotation.set(rote.x, rote.y, rote.z);
    // scene.add(tetrahedron);
    scene.add(tetraLines);
}

function animate(t = 0){
    requestAnimationFrame(animate);
    updateCamera(t);
    //must render after updating the camera
    composer.render(scene, camera);
    controls.update();
}

animate();

//Handles window resizing
window.addEventListener('resize', () => {
    //updates the matrix for the orbit camera
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});