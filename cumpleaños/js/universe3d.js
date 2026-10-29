
(() => {
  "use strict";

  function initUniverse3D() {
    const canvas = document.getElementById("universe-3d");
    const system = document.querySelector("#universe .solar-system");

    if (!canvas || !system || !window.THREE) {
      console.warn("Universo 3D: falta el canvas, el sistema solar o Three.js.");
      return;
    }

    // Evita inicializar la escena más de una vez.
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

    // Iluminación general y luz central cálida.
    scene.add(new THREE.AmbientLight(0x9b8bc9, 1.8));

    const sunLight = new THREE.PointLight(0xffb56b, 160, 45, 1.5);
    sunLight.position.set(0, 0, 2);
    scene.add(sunLight);

    const fillLight = new THREE.PointLight(0x7565ff, 35, 35);
    fillLight.position.set(-5, 3, 4);
    scene.add(fillLight);

    // El sol 3D queda detrás de los planetas.
    const sunGeometry = new THREE.SphereGeometry(0.48, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffbd69
    });

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0);
    scene.add(sun);

    // Resplandor del sol.
    const glowMaterial = new THREE.SpriteMaterial({
      map: createGlowTexture(),
      color: 0xff9b55,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const sunGlow = new THREE.Sprite(glowMaterial);
    sunGlow.scale.set(2.8, 2.8, 1);
    sunGlow.position.set(0, 0, -0.1);
    scene.add(sunGlow);

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
          data[index + 3] = Math.round(Math.pow(alpha, 2.5) * 255);
        }
      }

      const texture = new THREE.DataTexture(
        data, size, size, THREE.RGBAFormat
      );

      texture.needsUpdate = true;
      return texture;
    }

    // Colores base de los diez mundos.
    
    // Colores base y texturas de los diez mundos.
    const planetColors = [
      0xaaa0a5, // Mercurio
      0xe6b875, // Venus
      0x268bd2, // Tierra
      0xc65f45, // Marte
      0xd1a17c, // Júpiter
      0xd9c18f, // Saturno
      0x76dbe3, // Urano
      0x285fe0, // Neptuno
      0xb8a6a1, // Plutón
      0xb879ed  // Mundo violeta
    ];

    // Genera mapas de superficie sin descargar imágenes externas.
    function createPlanetTexture(index) {
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = 1024;
      textureCanvas.height = 512;

      const ctx = textureCanvas.getContext("2d");
      const w = textureCanvas.width;
      const h = textureCanvas.height;

      const palettes = [
        ["#29262e", "#a6a1a5", "#625c65"], // Mercurio
        ["#8f6046", "#e7c18a", "#b98259"], // Venus
        ["#06366e", "#1476b8", "#42c8ec"], // Tierra
        ["#5a211b", "#d56a48", "#f0a078"], // Marte
        ["#a76b42", "#e6c49a", "#f2dfc0"], // Júpiter
        ["#a18a62", "#ead7a8", "#c5ad7d"], // Saturno
        ["#347f9a", "#a6e9ed", "#d0ffff"], // Urano
        ["#102b80", "#2369e8", "#67baff"], // Neptuno
        ["#62565c", "#c4b7ae", "#eee0d4"], // Plutón
        ["#492276", "#bd73f4", "#f0c8ff"]  // Mundo violeta
      ];

      const colors = palettes[index] || palettes[9];

      // Base con variaciones de luz y color.
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, colors[1]);
      gradient.addColorStop(0.5, colors[0]);
      gradient.addColorStop(1, colors[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Variaciones superficiales reproducibles.
      let seed = (index + 1) * 7919;
      function random() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      }

      // Bandas atmosféricas de gigantes gaseosos y mundos helados.
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

      // Continentes estilizados para la Tierra.
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
          ctx.fillStyle = random() > 0.35 ? "#53b86a" : "#b3bd70";
          ctx.globalAlpha = 0.65 + random() * 0.3;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Nubes blancas sobre los océanos y continentes.
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

      // Cráteres para Mercurio, Marte y Plutón.
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
            Math.PI, Math.PI * 2
          );
          ctx.strokeStyle = "#fff0d9";
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.22;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Tormentas y remolinos atmosféricos de Júpiter.
      if (index === 4) {
        for (let i = 0; i < 9; i++) {
          const x = random() * w;
          const y = random() * h;

          ctx.beginPath();
          ctx.ellipse(
            x, y, 20 + random() * 35, 7 + random() * 13,
            0, 0, Math.PI * 2
          );
          ctx.fillStyle = i % 2 ? "#9b4934" : "#f0d0a1";
          ctx.globalAlpha = 0.65;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Bruma luminosa para el planeta romántico violeta.
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

    const planets = [];

    const planetButtons = [
      ...system.querySelectorAll(".universe-planet")
    ];

    planetButtons.forEach((button, index) => {
      const geometry = new THREE.SphereGeometry(1, 96, 96);
      const texture = createPlanetTexture(index);

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
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
        const ringGeometry = new THREE.RingGeometry(1.25, 1.85, 128);

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
        phase: index * 0.63,
        speed: index % 2 === 0 ? 0.16 : -0.12,
        ring
      });
    });


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

   
function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  const width = system.clientWidth;
  const height = system.clientHeight;

  if (!width || !height) return;

  // Mantiene las esferas dentro de la misma zona
  // que utiliza el sistema solar HTML.
  const baseRadius = Math.min(width, height) * 0.50;

  // Conversión aproximada de píxeles CSS a unidades 3D.
  const visibleHeight =
    2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
    camera.position.z;

  const worldPerPixel = visibleHeight / height;

  planets.forEach((planet) => {
    const button = planet.button;

    // Lee las posiciones calculadas por interactions.js.
    const orbitX = parseFloat(
      button.style.getPropertyValue("--orbit-x")
    ) || 0;

    const orbitY = parseFloat(
      button.style.getPropertyValue("--orbit-y")
    ) || 0;

    planet.mesh.position.set(
      orbitX * worldPerPixel,
      -orbitY * worldPerPixel,
      0
    );

    // Giro suave y ligeramente distinto para cada planeta.
const direction = planet.index % 2 === 0 ? 1 : -1;
planet.mesh.rotation.y += 0.0025 * direction;
planet.mesh.rotation.x += 0.00025;


    // Escala proporcional al tamaño del botón.
    const buttonSize = button.getBoundingClientRect().width;
    const radius = Math.max(
      0.12,
      buttonSize * worldPerPixel * 0.5
    );

    planet.mesh.scale.setScalar(radius);

    // El planeta puede rotar, pero no cambia de órbita.
    planet.mesh.visible = button.isConnected;
  });

  sun.rotation.y += 0.001;

  renderer.render(scene, camera);
}


    animate();

    // Permite limpiar los recursos si se necesita reiniciar.
    canvas.universe3dCleanup = () => {
      resizeObserver.disconnect();
      renderer.dispose();

      planets.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });

      sunGeometry.dispose();
      sunMaterial.dispose();
      glowMaterial.map.dispose();
      glowMaterial.dispose();
    };

    console.info("Universo 3D inicializado.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUniverse3D, {
      once: true
    });
  } else {
    initUniverse3D();
  }
})();
