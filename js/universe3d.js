
(() => {
  "use strict";

  function initUniverse3D() {
    const canvas = document.getElementById("universe-3d");
    const system = document.querySelector("#universe .solar-system");

    if (!canvas || !system || !window.THREE) {
      console.warn("Universo 3D: falta el canvas, el sistema solar o Three.js.");
      return;
    }

    if (
      canvas.dataset.initialized === "true" ||
      canvas.dataset.initialized === "initializing"
    ) {
      return;
    }

    canvas.dataset.initialized = "initializing";

    const THREE = window.THREE;
    const textureLoader = new THREE.TextureLoader();
    const scene = new THREE.Scene();

    // ==========================================
    // GRUPO PRINCIPAL DEL UNIVERSO
    // ==========================================

    // ==========================================
// GRUPO PRINCIPAL DEL UNIVERSO
// ==========================================

// ==========================================
// CENTRO DE ROTACIÓN DEL UNIVERSO
// ==========================================

const universePivot = new THREE.Group();

// El centro de rotación coincide con el centro del disco.
universePivot.position.set(0, 0, -2.48);
scene.add(universePivot);

// Grupo principal del universo.
const universeGroup = new THREE.Group();
universeGroup.position.z = 2.48;
universePivot.add(universeGroup);



// ==========================================
// FONDO ESPACIAL INTEGRADO AL UNIVERSO
// ==========================================

const backgroundGroup = new THREE.Group();

backgroundGroup.position.set(0, 0, 0);

// Integrar estrellas y nebulosas al movimiento principal.
universePivot.add(backgroundGroup);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // ==========================================
    // CARGA DE TEXTURAS
    // ==========================================

    function loadPlanetTexture(path, fallbackTexture) {
      textureLoader.load(
        path,
        (loadedTexture) => {
          fallbackTexture.image = loadedTexture.image;
          fallbackTexture.colorSpace = THREE.SRGBColorSpace;
          fallbackTexture.anisotropy =
            renderer.capabilities.getMaxAnisotropy();
          fallbackTexture.needsUpdate = true;

          loadedTexture.dispose();

          console.info(`Textura cargada: ${path}`);
        },
        undefined,
        (error) => {
          console.warn(
            `No se pudo cargar ${path}. Se conservará la textura anterior.`,
            error
          );
        }
      );

      return fallbackTexture;
    }

    // ==========================================
    // ILUMINACIÓN AMBIENTAL DEL UNIVERSO
    // ==========================================

    const ambientLight = new THREE.AmbientLight(0x9b83d8, 1.0);
    scene.add(ambientLight);

    // Luz principal dorada del Sol.
    const sunLight = new THREE.PointLight(
      0xffc078,
      190,
      50,
      1.4
    );

    sunLight.position.set(0, 0, 2);
    universeGroup.add(sunLight);

    // Luz secundaria violeta.
    const fillLight = new THREE.PointLight(
      0x8065ff,
      45,
      40,
      1.5
    );

    fillLight.position.set(-5, 3, 4);
    scene.add(fillLight);

    // Luz rosada.
    const pinkLight = new THREE.PointLight(
      0xff91d5,
      28,
      35,
      1.5
    );

    pinkLight.position.set(6, -5, -3);
    scene.add(pinkLight);

    // Luz azul lavanda.
    const lavenderLight = new THREE.PointLight(
      0xb6a0ff,
      18,
      32,
      1.5
    );

    lavenderLight.position.set(0, 6, -5);
    scene.add(lavenderLight);

    // ==========================================
    // TEXTURA PROCEDURAL DEL SOL (RESPALDO)
    // ==========================================

    function createSunTexture() {
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = 1024;
      textureCanvas.height = 512;

      const ctx = textureCanvas.getContext("2d");
      const w = textureCanvas.width;
      const h = textureCanvas.height;

      const gradient = ctx.createLinearGradient(0, 0, 0, h);

      gradient.addColorStop(0, "#ffdc83");
      gradient.addColorStop(0.35, "#ff9b32");
      gradient.addColorStop(0.7, "#f45b20");
      gradient.addColorStop(1, "#ffbd55");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 180; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radiusX = 12 + Math.random() * 65;
        const radiusY = 4 + Math.random() * 22;

        ctx.beginPath();

        ctx.ellipse(
          x,
          y,
          radiusX,
          radiusY,
          Math.random() * Math.PI,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = Math.random() > 0.5
          ? "#fff0a6"
          : "#d94318";

        ctx.globalAlpha = 0.12 + Math.random() * 0.28;
        ctx.fill();
      }

      for (let i = 0; i < 35; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;

        const glow = ctx.createRadialGradient(
          x, y, 1,
          x, y, 15 + Math.random() * 35
        );

        glow.addColorStop(0, "rgba(255,255,220,0.8)");
        glow.addColorStop(1, "rgba(255,180,50,0)");

        ctx.fillStyle = glow;
        ctx.fillRect(x - 45, y - 45, 90, 90);
      }

      ctx.globalAlpha = 1;

      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      return texture;
    }

    // ==========================================
    // RESPLANDOR DEL SOL
    // ==========================================

    function createGlowTexture() {
      const size = 128;
      const data = new Uint8Array(size * size * 4);

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = (x - size / 2) / (size / 2);
          const dy = (y - size / 2) / (size / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const alpha = Math.max(0, 1 - distance);
          const index = (y * size + x) * 4;

          data[index] = 255;
          data[index + 1] = 170;
          data[index + 2] = 100;
          data[index + 3] = Math.round(
            Math.pow(alpha, 2.5) * 255
          );
        }
      }

      const texture = new THREE.DataTexture(
        data,
        size,
        size,
        THREE.RGBAFormat
      );

      texture.needsUpdate = true;
      return texture;
    }

    // ==========================================
    // NEBULOSAS MÁGICAS
    // ==========================================

    function createNebulaTexture() {
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = 512;
      textureCanvas.height = 512;

      const ctx = textureCanvas.getContext("2d");

      const gradient = ctx.createRadialGradient(
        256, 256, 10,
        256, 256, 250
      );

      gradient.addColorStop(0, "rgba(190, 115, 255, 0.48)");
      gradient.addColorStop(0.35, "rgba(126, 75, 220, 0.30)");
      gradient.addColorStop(0.68, "rgba(244, 125, 205, 0.14)");
      gradient.addColorStop(1, "rgba(100, 60, 180, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      // Pequeñas nubes luminosas.
      for (let i = 0; i < 90; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 8 + Math.random() * 45;

        const cloud = ctx.createRadialGradient(
          x, y, 1,
          x, y, radius
        );

        cloud.addColorStop(
          0,
          i % 2 === 0
            ? "rgba(255, 190, 245, 0.16)"
            : "rgba(160, 130, 255, 0.17)"
        );

        cloud.addColorStop(1, "rgba(130, 90, 220, 0)");

        ctx.fillStyle = cloud;
        ctx.fillRect(
          x - radius,
          y - radius,
          radius * 2,
          radius * 2
        );
      }

      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      return texture;
    }

    // ==========================================
    // CREAR CAPAS DE NEBULOSAS
    // ==========================================

    const nebulaTexture = createNebulaTexture();

   const nebulaPositions = [
  // Nebulosas laterales: conservamos el resultado actual
  { x: -4.5, y: 3.0, scale: 4.5 },
  { x: 4.5, y: -3.0, scale: 4.5 },
  { x: 3.5, y: 3.8, scale: 4.0 },
  { x: -3.5, y: -3.8, scale: 4.0 },

  // Refuerzo más intenso en la zona central
{ x: -1.2, y: 0.8, scale: 4.2 },
{ x: 1.2, y: -0.8, scale: 4.2 }

   ]
    const nebulas = [];

    nebulaPositions.forEach((position, index) => {
    
const material = new THREE.SpriteMaterial({
  map: nebulaTexture,
  color: index % 2 === 0 ? 0xc59aff : 0xffa6df,
  transparent: true,
  opacity: 0.045,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  depthTest: true
});


      const sprite = new THREE.Sprite(material);

      sprite.position.set(
        position.x,
        position.y,
        -7 - index * 0.2
      );

      sprite.scale.set(
        position.scale,
        position.scale,
        1
      );

// Nebulosa desactivada temporalmente para comprobar
// si está generando el cuadro borroso.
sprite.visible = true;

backgroundGroup.add(sprite);
nebulas.push(sprite);
    });

    // ==========================================
    // CAMPO DE ESTRELLAS
    // ==========================================

const starCount = 3500;
const starPositions = new Float32Array(starCount * 3);

// Distribuir las estrellas alrededor del universo
// formando una capa esférica.
for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  // Distancia variable para dar profundidad.
  const radius = 35 + Math.random() * 20;

  starPositions[i * 3] =
    radius * Math.sin(phi) * Math.cos(theta);

  starPositions[i * 3 + 1] =
    radius * Math.sin(phi) * Math.sin(theta);

  starPositions[i * 3 + 2] =
    radius * Math.cos(phi);
}

    const starGeometry = new THREE.BufferGeometry();

    starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3)
);

// Posiciones originales de las estrellas
const baseStarPositions = starPositions.slice();

// Movimiento individual de las estrellas
const starPhases = new Float32Array(starCount);
const starSpeeds = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
  starPhases[i] = Math.random() * Math.PI * 2;
  starSpeeds[i] = 0.5 + Math.random() * 1.5;
}

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.13,
  transparent: true,
  opacity: 1,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});

    const starField = new THREE.Points(
      starGeometry,
      starMaterial
    );

  backgroundGroup.add(starField);
  // Estrellas fugaces
const shootingStars = [];

for (let i = 0; i < 2; i++) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(2, 0, 0)
  ]);

  const material = new THREE.LineBasicMaterial({
    color: 0xe9d5ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const shootingStar = new THREE.Line(geometry, material);

  shootingStar.rotation.z = -0.35;
  shootingStar.visible = false;

  backgroundGroup.add(shootingStar);
  shootingStars.push({
    object: shootingStar,
    material,
    offset: i * 4
  });
}

    // ==========================================
    // CREACIÓN DEL SOL
    // ==========================================

    const sunTexture = loadPlanetTexture(
      "assets/textures/sun.jpg",
      createSunTexture()
    );

    const sunGeometry = new THREE.SphereGeometry(0.72, 64, 64);

    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTexture,
      color: 0xffffff
    });

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    const sunSurfaceOffset = 0.745;

