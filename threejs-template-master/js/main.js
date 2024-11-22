import {
    AxesHelper,
    DirectionalLight,
    Mesh,
    PCFSoftShadowMap,
    PerspectiveCamera,
    RepeatWrapping,
    Scene,
    TextureLoader,
    Vector3,
    WebGLRenderer,
    Fog,
    AmbientLight
} from './lib/three.module.js';


import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';
import {GLTFLoader} from './loaders/GLTFLoader.js';
import {SimplexNoise} from './lib/SimplexNoise.js';
import * as rain from './Weather/Rain.js';
import * as Skybox from "./Skybox/Skybox.js";
import * as clouds from './Weather/Clouds.js';
import * as birds from "./Models/Birds.js";
import {Puddle} from "./Weather/Puddle.js";
import { Water } from './objects/Water.js'
import { ModelLoader } from './modelsimport/ModelLoader.js';
import {Trees} from "./Models/Trees.js";


async function main() {



    const scene = new Scene();
    scene.fog = new Fog(0x8b9ea8, 1, 50); //For å få tåke på vannet

    //Vann
    const water = new Water(100, new Vector3(1, 0.65, 1)); // Størrelse og posisjon
    const waterMesh = water.getMesh(); // Hent Mesh fra klassen

    waterMesh.rotation.x = -Math.PI / 2; // Legg vannet flatt
    scene.add(waterMesh);

    const axesHelper = new AxesHelper(15);
    scene.add(axesHelper);

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    /**
     * Handle window resize:
     *  - update aspect ratio.
     *  - update projection matrix
     *  - update renderer size
     */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    /**
     * Add canvas element to DOM.
     */
    document.body.appendChild(renderer.domElement);

    /**
     * Add light
     */
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(300, 400, 0);

    directionalLight.castShadow = true;

    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;

    scene.add(directionalLight);

    // Set direction
    directionalLight.target.position.set(0, 15, 0);
    scene.add(directionalLight.target);
    const ambientLight = new AmbientLight( 0x404040 ); // soft white light
    scene.add( ambientLight );


    camera.position.z = 1;
    camera.position.y = 1;
    camera.rotation.x -= Math.PI * 0.25;


    /**
     * Add terrain:
     * 
     * We have to wait for the image file to be loaded by the browser.
     * There are many ways to handle asynchronous flow in your application.
     * We are using the async/await language constructs of Javascript:
     *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
     */
    const heightmapImage = await Utilities.loadImage('resources/images/KartBergenGrayscalePNGHvitereTest.png');
    const width = 100;

    const simplex = new SimplexNoise();
    const terrainGeometry = new TerrainBufferGeometry({
        width,
        heightmapImage,
        //noiseFn: simplex.noise.bind(simplex),
        numberOfSubdivisions: 400,
        height: 10
    });


    const grassTexture = new TextureLoader().load('resources/textures/grass_02.png');
    grassTexture.wrapS = RepeatWrapping;
    grassTexture.wrapT = RepeatWrapping;
    grassTexture.repeat.set(5000 / width, 5000 / width);

    const rockTexture = new TextureLoader().load('resources/textures/rock_03.png');
    rockTexture.wrapS = RepeatWrapping;
    rockTexture.wrapT = RepeatWrapping;
    rockTexture.repeat.set(1500 / width, 1500 / width);


    const splatMap = new TextureLoader().load('resources/images/SplatmapBergenMindreMork.png');

    const terrainMaterial = new TextureSplattingMaterial({
        color: 0xffffff,
        shininess: 0,
        textures: [rockTexture, grassTexture],
        splatMaps: [splatMap]
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    terrain.castShadow = true;
    terrain.receiveShadow = true;

    scene.add(terrain);



    // instantiate a GLTFLoader:
    const loader = new GLTFLoader();

    const modelLoader = new ModelLoader(scene, loader);

// Load Bryggen
    modelLoader.loadModel(
        'resources/models/Bryggen.glb',
        new Vector3(1, 1, 1), // Position
        new Vector3(1, 1, 1), // Scale
        Math.PI / 2          // Rotation
    );

// Load Bybanen
    modelLoader.loadModel(
        'resources/models/Bybanen.glb',
        new Vector3(0, 0, 0), // Position
        new Vector3(0.01, 0.01, 0.01), // Scale
        Math.PI / 2           // Rotation
    );
    /**
     * Add trees
     */

    new Trees(scene, terrainGeometry, loader);


    /**
    Lager skybox
     */
    const skyboxTexturePath = "resources/images/Lyseblaa.png"; // Path to the texture
    const skyboxSystem = new Skybox.Skybox(scene, skyboxTexturePath);  // Instantiate and add the skybox to the scene

    /**
     * Regn
     */
    // Initialize the rain system
    const rainSystem = new rain.Rain(scene, 13000);  // Pass scene and number of raindrops

    /**
     * Vannpytt
     */
    const puddleCount = 100; // Number of puddles
    const puddles = [];

    for (let i = 0; i < puddleCount; i++) {
        const x = Math.random() * 100 - 50; // Range -50 to 50
        const z = Math.random() * 100 - 50; // Range -50 to 50
        const y = terrainGeometry.getHeightAt(x, z) + 0.1; // Get terrain height and offset slightly above it
        puddles.push(new Puddle(scene, new Vector3(x, y, z), terrainGeometry));
    }


    /**
    Skyer
     */
    const cloudSystem = new clouds.Clouds(scene, 150);

    /**
    Tåke
     */
    scene.fog = new Fog( 0x8b9ea8, 10, 50);

    /**
     * Fugler
     */
    const fugler = new birds.Birds(scene,15, loader);


    /**
     * Set up camera controller:
     */

    const mouseLookController = new MouseLookController(camera);

    // We attach a click lister to the canvas-element so that we can request a pointer lock.
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
    const canvas = renderer.domElement;

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    let yaw = 0;
    let pitch = 0;
    const mouseSensitivity = 0.001;

    function updateCamRotation(event) {
        yaw += event.movementX * mouseSensitivity;
        pitch += event.movementY * mouseSensitivity;
    }

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            canvas.addEventListener('mousemove', updateCamRotation, false);
        } else {
            canvas.removeEventListener('mousemove', updateCamRotation, false);
        }
    });

    let move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        speed: 0.01
    };

    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') {
            move.forward = true;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = true;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = true;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = true;
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') {
            move.forward = false;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = false;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = false;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = false;
            e.preventDefault();
        }
    });

    const velocity = new Vector3(0.0, 0.0, 0.0);

    let then = performance.now();
    function loop(now) {

        const delta = now - then;
        then = now;

        const moveSpeed = move.speed * delta;

        velocity.set(0.0, 0.0, 0.0);

        if (move.left) {
            velocity.x -= moveSpeed;
        }

        if (move.right) {
            velocity.x += moveSpeed;
        }

        if (move.forward) {
            velocity.z -= moveSpeed;
        }

        if (move.backward) {
            velocity.z += moveSpeed;
        }

        // update controller rotation.
        mouseLookController.update(pitch, yaw);
        yaw = 0;
        pitch = 0;

        // apply rotation to velocity vector, and translate moveNode with it.
        velocity.applyQuaternion(camera.quaternion);
        camera.position.add(velocity);

        //regn
        //rainSystem.updateRain(terrainGeometry, scene, puddles);
        //Skyer
        cloudSystem.updateCloud(delta);
        //Vannpytt

        rainSystem.updateRain(terrainGeometry, puddles);

        puddles.forEach((puddle) => {
            puddle.updatePuddle(terrainGeometry);
        });

        //fugler
        fugler.animate(now)


        //Vann
        water.update(delta * 0.1); // Convert to seconds

        // render scene:
        renderer.render(scene, camera);


        requestAnimationFrame(loop);

    }

    loop(performance.now());

}

main(); // Start application
