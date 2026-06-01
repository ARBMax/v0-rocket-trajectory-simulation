'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, MessageCircle, X } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: 'user', content: userMessage.content },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      // Read the streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let errorMessage = ''

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') continue
                if (!data) continue

                try {
                  const parsed = JSON.parse(data)
                  // Handle error messages
                  if (parsed.type === 'error' && parsed.errorText) {
                    errorMessage = parsed.errorText
                  }
                  // Handle text deltas
                  if (parsed.type === 'text-delta' && parsed.delta) {
                    assistantMessage += parsed.delta
                  } else if (parsed.choices?.[0]?.delta?.content) {
                    assistantMessage += parsed.choices[0].delta.content
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (streamError) {
          console.error('[v0] Stream reading error:', streamError)
        }
      }

      // Show error if one was received
      if (errorMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: errorMessage,
          },
        ])
      } else if (assistantMessage.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: assistantMessage.trim(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'No response received from AI.',
          },
        ])
      }
    } catch (error) {
      console.error('[v0] AI Assistant error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#00ffcc] to-[#0088ff] text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
        title="AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[90vw] h-[500px] bg-background border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00ffcc] to-[#0088ff] px-4 py-3 text-white font-semibold text-sm flex-shrink-0">
            Ozone Labs AI Assistant
          </div>

          {/* Messages - with improved scroll area */}
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center mt-8">
                  <p className="font-medium mb-2">Ask me anything about:</p>
                  <ul className="text-left space-y-1">
                    <li>• Rocket physics & trajectories</li>
                    <li>• Orbital mechanics</li>
                    <li>• Mission parameters</li>
                    <li>• Hohmann transfers</li>
                    <li>• Planet targeting</li>
                  </ul>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-3 py-2 text-sm break-words ${
                          message.role === 'user'
                            ? 'bg-[#00ffcc] text-black rounded-br-none'
                            : 'bg-muted text-foreground rounded-bl-none'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} className="h-1" />
                </>
              )}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="text-sm"
              />
              <Button
                size="sm"
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#00ffcc] text-black hover:bg-[#00ddbb]"
              >
                <Send size={16} />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
