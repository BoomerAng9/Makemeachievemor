import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import chatbotLogo from "@assets/A385DF30-D8BA-4BD2-9DDD-64AB75963E24_1749584458232.png";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  mode?: 'floating' | 'edge' | 'static';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function Chatbot({ isOpen, onToggle, mode = 'floating', position = 'bottom-right' }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your CHOOSE 2 ACHIEVEMOR assistant. I can help you with:\n\n• DOT and MC Authority setup\n• Trucking regulations and compliance\n• Authority Setup Checklist\n• Insurance requirements\n• Getting started as an owner-operator\n\nTry asking: 'show authority checklist' or 'help with DOT requirements'",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/chatbot', { 
        message: inputValue 
      });
      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please contact ACHIEVEMOR directly at (912) 742-9459 for immediate assistance.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPositionClasses = () => {
    const base = mode === 'edge' ? 'fixed' : 'fixed';
    switch (position) {
      case 'bottom-left':
        return mode === 'edge' ? `${base} bottom-0 left-0` : `${base} bottom-6 left-6`;
      case 'top-right':
        return mode === 'edge' ? `${base} top-0 right-0` : `${base} top-6 right-6`;
      case 'top-left':
        return mode === 'edge' ? `${base} top-0 left-0` : `${base} top-6 left-6`;
      default: // bottom-right
        return mode === 'edge' ? `${base} bottom-0 right-0` : `${base} bottom-6 right-6`;
    }
  };

  const handleBubbleClick = () => {
    setShowBubble(false);
    onToggle();
  };

  if (!isOpen && showBubble && mode !== 'static') {
    return (
      <div className={`${getPositionClasses()} z-50`}>
        {/* Animated Ask Me Bubble */}
        <div 
          className="relative cursor-pointer group"
          onClick={handleBubbleClick}
        >
          {/* Pulse animation rings */}
          <div className="absolute inset-0 animate-ping">
            <div className="w-20 h-20 rounded-full bg-amber-400/30 border-2 border-amber-400/50"></div>
          </div>
          <div className="absolute inset-0 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-amber-400/20 border border-amber-400/30"></div>
          </div>
          
          {/* Main bubble */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-retina-xl border-3 border-amber-400/40 overflow-hidden group-hover:scale-105 transition-retina chatbot-bubble">
            <img 
              src={chatbotLogo} 
              alt="ACHIEVEMOR Assistant" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
          
          {/* Ask me text bubble */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white shadow-retina-lg rounded-2xl px-4 py-2 border-2 border-amber-400/30 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            <div className="text-gray-800 font-semibold text-sm">Ask me!</div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className={`${getPositionClasses()} h-16 w-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 shadow-retina-xl border-2 border-amber-400/20 z-50 p-0 overflow-hidden`}
      >
        <img 
          src={chatbotLogo} 
          alt="ACHIEVEMOR Assistant" 
          className="h-12 w-12 object-cover rounded-full"
        />
      </Button>
    );
  }

  return (
    <Card className={`${getPositionClasses()} w-96 max-w-[calc(100vw-2rem)] shadow-retina-xl z-50 border-2 border-amber-400/30 glass ${isMinimized ? 'h-16' : 'h-[600px] max-h-[80vh]'} flex flex-col`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={chatbotLogo} 
              alt="ACHIEVEMOR Assistant" 
              className="h-8 w-8 object-cover rounded-full border-2 border-amber-400/30"
            />
            <CardTitle className="text-lg">ACHIEVEMOR Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-primary-foreground/20 h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white hover:bg-primary-foreground/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                        message.isUser
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
          
          {/* Quick Actions */}
          <div className="flex-shrink-0 p-4 border-t bg-gray-50/50">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const message = "show authority checklist";
                  setInputValue(message);
                  
                  const userMessage: Message = {
                    id: Date.now().toString(),
                    text: message,
                    isUser: true,
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => [...prev, userMessage]);
                  setInputValue("");
                  setIsLoading(true);
                  
                  try {
                    const response = await apiRequest('POST', '/api/chatbot', { message });
                    const data = await response.json();
                    
                    const botMessage: Message = {
                      id: (Date.now() + 1).toString(),
                      text: data.response,
                      isUser: false,
                      timestamp: new Date()
                    };
                    
                    setMessages(prev => [...prev, botMessage]);
                  } catch (error) {
                    console.error('Error sending message:', error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="text-xs"
              >
                Authority Checklist
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const message = "DOT requirements";
                  setInputValue(message);
                  
                  const userMessage: Message = {
                    id: Date.now().toString(),
                    text: message,
                    isUser: true,
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => [...prev, userMessage]);
                  setInputValue("");
                  setIsLoading(true);
                  
                  try {
                    const response = await apiRequest('POST', '/api/chatbot', { message });
                    const data = await response.json();
                    
                    const botMessage: Message = {
                      id: (Date.now() + 1).toString(),
                      text: data.response,
                      isUser: false,
                      timestamp: new Date()
                    };
                    
                    setMessages(prev => [...prev, botMessage]);
                  } catch (error) {
                    console.error('Error sending message:', error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="text-xs"
              >
                DOT Requirements
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const message = "MC authority";
                  setInputValue(message);
                  
                  const userMessage: Message = {
                    id: Date.now().toString(),
                    text: message,
                    isUser: true,
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => [...prev, userMessage]);
                  setInputValue("");
                  setIsLoading(true);
                  
                  try {
                    const response = await apiRequest('POST', '/api/chatbot', { message });
                    const data = await response.json();
                    
                    const botMessage: Message = {
                      id: (Date.now() + 1).toString(),
                      text: data.response,
                      isUser: false,
                      timestamp: new Date()
                    };
                    
                    setMessages(prev => [...prev, botMessage]);
                  } catch (error) {
                    console.error('Error sending message:', error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="text-xs"
              >
                MC Authority
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const message = "insurance requirements";
                  setInputValue(message);
                  
                  const userMessage: Message = {
                    id: Date.now().toString(),
                    text: message,
                    isUser: true,
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => [...prev, userMessage]);
                  setInputValue("");
                  setIsLoading(true);
                  
                  try {
                    const response = await apiRequest('POST', '/api/chatbot', { message });
                    const data = await response.json();
                    
                    const botMessage: Message = {
                      id: (Date.now() + 1).toString(),
                      text: data.response,
                      isUser: false,
                      timestamp: new Date()
                    };
                    
                    setMessages(prev => [...prev, botMessage]);
                  } catch (error) {
                    console.error('Error sending message:', error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="text-xs"
              >
                Insurance Info
              </Button>
            </div>
            
            {/* Input Area */}
            <div className="flex space-x-2 mb-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about DOT requirements, MC Authority..."
                disabled={isLoading}
                className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-4"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 px-1">
              Ask about compliance, authority setup, or trucking regulations
            </p>
          </div>
        </>
      )}
    </Card>
  );
}