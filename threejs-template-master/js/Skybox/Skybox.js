import { CubeTextureLoader, BoxGeometry, ShaderMaterial, Mesh, BackSide } from '../lib/three.module.js';

export class Skybox {
    constructor(scene, texturePath) {
        // Skybox texture paths
        const skyboxPaths = [
            texturePath, // +X
            texturePath, // -X
            texturePath, // +Y
            texturePath, // -Y
            texturePath, // +Z
            texturePath  // -Z
        ];

        // Load the cube texture
        const loader = new CubeTextureLoader();
        const cubeTexture = loader.load(skyboxPaths);

        // Set the scene background
        scene.background = cubeTexture;

        // Create skybox geometry and material
        const skyBoxGeometry = new BoxGeometry(1000, 1000, 1000);
        skyBoxGeometry.scale(-1, 1, 1); // Invert the cube to face inward

        const skyBoxMaterial = new ShaderMaterial({
            uniforms: {
                skybox: { value: cubeTexture },
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * viewMatrix * worldPosition;
                }
            `,
            fragmentShader: `
                uniform samplerCube skybox;
                varying vec3 vWorldPosition;
                void main() {
                    gl_FragColor = textureCube(skybox, normalize(vWorldPosition));
                }
            `,
            side: BackSide, // Render inside of the cube
        });

        // Create the skybox mesh and add it to the scene
        const skyBox = new Mesh(skyBoxGeometry, skyBoxMaterial);
        scene.add(skyBox);
    }
}
