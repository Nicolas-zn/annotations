<script setup lang="ts">
import { Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, AmbientLight, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { onBeforeUnmount, onMounted, ref } from 'vue';
const three= ref()
let scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  controls: OrbitControls;
let init_scene = async () => {
  scene = new Scene();
  camera = new PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  let vHeight = 3;
  camera.position.set(30, vHeight + 2, 20).setLength(15);
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  three.value.appendChild(renderer.domElement);
  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  let light = new DirectionalLight(0xffffff, 0.25);
  light.position.setScalar(1);
  scene.add(light, new AmbientLight(0xffffff, 0.75));
  // add_helper();
};
onMounted(()=>{
  init_scene()
  logic()
  render()
})
let rf: number;
const render = () => {
  renderer.render(scene, camera);
  rf = requestAnimationFrame(render);
};
import Code from './code.ts'
import { utils } from './utils.ts';
const logic =async ()=>{
  const url = new URL('./assembly_line/scene.gltf',import.meta.url)
  const model =await utils.loadGLTFModel(url.href)
  const code = new Code(scene,camera,renderer,model.scene)
  scene.add(model.scene)
  // code.addBox()
  code.loadMarker()
  const marker = code.addMarker(new Vector3(3,1,0),"2")
  code.addBillboard(marker,'交换机')
}
onBeforeUnmount(() => {
  cancelAnimationFrame(rf);
});
</script>

<template>
  <div class="three-container" ref="three">

  </div>
</template>

<style scoped></style>
