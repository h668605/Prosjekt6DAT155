import {
    MeshBasicMaterial,
    Mesh,
    SphereGeometry,
    Vector3,
    CylinderGeometry
} from '../lib/three.module.js';

export class ModelLoader {
    constructor(scene, loader) {
        this.scene = scene;
        this.loader = loader;
        this.models = [];
    }

    loadModel(path, position = new Vector3(), scale = new Vector3(1, 1, 1), rotation = 0) {
        this.loader.load(
            path, // Use the provided path directly
            (gltf) => {
                const model = gltf.scene;

                model.position.copy(position);
                model.scale.copy(scale);
                model.rotation.y = rotation;

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.models.push(model);
                this.scene.add(model); // Add the model to the scene
            },
            undefined,
            (error) => {
                console.error(`Error loading model ${path}:`, error);
            }
        );
    }
}
