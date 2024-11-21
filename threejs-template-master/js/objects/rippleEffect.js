import { Vector3, TextureLoader, CircleGeometry, MeshBasicMaterial, Mesh, Box3 } from '../lib/three.module.js';

class RippleEffect {
    constructor(scene) {
        this.rippleTime = 0;
        this.rippleActive = false;
        this.rippleRadius = 0;
        this.rippleStrength = 0.1;
        this.ripplePosition = new Vector3(0, 0, 0);  // Store the position of the ripple

        const textureLoader = new TextureLoader();
        this.rippleTexture = textureLoader.load('resources/textures/regn.png');  // Load the texture for the ripple

        // Create a small circle geometry for the ripple effect
        this.rippleGeometry = new CircleGeometry(0.1, 32);  // Small circle with a radius of 0.1

        // Create the ripple material with the loaded texture
        this.rippleMaterial = new MeshBasicMaterial({
            map: this.rippleTexture,  // Apply the texture to the material
            transparent: true,
            opacity: 0.6,  // Adjust opacity if needed
            depthWrite: false,  // So the ripple is transparent
        });

        // Create the ripple mesh and position it at the center of the puddle
        this.rippleMesh = new Mesh(this.rippleGeometry, this.rippleMaterial);
        this.rippleMesh.rotation.x = -Math.PI / 2;  // Rotate the ripple mesh to lie flat on the XZ plane
        this.rippleMesh.visible = false;  // Initially, the ripple mesh is invisible
        scene.add(this.rippleMesh);
    }

    // Function to check if the raindrop intersects the puddle (or water surface)
    checkCollision(raindrop) {
        if (!this.boundingBox) {
            this.boundingBox = new Box3().setFromObject(this.rippleMesh);  // Create bounding box for the ripple mesh
        }

        const raindropBox = new Box3().setFromObject(raindrop);  // Get the bounding box of the raindrop
        if (this.boundingBox.intersectsBox(raindropBox)) {  // Check if the raindrop intersects the ripple
            this.triggerRipple(raindrop.position);  // Trigger the ripple effect if there's a collision
        }
    }

    // Function to trigger a ripple effect at a specific position
    triggerRipple(landPosition) {
        this.rippleTime = Date.now();  // Start the ripple animation timer
        this.rippleActive = true;  // Activate the ripple animation
        this.rippleMesh.visible = true;  // Make the ripple mesh visible

        // Position the ripple mesh at the raindrop's landing position
        this.rippleMesh.position.set(landPosition.x, landPosition.y, landPosition.z);

        // Reset the ripple radius and strength for the new ripple
        this.rippleRadius = 0;
        this.rippleStrength = 0.1;  // Initial ripple strength (amplitude)
    }

    // Function to update the ripple over time
    updateRipple() {
        if (!this.rippleActive) return;

        const elapsed = (Date.now() - this.rippleTime) / 1000;  // Time in seconds since the ripple started

        // Grow ripple radius and fade strength over time
        this.rippleRadius += 0.05;  // Increase radius size gradually
        this.rippleStrength = Math.max(0, 0.3 - elapsed * 0.1);  // Fade out strength over time

        // Scale the ripple mesh to simulate growing effect
        this.rippleMesh.scale.set(this.rippleRadius, this.rippleRadius, 1);  // Scale along X and Y axes

        // Stop the ripple once the strength fades out
        if (this.rippleStrength <= 0) {
            this.rippleActive = false;  // Deactivate the ripple once it's fully faded
            this.rippleMesh.visible = false;  // Hide the ripple mesh
        }
    }

    // Function to get data related to the current ripple
    getRippleData() {
        return {
            rippleTime: this.rippleTime,
            rippleRadius: this.rippleRadius,
            rippleStrength: this.rippleStrength,
            ripplePosition: this.ripplePosition,
        };
    }
}

export { RippleEffect };
