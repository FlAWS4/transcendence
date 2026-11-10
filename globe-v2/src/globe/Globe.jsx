import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { campuses } from "./campuses.js";
import { latLngToVector3 } from "./geo.js";

function easeInOutCubic(t) {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function Globe({ selectedCampus, onCampusSelect }) {
  const hostRef = useRef(null);
  const focusCampusRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x102c38,
        roughness: 0.82,
        metalness: 0.05,
      })
    );
    scene.add(earth);

    scene.add(new THREE.HemisphereLight(0xdffcff, 0x071016, 1.7));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(3, 2, 4);
    scene.add(keyLight);

    const markerGeometry = new THREE.SphereGeometry(0.025, 12, 12);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0x56f2d4,
    });
    const markers = new THREE.InstancedMesh(
      markerGeometry,
      markerMaterial,
      campuses.length
    );

    const matrix = new THREE.Matrix4();

    campuses.forEach((campus, index) => {
      const [longitude, latitude] = campus.coordinates;
      const position = latLngToVector3(longitude, latitude, 1.025);
      matrix.makeTranslation(position.x, position.y, position.z);
      markers.setMatrixAt(index, matrix);
    });

    markers.instanceMatrix.needsUpdate = true;
    scene.add(markers);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.enableDamping = false;
    controls.minDistance = 2.1;
    controls.maxDistance = 4.4;

    let flightFrame = null;

    function render() {
      renderer.render(scene, camera);
    }

    function stopFlight() {
      if (flightFrame !== null) {
        cancelAnimationFrame(flightFrame);
        flightFrame = null;
      }
    }

    function focusCampus(campus) {
      if (!campus) return;

      stopFlight();

      const [longitude, latitude] = campus.coordinates;

      const startDirection = camera.position.clone().normalize();
      const endDirection = latLngToVector3(
        longitude,
        latitude,
        1
      ).normalize();

      const startDistance = camera.position.length();
      const endDistance = 2.55;

      if (reduceMotion) {
        camera.position.copy(endDirection).multiplyScalar(endDistance);
        camera.lookAt(controls.target);
        controls.update();
        render();
        return;
      }

      const fullRotation = new THREE.Quaternion().setFromUnitVectors(
        startDirection,
        endDirection
      );
      const identityRotation = new THREE.Quaternion();
      const currentRotation = new THREE.Quaternion();
      const currentDirection = new THREE.Vector3();

      const startTime = performance.now();
      const duration = 900;

      function animateFlight(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = easeInOutCubic(progress);

        currentRotation.slerpQuaternions(
          identityRotation,
          fullRotation,
          eased
        );

        currentDirection
          .copy(startDirection)
          .applyQuaternion(currentRotation)
          .normalize();

        const distance = THREE.MathUtils.lerp(
          startDistance,
          endDistance,
          eased
        );

        camera.position.copy(currentDirection).multiplyScalar(distance);
        camera.lookAt(controls.target);
        render();

        if (progress < 1) {
          flightFrame = requestAnimationFrame(animateFlight);
        } else {
          flightFrame = null;
          controls.update();
          render();
        }
      }

      flightFrame = requestAnimationFrame(animateFlight);
    }

    focusCampusRef.current = focusCampus;

    function resize() {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function selectCampus(event) {
      const rect = renderer.domElement.getBoundingClientRect();

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      const hit = raycaster.intersectObject(markers)[0];
      if (hit?.instanceId !== undefined) {
        onCampusSelect?.(campuses[hit.instanceId]);
      }
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    controls.addEventListener("start", stopFlight);
    controls.addEventListener("change", render);
    renderer.domElement.addEventListener("click", selectCampus);

    resize();

    return () => {
      stopFlight();
      focusCampusRef.current = null;
      resizeObserver.disconnect();
      controls.removeEventListener("start", stopFlight);
      controls.removeEventListener("change", render);
      renderer.domElement.removeEventListener("click", selectCampus);
      controls.dispose();
      markerGeometry.dispose();
      markerMaterial.dispose();
      earth.geometry.dispose();
      earth.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onCampusSelect]);

  useEffect(() => {
    focusCampusRef.current?.(selectedCampus);
  }, [selectedCampus]);

  return <div ref={hostRef} className="globe-host" />;
}
