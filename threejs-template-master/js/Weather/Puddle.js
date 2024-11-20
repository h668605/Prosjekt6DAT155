import {
    CylinderGeometry,
    Mesh,
    MeshBasicMaterial,
    Color,
    Box3,
    Vector3,
    CircleGeometry,
    TextureLoader
} from '../lib/three.module.js';


export class Puddle {
    constructor(scene, position, terrain) {
        this.scene = scene;
        this.position = position; // Store the initial position for the puddle
        this.terrain = terrain; // Store the terrain to get the height

        const radius = Math.random() * 0.9 + 0.1; // Random radius between 0.1 and 0.4
        const height = 0.01; // Thin puddle for realism
        const segments = Math.floor(Math.random() * 6 + 3); // Random segments between 3 and 8 (triangular to octagonal)

        // Create the geometry and material for the puddle
        this.geometry = new CylinderGeometry(radius, radius, height, segments);
        this.material = new MeshBasicMaterial({
            color:  0x708090, // Color of the water
            transparent: true,
            opacity: 0.7,
            depthWrite: false, // So the puddle appears transparent
        });

        // Create the puddle mesh
        this.mesh = new Mesh(this.geometry, this.material);

        // Set initial position based on terrain height
        const height_pos = terrain.getHeightAt(this.position.x, this.position.z);
        if (height_pos > 1) {
            this.mesh.position.set(this.position.x, height_pos, this.position.z);

            // Add the puddle to the scene
            scene.add(this.mesh);
            this.boundingBox = new Box3().setFromObject(this.mesh);

        }
        this.rippleTime = 0;
        this.rippleActive = false;
        this.initialScale = this.mesh.scale.clone();
        this.rippleRadius = 0;
        this.rippleStrength = 0.1;

        const textureLoader = new TextureLoader();

        //lage bedre bilde i canva
        this.rippleTexture = textureLoader.load('resources/textures/regn.png');
        // Create a small circle geometry for the ripple effect
        this.rippleGeometry = new CircleGeometry(0.1, 32);  // Small circle with a radius of 0.1
// Create the ripple material with the loaded texture
        this.rippleMaterial = new MeshBasicMaterial({
            map: this.rippleTexture, // Apply the texture to the material
            transparent: true,
            opacity: 0.5, // Adjust opacity if needed
            depthWrite: false, // So the ripple is transparent
        });

        // Create the ripple mesh and position it at the center of the puddle
        this.rippleMesh = new Mesh(this.rippleGeometry, this.rippleMaterial);
        this.rippleMesh.rotation.x = -Math.PI / 2;  // Rotate the ripple mesh to lie flat on the XZ plane
        this.rippleMesh.visible = false;  // Initially, the ripple mesh is invisible
        scene.add(this.rippleMesh);
    }

    checkCollision(raindrop) {
        if (!this.boundingBox) return;

        // Check if raindrop intersects puddle
        const raindropBox = new Box3().setFromObject(raindrop);
        if (this.boundingBox.intersectsBox(raindropBox)) {
            this.triggerRipple(raindrop.position);
        }
    }

    triggerRipple(landPosition) {
        this.rippleTime = Date.now(); // Start the ripple animation timer
        this.rippleActive = true;    // Activate the ripple animation
        this.rippleMesh.visible = true; // Make the ripple mesh visible

        // Position the ripple mesh at the raindrop's landing position
        this.rippleMesh.position.set(landPosition.x, landPosition.y, landPosition.z);

        // Save the original scale of the ripple
        this.initialScale = this.rippleMesh.scale.clone();
        this.rippleRadius = 0; // Initialize the ripple radius
        this.rippleStrength = 0.1; // Initial ripple strength (amplitude)

    }


    updatePuddle(terrain) {
        if (this.rippleActive) {
            const elapsedTime = (Date.now() - this.rippleTime) / 1000; // Time in seconds

            // Simulate ripple expansion and damping
            this.rippleRadius = elapsedTime * 5; // Ripple expands over time
            this.rippleStrength *= 0.95; // Gradually reduce the strength

            // Create a sine wave effect for ripple
            const scaleOffset = Math.sin(this.rippleRadius * Math.PI) * this.rippleStrength;
            this.mesh.scale.set(
                this.initialScale.x + scaleOffset,
                this.initialScale.y,
                this.initialScale.z + scaleOffset
            );

            // Reset animation after damping is complete
            // Reset animation after damping is complete
            if (this.rippleStrength < 0.01) {
                this.rippleActive = false; // Deactivate the ripple
                this.rippleMesh.visible = false; // Hide the ripple mesh
                this.rippleMesh.scale.copy(this.initialScale); // Reset to original scale
            }
        }
    }

}
