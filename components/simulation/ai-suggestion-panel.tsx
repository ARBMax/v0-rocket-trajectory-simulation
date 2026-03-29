"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, AlertTriangle, Zap, Target, Settings2, ChevronRight, Loader2, RefreshCw } from "lucide-react"
import { RocketParams, SimulationResult } from "@/lib/rocket-physics"
import { generateAISuggestions, AIAnalysis, AISuggestion } from "@/app/actions/ai-suggestions"

interface AISuggestionPanelProps {
  params: RocketParams
  result: SimulationResult | null
  onApplySuggestion?: (changes: Partial<RocketParams>) => void
}

const categoryIcons = {
  performance: Zap,
  safety: AlertTriangle,
  efficiency: Target,
  optimization: Settings2,
}

const priorityColors = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
}

const categoryColors = {
  performance: "text-primary",
  safety: "text-red-400",
  efficiency: "text-green-400",
  optimization: "text-yellow-400",
}

export function AISuggestionPanel({ params, result, onApplySuggestion }: AISuggestionPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [isPending, startTransition] = useTransition()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const handleAnalyze = () => {
    startTransition(async () => {
      const result_analysis = await generateAISuggestions(params, result)
      setAnalysis(result_analysis)
    })
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
                AI Flight Advisor
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground">
                TRAJECTORY OPTIMIZATION ENGINE
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAnalyze}
            disabled={isPending}
            className="h-7 text-xs font-mono bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ANALYZING
              </>
            ) : analysis ? (
              <>
                <RefreshCw className="mr-1.5 h-3 w-3" />
                RE-ANALYZE
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-3 w-3" />
                ANALYZE
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {!analysis && !isPending && (
          <div className="text-center py-8 px-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              AI-powered trajectory analysis
            </p>
            <p className="text-xs text-muted-foreground/70">
              Click ANALYZE to get optimization suggestions
            </p>
          </div>
        )}

        {isPending && (
          <div className="text-center py-8 px-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3 animate-pulse">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-sm text-primary mb-1 font-mono">
              Analyzing trajectory data...
            </p>
            <p className="text-xs text-muted-foreground/70">
              Computing optimal flight parameters
            </p>
          </div>
        )}

        {analysis && !isPending && (
          <>
            {/* Overall Assessment */}
            <div className="p-3 rounded border border-border/50 bg-secondary/30">
              <p className="text-xs font-mono text-foreground leading-relaxed">
                {analysis.overallAssessment}
              </p>
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded border border-border/50 bg-secondary/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">
                    Safety Rating
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {analysis.safetyRating}/10
                  </span>
                </div>
                <Progress 
                  value={analysis.safetyRating * 10} 
                  className="h-1.5 bg-muted"
                />
              </div>
              <div className="p-3 rounded border border-border/50 bg-secondary/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">
                    Efficiency
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {analysis.efficiencyRating}/10
                  </span>
                </div>
                <Progress 
                  value={analysis.efficiencyRating * 10} 
                  className="h-1.5 bg-muted"
                />
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Recommendations ({analysis.suggestions.length})
              </h4>
              
              {analysis.suggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={index}
                  suggestion={suggestion}
                  isExpanded={expandedIndex === index}
                  onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  onApply={onApplySuggestion}
                />
              ))}
            </div>

            {/* Predicted Improvement */}
            <div className="p-3 rounded border border-primary/30 bg-primary/5">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-primary block mb-1">
                    Predicted Outcome
                  </span>
                  <p className="text-xs text-foreground/80">
                    {analysis.predictedImprovement}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function SuggestionCard({
  suggestion,
  isExpanded,
  onToggle,
  onApply,
}: {
  suggestion: AISuggestion
  isExpanded: boolean
  onToggle: () => void
  onApply?: (changes: Partial<RocketParams>) => void
}) {
  const Icon = categoryIcons[suggestion.category]
  
  return (
    <div 
      className="border border-border/50 rounded overflow-hidden bg-secondary/20 transition-all"
    >
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className={`shrink-0 ${categoryColors[suggestion.category]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-foreground truncate">
              {suggestion.title}
            </span>
            <Badge 
              variant="outline" 
              className={`text-[9px] px-1.5 py-0 h-4 shrink-0 ${priorityColors[suggestion.priority]}`}
            >
              {suggestion.priority.toUpperCase()}
            </Badge>
          </div>
        </div>
        <ChevronRight 
          className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} 
        />
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 border-t border-border/30">
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 mb-3">
            {suggestion.description}
          </p>
          {suggestion.parameterChanges && onApply && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApply(suggestion.parameterChanges!)}
              className="h-6 text-[10px] font-mono bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
            >
              <Zap className="mr-1 h-3 w-3" />
              APPLY SUGGESTION
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
