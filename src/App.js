import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './App.css';

function App() {
  // ----------------------------------------------------------------
  //  A) BACKGROUND AUDIO TOGGLE
  // ----------------------------------------------------------------
  const [audioOn, setAudioOn] = useState(false);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    setAudioOn(!audioOn);
    if (audioRef.current) {
      if (!audioOn) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  // ----------------------------------------------------------------
  //  B) THREE.JS SCENE
  // ----------------------------------------------------------------
  useEffect(() => {
    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1c2f3c);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(8, 6, 10);
    camera.lookAt(0, 1, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    //  attach to DOM
    const container = document.getElementById('blueprint-container');
    if (container) {
      container.appendChild(renderer.domElement);
    }

    // 4. Grid Helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x4a5f6f, 0x2f3f49);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // 5. Shared line material
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
    });

    // House group
    const houseGroup = new THREE.Group();

    // (A) Base
    const baseWidth = 4;
    const baseDepth = 3;
    const baseHeight = 2;
    const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const baseEdges = new THREE.EdgesGeometry(baseGeometry);
    const baseOutline = new THREE.LineSegments(baseEdges, edgeMaterial);
    // Shift so bottom is at y=0
    baseOutline.position.y = baseHeight / 2;
    houseGroup.add(baseOutline);

    // (B) Roof
    const roofHeight = 1.5;
    const roofVertices = new Float32Array([
      -2, 0, -1.5,
       2, 0, -1.5,
       2, 0,  1.5,
      -2, 0,  1.5,
      -2, roofHeight, 0,
       2, roofHeight, 0,
    ]);
    const roofIndices = [
      // slopes
      0, 3, 4,
      1, 2, 5,
      // top
      3, 2, 5,
      5, 4, 3,
    ];
    const roofGeometry = new THREE.BufferGeometry();
    roofGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(roofVertices, 3)
    );
    roofGeometry.setIndex(roofIndices);
    roofGeometry.computeVertexNormals();
    const roofEdges = new THREE.EdgesGeometry(roofGeometry);
    const roofOutline = new THREE.LineSegments(roofEdges, edgeMaterial);
    roofOutline.position.y = baseHeight;
    houseGroup.add(roofOutline);

    // (C) Door
    const doorGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.1);
    const doorEdges = new THREE.EdgesGeometry(doorGeometry);
    const door = new THREE.LineSegments(doorEdges, edgeMaterial);
    door.position.set(0, 0.6, baseDepth / 2 + 0.05);
    houseGroup.add(door);

    // (D) Windows
    const windowGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.1);
    const windowEdges = new THREE.EdgesGeometry(windowGeometry);

    const leftWindow = new THREE.LineSegments(windowEdges, edgeMaterial);
    leftWindow.position.set(-1.2, 1.3, baseDepth / 2 + 0.05);
    houseGroup.add(leftWindow);

    const rightWindow = new THREE.LineSegments(windowEdges, edgeMaterial);
    rightWindow.position.set(1.2, 1.3, baseDepth / 2 + 0.05);
    houseGroup.add(rightWindow);

    scene.add(houseGroup);

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // 7. Animation
    const animate = () => {
      requestAnimationFrame(animate);
      // Slowly rotate the house
      houseGroup.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, []);

  // ----------------------------------------------------------------
  //  C) ANIMATED STATS WITH INTERSECTION OBSERVER
  // ----------------------------------------------------------------
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
  }, []);

  //  We'll animate the counters from 0 to their target
  //  once statsVisible becomes true.
  const [counter1, setCounter1] = useState(0);
  const [counter2, setCounter2] = useState(0);

  useEffect(() => {
    if (statsVisible) {
      let start1 = 0;
      let end1 = 10000; // e.g. 10,000
      let start2 = 0;
      let end2 = 99.9; // 99.9%

      const duration = 1500; // 1.5 seconds
      const stepTime = 20;
      const steps = duration / stepTime;

      const timer = setInterval(() => {
        start1 += end1 / steps;
        start2 += end2 / steps;
        if (start1 >= end1) start1 = end1;
        if (start2 >= end2) start2 = end2;

        setCounter1(Math.floor(start1));
        setCounter2(Math.floor(start2 * 10) / 10); // 1 decimal

        if (start1 === end1 && start2 === end2) {
          clearInterval(timer);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [statsVisible]);

  return (
    <>
      {/* AUDIO element for background sound */}
      <audio
        ref={audioRef}
        src="https://www.example.com/your-ambient-sound.mp3" 
        loop
      />

      {/* 
        PAGE CONTAINER:
        We'll use a parallax-like background with `background-attachment: fixed`.
        This is handled in App.css
      */}
      <div className="app-container">

        {/* HEADER / HERO SECTION */}
        <div className="hero-section">
          <h1 className="main-title animate-title">SENTINEL</h1>
          <p className="tagline animate-subtitle">Never afraid again</p>
          {/* Toggle button for the audio */}
          <button className="audio-toggle" onClick={toggleAudio}>
            {audioOn ? 'Pause Ambient' : 'Play Ambient'}
          </button>
        </div>

        {/* 
          3D House Container 
          We'll position it so the house is in the middle of the screen 
        */}
        <div id="blueprint-container" className="blueprint-container"></div>

        {/* SUBHEADING & DESCRIPTION */}
        <section className="description-section">
          <h2>Welcome to Sentinel</h2>
          <p>
            Sentinel provides state-of-the-art security solutions tailored to 
            your home. With Sentinel, you are protected 24/7.
          </p>
        </section>

        {/* DYNAMIC STATS SECTION */}
        <section className="stats-section" ref={statsRef}>
          <div className="stat-item">
            <h3>{counter1.toLocaleString()}+</h3>
            <p>Homes Secured</p>
          </div>
          <div className="stat-item">
            <h3>{counter2}%</h3>
            <p>Success Rate</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <p>HMHM © {new Date().getFullYear()} Sentinel. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#contact">Contact</a>
            <a href="#about">About Sentinel</a>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
