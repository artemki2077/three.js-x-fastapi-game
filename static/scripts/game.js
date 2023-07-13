import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


var dev = true;


const scene = new THREE.Scene();
const webSocket = new WebSocket("ws://localhost:8001/ws");


let ws_isConnected = false;
webSocket.onopen = (event) =>{
  ws_isConnected = true;
  const msg = {
    command: "start",
    x: world.pos.x,
    y: world.pos.y,
    z: world.pos.z,
  };
  console.log('connected');
  webSocket.send(JSON.stringify(msg));
  // plane.generateFloor()
};


webSocket.onmessage = (event) => {
  // parseJSON
  var data = jQuery.parseJSON(jQuery.parseJSON(event.data));

  if (data['command'] == 'start'){
    world.generateMap(data['result']);
  }
}

// const camera = new THREE.OrthographicCamera( window.innerWidth / - 16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / - 16, -200, 500 );
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);

camera.position.set(50, 100, 50)
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
scene.background = new THREE.Color(0xbfd1e5);
document.body.appendChild(renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

window.addEventListener('mousemove', (e)=>{
  e.preventDefault();
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function generatePlane(x, y, z, size, color=0xbfd1e5){
  const cube = {
    geometry: new THREE.PlaneGeometry(size, size),
    material: new THREE.MeshPhongMaterial({transparent: true, opacity: 0})
  };
  cube.mesh = new THREE.Mesh(cube.geometry, cube.material);
  cube.mesh.rotation.x = Math.PI / -2;
  cube.mesh.position.x = x;
  cube.mesh.position.y = y;
  cube.mesh.position.z = z;
  scene.add(cube.mesh);
  return cube.mesh
}

class Plane{
  constructor(scene){
    this.group = new THREE.Group();
    scene.add(this.group)
    

  }

  generateBlock(x, y, z, size, color=0x00ff00, selectedColor=0xffff00, pos={}){
    const cube = {
      geometry: new THREE.BoxGeometry(size, size, size),
      material: new THREE.MeshPhongMaterial({ color: color})
    };
    let cube_object = new THREE.Mesh(cube.geometry, cube.material);
    cube_object.position.x = x;
    cube_object.position.y = y;
    cube_object.position.z = z;
    cube_object.castShadow = true;
    cube_object.receiveShadow = true;
    this.group.add(cube_object);

    cube_object.userData.mainColor = color;
    cube_object.userData.selectedColor = selectedColor;
    cube_object.userData.colorChangeable = true;
    cube_object.userData.pos = pos;
    return cube_object
  }
  
  generatePlane(x, y, z, size, color=0x00ff00){
    const cube = {
      geometry: new THREE.PlaneGeometry(size, size),
      material: new THREE.MeshPhongMaterial({ color: color})
    };
    cube.mesh = new THREE.Mesh(cube.geometry, cube.material);
    cube.mesh.rotation.x = Math.PI / -2;
    cube.mesh.position.x = x;
    cube.mesh.position.y = y;
    cube.mesh.position.z = z;
    this.group.add(cube.mesh);
    return cube.mesh
  }

  generateFloor(){
    let p = {x: 0, y: 0};

    for(let x=-50;x <= 50;x += 5){
      
      for(let y=-50;y <= 50;y += 5){
        this.generateBlock(x, 0, y, 4.8, 0xf9c834, p);
        p.y += 1;
      }
      p.x += 1;
    }
  }
  updateMatrixWorld(){
    this.group.children.forEach(element => {
      element.updateMatrixWorld();
    });
  }

  update(slcd_object){
    this.group.children.forEach((element)=>{
      // console.log(slcd_object);
      if (element == slcd_object){
        console.log('finded')
        element.material.color.setHex( element.userData.selectedColor );
      }else{
        element.material.color.setHex( element.userData.mainColor );
      }
    })
  }

  add(object){
    this.group.add(object);
  }
}


class World{
  constructor(scene){
    this.pos = {x: 11, y: 1, z: 11};
    this.group = new THREE.Group();
    scene.add(this.group)
    let size_world = 30
    this.size_world = size_world;
    this.map = Array.from(Array(size_world).keys()).map(x => Array.from(Array(size_world).keys()).map(x => Array.from(Array(size_world).keys()).map(x => null)));
  }

  generateBlock(x, y, z, size, color=0x00ff00, selectedColor=0x000000, pos={}){
    
    const block_material = new THREE.MeshPhongMaterial({ color: color});

    var block_group = new THREE.Group();
    const cube = {
      geometry: new THREE.BoxGeometry(size, size, size),
      material: block_material
    };
    let cube_object = new THREE.Mesh(cube.geometry, cube.material);
    cube_object.userData.mainColor = color;
    cube_object.userData.selectedColor = selectedColor;
    block_group.userData.pos = pos;

    block_group.add(cube_object);

    // ____sides____
    let distance_beetwin = 0.001
    const planes_geometry = new THREE.PlaneGeometry(size, size);

    //    side y+
    var plane_object = new THREE.Mesh(planes_geometry, new THREE.MeshPhongMaterial({ color: block_material}));

    plane_object.userData.mainColor = color;
    plane_object.userData.selectedColor = selectedColor;
    pos.side = 'y+'
    plane_object.userData.pos = pos;
    plane_object.position.y = (size / 2) + distance_beetwin;
    plane_object.rotation.x = Math.PI / -2;
    block_group.add(plane_object);

    //    side y-
    var plane_object = new THREE.Mesh(planes_geometry, new THREE.MeshPhongMaterial({ color: block_material}));

    plane_object.userData.mainColor = color;
    plane_object.userData.selectedColor = selectedColor;
    pos.side = 'y-'
    plane_object.userData.pos = pos;
    plane_object.position.y = -(size / 2) - distance_beetwin;
    plane_object.rotation.x = Math.PI / 2;
    block_group.add(plane_object);

    //    side x+
    var plane_object = new THREE.Mesh(planes_geometry, new THREE.MeshPhongMaterial({ color: block_material}));

    plane_object.userData.mainColor = color;
    plane_object.userData.selectedColor = selectedColor;
    pos.side = 'x+'
    plane_object.userData.pos = pos;
    plane_object.position.x = (size / 2) + distance_beetwin;
    plane_object.rotation.y = Math.PI / 2;
    block_group.add(plane_object);

    //    side x-
    var plane_object = new THREE.Mesh(planes_geometry, new THREE.MeshPhongMaterial({ color: 0x000000}));

    plane_object.userData.mainColor = color;
    plane_object.userData.selectedColor = selectedColor;
    pos.side = 'x+'
    plane_object.userData.pos = pos;
    plane_object.position.x = -(size / 2) - distance_beetwin;
    plane_object.rotation.y = Math.PI / -2;
    block_group.add(plane_object);

    //    side z+
    var plane_object = new THREE.Mesh(planes_geometry, new THREE.MeshPhongMaterial({ color: 0x000000}));

    plane_object.userData.mainColor = color;
    plane_object.userData.selectedColor = selectedColor;
    pos.side = 'z+'
    plane_object.userData.pos = pos;
    plane_object.position.z = (size / 2) + distance_beetwin;
    // plane_object.rotation.y ;
    block_group.add(plane_object);

    //    side z-
    var plane_object = new THREE.Mesh(planes_geometry, new THREE.MeshPhongMaterial({ color: 0x000000}));

    plane_object.userData.mainColor = color;
    plane_object.userData.selectedColor = selectedColor;
    pos.side = 'z+'
    plane_object.userData.pos = pos;
    plane_object.position.z = -(size / 2) - distance_beetwin;
    plane_object.rotation.y = Math.PI;
    block_group.add(plane_object);





    
    block_group.position.x = x;
    block_group.position.y = y;
    block_group.position.z = z;
    block_group.castShadow = true;
    block_group.receiveShadow = true;

    block_group.userData.mainColor = color;
    block_group.userData.selectedColor = selectedColor;
    block_group.userData.pos = pos;

    this.group.add(block_group);

    
    return cube_object
  }


  generateMap(map){
    for(let h_x_i in map){
      for(let h_z_i in map[h_x_i]){
        for(let i_i in map[h_x_i][h_z_i]){
          let i = map[h_x_i][h_z_i][i_i];
          if(i != null){
            this.generateBlock((h_x_i - this.pos.x) * 5, i * 5, (h_z_i - this.pos.z) * 5, 4.75, 0xf9c834, 0x000000, {x: h_x_i, y: i_i, z: h_z_i})
            console.log(`generated x: ${h_x_i}, y: ${i_i}, z: ${h_z_i}`)
          }
        }
      }
    }
  }
  update(slcd_object){
    this.group.children.forEach((groups)=>{
      
      if(groups.isGroup){
        groups.children.forEach((element)=>{
          if (element == slcd_object){
            element.material.color.setHex( element.userData.selectedColor );
          }else{
            console.log(element);
            element.material.color.setHex( element.userData.mainColor );
          }
        })
      }
    })
  }

  add(object){
    this.group.add(object);
  }
}

class Hero{
  constructor(scene){
    const cube = {
      geometry: new THREE.BoxGeometry(5, 5, 5),
      material: new THREE.MeshPhongMaterial({ color: 0xDC143C})
    };
    cube.mesh = new THREE.Mesh(cube.geometry, cube.material);
    cube.mesh.position.y = 5
    cube.mesh.castShadow = true;
    cube.mesh.receiveShadow = true; 
    scene.add(cube.mesh);
  }
}

var world = new World(scene);
var plane = new Plane(scene);
var hero = new Hero(scene);



// for(let x=-40;x <= 40;x += 5){
//   for(let y=-40;y <= 40;y += 5){
//     plane.generateBlock(x, 0, y, 4.8, 0xf9c834);
//   }
// }

var plane_mouse = generatePlane(0, 0, 0, 100);
// plane.generateFloor();



// cube.mesh.lookAt(50, 50, 0);
// world.add(cube.mesh);





let hemiLight = new THREE.AmbientLight(0xffffff, 0.20);
scene.add(hemiLight);

//Add directional light
let dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(-30, 50, 45);
scene.add(dirLight);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -70;
dirLight.shadow.camera.right = 70;
dirLight.shadow.camera.top = 70;
dirLight.shadow.camera.bottom = -70;

if(dev){
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
}


let selected_object, selected_object_s;


function render() {

  renderer.render(scene, camera);

  // world.group.rotation.x += 0.05;
  // world.group.rotation.y -= 0.05;

  requestAnimationFrame(render);

  if(dev){
    controls.update();
  }

  raycaster.setFromCamera(mouse, camera);
  const found = raycaster.intersectObjects(world.group.children);
  const found_plane_mouse = raycaster.intersectObject(plane_mouse);

  if (found_plane_mouse.length){
    let plane_h = found_plane_mouse[0]
    // cube.mesh.lookAt(plane_h.point)
  }
  if (found.length){
    selected_object = found[0].object;
    // console.log(selected_object);
  }else{
    selected_object = undefined;
  }
  if (selected_object && selected_object_s != selected_object){
    world.update(selected_object);
    selected_object_s = selected_object;
  }
  
}

render();