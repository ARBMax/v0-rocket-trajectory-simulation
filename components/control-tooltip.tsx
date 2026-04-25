'use client'

import { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

interface ControlTooltipProps {
  label: string
  description: string
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function ControlTooltip({
  label,
  description,
  children,
  side = 'top',
}: ControlTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className="cursor-help">
          <div className="flex items-center gap-2">
            {children}
            <Info className="h-3 w-3 text-primary/50 hover:text-primary transition-colors" />
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="space-y-1">
            <p className="font-mono text-xs font-bold text-primary">{label}</p>
            <p className="text-[11px] text-foreground/80">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
