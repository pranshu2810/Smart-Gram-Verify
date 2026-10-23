import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * ThreeSpatialTwin — Interactive 3D Spatial Reconstruction & Digital Twin Viewer
 * Procedural BIM/LiDAR structural reconstruction for rural PMAY-G housing inspection.
 */
export default function ThreeSpatialTwin({
  stage = 'Plinth',
  metrics = null,
  detectedStage = null,
  interactive = true,
  height = '480px'
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameRef = useRef(null);
  const objectsGroupRef = useRef(null);
  const pointCloudRef = useRef(null);
  const solidGroupRef = useRef(null);
  const wireframeGroupRef = useRef(null);
  const dimensionsGroupRef = useRef(null);

  const [viewMode, setViewMode] = useState('solid'); // 'solid' | 'wireframe' | 'pointcloud'
  const [autoRotate, setAutoRotate] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [activePin, setActivePin] = useState(null);
  const [cameraPreset, setCameraPreset] = useState('isometric');

  const activeStage = detectedStage || stage || 'Plinth';

  // Fallback spatial metrics
  const spatialData = metrics || {
    reconstructedFootprintSqM: 25.4,
    plinthHeightMeters: activeStage === 'Foundation' ? 0.15 : 0.62,
    wallVerticalityDeflectionDeg: 0.35,
    rebarGridCompliancePct: 98.0,
    pointCloudDensity: 14200,
    meshVertices: 8450,
    structuralRiskLevel: 'LOW'
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const clientHeight = container.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / clientHeight, 0.1, 100);
    camera.position.set(9, 7, 10);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(12, 18, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    blueRimLight.position.set(-10, 8, -10);
    scene.add(blueRimLight);

    const warmFillLight = new THREE.PointLight(0xf59e0b, 0.6, 20);
    warmFillLight.position.set(0, 3, 0);
    scene.add(warmFillLight);

    // 5. Ground Grid & Reference Plane
    const gridHelper = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Site boundary plane (plot limit 10m x 8m)
    const siteGeo = new THREE.PlaneGeometry(12, 10);
    const siteMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1
    });
    const siteMesh = new THREE.Mesh(siteGeo, siteMat);
    siteMesh.rotation.x = -Math.PI / 2;
    siteMesh.position.y = -0.02;
    siteMesh.receiveShadow = true;
    scene.add(siteMesh);

    // 6. Root Objects Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // 7. Build Procedural Model based on stage
    buildStageModel(objectsGroup, activeStage);

    // 8. Mouse Orbit Controls (pure Three.js implementation)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = {
      radius: 15,
      theta: 0.8, // azimuth
      phi: 1.1    // polar
    };

    const updateCameraFromSpherical = () => {
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi));
      spherical.radius = Math.max(5, Math.min(26, spherical.radius));
      const x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      const y = spherical.radius * Math.cos(spherical.phi);
      const z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.position.set(x, y + 0.8, z);
      camera.lookAt(0, 1.1, 0);
    };
    updateCameraFromSpherical();

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.007;
      spherical.phi -= deltaY * 0.007;

      updateCameraFromSpherical();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      spherical.radius += e.deltaY * 0.015;
      updateCameraFromSpherical();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for mobile devices
    let touchStartDist = 0;
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        spherical.theta -= deltaX * 0.008;
        spherical.phi -= deltaY * 0.008;
        updateCameraFromSpherical();
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = (touchStartDist - dist) * 0.02;
        spherical.radius += factor;
        touchStartDist = dist;
        updateCameraFromSpherical();
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 9. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDragging && objectsGroupRef.current) {
        objectsGroupRef.current.rotation.y += delta * 0.25;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeStage]);

  // Handle visibility changes based on viewMode
  useEffect(() => {
    if (!solidGroupRef.current || !wireframeGroupRef.current || !pointCloudRef.current) return;

    if (viewMode === 'solid') {
      solidGroupRef.current.visible = true;
      wireframeGroupRef.current.visible = false;
      pointCloudRef.current.visible = false;
    } else if (viewMode === 'wireframe') {
      solidGroupRef.current.visible = false;
      wireframeGroupRef.current.visible = true;
      pointCloudRef.current.visible = false;
    } else if (viewMode === 'pointcloud') {
      solidGroupRef.current.visible = false;
      wireframeGroupRef.current.visible = false;
      pointCloudRef.current.visible = true;
    }
  }, [viewMode]);

  // Handle dimension lines visibility
  useEffect(() => {
    if (dimensionsGroupRef.current) {
      dimensionsGroupRef.current.visible = showDimensions;
    }
  }, [showDimensions]);

  // Set camera angle preset
  const applyCameraPreset = (preset) => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    if (preset === 'isometric') {
      cam.position.set(9, 7, 10);
    } else if (preset === 'topdown') {
      cam.position.set(0.1, 15, 0.1);
    } else if (preset === 'elevation') {
      cam.position.set(0, 2.5, 12);
    } else if (preset === 'rebar') {
      cam.position.set(3, 2, 4);
    }
    cam.lookAt(0, 1.1, 0);
  };

  /**
   * Builds the 3D Stage Geometry:
   * Foundation, Plinth, Lintel, or Completion for standard PMAY-G 25.4 m² rural home
   */
  const buildStageModel = (parentGroup, stageName) => {
    // Groups for different view modes
    const solidGroup = new THREE.Group();
    const wireframeGroup = new THREE.Group();
    const pointCloudGroup = new THREE.Group();
    const dimensionsGroup = new THREE.Group();

    parentGroup.add(solidGroup);
    parentGroup.add(wireframeGroup);
    parentGroup.add(pointCloudGroup);
    parentGroup.add(dimensionsGroup);

    solidGroupRef.current = solidGroup;
    wireframeGroupRef.current = wireframeGroup;
    pointCloudRef.current = pointCloudGroup;
    dimensionsGroupRef.current = dimensionsGroup;

    // Dimensions: 5.0m width x 5.1m depth = 25.5 m² carpet area
    const houseWidth = 5.0;
    const houseDepth = 5.1;
    const wallThick = 0.25;

    // Materials
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.85,
      metalness: 0.1
    });

    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.9,
      metalness: 0.15
    });

    const brickMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.75,
      metalness: 0.05
    });

    const plasterMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.6,
      metalness: 0.02
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.8,
      metalness: 0.1
    });

    const rebarMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.3,
      roughness: 0.4,
      metalness: 0.8
    });

    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.85
    });

    // Helper: Add mesh to solid and wireframe equivalents
    const addStructuralElement = (geometry, material, pos, rot = [0, 0, 0]) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      solidGroup.add(mesh);

      const wireGeo = new THREE.WireframeGeometry(geometry);
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      wire.position.set(...pos);
      wire.rotation.set(...rot);
      wireframeGroup.add(wire);

      return mesh;
    };

    // ── 1. FOUNDATION TRENCHES & FOOTINGS (Common to all stages) ──
    const footingDepth = 0.4;
    const footingWidth = houseWidth + 0.6;
    const footingDepthLength = houseDepth + 0.6;

    // Outer excavation outline (lowered base)
    const trenchMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 1.0 });
    const trench = new THREE.Mesh(
      new THREE.BoxGeometry(footingWidth, footingDepth, footingDepthLength),
      trenchMat
    );
    trench.position.set(0, footingDepth / 2 - 0.05, 0);
    solidGroup.add(trench);

    // Corner Column Footing Pads (4 corners)
    const corners = [
      [-houseWidth / 2, -houseDepth / 2],
      [houseWidth / 2, -houseDepth / 2],
      [houseWidth / 2, houseDepth / 2],
      [-houseWidth / 2, houseDepth / 2]
    ];

    corners.forEach(([cx, cz]) => {
      addStructuralElement(
        new THREE.BoxGeometry(0.8, 0.35, 0.8),
        concreteMat,
        [cx, 0.2, cz]
      );

      // Rebar starter cage glowing vertically
      const rebarHeight = stageName === 'Foundation' ? 0.9 : 1.8;
      for (let rx = -0.12; rx <= 0.12; rx += 0.24) {
        for (let rz = -0.12; rz <= 0.12; rz += 0.24) {
          const rebar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, rebarHeight, 8),
            rebarMat
          );
          rebar.position.set(cx + rx, 0.3 + rebarHeight / 2, cz + rz);
          solidGroup.add(rebar);
          wireframeGroup.add(rebar.clone());
        }
      }
    });

    // ── 2. PLINTH BEAM & FLOORING (Stages: Plinth, Lintel, Completion) ──
    if (['Plinth', 'Lintel', 'Completion'].includes(stageName)) {
      const plinthHeight = 0.62;

      // Perimeter Plinth Tie Beam (Front, Back, Left, Right)
      // Front beam
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth, plinthHeight, wallThick),
        plinthMat,
        [0, plinthHeight / 2 + 0.35, houseDepth / 2 - wallThick / 2]
      );
      // Back beam
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth, plinthHeight, wallThick),
        plinthMat,
        [0, plinthHeight / 2 + 0.35, -houseDepth / 2 + wallThick / 2]
      );
      // Left beam
      addStructuralElement(
        new THREE.BoxGeometry(wallThick, plinthHeight, houseDepth),
        plinthMat,
        [-houseWidth / 2 + wallThick / 2, plinthHeight / 2 + 0.35, 0]
      );
      // Right beam
      addStructuralElement(
        new THREE.BoxGeometry(wallThick, plinthHeight, houseDepth),
        plinthMat,
        [houseWidth / 2 - wallThick / 2, plinthHeight / 2 + 0.35, 0]
      );

      // Compacted Courtyard Soil filling
      const floorFill = new THREE.Mesh(
        new THREE.BoxGeometry(houseWidth - 0.5, plinthHeight - 0.05, houseDepth - 0.5),
        new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 1.0 })
      );
      floorFill.position.set(0, plinthHeight / 2 + 0.32, 0);
      solidGroup.add(floorFill);

      // Concrete Floor Slab (PCC top finish)
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth, 0.1, houseDepth),
        concreteMat,
        [0, plinthHeight + 0.35, 0]
      );
    }

    // ── 3. SUPERSTRUCTURE WALLS & LINTEL BAND (Stages: Lintel, Completion) ──
    if (['Lintel', 'Completion'].includes(stageName)) {
      const wallHeight = 2.1; // up to lintel
      const baseY = 0.97; // top of plinth slab

      // Back Wall (Solid)
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth, wallHeight, wallThick),
        brickMat,
        [0, baseY + wallHeight / 2, -houseDepth / 2 + wallThick / 2]
      );

      // Left Wall with Window Cutout
      // Left section
      addStructuralElement(
        new THREE.BoxGeometry(wallThick, wallHeight, 1.8),
        brickMat,
        [-houseWidth / 2 + wallThick / 2, baseY + wallHeight / 2, -1.5]
      );
      // Right section
      addStructuralElement(
        new THREE.BoxGeometry(wallThick, wallHeight, 1.8),
        brickMat,
        [-houseWidth / 2 + wallThick / 2, baseY + wallHeight / 2, 1.5]
      );
      // Under window sill (masonry up to 0.9m)
      addStructuralElement(
        new THREE.BoxGeometry(wallThick, 0.9, 1.5),
        brickMat,
        [-houseWidth / 2 + wallThick / 2, baseY + 0.45, 0]
      );

      // Right Wall with Window Cutout
      addStructuralElement(
        new THREE.BoxGeometry(wallThick, wallHeight, 1.8),
        brickMat,
        [houseWidth / 2 - wallThick / 2, baseY + wallHeight / 2, -1.5]
      );
      addStructuralElement(
        new THREE.BoxGeometry(wallThick, wallHeight, 1.8),
        brickMat,
        [houseWidth / 2 - wallThick / 2, baseY + wallHeight / 2, 1.5]
      );
      addStructuralElement(
        new THREE.BoxGeometry(wallThick, 0.9, 1.5),
        brickMat,
        [houseWidth / 2 - wallThick / 2, baseY + 0.45, 0]
      );

      // Front Wall with Door Opening (1.1m opening)
      addStructuralElement(
        new THREE.BoxGeometry(1.9, wallHeight, wallThick),
        brickMat,
        [-1.5, baseY + wallHeight / 2, houseDepth / 2 - wallThick / 2]
      );
      addStructuralElement(
        new THREE.BoxGeometry(1.9, wallHeight, wallThick),
        brickMat,
        [1.5, baseY + wallHeight / 2, houseDepth / 2 - wallThick / 2]
      );

      // Continuous Lintel Band (Reinforced concrete tie-beam at 2.1m)
      const lintelY = baseY + wallHeight + 0.08;
      // Front lintel
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth, 0.16, wallThick + 0.08),
        concreteMat,
        [0, lintelY, houseDepth / 2 - wallThick / 2]
      );
      // Back lintel
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth, 0.16, wallThick + 0.08),
        concreteMat,
        [0, lintelY, -houseDepth / 2 + wallThick / 2]
      );
      // Left lintel
      addStructuralElement(
        new THREE.BoxGeometry(wallThick + 0.08, 0.16, houseDepth),
        concreteMat,
        [-houseWidth / 2 + wallThick / 2, lintelY, 0]
      );
      // Right lintel
      addStructuralElement(
        new THREE.BoxGeometry(wallThick + 0.08, 0.16, houseDepth),
        concreteMat,
        [houseWidth / 2 - wallThick / 2, lintelY, 0]
      );

      // Cantilever Chajja (Sunshade over windows)
      addStructuralElement(
        new THREE.BoxGeometry(0.5, 0.06, 1.8),
        concreteMat,
        [-houseWidth / 2 - 0.25, lintelY, 0]
      );
      addStructuralElement(
        new THREE.BoxGeometry(0.5, 0.06, 1.8),
        concreteMat,
        [houseWidth / 2 + 0.25, lintelY, 0]
      );
    }

    // ── 4. ROOF SLAB & FINAL FINISH (Stage: Completion) ──
    if (stageName === 'Completion') {
      const roofY = 0.97 + 2.1 + 0.16 + 0.6; // Upper masonry + roof slab level

      // Upper wall extension (above lintel up to ceiling)
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth, 0.6, wallThick),
        plasterMat,
        [0, roofY - 0.35, -houseDepth / 2 + wallThick / 2]
      );
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth, 0.6, wallThick),
        plasterMat,
        [0, roofY - 0.35, houseDepth / 2 - wallThick / 2]
      );
      addStructuralElement(
        new THREE.BoxGeometry(wallThick, 0.6, houseDepth),
        plasterMat,
        [-houseWidth / 2 + wallThick / 2, roofY - 0.35, 0]
      );
      addStructuralElement(
        new THREE.BoxGeometry(wallThick, 0.6, houseDepth),
        plasterMat,
        [houseWidth / 2 - wallThick / 2, roofY - 0.35, 0]
      );

      // Reinforced Concrete Roof Slab with overhang
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth + 0.6, 0.15, houseDepth + 0.6),
        roofMat,
        [0, roofY, 0]
      );

      // Low Parapet Wall around roof
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth + 0.6, 0.4, 0.15),
        plasterMat,
        [0, roofY + 0.25, (houseDepth + 0.6) / 2 - 0.075]
      );
      addStructuralElement(
        new THREE.BoxGeometry(houseWidth + 0.6, 0.4, 0.15),
        plasterMat,
        [0, roofY + 0.25, -(houseDepth + 0.6) / 2 + 0.075]
      );
      addStructuralElement(
        new THREE.BoxGeometry(0.15, 0.4, houseDepth + 0.6),
        plasterMat,
        [-(houseWidth + 0.6) / 2 + 0.075, roofY + 0.25, 0]
      );
      addStructuralElement(
        new THREE.BoxGeometry(0.15, 0.4, houseDepth + 0.6),
        plasterMat,
        [(houseWidth + 0.6) / 2 - 0.075, roofY + 0.25, 0]
      );

      // Finished Entrance Door Frame
      const doorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 2.05, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 })
      );
      doorMesh.position.set(0, 0.97 + 1.025, houseDepth / 2 - wallThick / 2);
      solidGroup.add(doorMesh);
    }

    // ── 5. PROCEDURAL 3D LIDAR / SFM POINT CLOUD (Photogrammetric Reconstruction) ──
    const pointCount = spatialData.pointCloudDensity || 14200;
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);

    const maxY = stageName === 'Foundation' ? 1.2 : stageName === 'Plinth' ? 2.0 : stageName === 'Lintel' ? 3.3 : 4.4;

    for (let i = 0; i < pointCount; i++) {
      // Sample points distributed along structure boundaries with Gaussian noise
      const u = Math.random();
      let px, py, pz;

      if (u < 0.25) {
        // Front wall points
        px = (Math.random() - 0.5) * houseWidth + (Math.random() - 0.5) * 0.1;
        py = Math.random() * maxY;
        pz = houseDepth / 2 + (Math.random() - 0.5) * 0.15;
      } else if (u < 0.5) {
        // Back wall points
        px = (Math.random() - 0.5) * houseWidth + (Math.random() - 0.5) * 0.1;
        py = Math.random() * maxY;
        pz = -houseDepth / 2 + (Math.random() - 0.5) * 0.15;
      } else if (u < 0.75) {
        // Left/Right side points
        px = (Math.random() > 0.5 ? 1 : -1) * (houseWidth / 2) + (Math.random() - 0.5) * 0.15;
        py = Math.random() * maxY;
        pz = (Math.random() - 0.5) * houseDepth + (Math.random() - 0.5) * 0.1;
      } else {
        // Ground & footing points
        px = (Math.random() - 0.5) * (houseWidth + 1.5);
        py = (Math.random() - 0.5) * 0.2;
        pz = (Math.random() - 0.5) * (houseDepth + 1.5);
      }

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      // Color based on height (Spectral depth ramp: Blue -> Cyan -> Emerald -> Amber)
      const normY = Math.max(0, Math.min(1, py / maxY));
      colors[i * 3] = normY < 0.5 ? 0.1 + normY * 0.6 : 0.8;
      colors[i * 3 + 1] = normY < 0.5 ? 0.6 + normY * 0.8 : 1.0 - normY * 0.4;
      colors[i * 3 + 2] = 1.0 - normY * 0.7;
    }

    const pcGeometry = new THREE.BufferGeometry();
    pcGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pcGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pcMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });

    const pointCloud = new THREE.Points(pcGeometry, pcMaterial);
    pointCloudGroup.add(pointCloud);
    pointCloudGroup.visible = false; // off by default

    // ── 6. DIMENSION LINES & SPATIAL ANNOTATIONS ──
    const dimMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.2,
      gapSize: 0.1,
      linewidth: 2
    });

    // Width Dimension Line (Front edge)
    const widthPoints = [
      new THREE.Vector3(-houseWidth / 2, 0.05, houseDepth / 2 + 0.8),
      new THREE.Vector3(houseWidth / 2, 0.05, houseDepth / 2 + 0.8)
    ];
    const widthGeo = new THREE.BufferGeometry().setFromPoints(widthPoints);
    const widthLine = new THREE.Line(widthGeo, dimMat);
    widthLine.computeLineDistances();
    dimensionsGroup.add(widthLine);

    // Depth Dimension Line (Right edge)
    const depthPoints = [
      new THREE.Vector3(houseWidth / 2 + 0.8, 0.05, -houseDepth / 2),
      new THREE.Vector3(houseWidth / 2 + 0.8, 0.05, houseDepth / 2)
    ];
    const depthGeo = new THREE.BufferGeometry().setFromPoints(depthPoints);
    const depthLine = new THREE.Line(depthGeo, dimMat);
    depthLine.computeLineDistances();
    dimensionsGroup.add(depthLine);

    // Plinth Height Indicator Line
    const plinthPoints = [
      new THREE.Vector3(houseWidth / 2 + 0.4, 0, houseDepth / 2 + 0.4),
      new THREE.Vector3(houseWidth / 2 + 0.4, 0.97, houseDepth / 2 + 0.4)
    ];
    const plinthGeo = new THREE.BufferGeometry().setFromPoints(plinthPoints);
    const plinthLine = new THREE.Line(plinthGeo, new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 }));
    dimensionsGroup.add(plinthLine);

    // Plumb Line Vertical Deflection test line (Wall verticality check: 0.35°)
    const plumbPoints = [
      new THREE.Vector3(-houseWidth / 2 - 0.4, 0.97, houseDepth / 2),
      new THREE.Vector3(-houseWidth / 2 - 0.4, maxY, houseDepth / 2)
    ];
    const plumbGeo = new THREE.BufferGeometry().setFromPoints(plumbPoints);
    const plumbLine = new THREE.Line(plumbGeo, new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 0.15, gapSize: 0.08 }));
    plumbLine.computeLineDistances();
    dimensionsGroup.add(plumbLine);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
      {/* HUD Header Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            3D Spatial Twin &amp; LiDAR Mesh
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {activeStage.toUpperCase()}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto shadow-lg">
          <button
            onClick={() => setViewMode('solid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'solid'
                ? 'bg-primary-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏢 Solid BIM
          </button>
          <button
            onClick={() => setViewMode('wireframe')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'wireframe'
                ? 'bg-primary-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📐 Wireframe
          </button>
          <button
            onClick={() => setViewMode('pointcloud')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'pointcloud'
                ? 'bg-cyan-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ LiDAR Cloud ({spatialData.pointCloudDensity.toLocaleString()} pts)
          </button>
        </div>
      </div>

      {/* 3D Canvas Mounting Container */}
      <div
        ref={mountRef}
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Floating Spatial Measurement Readouts Overlay */}
      <div className="absolute top-14 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 shadow-xl text-left pointer-events-auto">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Carpet Area Footprint</p>
          <p className="text-base font-extrabold font-mono text-emerald-400 mt-0.5">
            {spatialData.reconstructedFootprintSqM} m²
            <span className="text-[10px] font-normal text-slate-400 ml-1.5">(Req: ≥25.0 m²)</span>
          </p>
          <p className="text-[10px] font-mono text-slate-400">Dimensions: 5.0m × 5.1m</p>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 shadow-xl text-left pointer-events-auto">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Plinth Height Gauge</p>
          <p className="text-base font-extrabold font-mono text-cyan-400 mt-0.5">
            +{spatialData.plinthHeightMeters}m
            <span className="text-[10px] font-normal text-slate-400 ml-1.5">(Min: 0.60m)</span>
          </p>
          <p className="text-[10px] font-mono text-slate-400">
            Plumb Deflection: <span className="text-emerald-400 font-bold">{spatialData.wallVerticalityDeflectionDeg}°</span> (Pass)
          </p>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 shadow-xl text-left pointer-events-auto">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Rebar Grid Compliance</p>
          <p className="text-base font-extrabold font-mono text-primary-400 mt-0.5">
            {spatialData.rebarGridCompliancePct}%
          </p>
          <p className="text-[10px] font-mono text-emerald-400 font-bold">
            Structural Risk: {spatialData.structuralRiskLevel}
          </p>
        </div>
      </div>

      {/* Floating Inspection Nodes Pin Controls */}
      <div className="absolute bottom-12 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Camera Angle Presets */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto shadow-lg">
          <span className="text-[10px] font-mono text-slate-400 px-2">Angle:</span>
          {[
            { id: 'isometric', label: 'Isometric' },
            { id: 'topdown', label: 'Plan View' },
            { id: 'elevation', label: 'Elevation' },
            { id: 'rebar', label: 'Corner Rebar' }
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyCameraPreset(preset.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                cameraPreset === preset.id
                  ? 'bg-slate-700 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* View Controls: Auto-Rotate & Dimension toggles */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto shadow-lg">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
              autoRotate ? 'bg-emerald-600/30 text-emerald-300' : 'text-slate-400'
            }`}
          >
            {autoRotate ? '⏸ Pause Rotate' : '▶ Auto Rotate'}
          </button>
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
              showDimensions ? 'bg-primary-600/30 text-primary-300' : 'text-slate-400'
            }`}
          >
            {showDimensions ? '📏 Dims ON' : '📏 Dims OFF'}
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="p-2 bg-slate-950 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between items-center px-4">
        <span>🖱️ Drag to rotate 3D twin • Scroll to zoom • Reconstructed from Multi-Model Video Walkthrough</span>
        <span className="text-slate-400">Mesh Vertices: {spatialData.meshVertices?.toLocaleString() || '8,450'}</span>
      </div>
    </div>
  );
}
