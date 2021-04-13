/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp32-mpu-6050-web-server/

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

let scene, camera, rendered, cube;

function parentWidth(elem) {
  return elem.parentElement.clientWidth;
}

function parentHeight(elem) {
  return elem.parentElement.clientHeight;
}

function init3D(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(75, parentWidth(document.getElementById("3Dcube")) / parentHeight(document.getElementById("3Dcube")), 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(parentWidth(document.getElementById("3Dcube")), parentHeight(document.getElementById("3Dcube")));

  document.getElementById('3Dcube').appendChild(renderer.domElement);

  // Create a geometry
  // const geometry = new THREE.BoxGeometry(5, 1, 4);
  const geometry = new THREE.BoxGeometry(3, 3, 3);

  // Materials of each face
  var cubeMaterials = [
    new THREE.MeshBasicMaterial({color:"red"}),
    new THREE.MeshBasicMaterial({color:"blue"}),
    new THREE.MeshBasicMaterial({color:"green"}),
    new THREE.MeshBasicMaterial({color:"black"}),
    new THREE.MeshBasicMaterial({color:"yellow"}),
    new THREE.MeshBasicMaterial({color:"pink"}),
  ];

  const material = new THREE.MeshFaceMaterial(cubeMaterials);

  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  camera.position.z = 5;
  renderer.render(scene, camera);
}

// Resize the 3D object when the browser window changes size
function onWindowResize(){
  camera.aspect = parentWidth(document.getElementById("3Dcube")) / parentHeight(document.getElementById("3Dcube"));
  //camera.aspect = window.innerWidth /  window.innerHeight;
  camera.updateProjectionMatrix();
  //renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(parentWidth(document.getElementById("3Dcube")), parentHeight(document.getElementById("3Dcube")));

}

window.addEventListener('resize', onWindowResize, false);

// Create the 3D representation
init3D();

const socketUrl = 'http://localhost:3000'
const socket = io(socketUrl)
const UPDATE_GYROSCOPE = 'UPDATE_GYROSCOPE'

socket.on(UPDATE_GYROSCOPE, (data) => {
  console.log(data)


  pitch = (180/Math.PI) * Math.atan2(data.AccelerationX, Math.sqrt(data.AccelerationY*data.AccelerationY + data.AccelerationZ*data.AccelerationZ))
  roll = (180/Math.PI) * Math.atan2(data.AccelerationY, data.AccelerationZ);
  yaw = data.AccelerationZ

  gyroX = THREE.Math.degToRad(roll).toFixed(2);
  gyroY = THREE.Math.degToRad(pitch).toFixed(2);
  gyroZ = THREE.Math.degToRad(yaw).toFixed(2);

  document.getElementById("gyroX").innerHTML = gyroX
  document.getElementById("gyroY").innerHTML = gyroY
  document.getElementById("gyroZ").innerHTML = gyroZ

  cube.rotation.x = gyroX
  cube.rotation.z = gyroY
  cube.rotation.y = gyroZ

  renderer.render(scene, camera);

});