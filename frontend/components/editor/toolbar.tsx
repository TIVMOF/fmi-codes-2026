'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MousePointer, Minus, Square, Eraser, Trash2, DoorOpen, LogOut, AlertTriangle } from 'lucide-react'
import type { EditorTool } from '@/types/simulation'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  selectedTool: EditorTool
  onToolChange: (tool: EditorTool) => void
  onClearAll: () => void
}

export function Toolbar({ selectedTool, onToolChange, onClearAll }: ToolbarProps) {
  const tools: { id: EditorTool; icon: typeof MousePointer; label: string; description: string; color?: string }[] = [
    {
      id: 'select',
      icon: MousePointer,
      label: 'Select',
      description: 'Select and inspect elements',
    },
    {
      id: 'wall',
      icon: Minus,
      label: 'Wall',
      description: 'Draw walls by clicking start and end points',
      color: 'text-red-500',
    },
    {
      id: 'door',
      icon: DoorOpen,
      label: 'Door',
      description: 'Draw doors by clicking start and end points',
      color: 'text-amber-500',
    },
    {
      id: 'table',
      icon: Square,
      label: 'Table',
      description: 'Draw tables by clicking 4 corners',
      color: 'text-blue-500',
    },
    {
      id: 'exit',
      icon: LogOut,
      label: 'Exit',
      description: 'Place emergency exit markers',
      color: 'text-emerald-500',
    },
    {
      id: 'panic',
      icon: AlertTriangle,
      label: 'Panic Pin',
      description: 'Place panic/hazard markers',
      color: 'text-orange-500',
    },
    {
      id: 'eraser',
      icon: Eraser,
      label: 'Eraser',
      description: 'Remove elements',
    },
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isSelected = selectedTool === tool.id
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isSelected ? 'default' : 'ghost'}
                  size="icon"
                  className={cn(
                    'h-10 w-10',
                    isSelected && 'bg-primary text-primary-foreground',
                    !isSelected && tool.color
                  )}
                  onClick={() => onToolChange(tool.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{tool.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{tool.label}</p>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
        
        <div className="my-1 h-px bg-border" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onClearAll}
            >
              <Trash2 className="h-5 w-5" />
              <span className="sr-only">Clear All</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">Clear All</p>
            <p className="text-xs text-muted-foreground">Remove all elements</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
