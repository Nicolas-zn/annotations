import { BoxGeometry, MeshBasicMaterial, Mesh, Scene } from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js"

export const utils = {
    loadGLTFModel:async(url:string)=>{
        const modelLoader = new GLTFLoader()
        let model =await modelLoader.loadAsync(url)
        return model
    },
    addBox:(scene:Scene)=> {
        const box = new BoxGeometry(10, 10, 10)
        const material = new MeshBasicMaterial({ color: 'green' })
        const mesh = new Mesh(box, material)
        scene.add(mesh)
    }
}