const fs = require('fs');

let content = fs.readFileSync('src/components/EventsView.tsx', 'utf8');

// Remove isTranslateOn from interface
content = content.replace("  isTranslateOn: boolean;\n  onToggleTranslate: () => void;\n", "");

// Remove from args
content = content.replace("isTranslateOn, onToggleTranslate", "");

// Remove const t
content = content.replace("  const t = (ja: string, vi: string) => (isTranslateOn ? vi : ja);\n\n", "");

// Replace isTranslateOn usage
content = content.replace(/isTranslateOn \? 'vi-VN' : 'ja-JP'/g, "'ja-JP'");

// Manually filter out the Translation Switch lines without using regex across newlines
const lines = content.split('\n');
let newLines = [];
let inSwitch = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Translation Switch */}')) {
    inSwitch = true;
  }
  if (!inSwitch) {
    newLines.push(lines[i]);
  }
  if (inSwitch && lines[i].includes('JP ↔ VN</p>')) {
    i++; // skip the next </div> as well
    inSwitch = false;
  }
}

content = newLines.join('\n');

// Replace card fields
const cardFields = `
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-2">
                                 <Tag className="w-3.5 h-3.5" />
                                 <span>{event.price || '無料'} • {event.format || 'オフライン'}</span>
                              </div>`;
content = content.replace(/(<div className="flex items-center gap-2 text-xs font-medium text-slate-400">\s*<MapPin className="w-3.5 h-3.5" \/>\s*<span>\{event.location\}<\/span>\s*<\/div>)/, `$1${cardFields}`);

// Replace detail fields
const detailFields = `
                            <div className="flex items-start gap-4 mt-6">
                               <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                                  <Users className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-slate-900">{featuredEvent.capacity > 0 ? \`定員: \${featuredEvent.capacity}名\` : '定員: 制限なし'}</p>
                               </div>
                            </div>
                            
                            <div className="flex items-start gap-4 mt-6">
                               <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
                                  <Tag className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-slate-900">{featuredEvent.price || '無料'}</p>
                                  <p className="text-xs font-bold text-slate-400 mt-1">{featuredEvent.format || 'オフライン'}</p>
                               </div>
                            </div>
                            
                            {featuredEvent.languageRequirement && (
                              <div className="flex items-start gap-4 mt-6">
                                 <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 flex-shrink-0">
                                    <Globe className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">言語要件</p>
                                    <p className="text-sm font-bold text-slate-900">{featuredEvent.languageRequirement}</p>
                                 </div>
                              </div>
                            )}`;

content = content.replace(/(<div className="flex items-start gap-4">\s*<div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">\s*<MapPin className="w-5 h-5" \/>\s*<\/div>\s*<div>\s*<p className="text-sm font-bold text-slate-900">\{featuredEvent.location\}<\/p>\s*<\/div>\s*<\/div>)/, `$1${detailFields}`);

if (!content.includes('Tag, ')) {
  content = content.replace(/Search, Calendar, MapPin, Users, Heart, Share2, Info, ChevronRight, Globe, Bookmark, Loader2, Languages/, 'Search, Calendar, MapPin, Users, Heart, Share2, Info, ChevronRight, Globe, Bookmark, Loader2, Languages, Tag');
}

// Write the file
fs.writeFileSync('src/components/EventsView.tsx', content);
