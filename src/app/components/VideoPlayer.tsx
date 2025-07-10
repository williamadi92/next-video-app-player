"use client";

import React, { useRef, useEffect, useState } from "react";

type Props = {
  videoUrl: string;
};

export const VideoPlayer: React.FC<Props> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.warn("Video or Canvas not available yet.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = () => {
      if (video.paused || video.ended) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(drawFrame);
    };

    const handleLoaded = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.play();
    };

    const handleError = () => {
      setError("Failed to load video");
    };

    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("error", handleError);
    video.addEventListener("play", drawFrame);

    return () => {
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("play", drawFrame);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime =
        (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const updateProgress = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const toggleFullscreen = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!document.fullscreenElement) {
      canvas.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={videoUrl}
        hidden
        onTimeUpdate={updateProgress}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
        crossOrigin="anonymous"
      />
      <canvas ref={canvasRef} className="border w-full max-w-[800px]" />
      {/* Overlay */}
      <div className="absolute top-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
        Watermark - {new Date().toLocaleTimeString()}
      </div>

      {/* Controls */}
      <div className="flex gap-2 items-center mt-2">
        <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgress}
        />
        <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
        <button onClick={toggleFullscreen}>
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>
    </div>
  );
};
