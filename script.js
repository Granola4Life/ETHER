let renderer,
scene,
camera,
sphereBg,
nucleus,
stars,
controls,
container = document.getElementById("canvas_container"),
timeout_Debounce,
noise = new SimplexNoise(),
cameraSpeed = 0,
blobScale = 3;


init();
animate();


function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 1000)
    camera.position.set(0,0,230);

    const directionalLight = new THREE.DirectionalLight("#fff", 2);
    directionalLight.position.set(0, 50, -20);
    scene.add(directionalLight);

    let ambientLight = new THREE.AmbientLight("#ffffff", 1);
    ambientLight.position.set(0, 20, 20);
    scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    //OrbitControl
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 4;
    controls.maxDistance = 350;
    controls.minDistance = 150;
    controls.enablePan = false;

    const loader = new THREE.TextureLoader();
    const textureSphereBg = loader.load('https://etherpro.co/images/appa pink sky.jpeg');
    const texturenucleus = loader.load('https://etherpro.co/images/appa.jpeg');
    const textureStar = loader.load("https://i.ibb.co/ZKsdYSz/p1-g3zb2a.png");
    const texture1 = loader.load("https://i.ibb.co/F8by6wW/p2-b3gnym.png");
    const texture2 = loader.load("https://i.ibb.co/yYS2yx5/p3-ttfn70.png");
    const texture4 = loader.load("https://i.ibb.co/yWfKkHh/p4-avirap.png");


    /*  Nucleus  */
    texturenucleus.anisotropy = 16;
    let icosahedronGeometry = new THREE.IcosahedronGeometry(30, 10);
    let lambertMaterial = new THREE.MeshPhongMaterial({ map: texturenucleus });
    nucleus = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    scene.add(nucleus);


    /*    Sphere  Background   */
    textureSphereBg.anisotropy = 16;
    let geometrySphereBg = new THREE.SphereBufferGeometry(150, 40, 40);
    let materialSphereBg = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: textureSphereBg,
    });
    sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
    scene.add(sphereBg);


    /*    Moving Stars   */
    let starsGeometry = new THREE.Geometry();

    for (let i = 0; i < 50; i++) {
        let particleStar = randomPointSphere(150);

        particleStar.velocity = THREE.MathUtils.randInt(50, 200);

        particleStar.startX = particleStar.x;
        particleStar.startY = particleStar.y;
        particleStar.startZ = particleStar.z;

        starsGeometry.vertices.push(particleStar);
    }
    let starsMaterial = new THREE.PointsMaterial({
        size: 5,
        color: "#ffffff",
        transparent: true,
        opacity: 0.8,
        map: textureStar,
        blending: THREE.AdditiveBlending,
    });
    starsMaterial.depthWrite = false;
    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);


    /*    Fixed Stars   */
    function createStars(texture, size, total) {
        let pointGeometry = new THREE.Geometry();
        let pointMaterial = new THREE.PointsMaterial({
            size: size,
            map: texture,
            blending: THREE.AdditiveBlending,
        });

        for (let i = 0; i < total; i++) {
            let radius = THREE.MathUtils.randInt(149, 70);
            let particles = randomPointSphere(radius);
            pointGeometry.vertices.push(particles);
        }
        return new THREE.Points(pointGeometry, pointMaterial);
    }
    scene.add(createStars(texture1, 15, 20));
    scene.add(createStars(texture2, 5, 5));
    scene.add(createStars(texture4, 7, 5));


    function randomPointSphere (radius) {
        let theta = 2 * Math.PI * Math.random();
        let phi = Math.acos(2 * Math.random() - 1);
        let dx = 0 + (radius * Math.sin(phi) * Math.cos(theta));
        let dy = 0 + (radius * Math.sin(phi) * Math.sin(theta));
        let dz = 0 + (radius * Math.cos(phi));
        return new THREE.Vector3(dx, dy, dz);
    }
}


function animate() {

    //Stars  Animation
    stars.geometry.vertices.forEach(function (v) {
        v.x += (0 - v.x) / v.velocity;
        v.y += (0 - v.y) / v.velocity;
        v.z += (0 - v.z) / v.velocity;

        v.velocity -= 0.3;

        if (v.x <= 5 && v.x >= -5 && v.z <= 5 && v.z >= -5) {
            v.x = v.startX;
            v.y = v.startY;
            v.z = v.startZ;
            v.velocity = THREE.MathUtils.randInt(50, 300);
        }
    });


    //Nucleus Animation
    nucleus.geometry.vertices.forEach(function (v) {
        let time = Date.now();
        v.normalize();
        let distance = nucleus.geometry.parameters.radius + noise.noise3D(
            v.x + time * 0.0020,
            v.y + time * 0.0005,
            v.z + time * 0.0008
        ) * blobScale;
        v.multiplyScalar(distance);
    })
    nucleus.geometry.verticesNeedUpdate = true;
    nucleus.geometry.normalsNeedUpdate = true;
    nucleus.geometry.computeVertexNormals();
    nucleus.geometry.computeFaceNormals();
    nucleus.rotation.y += 0.002;


    //Sphere Beckground Animation
    sphereBg.rotation.x += 0.002;
    sphereBg.rotation.y += 0.002;
    sphereBg.rotation.z += 0.002;


    controls.update();
    stars.geometry.verticesNeedUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}



/*     Resize     */
window.addEventListener("resize", () => {
    clearTimeout(timeout_Debounce);
    timeout_Debounce = setTimeout(onWindowResize, 80);
});
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}



