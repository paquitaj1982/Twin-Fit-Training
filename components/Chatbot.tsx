
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { MessageSquare, X, Send, Loader2, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, UserProfile } from '../types';

interface ChatbotProps {
  user: UserProfile;
}

export const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Welcome, ${user.name}! I'm your Twin AI Assistant. How can I help you dominate your session today?`,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize chat if not exists
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: `You are the Twin AI Assistant for the "Twin Fit Training" app. 
            The brand tagline is "Built Strong. Built Tough." 
            You are professional, motivating, direct, and expert in fitness and nutrition.
            
            App Features you can assist with:
            - Nutrition: Calorie and macro tracking, water intake, meal plans.
            - Progress: Weight tracking and video check-ins for visual transformation.
            - Booking: Scheduling 1-on-1 sessions with Twin.
            - Live: Real-time workout tracking with heart rate and calorie monitoring.
            
            Contact Info: Direct inquiries should be sent to twin.fit.trainer@gmail.com.
            
            Current User: ${user.name}, Level: ${user.level}, Goals: ${user.goals.join(', ')}.
            
            Always encourage the user to stay disciplined. Keep responses concise and merchandise-ready.`,
          },
        });
      }

      const stream = await chatRef.current.sendMessageStream({ message: input });
      
      let assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let fullText = '';
      for await (const chunk of stream) {
        // Casting chunk to GenerateContentResponse and accessing .text property directly
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text || '';
        fullText += textChunk;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === assistantMessage.id ? { ...msg, text: fullText } : msg
          )
        );
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error',
          role: 'model',
          text: "I hit a snag in the network. Let's try that again. Stay focused.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-brand-red shadow-2xl hover:scale-110 transition-all group"
        >
          <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-red"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] sm:inset-auto sm:bottom-6 sm:left-6 sm:w-96 sm:h-[600px] flex flex-col bg-neutral-950 sm:rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center transform rotate-3 shadow-lg shadow-red-900/20">
                <Zap className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl tracking-tight leading-none">TWIN AI</h3>
                <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest mt-1">Personal Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-red text-white rounded-br-none shadow-lg shadow-red-900/10'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'model' && (
                    <div className="flex items-center gap-1.5 mb-2 opacity-50">
                      <Zap className="w-3 h-3 text-brand-red" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Assistant</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && messages[messages.length - 1].role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl rounded-bl-none">
                  <Loader2 className="w-4 h-4 text-brand-red animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-neutral-900/50 border-t border-neutral-800 backdrop-blur-md">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask anything..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:border-brand-red transition-colors placeholder-neutral-700"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 text-brand-red hover:text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[9px] text-center text-neutral-600 mt-2 uppercase tracking-widest font-bold">Built Strong. Built Tough.</p>
          </div>
        </div>
      )}
    </>
  );
};
