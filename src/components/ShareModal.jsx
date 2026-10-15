import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, Download, QrCode } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export const ShareModal = ({ onClose }) => {
  const { itinerary, pandals, generateShareData } = useAppData();
  const [selectedDay, setSelectedDay] = useState('Saptami');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const days = ['Saptami', 'Ashtami', 'Navami', 'Dashami'];
  const shareData = generateShareData(selectedDay);

  // Generate plain-text formatted WhatsApp itinerary
  const generateFormattedText = () => {
    const items = itinerary[selectedDay] || [];
    let text = `🏮 *UtsavRoute: Durga Puja Itinerary - ${selectedDay}* 🏮\n\n`;
    if (items.length === 0) {
      text += `No pandals scheduled yet for ${selectedDay}.\n`;
    } else {
      items.forEach((item, idx) => {
        const p = pandals.find((pan) => pan.id === item.pandalId);
        if (p) {
          text += `${idx + 1}. *${p.name}* (${p.zone})\n`;
          if (p.nearest_metro) text += `   🚇 Metro: ${p.nearest_metro}\n`;
          if (item.notes) text += `   📝 Note: ${item.notes}\n`;
          text += `   📍 Map: ${p.google_maps_url}\n\n`;
        }
      });
    }
    text += `Explore and customize your Durga Puja routes on UtsavRoute PWA! ✨`;
    return text;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareData.shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateFormattedText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateFormattedText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-stone-900 border border-amber-500/30 rounded-3xl shadow-2xl p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Share2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Share Itinerary With Friends
          </span>
        </div>
        <h3 className="text-xl font-black text-stone-100 mb-4">
          Group Puja Trip Planner
        </h3>

        {/* Day Selector */}
        <div className="flex items-center gap-2 mb-4">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDay === d
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-stone-950/60 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Share Code Box */}
        <div className="bg-stone-950/80 rounded-2xl p-4 border border-stone-800 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Unique Puja Code:</span>
            <span className="font-mono font-bold text-amber-400">{shareData.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareData.shareUrl}
              className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Share via WhatsApp
          </button>

          <button
            onClick={handleCopyText}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 border border-stone-700 transition-all"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedText ? 'Itinerary Text Copied to Clipboard!' : 'Copy Formatted Itinerary Text'}
          </button>
        </div>
      </div>
    </div>
  );
};
