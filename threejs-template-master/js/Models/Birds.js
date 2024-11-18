

export class Birds {
    constructor(scene, birdAmount, loader) {
        this.scene = scene;
        this.birdAmount = birdAmount;
        this.birds = [];
        this.loader = loader;
        this.createBirds()
    }

    createBirds(){
        this.loader.load("resources/models/Birds/Flying gull.glb", (gltf) => {
            for(let i = 0;i<this.birdAmount;i++){
                const bird = gltf.scene.children[0].clone();
                bird.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                    }
                })

                bird.position.x = 10 + Math.random()*10;
                bird.position.y = 10 + Math.random()*10;
                bird.position.z = 10 + Math.random()*10;

                bird.rotation.y = Math.random() * (2 * Math.PI);

                bird.scale.multiplyScalar(0.01);

                this.scene.add(bird);
                this.birds.push(bird);
            }
        })
    }


    animate(delta) {
        // Loop through all birds and animate them
        this.birds.forEach((bird) => {
            // Move birds in a circular motion with sine and cosine functions
            const speed = 0;  // Control the speed of the motion
            const radius = 5;  // Set the radius of the circular path
            const time = delta * 0.001;  // Time factor for smooth animation


            // Update bird's position to follow a circular path
            bird.position.x = 10
            bird.position.y = 10 + Math.sin(time + bird.id) * 2;  // Adds some vertical variation
            bird.position.z = Math.cos(time + bird.id) * radius+speed;

            // Rotate the bird slightly as it moves to simulate flapping or facing direction
            bird.rotation.y += 0.01;  // Constant rotation speed for the bird

            // You can also add random variation to simulate more natural motion:
            // bird.rotation.x = Math.sin(time + bird.id) * 0.1;
        });
    }



}