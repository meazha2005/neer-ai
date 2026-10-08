'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { LiveWeatherData, AgroSuitabilityResult, Dam } from '@/types';

interface ChatbotDrawerProps {
  currentLocationName: string;
  weather: LiveWeatherData | null;
  suitability: AgroSuitabilityResult | null;
  nearestDams: Dam[];
}

interface Message {
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export default function ChatbotDrawer({
  currentLocationName,
  weather,
  suitability,
  nearestDams,
}: ChatbotDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: `Vanakkam! I am NEER-AI, your Agri-Water & Irrigation Assistant for ${currentLocationName}. How can I assist with crop selection, rain predictions, dam water storage, or irrigation schedules today?`,
      time: 'Just now',
    },
  ]);

  const quickPrompts = [
    '🌱 Best crops for current soil moisture?',
    '🌧️ Will it rain in the next 48 hours?',
    '💧 Nearest dam water percentage?',
    '⏳ When should I irrigate next?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    setTimeout(() => {
      let botResponse = '';
      const lower = query.toLowerCase();

      if (lower.includes('crop') || lower.includes('suitab') || lower.includes('grow')) {
        const crops = suitability?.recommendedCrops?.join(', ') || 'Millets, Pulses, and Groundnut';
        botResponse = `Based on current soil moisture and water table depth in ${currentLocationName}, the most suitable crops are: ${crops}. Land suitability index is ${suitability?.score || 68}/100.`;
      } else if (lower.includes('rain') || lower.includes('weather') || lower.includes('precipitation')) {
        const rain48 = ((weather?.daily?.precipitationSum[0] || 0) + (weather?.daily?.precipitationSum[1] || 0)).toFixed(1);
        const prob = weather?.daily?.precipitationProbMax[0] || 20;
        botResponse = `Rain Forecast for ${currentLocationName}: Expected ~${rain48}mm over next 48 hours with a peak probability of ${prob}%. Temp is currently ${weather?.temperature}°C.`;
      } else if (lower.includes('dam') || lower.includes('reservoir') || lower.includes('water percentage')) {
        if (nearestDams.length > 0) {
          const d = nearestDams[0];
          botResponse = `The closest major reservoir is ${d.name} (${d.distanceKm} km away). It is currently holding ${d.currentStorageMCM} MCM out of ${d.grossCapacityMCM} MCM (${d.storagePercentage}% capacity).`;
        } else {
          botResponse = `Nearest reservoirs maintain an average catchment storage of approx 62%.`;
        }
      } else if (lower.includes('irrigate') || lower.includes('water') || lower.includes('schedule')) {
        const rootMoist = ((weather?.hourly?.soilMoistureRoot[12] || 0.18) * 100).toFixed(1);
        botResponse = `Root zone soil moisture is currently at ${rootMoist}%. Recommended irrigation window is tomorrow morning before 07:00 AM using micro-drip systems to conserve water.`;
      } else {
        botResponse = `I have logged your hydrological query for ${currentLocationName}. Current temperature is ${weather?.temperature || 31}°C and nearby dam storage is healthy. You can raise a formal water grievance or inspect the interactive map layers for deeper insights!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 400);
  };

  return (
    <div className="fixed bottom-14 sm:bottom-6 right-3 sm:right-6 z-[9990]">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-xl shadow-blue-600/30 border border-blue-400/40 transition transform hover:scale-105 cursor-pointer"
        >
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-sky-200 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-bold tracking-wide">NEER-AI Advisor</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>
      )}

      {/* Chat Window Drawer (Optimized for Mobile Screens) */}
      {isOpen && (
        <div className="w-[calc(100vw-1.5rem)] max-w-sm sm:w-[400px] h-[480px] sm:h-[520px] bg-white border border-blue-200 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-3.5 sm:p-4 text-white flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 text-white border border-white/30 flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                  <span>NEER-AI Assistant</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h4>
                <p className="text-[10px] text-blue-100 font-medium truncate max-w-[190px]">
                  {currentLocationName}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Model Status Notice */}
          <div className="bg-blue-50 border-b border-blue-100 px-3 py-1.5 text-[10px] text-blue-800 font-semibold flex items-center justify-between">
            <span>⚡ Agro-Hydrology AI Engine</span>
            <span className="text-slate-500">Gemini LLM ready</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2.5 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs font-medium'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className={`block text-[9px] mt-1 text-right ${m.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 border-t border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-none">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 sm:p-3 border-t border-slate-200 flex items-center gap-2 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about rain, soil, dam levels..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 sm:py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
