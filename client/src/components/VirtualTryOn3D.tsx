import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera as MediaPipeCamera } from "@mediapipe/camera_utils";
import * as THREE from "three";

interface VirtualTryOn3DProps {
  selectedOutfit?: {
    id: string;
    imageUrl: string;
    name: string;
    category: string;
  } | null;
  onCameraStatus: (status: 'loading' | 'active' | 'error' | 'denied') => void;
  onCapture?: (imageData: string) => void;
}

export function VirtualTryOn3D({ selectedOutfit, onCameraStatus, onCapture }: VirtualTryOn3DProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const threeCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clothingGroupRef = useRef<THREE.Group | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [poseDetected, setPoseDetected] = useState(false);
  const { toast } = useToast();

  // Initialize Three.js scene
  useEffect(() => {
    if (!threeCanvasRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    threeCameraRef.current = camera;

    // Create renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ 
      canvas: threeCanvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Create clothing group
    const clothingGroup = new THREE.Group();
    scene.add(clothingGroup);
    clothingGroupRef.current = clothingGroup;

    // Handle window resize
    const handleResize = () => {
      if (threeCameraRef.current && rendererRef.current) {
        threeCameraRef.current.aspect = window.innerWidth / window.innerHeight;
        threeCameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      if (rendererRef.current && sceneRef.current && threeCameraRef.current) {
        rendererRef.current.render(sceneRef.current, threeCameraRef.current);
      }
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Create or update clothing based on category
  useEffect(() => {
    if (!selectedOutfit || !clothingGroupRef.current) return;

    // Clear existing clothing
    while (clothingGroupRef.current.children.length > 0) {
      const child = clothingGroupRef.current.children[0];
      clothingGroupRef.current.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    }

    // Create clothing based on category
    const category = selectedOutfit.category.toLowerCase();
    
    if (category.includes('top') || category === 'all') {
      // T-shirt
      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.5, 0.3),
        new THREE.MeshStandardMaterial({ 
          color: 0x4a90e2, 
          transparent: true, 
          opacity: 0.7,
          side: THREE.DoubleSide
        })
      );
      clothingGroupRef.current.add(torso);

      // Left sleeve
      const leftSleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.18, 0.8, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x4a90e2, 
          transparent: true, 
          opacity: 0.7,
          side: THREE.DoubleSide
        })
      );
      leftSleeve.position.set(-0.6, 0.4, 0);
      clothingGroupRef.current.add(leftSleeve);

      // Right sleeve
      const rightSleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.18, 0.8, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x4a90e2, 
          transparent: true, 
          opacity: 0.7,
          side: THREE.DoubleSide
        })
      );
      rightSleeve.position.set(0.6, 0.4, 0);
      clothingGroupRef.current.add(rightSleeve);
    } else if (category.includes('bottom')) {
      // Pants
      const waist = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.3, 0.3),
        new THREE.MeshStandardMaterial({ 
          color: 0x2c3e50, 
          transparent: true, 
          opacity: 0.7,
          side: THREE.DoubleSide
        })
      );
      waist.position.set(0, -0.5, 0);
      clothingGroupRef.current.add(waist);

      // Left leg
      const leftLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.18, 1.4, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x2c3e50, 
          transparent: true, 
          opacity: 0.7,
          side: THREE.DoubleSide
        })
      );
      leftLeg.position.set(-0.25, -1.2, 0);
      clothingGroupRef.current.add(leftLeg);

      // Right leg
      const rightLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.18, 1.4, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0x2c3e50, 
          transparent: true, 
          opacity: 0.7,
          side: THREE.DoubleSide
        })
      );
      rightLeg.position.set(0.25, -1.2, 0);
      clothingGroupRef.current.add(rightLeg);
    } else if (category.includes('dress')) {
      // Dress
      const upperBody = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 0.3),
        new THREE.MeshStandardMaterial({ 
          color: 0xe91e63, 
          transparent: true, 
          opacity: 0.7,
          side: THREE.DoubleSide
        })
      );
      upperBody.position.set(0, 0.2, 0);
      clothingGroupRef.current.add(upperBody);

      // Skirt
      const skirt = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 1.5, 32),
        new THREE.MeshStandardMaterial({ 
          color: 0xe91e63, 
          transparent: true, 
          opacity: 0.7,
          side: THREE.DoubleSide
        })
      );
      skirt.position.set(0, -0.8, 0);
      clothingGroupRef.current.add(skirt);
    }
  }, [selectedOutfit]);

  // Initialize pose detection
  useEffect(() => {
    let cancelled = false;
    
    initializePoseDetection();

    return () => {
      cancelled = true;
      
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {
          console.warn('Error stopping camera:', e);
        }
        cameraRef.current = null;
      }
      if (poseRef.current) {
        try {
          poseRef.current.close();
        } catch (e) {
          console.warn('Error closing pose:', e);
        }
        poseRef.current = null;
      }
      if (videoRef.current?.srcObject) {
        try {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        } catch (e) {
          console.warn('Error stopping video tracks:', e);
        }
      }
      setStream(null);
    };
  }, [facingMode]);

  const initializePoseDetection = async () => {
    try {
      onCameraStatus('loading');
      setCameraError(null);

      // Clean up any existing instances first
      if (cameraRef.current) {
        try {
          await cameraRef.current.stop();
        } catch (e) {
          console.warn('Error stopping existing camera:', e);
        }
        cameraRef.current = null;
      }
      if (poseRef.current) {
        try {
          await poseRef.current.close();
        } catch (e) {
          console.warn('Error closing existing pose:', e);
        }
        poseRef.current = null;
      }

      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults(onPoseResults);
      poseRef.current = pose;

      if (videoRef.current) {
        const camera = new MediaPipeCamera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && poseRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
          facingMode: facingMode
        });

        await camera.start();
        cameraRef.current = camera;
        setStream(videoRef.current.srcObject as MediaStream);
        onCameraStatus('active');
      }
    } catch (error) {
      console.error('Pose detection initialization error:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setCameraError('Camera access denied. Please grant permission to use this feature.');
          onCameraStatus('denied');
        } else {
          setCameraError('Unable to initialize virtual try-on. Please check your device settings.');
          onCameraStatus('error');
        }
      }
    }
  };

  const onPoseResults = (results: any) => {
    if (results.poseLandmarks && results.poseLandmarks.length > 0 && clothingGroupRef.current) {
      setPoseDetected(true);

      const landmarks = results.poseLandmarks;
      
      // Key body points
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return;

      // Calculate body dimensions
      const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
      const shoulderMidZ = (leftShoulder.z + rightShoulder.z) / 2;

      const shoulderWidth = Math.sqrt(
        Math.pow(rightShoulder.x - leftShoulder.x, 2) +
        Math.pow(rightShoulder.y - leftShoulder.y, 2)
      );

      const torsoHeight = Math.sqrt(
        Math.pow(leftHip.x - leftShoulder.x, 2) +
        Math.pow(leftHip.y - leftShoulder.y, 2)
      );

      // Position the clothing (convert normalized coordinates to 3D space)
      const x = (shoulderMidX - 0.5) * 10;
      const y = -(shoulderMidY - 0.5) * 10;
      const z = -shoulderMidZ * 5;

      clothingGroupRef.current.position.set(x, y, z);

      // Scale based on body size
      const scale = shoulderWidth * 15;
      clothingGroupRef.current.scale.set(scale, scale * (torsoHeight / shoulderWidth), scale);

      // Rotate based on shoulder tilt
      const angle = Math.atan2(
        rightShoulder.y - leftShoulder.y,
        rightShoulder.x - leftShoulder.x
      );
      clothingGroupRef.current.rotation.z = angle;
    } else {
      setPoseDetected(false);
    }
  };

  const flipCamera = async () => {
    if (cameraRef.current) {
      await cameraRef.current.stop();
    }
    if (poseRef.current) {
      await poseRef.current.close();
    }
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const captureCanvas = captureCanvasRef.current;
    
    if (!video || !captureCanvas) return;

    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    // Convert to image and download
    const imageData = captureCanvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = selectedOutfit 
      ? `virtualfit-3d-${selectedOutfit.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
      : `virtualfit-3d-${Date.now()}.png`;
    link.href = imageData;
    link.click();

    if (onCapture) {
      onCapture(imageData);
    }

    toast({
      title: "Photo captured!",
      description: "Your 3D virtual try-on photo has been saved.",
    });
  };

  if (cameraError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-card">
        <Card className="p-8 max-w-md mx-4 text-center">
          <CameraOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Camera Unavailable</h3>
          <p className="text-muted-foreground mb-6">{cameraError}</p>
          <Button onClick={initializePoseDetection} data-testid="button-retry-camera">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="video-camera-feed"
      />
      
      {/* 3D Canvas overlay */}
      <canvas
        ref={threeCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* Status Indicators */}
      {!poseDetected && stream && (
        <div className="absolute top-4 left-4 bg-yellow-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm z-20">
          Stand in frame to try on 3D clothing
        </div>
      )}

      {poseDetected && selectedOutfit && (
        <div className="absolute top-4 left-4 bg-green-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm flex items-center gap-2 z-20">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          3D Try-On Active
        </div>
      )}

      {poseDetected && !selectedOutfit && (
        <div className="absolute top-4 left-4 bg-blue-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm z-20">
          Select an outfit to try on
        </div>
      )}

      {/* Camera Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Button
          size="icon"
          variant="secondary"
          onClick={flipCamera}
          className="bg-background/80 backdrop-blur-lg hover-elevate"
          data-testid="button-flip-camera"
          aria-label="Flip camera"
        >
          <RotateCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Capture Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-8 lg:translate-x-0 z-20">
        <Button
          size="icon"
          onClick={capturePhoto}
          className="h-14 w-14 rounded-full shadow-lg"
          data-testid="button-capture-photo"
          aria-label="Capture photo"
        >
          <Camera className="w-6 h-6" />
        </Button>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={captureCanvasRef} className="hidden" />

      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-4">
            <Camera className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-sm font-medium">Initializing 3D virtual try-on...</p>
          </div>
        </div>
      )}
    </div>
  );
}
