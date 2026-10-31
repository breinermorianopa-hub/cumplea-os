
(() => {
  "use strict";

  function initUniverse3D() {
    const canvas = document.getElementById("universe-3d");
    const system = document.querySelector("#universe .solar-system");

    if (!canvas || !system || !window.THREE) {
      console.warn("Universo 3D: falta el canvas, el sistema solar o Three.js.");
      return;
    }

    if (canvas.dataset.initialized === "true") return;
    canvas.dataset.initialized = "true";

    const THREE = window.THREE;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // ==========================================
    // ILUMINACIÓN
    // ==========================================

    const ambientLight = new THREE.AmbientLight(0x9b8bc9, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffb56b, 160, 45, 1.5);
    sunLight.position.set(0, 0, 2);
    scene.add(sunLight);

    const fillLight = new THREE.PointLight(0x7565ff, 35, 35);
    fillLight.position.set(-5, 3, 4);
    scene.add(fillLight);

    const pinkLight = new THREE.PointLight(0xff8fcf, 18, 30);
    pinkLight.position.set(6, -5, -3);
    scene.add(pinkLight);

    // ==========================================
    // TEXTURA DEL SOL
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
          x, y, radiusX, radiusY,
          Math.random() * Math.PI,
          0, Math.PI * 2
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
    // CREACIÓN DEL SOL
    // ==========================================

    const sunTexture = createSunTexture();

    const sunGeometry = new THREE.SphereGeometry(0.72, 96, 96);

    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTexture,
      color: 0xffffff
    });

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0);
    scene.add(sun);

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
    sunGlow.position.set(0, 0, -0.1);
    scene.add(sunGlow);

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
    // TEXTURAS PROCEDURALES DE LOS PLANETAS
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

        // Nubes.
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
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
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
      const geometry = new THREE.SphereGeometry(1, 96, 96);
      const texture = createPlanetTexture(index);

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: planetColors[index] || 0xffffff,
        roughness: 0.88,
        metalness: 0.02
      });

      const mesh = new THREE.Mesh(geometry, material);

      mesh.rotation.set(
        Math.random() * 0.5,
        Math.random() * Math.PI,
        Math.random() * 0.3
      );

      scene.add(mesh);

      // Anillos de Saturno.
      let ring = null;

      if (index === 5) {
        const ringGeometry = new THREE.RingGeometry(
          1.25,
          1.85,
          128
        );

        const ringMaterial = new THREE.MeshStandardMaterial({
          color: 0xe2d0ad,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88,
          roughness: 0.92
        });

        ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI * 0.34;
        mesh.add(ring);
      }

      planets.push({
        mesh,
        button,
        index,
        rotationSpeed: rotationSpeeds[index] || 0.0015,
        inclination: inclinations[index] || 0,
        texture,
        ring
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

    // ==========================================
    // ANIMACIÓN PRINCIPAL
    // ==========================================

    function animate() {
      requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      const width = system.clientWidth;
      const height = system.clientHeight;

      if (!width || !height) return;

      const visibleHeight =
        2 * Math.tan(
          THREE.MathUtils.degToRad(camera.fov / 2)
        ) * camera.position.z;

      const worldPerPixel = visibleHeight / height;

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

        // Posición tridimensional.
        planet.mesh.position.set(
          orbitX * worldPerPixel,
          -orbitY * worldPerPixel,
          orbitZ * worldPerPixel
        );

        // Rotación individual.
        planet.mesh.rotation.y +=
          planet.rotationSpeed * delta * 60;

        planet.mesh.rotation.x = planet.inclination;

        // Tamaño proporcional al botón.
        const buttonSize = button.getBoundingClientRect().width;

        const radius = Math.max(
          0.12,
          buttonSize * worldPerPixel * 0.5
        );

        planet.mesh.scale.setScalar(radius);

        planet.mesh.visible = button.isConnected;
      });

      // Rotación del sol.
      sun.rotation.y += 0.0018 * delta * 60;
      sun.rotation.x = Math.sin(elapsed * 0.2) * 0.025;

      // Pulsación del resplandor.
      const pulse = 1 + Math.sin(elapsed * 1.8) * 0.055;

      sunGlow.scale.set(
        4.2 * pulse,
        4.2 * pulse,
        1
      );

      // Variación suave de la luz.
      sunLight.intensity =
        160 + Math.sin(elapsed * 2) * 12;

      renderer.render(scene, camera);
    }

    animate();

    // ==========================================
    // LIMPIEZA DE RECURSOS
    // ==========================================

    canvas.universe3dCleanup = () => {
      resizeObserver.disconnect();
      renderer.dispose();

      planets.forEach(({ mesh, texture, ring }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        texture.dispose();

        if (ring) {
          ring.geometry.dispose();
          ring.material.dispose();
        }
      });

      sunGeometry.dispose();
      sunMaterial.dispose();
      sunTexture.dispose();
      glowTexture.dispose();
      glowMaterial.dispose();
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
