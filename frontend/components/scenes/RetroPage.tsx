'use client';

import { useState } from 'react';

export function RetroPage({ visible }: { visible: boolean }) {
  const [activeTab, setActiveTab] = useState<'lore' | 'quests' | 'guild'>('lore');

  if (!visible) return null;

  return (
    <main className="fixed inset-0 bg-[linear-gradient(135deg,#0a0a0c,#16161e,#0c0c0e)] flex flex-col items-center justify-center z-[500] animate-in fade-in duration-1000">
      <div className="max-w-5xl w-full px-6 flex flex-col items-center text-white text-center space-y-12 overflow-y-auto max-h-[100vh] py-12">
        
        <div className="space-y-6">
          <div className="inline-block px-4 py-2 border-2 border-blue-500 rounded-full text-[10px] md:text-xs font-retro text-blue-400 mb-2 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            IEEE RAIT JUNIOR COMMITTEE REACHED
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Welcome to the RAIT GYM
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Crafting digital experiences, hardware innovations, and massive tech events that feel like high-adventure RPGs.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-6 md:gap-12 w-full">
          {(['lore', 'quests', 'guild'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`group flex flex-col items-center space-y-2 p-2 ${activeTab === tab ? 'text-blue-400' : 'text-white'}`}
            >
              <span className={`text-[10px] md:text-xs font-retro uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-blue-400' : 'group-hover:text-blue-300'}`}>
                {tab}
              </span>
              <div className={`h-1 bg-blue-500 nav-line ${activeTab === tab ? 'w-full' : 'w-0'}`}></div>
            </button>
          ))}
        </nav>

        <div className="w-full min-h-[300px]">
          {activeTab === 'lore' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-left hover:border-blue-500/50 transition-colors">
                <h3 className="text-xs font-retro text-blue-300 mb-4">Core & Operations</h3>
                <p className="text-sm text-gray-400">The backbone of our guild. Managing events, logistics, and the grand strategy of the IEEE RAIT chapter.</p>
              </div>
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-left hover:border-purple-500/50 transition-colors">
                <h3 className="text-xs font-retro text-purple-300 mb-4">Research & Development</h3>
                <p className="text-sm text-gray-400">Forging new technologies in hardware and software. We build the weapons for tomorrow&apos;s challenges.</p>
              </div>
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-left hover:border-green-500/50 transition-colors">
                <h3 className="text-xs font-retro text-green-300 mb-4">Sponsorship</h3>
                <p className="text-sm text-gray-400">The merchants and diplomats securing resources and alliances with top tech corporations.</p>
              </div>
              <div className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-left hover:border-red-500/50 transition-colors">
                <h3 className="text-xs font-retro text-red-300 mb-4">Creatives</h3>
                <p className="text-sm text-gray-400">The bards and artisans crafting visual identities, UI/UX, and capturing the essence of our journey.</p>
              </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 rounded-xl bg-black/40 border-2 border-yellow-500/30 text-left flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded flex items-center justify-center font-retro text-2xl text-yellow-500 shrink-0">
                  ★
                </div>
                <div>
                  <h3 className="text-sm font-retro text-yellow-400 mb-2">Main Quest: Hardware Hackathon</h3>
                  <p className="text-sm text-gray-400">Successfully hosted 500+ participants for a 24-hour hardware innovation marathon.</p>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-black/40 border-2 border-blue-500/30 text-left flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded flex items-center justify-center font-retro text-2xl text-blue-500 shrink-0">
                  ⚔
                </div>
                <div>
                  <h3 className="text-sm font-retro text-blue-400 mb-2">Side Quest: AI Workshop</h3>
                  <p className="text-sm text-gray-400">Trained 200+ students in modern LLM architecture and deployment strategies.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guild' && (
            <div className="max-w-lg mx-auto animate-in zoom-in duration-500">
              <div className="p-8 rounded-xl bg-black/60 border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <h2 className="font-retro text-xl text-white mb-6">Join the Guild</h2>
                <form className="flex flex-col gap-4 text-left">
                  <div>
                    <label className="font-retro text-[8px] text-gray-400 mb-2 block">TRAINER NAME</label>
                    <input type="text" className="w-full bg-black/50 border border-gray-600 rounded p-3 text-white font-body focus:outline-none focus:border-green-500 transition-colors" placeholder="Ash Ketchum" />
                  </div>
                  <div>
                    <label className="font-retro text-[8px] text-gray-400 mb-2 block">CLASS (DOMAIN)</label>
                    <select className="w-full bg-black/50 border border-gray-600 rounded p-3 text-white font-body focus:outline-none focus:border-green-500 transition-colors appearance-none">
                      <option>Core & Operations</option>
                      <option>Research & Development</option>
                      <option>Creatives</option>
                      <option>Sponsorship</option>
                    </select>
                  </div>
                  <button type="button" className="mt-4 bg-green-600 hover:bg-green-500 text-white font-retro text-xs py-4 rounded border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all">
                    START ADVENTURE
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
