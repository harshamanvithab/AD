import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RotateCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CameraFeedProps {
  selectedOutfit?: {
    id: string;
    imageUrl: string;
    name: string;
  } | null;
  onCameraStatus: (status: 'loading' | 'active' | 'error' | 'denied') => void;
  onCapture?: (imageData: string) => void;
}

export function CameraFeed({ selectedOutfit, onCameraStatus, onCapture }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { toast } = useToast();

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

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    
    if (!video || !canvas) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw outfit overlay if selected
    if (selectedOutfit) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedOutfit.imageUrl;
      
      img.onload = () => {
        const outfitWidth = canvas.width * 0.5;
        const outfitHeight = (img.height / img.width) * outfitWidth;
        const x = (canvas.width - outfitWidth) / 2;
        const y = canvas.height * 0.15;

        ctx.globalAlpha = 0.85;
        ctx.drawImage(img, x, y, outfitWidth, outfitHeight);
        ctx.globalAlpha = 1.0;

        // Convert to image and download
        const imageData = canvas.toDataURL('image/png');
        
        // Trigger download
        const link = document.createElement('a');
        link.download = `virtualfit-${selectedOutfit.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
        link.href = imageData;
        link.click();

        // Call callback if provided
        if (onCapture) {
          onCapture(imageData);
        }

        toast({
          title: "Photo captured!",
          description: "Your virtual try-on photo has been saved.",
        });
      };
    } else {
      // No outfit selected, just capture video frame
      const imageData = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `virtualfit-${Date.now()}.png`;
      link.href = imageData;
      link.click();

      if (onCapture) {
        onCapture(imageData);
      }

      toast({
        title: "Photo captured!",
        description: "Your photo has been saved.",
      });
    }
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
            <p className="text-sm font-medium">Connecting camera...</p>
          </div>
        </div>
      )}
    </div>
  );
}
