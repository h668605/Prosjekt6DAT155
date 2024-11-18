import {
    MeshBasicMaterial,
    Mesh,
    SphereGeometry,
    Vector3
} from '../lib/three.module.js';

export class Clouds extends MeshBasicMaterial {
    constructor(scene, cloudCount) {
        super();
        this.scene = scene;
        this.cloudCount = cloudCount;
        this.cloud = []; // Array for skyene
        this.cloudMaterial = new MeshBasicMaterial({
            color: 0xffffff, // Cloud color
            opacity: 0.5,
            transparent: true,
            depthWrite: false,
        });
        this.cloudGeometry = new SphereGeometry(30, 30, 30); // Store sfærer
        this.createCloud();
    }

    createCloud() {
        // Define a single direction vector for all clouds to move
        const direction = new Vector3(
            Math.random() - 0.5,  // x-direction (random between -0.5 and 0.5)
            Math.random() * 0.1 - 0.05, // small y-direction (random slight upward/downward drift)
            Math.random() - 0.5   // z-direction (random between -0.5 and 0.5)
        ).normalize(); // Normalize to keep consistent movement speed

        // Iterate through each cloud and set its position and velocity
        for (let i = 0; i < this.cloudCount; i++) {
            const cumulus = new Mesh(this.cloudGeometry, this.cloudMaterial);

            // Random initial position for each cloud
            cumulus.position.set(
                Math.random() * 200 - 100,  // x-position between -100 and 100
                125,   // y-position between 50 and 150 (height above ground)
                Math.random() * 200 - 100   // z-position between -100 and 100
            );

            // All clouds share the same movement direction, so apply the same velocity
            cumulus.velocity = direction.clone().multiplyScalar(0.3);  // Slower movement speed

            this.cloud.push(cumulus);
            this.scene.add(cumulus);
        }
    }

    // Funksjon for å oppdatere regndråpene
    updateCloud(deltaTime) {
        for (let i = 0; i < this.cloud.length; i++) {
            const clouds = this.cloud[i];
            clouds.position.add(clouds.velocity); // Update position with velocity

            // If cloud moves out of view, reset position to make it continuous
            if (clouds.position.x > 200) clouds.position.x = -200;
            if (clouds.position.x < -200) clouds.position.x = 200;
            if (clouds.position.z > 200) clouds.position.z = -200;
            if (clouds.position.z < -200) clouds.position.z = 200;
        }
    }
}
