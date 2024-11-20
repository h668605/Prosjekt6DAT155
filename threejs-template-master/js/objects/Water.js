import * as THREE from '../lib/three.module.js';

class Water {
    constructor(size, position = new THREE.Vector3(0, 0, 0)) {
        this.size = size;
        this.position = position;

        const normalMap = new THREE.TextureLoader().load('/threejs-template-master/resources/textures/WaterNormal.png', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
        });

        // Lag geometrien for vannet (en stor plane)
        this.geometry = new THREE.PlaneGeometry(size, size, 128, 128);

        // Lag materialet for vannet ved å bruke ShaderMaterial
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                normalMap: { value: normalMap },
                waterColor: { value: new THREE.Color(0x1E3A81) },
                surfaceColor: { value: new THREE.Color(0x0a3d34) },
                fogColor: { value: new THREE.Color(0x8b9ea8) },
                fogNear: { value: 1.0 },
                fogFar: { value: 50.0 },
            },
            vertexShader: `
                uniform float time;
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    // Add wave movement
                   // varying vec3 vPos;
                    pos.z += sin(uv.x * 5.0 + mod(time * 0.02, 100.0)) * cos(vUv.y * 5.0 + mod(time * 0.02, 100.0)) * 0.05;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform sampler2D normalMap;
                uniform vec3 waterColor;
                uniform vec3 surfaceColor;
                uniform vec3 fogColor;
                uniform float fogNear;
                uniform float fogFar;

                varying vec2 vUv;
                varying vec3 vPos;
                
                void main() {
                    // Sample normal map for wave details
                    vec3 normal = texture2D(normalMap, vUv).rgb;
                    normal = normalize(normal * 2.0 - 1.0);

                    // Mix water colors with normal map influence
                    vec3 color = mix(waterColor, surfaceColor, normal.r);
                    
                    // Apply fog
                    float depth = gl_FragCoord.z / gl_FragCoord.w;
                    float fogFactor = smoothstep(fogNear, fogFar, depth);
                    color = mix(color, fogColor, fogFactor);

                    gl_FragColor = vec4(color, 1.0);
                
                }
               `,
            side: THREE.DoubleSide,
            transparent: true,
        });

        // Lag mesh for vannet
        this.waterMesh = new THREE.Mesh(this.geometry, this.material);
        this.waterMesh.position.set(position.x, position.y, position.z);
        this.waterMesh.rotation.x = -Math.PI / 2; // Vann flatt på xz-planet
    }
    const
    normalMap = new THREE.TextureLoader().load('./resources/textures/WaterNormal.png', () => {
        console.log('Normal map loaded successfully.');
    }, undefined, (error) => {
        console.error('Error loading normal map:', error);
    });

    // Funksjon for å oppdatere vannet med tid
    update(deltaTime) {
        this.material.uniforms.time.value += deltaTime;
    }

    getMesh() {
        return this.waterMesh;
    }
}

export { Water };