// Import necessary modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Initialize GLTFLoader
const loader = new GLTFLoader();

// Load the model
loader.load(
    './models/Bryggen.glb', // Path to your .glb file
    (gltf) => {
        const model = gltf.scene; // Extract the model from the loaded GLTF file
        scene.add(model); // Add the model to your existing scene

        // Optional: Position, scale, and rotate the model
        model.position.set(0, 0, 0); // Set the position (x, y, z)
        model.scale.set(1, 1, 1);    // Scale the model uniformly
        model.rotation.y = Math.PI / 2; // Rotate if necessary
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);

loader.load(
    './models/Bybanen.glb', // Path to your .glb file
    (gltf) => {
        const model = gltf.scene; // Extract the model from the loaded GLTF file
        scene.add(model); // Add the model to your existing scene

        // Optional: Position, scale, and rotate the model
        model.position.set(0, 0, 0); // Set the position (x, y, z)
        model.scale.set(1, 1, 1);    // Scale the model uniformly
        model.rotation.y = Math.PI / 2; // Rotate if necessary
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);
