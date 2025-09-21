import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const ChatModal = ({ isOpen, onClose, sessionId, caseId }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Function to clean up the response and extract only the AI's reply
  const cleanResponse = (rawResponse) => {
    if (!rawResponse) return 'Sorry, I could not process your request.'
    
    // Remove common prefixes and user question echoes
    let cleanedResponse = rawResponse
      .replace(/^Here's my response to your question:\s*/i, '')
      .replace(/^Officer:.*?\n\n/s, '')
      .replace(/^AI Guide:\s*/i, '')
      .replace(/^AI:\s*/i, '')
      .replace(/^Based on the legal context provided.*?\n\n/s, '')
      .replace(/\s*---\s*$/g, '')
      .trim()
    
    // If the response is empty after cleaning, return a fallback
    if (!cleanedResponse) {
      return 'I understand your question. How can I help you with your case?'
    }
    
    return cleanedResponse
  }

  // Function to format the response for better display
  const formatResponse = (text) => {
    if (!text) return text
    
    // Split into lines for processing
    const lines = text.split('\n')
    const formattedLines = []
    
    for (let line of lines) {
      line = line.trim()
      if (!line) continue
      
      // Handle headers (### or **)
      if (line.startsWith('###')) {
        formattedLines.push({
          type: 'header',
          content: line.replace(/^###\s*/, '').replace(/\*+$/, '').trim()
        })
      }
      // Handle numbered items
      else if (/^\d+\.\s*/.test(line)) {
        const match = line.match(/^(\d+)\.\s*(.*)/)
        if (match) {
          formattedLines.push({
            type: 'numbered',
            number: match[1],
            content: match[2].replace(/^\*+/, '').replace(/\*+$/, '').trim()
          })
        }
      }
      // Handle bullet points or sub-items
      else if (line.startsWith('*') || line.startsWith('-')) {
        formattedLines.push({
          type: 'bullet',
          content: line.replace(/^[\*\-]\s*/, '').replace(/\*+$/, '').trim()
        })
      }
      // Regular text
      else {
        formattedLines.push({
          type: 'text',
          content: line
        })
      }
    }
    
    return formattedLines
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return

    const userMessage = { type: 'user', content: inputMessage, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      
      const response = await axios.post(`${apiBaseUrl}/api/chat`, {
        message: inputMessage,
        session_id: sessionId,
        case_id: caseId
      })

      const cleanedContent = cleanResponse(response.data.response)
      const formattedContent = formatResponse(cleanedContent)
      const botMessage = { 
        type: 'bot', 
        content: cleanedContent,
        formattedContent: formattedContent,
        timestamp: new Date() 
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = { 
        type: 'bot', 
        content: 'Sorry, there was an error processing your message. Please try again.', 
        timestamp: new Date() 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Chat Modal */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-lg h-[32rem] flex flex-col border border-white/30">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">AI Legal Assistant</h3>
              <p className="text-xs text-gray-500">Online • Ready to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none p-2 hover:bg-gray-100/50 rounded-full transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-gray-50/30">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-700">Ask me anything about your case!</p>
              <p className="mt-2 text-xs text-gray-500">I can help with legal requirements, next steps, or clarifications.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl backdrop-blur-sm ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white/80 text-gray-800 shadow-md border border-gray-200/50'
              }`}>
                {message.type === 'bot' && message.formattedContent ? (
                  <div className="text-sm leading-relaxed space-y-2">
                    {message.formattedContent.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        {item.type === 'header' && (
                          <h4 className="font-bold text-blue-700 text-base mb-2">
                            {item.content}
                          </h4>
                        )}
                        {item.type === 'numbered' && (
                          <div className="flex items-start space-x-2 mb-1">
                            <span className="font-bold text-blue-600 min-w-[20px]">
                              {item.number}.
                            </span>
                            <span className="flex-1">{item.content}</span>
                          </div>
                        )}
                        {item.type === 'bullet' && (
                          <div className="flex items-start space-x-2 mb-1 ml-4">
                            <span className="text-blue-500 min-w-[8px] mt-2">•</span>
                            <span className="flex-1">{item.content}</span>
                          </div>
                        )}
                        {item.type === 'text' && (
                          <p className="mb-1">{item.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/80 backdrop-blur-sm text-gray-800 max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl shadow-md border border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-gray-200/50 rounded-b-2xl">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your case..."
              className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all duration-200"
              disabled={isLoading || !sessionId}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim() || !sessionId}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          {!sessionId && (
            <p className="text-xs text-red-500 mt-2 bg-red-50/80 backdrop-blur-sm p-2 rounded-lg border border-red-200/50">
              ⚠️ Session not available. Please submit the case first.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatModal