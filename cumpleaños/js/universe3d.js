
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

    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

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
  opacity: 0.018,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  depthTest: false
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

scene.add(sprite);
nebulas.push(sprite);
    });

    // ==========================================
    // CAMPO DE ESTRELLAS
    // ==========================================

    const starCount = 900;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] =
        (Math.random() - 0.5) * 28;

      starPositions[i * 3 + 1] =
        (Math.random() - 0.5) * 20;

      starPositions[i * 3 + 2] =
        -2 - Math.random() * 12;
    }

    const starGeometry = new THREE.BufferGeometry();

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      color: 0xf3ddff,
      size: 0.055,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const starField = new THREE.Points(
      starGeometry,
      starMaterial
    );

    scene.add(starField);

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
    sunGlow.position.set(0, 0, -2.58);
    
    universeGroup.add(sunGlow);
sunGlow.visible = true;
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
sunHalo.position.set(0, 0, -2.58);
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

const orbitPlaneTexture = createOrbitPlaneTexture();

const orbitPlaneGeometry = new THREE.CircleGeometry(0.975, 256);

const orbitPlaneMaterial = new THREE.MeshBasicMaterial({
  map: orbitPlaneTexture,
  color: 0xffffff,
  transparent: true,
  opacity: 0.32,
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

      if (index === 5) {
        ringTexture = textureLoader.load(
          "assets/textures/ring_alpha.png",
          (loadedTexture) => {
            loadedTexture.colorSpace = THREE.SRGBColorSpace;
            loadedTexture.anisotropy =
              renderer.capabilities.getMaxAnisotropy();
          },
          undefined,
          (error) => {
            console.warn("No se pudo cargar ring_alpha.png", error);
          }
        );

        ringTexture.colorSpace = THREE.SRGBColorSpace;

        const ringGeometry = new THREE.RingGeometry(
          1.25,
          1.95,
          160
        );

        const ringMaterial = new THREE.MeshStandardMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          alphaTest: 0.08,
          opacity: 0.95,
          roughness: 0.9,
          metalness: 0,
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
        cloudTexture
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

      // Aplicar suavemente la rotación del universo.
      universeGroup.rotation.x +=
        (targetRotationX - universeGroup.rotation.x) * 0.08;

      universeGroup.rotation.y +=
        (targetRotationY - universeGroup.rotation.y) * 0.08;

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

// ==========================================
// POSICIÓN SOBRE EL PLANO ORBITAL INCLINADO
// ==========================================

const planeTilt = -1.05;
const planeCenterZ = -2.48;

// Coordenadas originales de la órbita.
const localX = orbitX * worldPerPixel;
const localY = -orbitY * worldPerPixel;

// Calcular primero el tamaño del planeta.
const buttonSize = button.getBoundingClientRect().width;

const radius = Math.max(
  0.12,
  buttonSize * worldPerPixel * 0.5
);

// Elevación perpendicular según el tamaño.
const surfaceOffset = radius + 0.025;

// Transformar la posición al plano inclinado.
const planetX = localX;

const planetY =
  localY * Math.cos(planeTilt) -
  Math.sin(planeTilt) * surfaceOffset;

const planetZ =
  planeCenterZ +
  localY * Math.sin(planeTilt) +
  Math.cos(planeTilt) * surfaceOffset;

// Aplicar posición y tamaño.
planet.mesh.position.set(
  planetX,
  planetY,
  planetZ
);

planet.mesh.scale.setScalar(radius);       
 // ==========================================
        // ROTACIÓN INDIVIDUAL DEL PLANETA
        // ==========================================

        planet.mesh.rotation.y +=
          planet.rotationSpeed * delta * 60;

        planet.mesh.rotation.x = planet.inclination;

        // Rotación independiente de las nubes terrestres.
        if (planet.cloudMesh) {
          planet.cloudMesh.rotation.y +=
            0.00035 * delta * 60;
        }

       
        // ==========================================
        // SINCRONIZAR EL BOTÓN CON EL PLANETA 3D
        // ==========================================

        const screenPosition = new THREE.Vector3();

        planet.mesh.getWorldPosition(screenPosition);
        screenPosition.project(camera);

        // Convertir la posición 3D a coordenadas de pantalla.
        const screenX =
          (screenPosition.x * 0.5 + 0.5) * width;

        const screenY =
          (-screenPosition.y * 0.5 + 0.5) * height;

        // Posicionar el botón HTML exactamente sobre el planeta.
        button.style.left = `${screenX}px`;
        button.style.top = `${screenY}px`;

        // Mantener el botón centrado sobre su planeta.
        button.style.transform = "translate(-50%, -50%)";

        planet.mesh.visible = button.isConnected;
      }); // CORRECCIÓN: aquí se cierra planets.forEach().
      // ==========================================

// ==========================================
// TAMAÑO DEL PLANO ORBITAL
// ==========================================

const orbitRadiusX = width * 0.36 * worldPerPixel;
const orbitRadiusY = height * 0.42 * worldPerPixel;

// El anillo permanece centrado alrededor del Sol.
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
      // ANIMACIÓN AMBIENTAL DEL UNIVERSO
      // ==========================================

      // Movimiento sutil de las nebulosas.
      nebulas.forEach((nebula, index) => {
        nebula.rotation.z =
          Math.sin(elapsed * 0.08 + index) * 0.08;

        nebula.material.opacity =
          0.055 + Math.sin(elapsed * 0.4 + index) * 0.012;
      });

      // Brillo respirante de las estrellas.
      starMaterial.opacity =
        0.75 + Math.sin(elapsed * 0.8) * 0.1;

      starField.rotation.z = elapsed * 0.001;

      // Pulsación lenta del halo mágico.
      const haloPulse =
        1 + Math.sin(elapsed * 0.8) * 0.035;

      sunHalo.scale.set(
        6.2 * haloPulse,
        6.2 * haloPulse,
        1
      );

      sunHaloMaterial.opacity =
        0.24 + Math.sin(elapsed * 0.9) * 0.05;

      // Pulsación del resplandor solar.
      const pulse =
        1 + Math.sin(elapsed * 1.8) * 0.055;

      sunGlow.scale.set(
        4.2 * pulse,
        4.2 * pulse,
        1
      );

      // Variación suave de la luz solar.
      sunLight.intensity =
        190 + Math.sin(elapsed * 2) * 12;

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
      });

      // Liberar recursos del Sol.
      sunGeometry.dispose();
      sunMaterial.dispose();
      sunTexture.dispose();

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
