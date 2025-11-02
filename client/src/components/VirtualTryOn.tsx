import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera as MediaPipeCamera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

interface VirtualTryOnProps {
  selectedOutfit?: {
    id: string;
    imageUrl: string;
    name: string;
  } | null;
  onCameraStatus: (status: 'loading' | 'active' | 'error' | 'denied') => void;
  onCapture?: (imageData: string) => void;
}

export function VirtualTryOn({ selectedOutfit, onCameraStatus, onCapture }: VirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const outfitImageRef = useRef<HTMLImageElement | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [poseDetected, setPoseDetected] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    if (selectedOutfit) {
      loadOutfitImage();
    }
  }, [selectedOutfit]);

  const loadOutfitImage = () => {
    if (!selectedOutfit) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedOutfit.imageUrl;
    img.onload = () => {
      outfitImageRef.current = img;
    };
    img.onerror = () => {
      console.error('Failed to load outfit image:', selectedOutfit.imageUrl);
      toast({
        title: "Image load error",
        description: "Unable to load the outfit image. Please try another item.",
        variant: "destructive",
      });
      outfitImageRef.current = null;
    };
  };

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
      setPoseDetected(true);

      // Draw pose skeleton (optional - for debugging)
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: 'rgba(0, 255, 0, 0.3)',
        lineWidth: 2
      });
      drawLandmarks(ctx, results.poseLandmarks, {
        color: 'rgba(255, 0, 0, 0.3)',
        lineWidth: 1,
        radius: 2
      });

      // Draw outfit overlay mapped to body
      if (selectedOutfit && outfitImageRef.current) {
        drawOutfitOnBody(ctx, results.poseLandmarks, canvas.width, canvas.height);
      }
    } else {
      setPoseDetected(false);
    }

    ctx.restore();
  };

  const drawOutfitOnBody = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    width: number,
    height: number
  ) => {
    if (!outfitImageRef.current) return;

    // Key body landmarks for clothing mapping
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const nose = landmarks[0];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return;

    // Calculate body dimensions
    const shoulderWidth = Math.sqrt(
      Math.pow((rightShoulder.x - leftShoulder.x) * width, 2) +
      Math.pow((rightShoulder.y - leftShoulder.y) * height, 2)
    );

    const torsoHeight = Math.sqrt(
      Math.pow((leftHip.x - leftShoulder.x) * width, 2) +
      Math.pow((leftHip.y - leftShoulder.y) * height, 2)
    );

    // Position and scale outfit based on body
    const outfitWidth = shoulderWidth * 2.2;
    const outfitHeight = (outfitImageRef.current.height / outfitImageRef.current.width) * outfitWidth;

    const centerX = ((leftShoulder.x + rightShoulder.x) / 2) * width;
    const centerY = ((leftShoulder.y + rightShoulder.y) / 2) * height;

    const x = centerX - outfitWidth / 2;
    const y = centerY - outfitHeight * 0.15;

    // Calculate rotation angle based on shoulder tilt
    const angle = Math.atan2(
      (rightShoulder.y - leftShoulder.y) * height,
      (rightShoulder.x - leftShoulder.x) * width
    );

    // Apply transformations and draw outfit
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.translate(-centerX, -centerY);
    
    ctx.globalAlpha = 0.85;
    ctx.drawImage(outfitImageRef.current, x, y, outfitWidth, outfitHeight);
    ctx.globalAlpha = 1.0;
    
    ctx.restore();
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
    const canvas = canvasRef.current;
    const captureCanvas = captureCanvasRef.current;
    
    if (!video || !canvas || !captureCanvas) return;

    captureCanvas.width = canvas.width;
    captureCanvas.height = canvas.height;

    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    // Draw pose overlay on top
    ctx.drawImage(canvas, 0, 0);

    // Convert to image and download
    const imageData = captureCanvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = selectedOutfit 
      ? `virtualfit-${selectedOutfit.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
      : `virtualfit-${Date.now()}.png`;
    link.href = imageData;
    link.click();

    if (onCapture) {
      onCapture(imageData);
    }

    toast({
      title: "Photo captured!",
      description: "Your virtual try-on photo has been saved.",
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
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="video-camera-feed"
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        data-testid="canvas-pose-overlay"
      />

      {/* Status Indicator */}
      {!poseDetected && stream && (
        <div className="absolute top-4 left-4 bg-yellow-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Position yourself in frame to try on clothes
        </div>
      )}

      {poseDetected && selectedOutfit && (
        <div className="absolute top-4 left-4 bg-green-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Body detected - Try on active!
        </div>
      )}

      {/* Camera Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-8 lg:translate-x-0">
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
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Camera className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-sm font-medium">Initializing virtual try-on...</p>
          </div>
        </div>
      )}
    </div>
  );
}
