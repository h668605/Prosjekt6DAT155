import {
    MeshBasicMaterial,
    Mesh,
    SphereGeometry,
    Vector3
} from './lib/three.module.js';

export class Rain {
    constructor(scene, rainCount = 1000) {
        this.scene = scene;
        this.rainCount = rainCount;
        this.rain = []; // Array for regndråpene
        this.rainMaterial = new MeshBasicMaterial({
            color: 0xaaaaaa, // Farge for regndråpene
            opacity: 0.5,
            transparent: true,
            depthWrite: false,
        });
        this.rainGeometry = new SphereGeometry(0.05, 6, 6); // Bruker små sfærer som regndråper
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
            raindrop.velocity = new Vector3(0, -Math.random() * 0.5 - 0.2, 0);

            this.rain.push(raindrop);
            this.scene.add(raindrop); // Legg til regndråpen i scenen
        }
    }

    // Funksjon for å oppdatere regndråpene
    updateRain(deltaTime) {
        for (let i = 0; i < this.rain.length; i++) {
            const raindrop = this.rain[i];
            raindrop.position.add(raindrop.velocity); // Oppdater posisjonen med hastigheten

            // Hvis regndråpen har falt under bakken, sett den tilbake til en ny posisjon
            if (raindrop.position.y < 0) {
                raindrop.position.y = Math.random() * 100 + 50; // Tilfeldig høyde
                raindrop.position.x = Math.random() * 200 - 100; // Tilfeldig x-posisjon
                raindrop.position.z = Math.random() * 200 - 100; // Tilfeldig z-posisjon
            }
        }
    }
}
