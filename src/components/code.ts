import { CanvasTexture, Group, Mesh, PerspectiveCamera, Raycaster, Scene, Sprite, SpriteMaterial, Vector3, WebGLRenderer } from "three";

export default class Code {
    scene: Scene;
    box!: Mesh;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    model: Group;
    constructor(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, model: Group) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.model = model
    }
    updateScreenPosition() {
        const vector = new Vector3(5, 5, 5)
        const canvas = this.renderer.domElement
        vector.project(this.camera)
        vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
        vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));
        const annotation = document.querySelector('.annotation') as HTMLDivElement
        annotation.style.top = `${vector.y}px`;
        annotation.style.left = `${vector.x}px`;
    }

    drawMarker() {
        const canvas = document.querySelector('#number') as HTMLCanvasElement
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        const x = 32, y = 32, radius = 20, startAngle = 0, endAngle = Math.PI * 2;
        ctx.fillStyle = 'rgb(0,0,0)'
        ctx.beginPath()
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.fill();
        ctx.strokeStyle = 'rgb(255,255,266)'
        ctx.lineWidth = 3;
        ctx.beginPath()
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.stroke();
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('1', x, y);
    }
    loadMarker() {
        this.drawMarker()
        let animation = () => {
            this.updateScreenPosition()
            requestAnimationFrame(animation)
        }
        animation.bind(this)
        animation()
        const canvas = document.querySelector('#number') as HTMLCanvasElement
        const numberTexture = new CanvasTexture(canvas)
        const spriteMaterial = new SpriteMaterial({
            map: numberTexture,
            alphaTest: 0.5,
            transparent: true,
            depthTest: false,
            depthWrite: false
        })
        const sprite = new Sprite(spriteMaterial);
        sprite.position.set(5, 5, 5);
        sprite.scale.set(1, 1, 1);
        this.scene.add(sprite);
    }
    // 以下为传参方法
    createMarker(content: string, color: string) {
        const canvas = document.createElement('canvas') as HTMLCanvasElement
        canvas.height = 64
        canvas.width = 64
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        const x = 32, y = 32, radius = 20, startAngle = 0, endAngle = Math.PI * 2;
        ctx.fillStyle = 'rgb(0,0,0)'
        ctx.beginPath()
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.fill();
        ctx.strokeStyle = color
        ctx.lineWidth = 3;
        ctx.beginPath()
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(content, x, y);
        return canvas
    }
    addMarker(position: Vector3, content: string, color = "rgb(255,255,255)") {
        const canvas = this.createMarker(content, color)
        const numberTexture = new CanvasTexture(canvas)
        const spriteMaterial = new SpriteMaterial({
            map: numberTexture,
            alphaTest: 0.5,
            transparent: true,
            depthTest: false,
            depthWrite: false
        })
        const sprite = new Sprite(spriteMaterial);
        sprite.position.copy(position)
        sprite.scale.set(1, 1, 1);
        this.scene.add(sprite)
        return sprite
    }
    // 为marker添加广告牌
    addBillboard(marker: Sprite, content: HTMLDivElement | string) {
        const position = marker.position.clone();
        // const position = new Vector3(0,0,0);
        const canvas = this.renderer.domElement
        position.project(this.camera)
        position.x = Math.round((0.5 + position.x / 2) * (canvas.width / window.devicePixelRatio));
        position.y = Math.round((0.5 - position.y / 2) * (canvas.height / window.devicePixelRatio));
        function isElement(ele: any) {
            return ele.nodeType ? true : false;
        }
        let annotation: HTMLDivElement
        if (isElement(content)) {
            annotation = content as HTMLDivElement
        } else {
            annotation = document.createElement('div')
            annotation.innerText = content as string
            annotation.style.color = 'white'
            annotation.style.position = 'absolute'
            annotation.style.marginLeft = '15px'
            // annotation.style.marginTop = '15px'
        }
        document.body.appendChild(annotation)
        annotation.style.cursor = "pointer"
        annotation.addEventListener('click',()=>{
            console.log('click the div');
            
        })
        const animate = () => {
            requestAnimationFrame(animate)
            // 更新billboard的位置
            this.updateBillboardPosition(marker.position, annotation)
            // 是否被遮挡
            this.updateDistance(marker,annotation)
        }
        animate.bind(this)
        animate()
    }
    updateBillboardPosition(position: Vector3, annotation: HTMLDivElement) {
        const vector = position.clone()
        const canvas = this.renderer.domElement
        vector.project(this.camera)
        vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
        vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));
        annotation.style.top = `${vector.y}px`;
        annotation.style.left = `${vector.x}px`;
    }

    updateDistance(marker: Sprite, billBoard: HTMLDivElement) {
        const distance = this.camera.position.distanceTo(marker.position)
        const direction = marker.position.clone().sub(this.camera.position).normalize()
        const raycaster = new Raycaster(this.camera.position, direction,0,distance)
        const intersects = raycaster.intersectObject(this.model)
        // 检查相交结果是否包含目标 `marker`
        let isObstructed = false;
        if (intersects.length > 0) {
            // 如果有相交的物体，检查第一个相交对象是否是 `marker`
            for (const intersect of intersects) {
                if (intersect.object !== marker) {
                    isObstructed = true;
                    break;
                }
            }
        }
        // 更新距离显示或阻挡信息
        if (isObstructed) {
            marker.material.opacity = 0.25
            billBoard.style.color = 'red'; // 例如，设置被阻挡时显示红色
            billBoard.innerText = `距离: ${distance.toFixed(2)} - 有遮挡`;
            billBoard.style.opacity = '0.25'
        } else {
            marker.material.opacity = 1
            billBoard.style.color = 'green'; // 未被阻挡时显示绿色
            billBoard.innerText = `距离: ${distance.toFixed(2)} - 无遮挡`;
            billBoard.style.opacity = '1'

        }
    }
    removeMarker(marker: Sprite) {
        this.scene.remove(marker)
        marker.geometry.dispose()
    }
}