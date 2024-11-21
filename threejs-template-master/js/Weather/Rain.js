import {
    MeshBasicMaterial,
    Mesh,
    SphereGeometry,
    Vector3,
    CylinderGeometry
} from '../lib/three.module.js';
//import * as TerrainBufferGeometry from "../terrain/TerrainBufferGeometry";

export class Rain {
    constructor(scene, rainCount) {
        this.scene = scene;
        this.rainCount = rainCount;
        this.rain = []; // Array for regndråpene
        this.rainMaterial = new MeshBasicMaterial({
            color: 0x5f9ea0, // Farge for regndråpene
            opacity: 0.7,
            transparent: true,
            depthWrite: false,
        });
        this.rainGeometry = new CylinderGeometry(0.02, 0.02, 0.08, 8); // Bruker små sfærer som regndråper
        this.createRain();
    }

    // Funksjon for å lage regndråpene
    createRain() {
        for (let i = 0; i < this.rainCount; i++) {
            const raindrop = new Mesh(this.rainGeometry, this.rainMaterial);

            // Tilfeldig posisjon for regndråpene
            raindrop.position.set(
                Math.random() * 200 - 100, // x
                Math.random() * 100 + 50,  // y
                Math.random() * 200 - 100  // z
            );

            // Tilfeldig fallhastighet for regndråpene
            raindrop.velocity = new Vector3(0, -Math.random() * 0.4 - 0.1, 0);

            this.rain.push(raindrop);
            this.scene.add(raindrop); // Legg til regndråpen i scenen
        }
    }

    // Funksjon for å oppdatere regndråpene
    updateRain(terrain, puddles) {
        for (const raindrop of this.rain) {
            // Update position based on velocity
            raindrop.position.add(raindrop.velocity);

            // Get terrain height at raindrop's (x, z) position
            const terrainHeight = terrain.getHeightAt(raindrop.position.x, raindrop.position.z);

            // Check if raindrop touches or falls below terrain
            if (raindrop.position.y <= terrainHeight) {
                // Reverse vertical velocity (bounce)
                raindrop.velocity.y = Math.abs(raindrop.velocity.y) * 0.7; // Lose 30% energy per bounce

                // Prevent sinking below terrain
                raindrop.position.y = terrainHeight + 0.1;

                // Scatter effect: add random offsets to x and z velocities
                raindrop.velocity.x += (Math.random() - 0.2) * 0.1; // Small random scatter in x
                raindrop.velocity.z += (Math.random() - 0.2) * 0.1 // Small random scatter in z
                //Regndråpene vil hoppe i tilfeldig retning med mindre og mindre hopp når farten blir mindre

                // Reduce overall velocity to simulate friction
                raindrop.velocity.multiplyScalar(0.5); // Slow down overall velocity

                // Reset if velocity is too small (stop bouncing)@

                if (Math.abs(raindrop.velocity.y) < 0.05) {
                    //console.log("Resetting raindrop:", raindrop);
                    this.resetRaindrop(raindrop);
                }
                if (raindrop.bounces === undefined) raindrop.bounces = 0;
                raindrop.bounces += 1;
                if (raindrop.bounces > 3) {
                    this.resetRaindrop(raindrop);
                    raindrop.bounces = 0;
                }

                puddles.forEach((puddle) => puddle.checkCollision(raindrop));
            }
           else {
                // Apply gravity to pull raindrop down
                raindrop.velocity.y -= 0.03; // Gravity strength
            }
        }
    }

// Reset a raindrop to the top of the scene with a new random position and velocity
    resetRaindrop(raindrop) {
        raindrop.position.set(
            Math.random() * 200 - 100, // Random x position
            Math.random() * 100 + 50,  // High y position
            Math.random() * 200 - 100  // Random z position
        );

        raindrop.velocity.set(0, -Math.random() * 0.4 - 0.1, 0);
    }




}
