import {
    Mesh,
    PlaneGeometry,
    ShaderMaterial,
    TextureLoader,
    Vector3,
    Object3D
} from '../lib/three.module.js';

export class Clouds {
    constructor(scene, cloudTexturePath, cloudCount = 10) {
        this.scene = scene;
        this.cloudTexture = new TextureLoader().load(cloudTexturePath);
        this.cloudCount = cloudCount;
        this.clouds = [];
        this.cloudObject = new Object3D();
        this.createClouds();
    }

    // Function to create clouds
    createClouds() {
        for (let i = 0; i < this.cloudCount; i++) {
            // Create a plane geometry for each cloud
            const cloudPlane = new Mesh(
                new PlaneGeometry(100, 100), // size of the cloud
                new ShaderMaterial({
                    uniforms: {
                        texture: { value: this.cloudTexture },
                    },
                    vertexShader: `
                        varying vec3 vPosition;
                        void main() {
                            vPosition = position; // Pass 3D position to fragment shader
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        #version 300
                        #define varying in
                        out highp vec4 pc_fragColor;
                        #define gl_FragColor pc_fragColor
                        #define gl_FragDepthEXT gl_FragDepth
                        #define texture2D texture
                        precision highp float;
                        
                        uniform sampler2D texture; // Corrected to sampler2D
                        
                        varying vec3 vPosition; // 3D position passed from the vertex shader
                        
                        void main() {
                            vec2 uv = (vPosition.xy + 1.0) * 0.5;  // Simple mapping to [0, 1]
                            pc_fragColor = texture(texture, uv);  // Sample the texture with the uv coordinates
                        }
                    `,
                    transparent: true,
                    depthWrite: false
                })
            );

            // Randomly position the clouds within the scene
            cloudPlane.position.set(
                Math.random() * 500 - 250, // random X position
                Math.random() * 100 + 50,  // random Y (height) position
                Math.random() * 500 - 250  // random Z position
            );

            cloudPlane.scale.set(Math.random() * 2 + 1, Math.random() * 2 + 1, 1);  // Random scale for variety
            this.clouds.push(cloudPlane);
            this.scene.add(cloudPlane);
        }
    }

    // Function to update clouds (make them face the camera)
    updateClouds(camera) {
        for (let cloud of this.clouds) {
            cloud.lookAt(camera.position);  // Make each cloud face the camera
        }
    }

    // Function to make clouds face a target position (targetPosition)
    lookAt(position) {
        const targetPosition = new Vector3(position.x, position.y, position.z);

        // Make each cloud face the target position
        for (let cloud of this.clouds) {
            cloud.lookAt(targetPosition);  // Apply lookAt to each cloud individually
        }
    }

    getObject() {
        return this.cloudObject;
    }
}
