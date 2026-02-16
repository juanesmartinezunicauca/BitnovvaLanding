import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input, NgZone } from '@angular/core';
import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
    selector: 'app-avatar-3d',
    standalone: true,
    template: '<div #rendererContainer class="avatar-3d-container"></div>',
    styles: [`
    .avatar-3d-container {
      width: 100%;
      height: 100%;
      min-height: 200px;
      overflow: hidden;
      border-radius: 12px;
    }
  `]
})
export class Avatar3d implements AfterViewInit, OnDestroy {
    @ViewChild('rendererContainer') rendererContainer!: ElementRef;
    @Input() color: string = '#00ffff'; // Default cyan
    @Input() shape: 'cube' | 'sphere' | 'torus' | 'icosahedron' = 'icosahedron';
    @Input() modelUrl?: string;

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private mesh!: THREE.Mesh | THREE.Group;
    private animationId: number | null = null;
    private clock = new THREE.Clock();
    private mixer: THREE.AnimationMixer | null = null;

    constructor(private ngZone: NgZone) { }

    ngAfterViewInit(): void {
        console.log('Avatar3d: ngAfterViewInit', { modelUrl: this.modelUrl, color: this.color });
        this.initThree();
        this.animate();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    ngOnDestroy(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.onWindowResize.bind(this));

        // Dispose resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        this.disposeMesh();
    }

    private disposeMesh(): void {
        if (this.mesh) {
            if (this.mesh instanceof THREE.Mesh) {
                this.mesh.geometry.dispose();
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach((m: any) => m.dispose());
                } else {
                    (this.mesh.material as any).dispose();
                }
            }
        }
    }

    private initThree(): void {
        const container = this.rendererContainer.nativeElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        console.log('Avatar3d: initThree', { width, height });

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = null;

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 2.5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040, 3);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(2, 2, 5);
        this.scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xff00ff, 1);
        backLight.position.set(-2, 2, -5);
        this.scene.add(backLight);

        // ALWAYS create a fallback shape first so we see something
        console.log('Avatar3d: Creating fallback shape');
        this.createGeometricShape();

        if (this.modelUrl) {
            console.log('Avatar3d: Starting model load from URL:', this.modelUrl);
            this.loadModel();
        }
    }

    private loadModel(): void {
        const loader = new GLTFLoader();
        loader.load(this.modelUrl!, (gltf: GLTF) => {
            console.log('Avatar3d: Model loaded successfully', gltf);

            // Remove the temporary shape
            if (this.mesh) {
                this.scene.remove(this.mesh);
                this.disposeMesh();
            }

            this.mesh = gltf.scene;

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(this.mesh);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            console.log('Avatar3d: Model bounds', { center, size });

            // Reset position
            this.mesh.position.x += (this.mesh.position.x - center.x);
            this.mesh.position.y += (this.mesh.position.y - center.y);
            this.mesh.position.z += (this.mesh.position.z - center.z);

            // Scale
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
                // Increased scale to 3.5 for a very close-up view
                const scale = 3.5 / maxDim;
                console.log('Avatar3d: Applied scale', scale);
                this.mesh.scale.set(scale, scale, scale);

                // Move down further to frame the head properly
                this.mesh.position.y -= 0.8;
            } else {
                console.warn('Avatar3d: Model has 0 dimensions!');
            }

            this.scene.add(this.mesh);

            // Animation
            if (gltf.animations && gltf.animations.length) {
                console.log('Avatar3d: Found animations', gltf.animations.length);
                this.mixer = new THREE.AnimationMixer(this.mesh);
                const action = this.mixer.clipAction(gltf.animations[0]);
                action.play();
            }
        }, (xhr: any) => {
            console.log('Avatar3d: Loading progress', (xhr.loaded / xhr.total * 100) + '%');
        }, (error: unknown) => {
            console.error('Avatar3d: Error loading model', error);
            // Fallback shape is already there, so we don't need to do anything else but maybe log visible error
        });
    }

    private createGeometricShape(): void {
        let geometry: THREE.BufferGeometry;
        switch (this.shape) {
            case 'cube':
                geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.8, 0.3, 16, 100);
                break;
            case 'icosahedron':
            default:
                geometry = new THREE.IcosahedronGeometry(1.2, 0);
                break;
        }

        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    private animate(): void {
        this.ngZone.runOutsideAngular(() => {
            const loop = () => {
                this.animationId = requestAnimationFrame(loop);

                const delta = this.clock.getDelta();

                if (this.mixer) {
                    this.mixer.update(delta);
                }

                if (this.mesh) {
                    this.mesh.rotation.y += 0.005;
                }

                this.renderer.render(this.scene, this.camera);
            };
            loop();
        });
    }

    private onWindowResize(): void {
        if (!this.rendererContainer) return;

        const container = this.rendererContainer.nativeElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
