import {CylinderGeometry, CircleGeometry,Mesh, MeshBasicMaterial} from '../lib/three.module.js';


export class Puddle {
    constructor(scene, position, terrain) {
        this.scene = scene;
        this.position = position; // Store the initial position for the puddle
        this.terrain = terrain; // Store the terrain to get the height

        const radius = Math.random() * 0.3 + 0.1; // Random radius between 0.1 and 0.4
        const height = Math.random() * 0.1 + 0.05; // Random height between 0.05 and 0.15
        const segments = Math.floor(Math.random() * 6 + 3); // Random segments between 3 and 8 (triangular to octagonal)

        // Create the geometry and material for the puddle
        this.geometry = new CylinderGeometry(radius, radius, height, segments); // Simple cylinder as the puddle shape
        this.material = new MeshBasicMaterial({
            color:  0x708090, // Color of the water
            transparent: true,
            opacity: 0.7,
            depthWrite: false, // So the puddle appears transparent
        });

        // Create the puddle mesh
        this.mesh = new Mesh(this.geometry, this.material);

        // Set initial position based on terrain height
        this.mesh.position.set(this.position.x, terrain.getHeightAt(this.position.x, this.position.z), this.position.z);

        // Add the puddle to the scene
        scene.add(this.mesh);
    }

    updatePuddle(terrain) {
        // Get the current terrain height at the puddle's x, z position
        // Update the puddle's position to match the terrain height
        this.mesh.position.y = terrain.getHeightAt(this.mesh.position.x, this.mesh.position.z);

        // Add a slight wave effect to simulate water movement (optional)
        this.mesh.position.y += Math.sin(Date.now() * 0.005) * 0.02; // Small oscillation for wave effect
    }

}
