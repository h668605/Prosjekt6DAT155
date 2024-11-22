import {
    Vector3,
    CatmullRomCurve3
} from '/threejs-template-master/js/lib/three.module.js';


export class Birds {
    /**
     * Konstruktør for klassen
     * @param scene
     * @param birdAmount
     * @param loader
     */
    constructor(scene, birdAmount, loader) {
        this.scene = scene;
        this.birdAmount = birdAmount;
        this.birds = [];
        this.loader = loader;
        this.curves = [];
        this.createBirds()
    }

    /**
     * Denne metoden henter fuglemodellen, lager gitt antall fugler, posisjonerer og skalerer fuglene. Hver fugl får en
     * unik path laget som en CatmullRomCurve3, som definerer hver fugl sin flygebane
     */
    createBirds() {
        this.loader.load("resources/models/Birds/Flying gull.glb", (gltf) => {
            for (let i = 0; i < this.birdAmount; i++) {
                const bird = gltf.scene.children[0].clone();
                bird.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                bird.position.x = 40 + Math.random() * 10;
                bird.position.y = 10 + Math.random() * 10;
                bird.position.z = 30 + Math.random() * 10;

                bird.rotation.y = Math.random() * (2 * Math.PI);

                bird.scale.multiplyScalar(0.01);

                const points = [];
                for (let j = 0; j < 5; j++) {
                    points.push(new Vector3(
                        (Math.random() - 0.5) * 50,
                        10 + Math.random() * 5,
                        (Math.random() - 0.5) * 50
                    ));
                }
                const curve = new CatmullRomCurve3(points, true); // Closed curve
                this.curves.push(curve);

                this.birds.push({ bird, curve }); // Store bird-curve pair

                this.scene.add(bird);
            }
        });
    }


    /**
     * Hver fugl animeres ved at man modulerer tid med 6, og for hver ny modulo får hver fugl en ny posisjon på CatmullRomCurve3 å "fly" til.
     * Vi noramaliserer også modellen og oppdaterer slik at fuglen alltid ser forover
     * @param time
     */
    animate(time) {
        const t = (time / 3600 % 6) / 6; // Normalized time for movement
        this.birds.forEach(({ bird, curve }) => {
            const position = curve.getPointAt(t); // Get position on the curve
            bird.position.copy(position); // Update bird position

            const tangent = curve.getTangentAt(t).normalize();
            bird.lookAt(position.clone().add(tangent)); // Align bird's forward direction with the tangent

            // Adjust orientation to fix the sideways issue
            bird.rotateY(-Math.PI / 2); // Rotate 90 degrees counterclockwise since model is 90 degrees turned wrong
        });
    }




}