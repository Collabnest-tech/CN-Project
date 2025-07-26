// src/components/features/courses/module-player.tsx
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, Maximize, FileText } from "lucide-react"
import { getModuleVideoPath, getModulePresentationPath, hasModuleContent } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface ModulePlayerProps {
  moduleId: string
  title: string
  description?: string
  className?: string
}

export function ModulePlayer({ moduleId, title, description, className }: ModulePlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [showPresentation, setShowPresentation] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  if (!hasModuleContent(moduleId)) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Module content not available</p>
        </CardContent>
      </Card>
    )
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const videoPath = getModuleVideoPath(moduleId)
  const presentationPath = getModulePresentationPath(moduleId)

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPresentation(!showPresentation)}
            >
              <FileText className="h-4 w-4 mr-2" />
              {showPresentation ? "Video" : "Slides"}
            </Button>
          </div>
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {showPresentation ? (
          <div className="video-container">
            <iframe
              src={presentationPath}
              className="presentation-container"
              title={`${title} Presentation`}
            />
          </div>
        ) : (
          <div className="relative video-container group">
            <video
              ref={videoRef}
              className="video-player"
              src={videoPath}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls
            >
              Your browser does not support the video tag.
            </video>
            
            {/* Custom Controls Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}