sun.position.set(
  0,
  Math.sin(1.05) * sunSurfaceOffset,
  -2.48 + Math.cos(1.05) * sunSurfaceOffset
);
    universeGroup.add(sun);

 // ==========================================
// NÚCLEO OSCURO INTEGRADO EN EL DISCO CÓSMICO
// ==========================================

const blackHoleGeometry = new THREE.CircleGeometry(
  0.28,
  128
);
const blackHoleMaterial = new THREE.MeshBasicMaterial({
  color: 0x080510,
  transparent: true,
  opacity: 0.92,
  side: THREE.DoubleSide,
  depthWrite: false,
  depthTest: true
});

const blackHoleCore = new THREE.Mesh(
  blackHoleGeometry,
  blackHoleMaterial
);

// Misma inclinación que el disco y las órbitas.
blackHoleCore.rotation.x = -1.05;

// Centro del disco, ligeramente hacia la cámara
// para evitar que se superponga exactamente con el plano.
blackHoleCore.position.set(0, 0.45, -2.465);

universeGroup.add(blackHoleCore);
blackHoleCore.visible = false;

// ==========================================
// RESPLANDOR DEL SOL
// ==========================================

const glowTexture = createGlowTexture();

const glowMaterial = new THREE.SpriteMaterial({
  map: glowTexture,
  color: 0xff9b55,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const sunGlow = new THREE.Sprite(glowMaterial);

sunGlow.scale.set(4.2, 4.2, 1);
sunGlow.position.copy(sun.position);

universeGroup.add(sunGlow);
    // ==========================================
    // HALO MÁGICO DEL SOL
    // ==========================================

    const sunHaloMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xb99aff,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

  const sunHalo = new THREE.Sprite(sunHaloMaterial);
sunHalo.position.copy(sun.position);
universeGroup.add(sunHalo);

// ==========================================
// GRAN PLANO ORBITAL 3D
// ==========================================

// Geometría de un anillo circular.
const orbitGeometry = new THREE.RingGeometry(
  0.975,
  1,
  256
);

// Material luminoso violeta y blanco.
const orbitMaterial = new THREE.MeshBasicMaterial({
  color: 0x9b6bff,
  transparent: true,
  opacity: 0.22,
  blending: THREE.NormalBlending,
  side: THREE.DoubleSide,
  depthWrite: false,
  depthTest: true
});

// Crear el anillo orbital.
const orbitalRing = new THREE.Mesh(
  orbitGeometry,
  orbitMaterial
);

// Inclinación sutil para dar perspectiva 3D.
orbitalRing.rotation.x = -1.05;

// Situarlo detrás del Sol y de los planetas.
orbitalRing.position.set(0, 0, -2.5);

universeGroup.add(orbitalRing);
// ==========================================
// SUPERFICIE DEL PLANO ORBITAL
// ==========================================
// ==========================================
// TEXTURA CÓSMICA DEL PLANO ORBITAL
// ==========================================

function createOrbitPlaneTexture() {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 1024;
  textureCanvas.height = 1024;

  const ctx = textureCanvas.getContext("2d");

  // Base espacial oscura.
  ctx.fillStyle = "#160b2d";
  ctx.fillRect(0, 0, 1024, 1024);

  // Nubes violetas y rosadas.
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const radius = 20 + Math.random() * 100;

    const gradient = ctx.createRadialGradient(
      x, y, 1,
      x, y, radius
    );

    gradient.addColorStop(
      0,
      i % 2 === 0
        ? "rgba(174, 105, 255, 0.20)"
        : "rgba(255, 130, 210, 0.13)"
    );

    gradient.addColorStop(1, "rgba(30, 10, 60, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );
  }

  // Pequeñas partículas luminosas.
  for (let i = 0; i < 450; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const radius = 0.5 + Math.random() * 1.5;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    ctx.fillStyle = "rgba(220, 190, 255, 0.45)";
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}


    // ==========================================
    // TEXTURA CÓSMICA CON RECORTE CENTRAL
    // Y BORDES SUAVES
    // ==========================================

    const orbitCanvas = document.createElement("canvas");
    orbitCanvas.width = 1024;
    orbitCanvas.height = 1024;

    const orbitContext = orbitCanvas.getContext("2d");

    const orbitPlaneTexture = new THREE.CanvasTexture(orbitCanvas);

    orbitPlaneTexture.colorSpace = THREE.SRGBColorSpace;
    orbitPlaneTexture.anisotropy =
      renderer.capabilities.getMaxAnisotropy();

    textureLoader.load(
      "assets/textures/cosmo.png",
      (loadedTexture) => {
        const image = loadedTexture.image;

        // Recortar un cuadrado desde el centro
        // sin deformar las proporciones originales.
        const sourceSize = Math.min(
          image.width,
          image.height
        );

        const sourceX = (image.width - sourceSize) / 2;
        const sourceY = (image.height - sourceSize) / 2;

        orbitContext.clearRect(0, 0, 1024, 1024);

        orbitContext.drawImage(
          image,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          1024,
          1024
        );

// ==========================================
// PROFUNDIDAD DEL NÚCLEO CÓSMICO
// ==========================================

// Oscurecimiento radial concentrado en el centro.
const coreShadow = orbitContext.createRadialGradient(
  512, 512, 35,
  512, 512, 350
);

coreShadow.addColorStop(
  0,
  "rgba(5, 2, 14, 0.78)"
);

coreShadow.addColorStop(
  0.12,
  "rgba(5, 2, 14, 0.84)"
);

coreShadow.addColorStop(
  0.28,
  "rgba(12, 5, 27, 0.64)"
);

coreShadow.addColorStop(
  0.55,
  "rgba(20, 8, 38, 0.32)"
);

coreShadow.addColorStop(
  1,
  "rgba(25, 10, 45, 0)"
);

orbitContext.fillStyle = coreShadow;
orbitContext.fillRect(0, 0, 1024, 1024);


        // Suavizar los bordes exteriores.
        orbitContext.globalCompositeOperation = "destination-in";

        const fade = orbitContext.createRadialGradient(
          512, 512, 300,
          512, 512, 510
        );

        fade.addColorStop(0, "rgba(255,255,255,1)");
fade.addColorStop(0.62, "rgba(255,255,255,1)");
fade.addColorStop(0.78, "rgba(255,255,255,0.65)");
fade.addColorStop(0.92, "rgba(255,255,255,0.18)");
fade.addColorStop(1, "rgba(255,255,255,0)");

        orbitContext.fillStyle = fade;
        orbitContext.fillRect(0, 0, 1024, 1024);

        orbitContext.globalCompositeOperation = "source-over";

        orbitPlaneTexture.needsUpdate = true;

        loadedTexture.dispose();

        console.info(
          "Textura del agujero negro cargada y recortada correctamente."
        );
      },
      undefined,
      (error) => {
        console.error("Error al cargar cosmo.png:", error);
      }
    );


orbitPlaneTexture.colorSpace = THREE.SRGBColorSpace;
orbitPlaneTexture.anisotropy =
  renderer.capabilities.getMaxAnisotropy();

const orbitPlaneGeometry = new THREE.CircleGeometry(0.975, 256);

const orbitPlaneMaterial = new THREE.MeshBasicMaterial({
  map: orbitPlaneTexture,
  color: 0xffffff,
  transparent: true,
  opacity: 0.42,
  blending: THREE.NormalBlending,
  side: THREE.DoubleSide,
  depthWrite: false,
  depthTest: true
  
});

const orbitPlane = new THREE.Mesh(
  orbitPlaneGeometry,
  orbitPlaneMaterial
);

// Mantener la misma inclinación y posición del anillo.
orbitPlane.rotation.x = -1.05;
orbitPlane.position.set(0, 0, -2.48);

universeGroup.add(orbitPlane);
// ==========================================
// ÓRBITAS INTERIORES DEL COSMOS
// ==========================================

const orbitDetails = [];

const orbitDetailConfigs = [
  { radius: 0.76, color: 0x9b6bff, opacity: 0.20 },
  { radius: 0.54, color: 0xc4a7ff, opacity: 0.15 },
  { radius: 0.32, color: 0xf4a7c5, opacity: 0.12 }
];

orbitDetailConfigs.forEach((config) => {
  const geometry = new THREE.RingGeometry(
    config.radius,
    config.radius + 0.003,
    256
  );

  const material = new THREE.MeshBasicMaterial({
    color: config.color,
    transparent: true,
    opacity: config.opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true
  });

  const ring = new THREE.Mesh(geometry, material);

  ring.rotation.x = -1.05;
  ring.position.set(0, 0, -2.47);

  universeGroup.add(ring);

 orbitDetails.push({
  ring,
  geometry,
  material
});
});
    // ==========================================
    // COLORES DE LOS PLANETAS
    // ==========================================

    const planetColors = [
      0xaaa0a5,
      0xe6b875,
      0x268bd2,
      0xc65f45,
      0xd1a17c,
      0xd9c18f,
      0x76dbe3,
      0x285fe0,
      0xb8a6a1,
      0xb879ed
    ];

    // ==========================================
    // TEXTURAS PROCEDURALES DE RESPALDO
    // ==========================================

    function createPlanetTexture(index) {
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = 1024;
      textureCanvas.height = 512;

      const ctx = textureCanvas.getContext("2d");
      const w = textureCanvas.width;
      const h = textureCanvas.height;

      const palettes = [
        ["#29262e", "#a6a1a5", "#625c65"],
        ["#8f6046", "#e7c18a", "#b98259"],
        ["#06366e", "#1476b8", "#42c8ec"],
        ["#5a211b", "#d56a48", "#f0a078"],
        ["#a76b42", "#e6c49a", "#f2dfc0"],
        ["#a18a62", "#ead7a8", "#c5ad7d"],
        ["#347f9a", "#a6e9ed", "#d0ffff"],
        ["#102b80", "#2369e8", "#67baff"],
        ["#62565c", "#c4b7ae", "#eee0d4"],
        ["#492276", "#bd73f4", "#f0c8ff"]
      ];

      const colors = palettes[index] || palettes[9];

      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, colors[1]);
      gradient.addColorStop(0.5, colors[0]);
      gradient.addColorStop(1, colors[2]);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      let seed = (index + 1) * 7919;

      function random() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      }

      // Bandas atmosféricas.
      if ([1, 4, 5, 6, 7, 9].includes(index)) {
        for (let i = 0; i < 42; i++) {
          const y = random() * h;
          const bandHeight = 2 + random() * (index === 4 ? 18 : 10);

          ctx.globalAlpha = 0.08 + random() * 0.23;
          ctx.fillStyle = random() > 0.5 ? colors[2] : colors[0];
          ctx.fillRect(0, y, w, bandHeight);
        }

        ctx.globalAlpha = 1;
      }

      // Continentes de la Tierra.
      if (index === 2) {
        for (let i = 0; i < 34; i++) {
          const x = random() * w;
          const y = 45 + random() * (h - 90);
          const rx = 12 + random() * 65;
          const ry = 8 + random() * 28;

          ctx.beginPath();

          ctx.ellipse(
            x, y, rx, ry,
            random() * Math.PI,
            0, Math.PI * 2
          );

          ctx.fillStyle = random() > 0.35
            ? "#53b86a"
            : "#b3bd70";

          ctx.globalAlpha = 0.65 + random() * 0.3;
          ctx.fill();
        }

        ctx.globalAlpha = 1;

        // Nubes procedurales de respaldo.
        for (let i = 0; i < 150; i++) {
          ctx.beginPath();

          ctx.ellipse(
            random() * w,
            random() * h,
            4 + random() * 25,
            1 + random() * 5,
            random() * 0.4,
            0, Math.PI * 2
          );

          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 0.08 + random() * 0.24;
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      // Cráteres de Mercurio, Marte y Plutón.
      if ([0, 3, 8].includes(index)) {
        const count = index === 0 ? 170 : 90;

        for (let i = 0; i < count; i++) {
          const x = random() * w;
          const y = random() * h;
          const radius = 2 + random() * (index === 0 ? 15 : 10);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);

          ctx.fillStyle = "#17151b";
          ctx.globalAlpha = 0.08 + random() * 0.22;
          ctx.fill();

          ctx.beginPath();

          ctx.arc(
            x - radius * 0.2,
            y - radius * 0.2,
            radius * 0.72,
            Math.PI,
            Math.PI * 2
          );

          ctx.strokeStyle = "#fff0d9";
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.22;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      // Tormentas de Júpiter.
      if (index === 4) {
        for (let i = 0; i < 9; i++) {
          const x = random() * w;
          const y = random() * h;

          ctx.beginPath();

          ctx.ellipse(
            x, y,
            20 + random() * 35,
            7 + random() * 13,
            0, 0, Math.PI * 2
          );

          ctx.fillStyle = i % 2 ? "#9b4934" : "#f0d0a1";
          ctx.globalAlpha = 0.65;
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      // Bruma del mundo violeta.
      if (index === 9) {
        for (let i = 0; i < 100; i++) {
          ctx.beginPath();

          ctx.arc(
            random() * w,
            random() * h,
            2 + random() * 13,
            0, Math.PI * 2
          );

          ctx.fillStyle = "#f9dfff";
          ctx.globalAlpha = 0.05 + random() * 0.18;
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy =
        renderer.capabilities.getMaxAnisotropy();
      texture.needsUpdate = true;

      return texture;
    }

    // ==========================================
    // CREACIÓN DE LOS DIEZ PLANETAS
    // ==========================================

    const planets = [];

    const planetButtons = [
      ...system.querySelectorAll(".universe-planet")
    ];

    if (planetButtons.length !== 10) {
      console.warn(
        `Universo 3D: se esperaban 10 planetas y se encontraron ${planetButtons.length}.`
      );

      renderer.dispose();
      canvas.dataset.initialized = "false";
      return;
    }

    const planetTexturePaths = [
      "assets/textures/mercury.jpg",
      "assets/textures/venu.jpg",
      "assets/textures/Tierra.jpg",
      "assets/textures/mars.jpg",
      "assets/textures/jupiter.jpg",
      "assets/textures/saturn.jpg",
      "assets/textures/uranus.jpg",
      "assets/textures/neptune.jpg",
      "assets/textures/pluton.jpg",
      null
    ];

    const rotationSpeeds = [
      0.0018,
      0.0012,
      0.0024,
      0.0015,
      0.0020,
      0.0011,
      0.0017,
      0.0022,
      0.0013,
      0.0019
    ];

    const inclinations = [
      0.02, -0.04, 0.06, -0.03, 0.05,
      -0.06, 0.03, -0.02, 0.04, -0.05
    ];

    planetButtons.forEach((button, index) => {
      const geometry = new THREE.SphereGeometry(1, 64, 64);

      const fallbackTexture = createPlanetTexture(index);

      const texture = planetTexturePaths[index]
        ? loadPlanetTexture(
            planetTexturePaths[index],
            fallbackTexture
          )
        : fallbackTexture;

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: planetColors[index] || 0xffffff,
        roughness: 0.88,
        metalness: 0.02
      });

      const mesh = new THREE.Mesh(geometry, material);

      // ==========================================
      // CAPA INDEPENDIENTE DE NUBES DE LA TIERRA
      // ==========================================

      let cloudMesh = null;
      let cloudTexture = null;

      if (index === 2) {
        cloudTexture = textureLoader.load(
          "assets/textures/nubes.jpg",
          (loadedTexture) => {
            loadedTexture.colorSpace = THREE.SRGBColorSpace;
            loadedTexture.anisotropy =
              renderer.capabilities.getMaxAnisotropy();
          },
          undefined,
          (error) => {
            console.warn("No se pudo cargar nubes.jpg", error);
          }
        );

        cloudTexture.colorSpace = THREE.SRGBColorSpace;

        const cloudGeometry = new THREE.SphereGeometry(
          1.018,
          64,
          64
        );

        const cloudMaterial = new THREE.MeshStandardMaterial({
          map: cloudTexture,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
          roughness: 1,
          metalness: 0
        });

        cloudMesh = new THREE.Mesh(
          cloudGeometry,
          cloudMaterial
        );

        mesh.add(cloudMesh);
      }

      mesh.rotation.set(
        Math.random() * 0.5,
        Math.random() * Math.PI,
        Math.random() * 0.3
      );

      universeGroup.add(mesh);

      
// ==========================================
// ANILLOS DE SATURNO
// ==========================================

let ring = null;
let ringTexture = null;
let ringColorTexture = null;

if (index === 5) {
  // Textura de color de los anillos.
  ringColorTexture = textureLoader.load(
    "assets/textures/anillos-saturno.png",
    (loadedTexture) => {
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      loadedTexture.anisotropy =
        renderer.capabilities.getMaxAnisotropy();
    },
    undefined,
    (error) => {
      console.warn("No se pudo cargar la textura de los anillos.", error);
    }
  );

  // Mapa de transparencia existente.
  ringTexture = textureLoader.load(
    "assets/textures/ring_alpha.png",
    undefined,
    undefined,
    (error) => {
      console.warn("No se pudo cargar ring_alpha.png", error);
    }
  );

  const ringGeometry = new THREE.RingGeometry(
    1.25,
    1.95,
    160
  );

  const ringMaterial = new THREE.MeshBasicMaterial({
    map: ringColorTexture,
    alphaMap: ringTexture,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.08,
    opacity: 0.95,
    depthWrite: false
  });

  ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI * 0.34;
  mesh.add(ring);
}


      // ==========================================
      // GUARDAR PLANETAS
      // ==========================================

      planets.push({
        mesh,
        button,
        index,
        rotationSpeed: rotationSpeeds[index] || 0.0015,
        inclination: inclinations[index] || 0,
        texture,
        ring,
        ringTexture,
        cloudMesh,
        cloudTexture,
        ringColorTexture
      });
    });

    // ==========================================
    // AJUSTE DEL TAMAÑO DE LA ESCENA
    // ==========================================

    function resize() {
      const width = Math.max(system.clientWidth, 1);
      const height = Math.max(system.clientHeight, 1);

      renderer.setSize(width, height, false);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(system);
    resize();

    const clock = new THREE.Clock();
    let animationFrameId;

    // ==========================================
    // CONTROLES DE ROTACIÓN DEL UNIVERSO
    // ==========================================

    let isDragging = false;

    let previousPointerX = 0;
    let previousPointerY = 0;

    let targetRotationX = 0;
    let targetRotationY = 0;

    // Iniciar el arrastre.
    system.addEventListener("pointerdown", (event) => {
      // No interferir con los botones de los planetas.
      if (event.target.closest(".universe-planet")) return;

      if (event.pointerType === "mouse" && event.button !== 0) return;

      isDragging = true;

      previousPointerX = event.clientX;
      previousPointerY = event.clientY;

      system.setPointerCapture(event.pointerId);
    });

    // Girar el universo mientras arrastramos.
    system.addEventListener("pointermove", (event) => {
      if (!isDragging) return;

      const deltaX = event.clientX - previousPointerX;
      const deltaY = event.clientY - previousPointerY;

      targetRotationY += deltaX * 0.006;
      targetRotationX += deltaY * 0.006;

      // Limitar la inclinación vertical.
      targetRotationX = THREE.MathUtils.clamp(
        targetRotationX,
        -0.8,
        0.8
      );

      previousPointerX = event.clientX;
      previousPointerY = event.clientY;
    });

    // Finalizar el arrastre.
    function stopUniverseDrag(event) {
      isDragging = false;

      if (system.hasPointerCapture(event.pointerId)) {
        system.releasePointerCapture(event.pointerId);
      }
    }

    system.addEventListener("pointerup", stopUniverseDrag);
    system.addEventListener("pointercancel", stopUniverseDrag);

    // ==========================================
    // ANIMACIÓN PRINCIPAL
    // ==========================================

   
function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  universePivot.rotation.x +=
    (targetRotationX - universePivot.rotation.x) * 0.08;

  universePivot.rotation.y +=
    (targetRotationY - universePivot.rotation.y) * 0.08;

  const width = system.clientWidth;
  const height = system.clientHeight;

  if (!width || !height) return;

  const visibleHeight =
    2 * Math.tan(
      THREE.MathUtils.degToRad(camera.fov / 2)
    ) * camera.position.z;

  const worldPerPixel = visibleHeight / height;

  // ==========================================
  // MOVIMIENTO DE LOS PLANETAS
  // ==========================================

  planets.forEach((planet) => {
    const button = planet.button;

    const orbitX = parseFloat(
      button.style.getPropertyValue("--orbit-x")
    ) || 0;

    const orbitY = parseFloat(
      button.style.getPropertyValue("--orbit-y")
    ) || 0;

    const orbitZ = parseFloat(
      button.style.getPropertyValue("--orbit-z")
    ) || 0;

    // POSICIÓN SOBRE EL PLANO ORBITAL INCLINADO

    const planeTilt = -1.05;
    const planeCenterZ = -2.48;

    const localX = orbitX * worldPerPixel;
    const localY = -orbitY * worldPerPixel;

    const buttonSize = button.getBoundingClientRect().width;

    const radius = Math.max(
      0.12,
      buttonSize * worldPerPixel * 0.5
    );

    const surfaceOffset = radius + 0.025;

    const planetX = localX;

    const planetY =
      localY * Math.cos(planeTilt) -
      Math.sin(planeTilt) * surfaceOffset;

    const planetZ =
      planeCenterZ +
      localY * Math.sin(planeTilt) +
      Math.cos(planeTilt) * surfaceOffset;

    planet.mesh.position.set(
      planetX,
      planetY,
      planetZ
    );

    planet.mesh.scale.setScalar(radius);

    // ROTACIÓN INDIVIDUAL DEL PLANETA

    planet.mesh.rotation.y +=
      planet.rotationSpeed * delta * 60;

    planet.mesh.rotation.x = planet.inclination;

    if (planet.cloudMesh) {
      planet.cloudMesh.rotation.y +=
        0.00035 * delta * 60;
    }

    // SINCRONIZAR BOTÓN CON PLANETA 3D

    const screenPosition = new THREE.Vector3();

    planet.mesh.getWorldPosition(screenPosition);
    screenPosition.project(camera);

    const screenX =
      (screenPosition.x * 0.5 + 0.5) * width;

    const screenY =
      (-screenPosition.y * 0.5 + 0.5) * height;

    button.style.left = `${screenX}px`;
    button.style.top = `${screenY}px`;
    button.style.transform = "translate(-50%, -50%)";

    planet.mesh.visible = button.isConnected;
  });

  // ==========================================
  // TAMAÑO DEL PLANO ORBITAL
  // ==========================================

  const orbitRadiusX = width * 0.36 * worldPerPixel;
  const orbitRadiusY = height * 0.42 * worldPerPixel;

  orbitalRing.scale.set(
    orbitRadiusX,
    orbitRadiusY,
    1
  );

  orbitPlane.scale.set(
    orbitRadiusX,
    orbitRadiusY,
    1
  );

  orbitDetails.forEach(({ ring }) => {
    ring.scale.set(orbitRadiusX, orbitRadiusY, 1);
  });

  // ==========================================
  // ROTACIÓN DEL SOL
  // ==========================================

  sun.rotation.y += 0.0018 * delta * 60;
  sun.rotation.x = Math.sin(elapsed * 0.2) * 0.025;

  // ==========================================
  // ANIMACIÓN AMBIENTAL
  // ==========================================

  // Movimiento de las nebulosas

  nebulas.forEach((nebula, index) => {
    nebula.rotation.z =
      Math.sin(elapsed * 0.08 + index) * 0.08;

    nebula.material.opacity =
      0.045 + Math.sin(elapsed * 0.4 + index) * 0.008;
  });

  // ==========================================
  // MOVIMIENTO Y BRILLO DE LAS ESTRELLAS
  // ==========================================

  const positions = starGeometry.attributes.position.array;

  for (let i = 0; i < starCount; i++) {
    const index = i * 3;

    const phase =
      elapsed * starSpeeds[i] + starPhases[i];

    positions[index] =
      baseStarPositions[index] +
      Math.sin(phase) * 0.035;

    positions[index + 1] =
      baseStarPositions[index + 1] +
      Math.cos(phase) * 0.035;
  }

  starGeometry.attributes.position.needsUpdate = true;

  // Parpadeo general
  starMaterial.opacity =
    0.85 + Math.sin(elapsed * 2) * 0.15;

  // Rotación lenta del campo estelar
  starField.rotation.z = elapsed * 0.001;

  // ==========================================
  // ESTRELLAS FUGACES
  // ==========================================

  shootingStars.forEach((star) => {
    const progress = ((elapsed + star.offset) % 8) / 8;
    const duration = 0.22;

    if (progress < duration) {
      const movement = progress / duration;

      star.object.visible = true;

      star.object.position.set(
        -22 + movement * 44,
        10 - movement * 18,
        -35
      );

      star.material.opacity =
        1 - movement;
    } else {
      star.object.visible = false;
      star.material.opacity = 0;
    }
  });

  // ==========================================
  // PULSACIÓN DEL HALO MÁGICO
  // ==========================================

  const haloPulse =
    1 + Math.sin(elapsed * 0.8) * 0.035;

  sunHalo.scale.set(
    6.2 * haloPulse,
    6.2 * haloPulse,
    1
  );

  sunHaloMaterial.opacity =
    0.24 + Math.sin(elapsed * 0.9) * 0.05;

  // ==========================================
  // RESPLANDOR SOLAR
  // ==========================================

  const pulse =
    1 + Math.sin(elapsed * 1.8) * 0.055;

  sunGlow.scale.set(
    4.2 * pulse,
    4.2 * pulse,
    1
  );

  sunLight.intensity =
    190 + Math.sin(elapsed * 2) * 12;

  // ==========================================
  // RENDERIZADO
  // ==========================================

  renderer.render(scene, camera);
}


    canvas.dataset.initialized = "true";
    animate();

    // ==========================================
    // LIMPIEZA DE RECURSOS
    // ==========================================

    canvas.universe3dCleanup = () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      // Liberar recursos de los planetas.
      planets.forEach(({
  mesh,
  texture,
  ring,
  ringTexture,
  ringColorTexture,
  cloudMesh,
  cloudTexture
}) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        texture.dispose();

        // Liberar recursos de las nubes.
        if (cloudMesh) {
          cloudMesh.geometry.dispose();
          cloudMesh.material.dispose();
        }

        if (cloudTexture) {
          cloudTexture.dispose();
        }

        // Liberar recursos de los anillos.
        if (ring) {
          ring.geometry.dispose();
          ring.material.dispose();
        }

        if (ringTexture) {
  ringTexture.dispose();
}

if (ringColorTexture) {
  ringColorTexture.dispose();
}
      });

      // Liberar recursos del Sol.
      sunGeometry.dispose();
      sunMaterial.dispose();
      sunTexture.dispose();
// Liberar recursos del núcleo oscuro.
blackHoleGeometry.dispose();
blackHoleMaterial.dispose();
      glowTexture.dispose();
      glowMaterial.dispose();
      sunHaloMaterial.dispose();
orbitGeometry.dispose();
orbitMaterial.dispose();
orbitPlaneGeometry.dispose();
orbitPlaneMaterial.dispose(); // Liberar recursos de las órbitas interiores.
orbitPlaneTexture.dispose();
orbitDetails.forEach(({ geometry, material }) => {
  geometry.dispose();
  material.dispose();
});
      // Liberar recursos de las nebulosas.
      nebulas.forEach((nebula) => {
        nebula.material.dispose();
      });

      nebulaTexture.dispose();

      // Liberar recursos del campo de estrellas.
starGeometry.dispose();
starMaterial.dispose();

// Liberar recursos de las estrellas fugaces.
shootingStars.forEach((star) => {
  star.object.geometry.dispose();
  star.material.dispose();
});
      // Liberar el renderizador.
      renderer.dispose();

      canvas.dataset.initialized = "false";
      delete canvas.universe3dCleanup;
    };

    console.info("Universo 3D inicializado correctamente.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUniverse3D, {
      once: true
    });
  } else {
    initUniverse3D();
  }
})();
