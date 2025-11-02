import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CameraFeedProps {
  selectedOutfit?: {
    id: string;
    imageUrl: string;
    name: string;
  } | null;
  onCameraStatus: (status: 'loading' | 'active' | 'error' | 'denied') => void;
}

export function CameraFeed({ selectedOutfit, onCameraStatus }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  useEffect(() => {
    if (selectedOutfit && videoRef.current && canvasRef.current) {
      drawOutfitOverlay();
    }
  }, [selectedOutfit]);

  const startCamera = async () => {
    try {
      onCameraStatus('loading');
      setCameraError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        onCameraStatus('active');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setCameraError('Camera access denied. Please grant permission to use this feature.');
          onCameraStatus('denied');
        } else {
          setCameraError('Unable to access camera. Please check your device settings.');
          onCameraStatus('error');
        }
      }
    }
  };

  const flipCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const drawOutfitOverlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !selectedOutfit) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedOutfit.imageUrl;
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate outfit position (centered on upper body)
      const outfitWidth = canvas.width * 0.5;
      const outfitHeight = (img.height / img.width) * outfitWidth;
      const x = (canvas.width - outfitWidth) / 2;
      const y = canvas.height * 0.15;

      ctx.globalAlpha = 0.85;
      ctx.drawImage(img, x, y, outfitWidth, outfitHeight);
      ctx.globalAlpha = 1.0;
    };
  };

  if (cameraError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-card">
        <Card className="p-8 max-w-md mx-4 text-center">
          <CameraOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Camera Unavailable</h3>
          <p className="text-muted-foreground mb-6">{cameraError}</p>
          <Button onClick={startCamera} data-testid="button-retry-camera">
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
      
      {selectedOutfit && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          data-testid="canvas-outfit-overlay"
        />
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

      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Camera className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-sm font-medium">Connecting camera...</p>
          </div>
        </div>
      )}
    </div>
  );
}