/*     Fullscreen btn     */
// let fullscreen;
// let fsEnter = document.getElementById('fullscr');
// fsEnter.addEventListener('click', function (e) {
//     e.preventDefault();
//     if (!fullscreen) {
//         fullscreen = true;
//         document.documentElement.requestFullscreen();
//         fsEnter.innerHTML = "Exit Fullscreen";
//     }
//     else {
//         fullscreen = false;
//         document.exitFullscreen();
//         fsEnter.innerHTML = "Go Fullscreen";
//     }
// });

const ns = 'http://www.w3.org/2000/svg';

const Generator = (grammar) => {
  const root = document.createElementNS(ns, 'g');

  const generator = {
    root: root,
    context: root,
    currentDepth: 0,
    active: [{ type: 'START', at: root, depth: 0 }],
    added: [],

    withContext: (callback) => {
      const oldDepth = generator.depth;
      const oldContext = generator.context;
      callback();
      generator.context = oldContext;
      generator.depth = oldDepth;
    },

    add: (params) => {
      const path = document.createElementNS(ns, 'path');
      Object.keys(params).forEach(key => path.setAttribute(key, params[key]));
      generator.context.appendChild(path);
      generator.added.push(path);
    },

    transform: (transformation) => {
      const newContext = document.createElementNS(ns, 'g');
      newContext.setAttribute('transform', transformation);

      generator.context.appendChild(newContext);
      generator.context = newContext;
    },

    spawn: (type) => generator.active.push({ type: type, at: generator.context, depth: generator.depth + 1 }),

    done: () => generator.active.length === 0,

    next: () => {
      generator.added = [];

      const spawnPoint = generator.active.splice(Math.floor(Math.random() * generator.active.length), 1)[0];
      generator.withContext(() => {
        generator.context = spawnPoint.at;
        generator.depth = spawnPoint.depth;
        grammar[spawnPoint.type](generator);
      });

      return generator.added;
    },

    runAll: () => {
      while (!generator.done()) generator.next();
      return generator;
    }
  };

  return generator;
};

const Tree = {
  START: (generator) => {
    generator.spawn('branch');
  },

  branch: (generator) => {
    if (generator.depth > 1) {
      const scale = Math.random() * 0.25 + 0.65;
      const rotation = Math.random() * 60 - 30;
      generator.transform(`scale(${scale}) rotate(${rotation})`);
    } else {
      const scale = Math.random() * 0.2 + 0.7;
      const rotation = Math.random() * 40 - 20;
      generator.transform(`scale(${scale}) rotate(${rotation})`);
    }

    generator.withContext(() => {
      generator.transform(`translate(0 -50)`);
      generator.spawn('branchOrLeaf');
    });

    generator.add({
      d: 'M 0,0 L 0,-50',
      stroke: '#70655D',
      fill: 'none',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      style: 'vector-effect: non-scaling-stroke'
    });
  },

  branchOrLeaf: (generator) => {
    const leaf = Math.random() < 0.4 && generator.depth > 4;
    if (leaf || generator.depth > 10) {
      generator.spawn('leaf');
    } else {
      generator.spawn('branch');
      generator.spawn('maybeBranch');
      generator.spawn('maybeBranch');
    }
  },

  maybeBranch: (generator) => {
    if (Math.random() < 0.6) {
      generator.spawn('branch');
    }
  },

  leaf: (generator) => {
    const x = 0;
    const y = 0;
    const r = 50;
    const hue = Math.round(Math.random() * 50 + 70);
    generator.add({
      d: `M${x - r},${y} ` +
        `a${r},${r} 0 1,0 ${r * 2},0 ` +
        `a${r},${r} 0 1,0 ${-r * 2},0`,
      //fill: '#F7BEB2',
      fill: `hsl(${hue}, 50%, 50%)`,
      'fill-opacity': 0.8,
      stroke: 'none'
    });
  }
};

const svg = document.createElementNS(ns, 'svg');
svg.setAttribute('width', 990);
svg.setAttribute('height', 360);
svg.setAttribute('viewBox', '0 0 990 360');
document.body.appendChild(svg);

const generators = [];
for (let i = 0; i < 40; i++) {
  const currentGenerator = Generator(Tree);
  const model = currentGenerator.root;
  model.setAttribute('transform', `scale(0.45) translate(${(i % 10 + 1) * 200} ${Math.floor(i / 10 + 1) * 200})`);
  svg.appendChild(model);

  generators.push(currentGenerator);
}

const WIDTH = 10;
const HEIGHT = 4;
const generatorQueue = [];
for (let x = -3; x < WIDTH; x++) {
  for (let i = 0; i < HEIGHT; i++) {
    if (x + i >= 0 && x + i < WIDTH) {
      generatorQueue.push(generators[(HEIGHT - i - 1) * WIDTH + x + i]);
    }
  }
}

let active = [generatorQueue.shift()];
let step = 0;

const runAll = () => {
  window.requestAnimationFrame(() => {
    active.forEach(generator => {
      let added = [];
      do {
        added.push(...generator.next());
      } while (!generator.done() && added.length < 1);

      added.forEach((path) => {
        path.classList.add('path-appearing');
      });
    });

    active = active.filter(generator => !generator.done());

    step++;

    if (generatorQueue.length > 0 && step % 5 === 0) {
      active.push(generatorQueue.shift());
    }

    if (active.length > 0 || generatorQueue.length > 0) {
      runAll();
    }
  });
};

runAll();
