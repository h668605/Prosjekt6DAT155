

import {
    Vector3,
    CatmullRomCurve3,
    LOD,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    TextureLoader
} from '/threejs-template-master/js/lib/three.module.js';

export class Trees {
    /**
     * Konstruktøren
     * @param scene
     * @param terrainGeometry
     * @param loader
     */
    constructor(scene, terrainGeometry, loader) {
        this.scene = scene;
        this.terrainGeometry = terrainGeometry;
        this.loader = loader;
        this.makeTrees()
    }

    /**
     * Metoden som lager trærne. Tar in modell, deler opp kartet i mange deler og plasserer trær på hver del
     */
    makeTrees(){

        this.loader.load(
            // resource URL
            'resources/models/kenney_nature_kit/tree_thin.glb',
            // called when resource is loaded
            (object) => {
                for (let x = -50; x < 50; x += 2) {
                    for (let z = -50; z < 50; z += 2) {

                        const px = x + 1 + (6 * Math.random()) - 3;
                        const pz = z + 1 + (6 * Math.random()) - 3;

                        const height = this.terrainGeometry.getHeightAt(px, pz);

                        if (height < 5 && height > 2) {

                            const lod = new LOD;

                            const tree = object.scene.children[0].clone();

                            tree.traverse((child) => {
                                if (child.isMesh) {
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                }
                            });



                            lod.addLevel(tree, 0);

                            const texture = new TextureLoader().load('resources/textures/Tree1Billboard.png');
                            const material = new MeshBasicMaterial({ map: texture, transparent: true });
                            const geometry = new PlaneGeometry(1, 2); // Adjust size to match tree
                            const lowDetailTree = new Mesh(geometry, material);

                            lod.addLevel(lowDetailTree,20)

                            lod.position.x = px;
                            lod.position.y = height + 0.001;
                            lod.position.z = pz;

                            lod.rotation.y = Math.random() * (2 * Math.PI);

                            tree.scale.multiplyScalar(0.4+Math.random()*0.01);
                            this.scene.add(lod);
                        }

                    }
                }
            },
            (xhr) => {
                console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model.', error);
            }
        );
    }
}