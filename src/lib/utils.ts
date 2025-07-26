import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Module utilities for your "edited and compressed vids" folder
export function getModuleVideoPath(moduleId: string): string {
  return `/edited and compressed vids/module-${moduleId}/video.mp4`
}

export function getModulePresentationPath(moduleId: string): string {
  return `/edited and compressed vids/module-${moduleId}/presentation.html`
}

export function getModuleAssetsPath(moduleId: string): string {
  return `/edited and compressed vids/module-${moduleId}/assets/`
}

// Check if module content exists
export function hasModuleContent(moduleId: string): boolean {
  const moduleNumber = parseInt(moduleId)
  return moduleNumber >= 1 && moduleNumber <= 8
}
