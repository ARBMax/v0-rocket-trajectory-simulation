'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, MessageCircle, X } from 'lucide-react'

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ai-assistant' }),
  })
  
  console.log('[v0] AIAssistant rendered. messages:', messages, 'status:', status)

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] handleSubmit called. input:', input, 'isLoading:', isLoading)
    if (!input.trim() || isLoading) {
      console.log('[v0] Early return: input.trim():', input.trim(), 'isLoading:', isLoading)
      return
    }
    console.log('[v0] Calling sendMessage with:', input)
    sendMessage({ text: input })
    setInput('')
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
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[90vw] h-96 bg-background border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00ffcc] to-[#0088ff] px-4 py-3 text-white font-semibold text-sm">
            Ozone Labs AI Assistant
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 border-b border-border">
            <div className="space-y-4 pr-4">
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
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                        message.role === 'user'
                          ? 'bg-[#00ffcc] text-black rounded-br-none'
                          : 'bg-muted text-foreground rounded-bl-none'
                      }`}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === 'text') {
                          return <span key={index}>{part.text}</span>
                        }
                        return null
                      })}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border">
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
