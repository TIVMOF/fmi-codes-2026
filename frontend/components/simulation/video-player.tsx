'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, Volume2, VolumeX, Maximize, Download } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  title?: string
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(video.currentTime)
  }

  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    setDuration(video.duration)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return
    
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = src
    a.download = title ? `${title}.mp4` : 'simulation.mp4'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-video bg-background">
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
      
      <div className="flex flex-col gap-2 p-4">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="min-w-12 text-xs text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <Slider
            min={0}
            max={duration || 100}
            step={0.1}
            value={[currentTime]}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="min-w-12 text-xs text-muted-foreground text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay}>
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFullscreen}>
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
