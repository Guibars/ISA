import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Loader2, Square, X, ImageIcon, ArrowLeft, ZoomIn, Search, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import IsaSphere from './IsaSphere';
import { getChatSession, ai, SYSTEM_INSTRUCTION } from '../lib/gemini';
import { startLiveSession, endLiveSession } from '../lib/audio';
import { STRUCTURE_PARTS } from '../data/structures';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Get only the base64 part
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
}

const SUGGESTIONS = [
  "O que significa MLPE?",
  "Nosso kit acompanha cabo tronco?",
  "O que vem na caixa do micro?",
  "O que é retrofit?",
  "Quais marcas de híbridos?"
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string, attachments?: string[]}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isIsaSpeaking, setIsIsaSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{file: File, previewUrl: string} | null>(null);
  
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryBrand, setGalleryBrand] = useState('Todas');
  const [galleryCategory, setGalleryCategory] = useState('Todas');

  const filteredGallery = STRUCTURE_PARTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(gallerySearch.toLowerCase());
    const matchesBrand = galleryBrand === 'Todas' || p.brand === galleryBrand;
    const matchesCategory = galleryCategory === 'Todas' || p.category === galleryCategory;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isLiveMode) {
        endLiveSession();
      }
    };
  }, [isLiveMode]);

  const handleSend = async (presetText?: string) => {
    const textToSend = typeof presetText === 'string' ? presetText : input;
    
    if (!textToSend.trim() && !selectedImage && !isLiveMode) return;
    
    const userMessage = textToSend.trim();
    const imageToSend = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    
    setMessages(prev => [
      ...prev, 
      { role: 'user', content: userMessage, attachments: imageToSend ? [imageToSend.previewUrl] : [] }
    ]);
    setIsTyping(true);

    try {
      if (imageToSend) {
        const base64Data = await fileToBase64(imageToSend.file);
        
        const contents = [
           { text: SYSTEM_INSTRUCTION },
        ];
        
        contents.push({ text: userMessage || 'O que é isso?' });
        contents.push({
           inlineData: {
              data: base64Data,
              mimeType: imageToSend.file.type,
           }
        } as any);

        const responseStream = await ai.models.generateContentStream({
           model: 'gemini-3.1-pro-preview',
           contents: contents,
        });

        setMessages(prev => [...prev, { role: 'model', content: '' }]);
        for await (const chunk of responseStream) {
           setMessages(prev => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1].content += chunk.text;
              return newMsgs;
           });
        }
        
      } else {
        const chat = getChatSession();
        const responseStream = await chat.sendMessageStream({ message: userMessage });
        setMessages(prev => [...prev, { role: 'model', content: '' }]);
        for await (const chunk of responseStream) {
           setMessages(prev => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1].content += chunk.text;
              return newMsgs;
           });
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', content: 'Desculpe, ocorreu um erro de conexão.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMicClick = async () => {
    if (!isLiveMode) {
       setIsLiveMode(true);
       try {
         await startLiveSession(
           (isSpeaking) => setIsIsaSpeaking(isSpeaking),
           (text) => {} // We can log text if transcriptions are enabled
         );
       } catch (err) {
         console.error(err);
         setIsLiveMode(false);
       }
    } else {
       setIsLiveMode(false);
       endLiveSession();
       setIsIsaSpeaking(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return;
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage({ file, previewUrl });
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setSelectedImage(null);
    if (isLiveMode) {
      setIsLiveMode(false);
      endLiveSession();
      setIsIsaSpeaking(false);
    }
  };

  const isActiveView = isLiveMode || isTyping || isIsaSpeaking;
  const activeMessageContent = (isTyping || isLiveMode) && messages.length > 0 && messages[messages.length - 1].role === 'model' ? messages[messages.length - 1].content : '';

  return (
    <div className="flex flex-col h-full relative w-full overflow-hidden">
      <div className={`ai-edge-particles ${isActiveView ? 'active' : ''}`}>
        <div className="ai-edge-inner-1"></div>
        <div className="ai-edge-inner-2"></div>
      </div>

      {isGalleryOpen && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="bg-[#080B10]/90 border border-white/10 shadow-2xl rounded-[32px] w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-semibold text-white">Galeria de Peças e Estruturas</h2>
              <button 
                onClick={() => setIsGalleryOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 border-b border-white/5 bg-white/5">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Buscar peça por nome..."
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  className="w-full bg-[#080B10]/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-[#fab515]/50 transition-colors"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select 
                  value={galleryBrand}
                  onChange={(e) => setGalleryBrand(e.target.value)}
                  className="bg-[#080B10]/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#fab515]/50 flex-1 md:w-40 appearance-none"
                >
                  <option value="Todas">Marcas</option>
                  <option value="CCM">CCM</option>
                  <option value="Solar Group">Solar Group</option>
                  <option value="Pratyc">Pratyc</option>
                  <option value="Solar A+">Solar A+</option>
                </select>
                <select 
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value)}
                  className="bg-[#080B10]/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#fab515]/50 flex-1 md:w-48 appearance-none"
                >
                  <option value="Todas">Categorias</option>
                  <option value="Fibrocimento">Fibrocimento</option>
                  <option value="Fibrometal">Fibrometal</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
              {filteredGallery.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/50">
                  <p>Nenhuma peça encontrada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredGallery.map(part => (
                    <div key={part.id} className="liquid-glass-depth rounded-2xl overflow-hidden group border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="h-48 w-full bg-white/5 p-4 flex items-center justify-center relative">
                        {part.brandLogo && (
                          <img src={part.brandLogo} alt={part.brand} className="absolute top-3 right-3 w-8 h-8 md:w-10 md:h-10 object-contain opacity-50 drop-shadow-md z-10" />
                        )}
                        <img src={part.imageUrl} alt={part.name} className="max-h-full max-w-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80">{part.brand}</span>
                          <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full bg-[#fab515]/20 text-[#fab515]">{part.category}</span>
                        </div>
                        <h3 className="text-white font-medium text-sm md:text-base leading-tight">{part.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(messages.length > 0 || isLiveMode) && !isActiveView && (
        <button 
          onClick={resetChat}
          className="liquid-glass-pill rounded-full absolute top-4 left-4 md:top-8 md:left-8 z-50 p-2.5 md:p-3 text-white/70 hover:text-white animate-in fade-in"
          title="Encerrar chat e voltar ao estado inicial"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {/* Active Modal Overlay */}
      <div 
         className={`absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isActiveView ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
      >
         <div className="w-64 h-64 md:w-96 md:h-96 relative flex items-center justify-center mb-8 pointer-events-auto">
           <IsaSphere 
             isSpeaking={isIsaSpeaking || (isTyping && messages.length > 0 && messages[messages.length - 1].role === 'model')} 
             isListening={isLiveMode && !isIsaSpeaking} 
             isThinking={isTyping && !(messages.length > 0 && messages[messages.length - 1].role === 'model')}
           />
         </div>
         
         <div className="max-w-3xl text-center z-20 min-h-[100px] flex flex-col items-center justify-center pointer-events-auto">
           {isLiveMode && !isIsaSpeaking && !activeMessageContent && (
              <p className="text-white/60 text-lg md:text-xl font-medium animate-pulse mb-8">Pode falar, estou ouvindo...</p>
           )}
           
           {activeMessageContent && (
              <div className="prose prose-invert prose-lg md:prose-2xl max-w-none text-white/90 font-medium leading-relaxed drop-shadow-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                   {activeMessageContent}
                </ReactMarkdown>
              </div>
           )}

           {isLiveMode && (
              <button 
                onClick={handleMicClick}
                className="mt-12 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 hover:border-red-500/50 flex items-center justify-center hover:bg-red-500/20 transition-all shadow-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] group"
               >
                 <Square className="w-6 h-6 md:w-8 md:h-8 text-white/50 group-hover:text-red-500 fill-current transition-colors" />
              </button>
           )}
         </div>
      </div>

      {/* Main Background Container */}
      <div 
        className={`flex flex-col flex-1 w-full h-full relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform origin-bottom ${
          isActiveView ? 'scale-[0.93] -translate-y-4 opacity-20 blur-[2px] pointer-events-none' : 'scale-100 translate-y-0 opacity-100 blur-none pointer-events-auto'
        }`}
      >
        <div className={`transition-all duration-1000 ease-out flex flex-col items-center justify-center ${messages.length === 0 ? 'flex-1' : 'mt-4 md:mt-8 h-20 md:h-32 shrink-0'}`}>
          <div className={`relative transition-all duration-1000 flex items-center justify-center ${messages.length === 0 ? 'w-32 h-32 md:w-48 md:h-48 mb-8 md:mb-12' : 'w-0 h-0 opacity-0 overflow-hidden'}`}>
              <img 
                src="https://res.cloudinary.com/dsctpzqvy/image/upload/v1776894302/I_1_jmecmo.png" 
                className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(250,181,21,0.2)] animate-float" 
                alt="ISA Logo" 
              />
          </div>
        </div>

        {(messages.length > 0) && (
          <div className="flex-1 overflow-y-auto w-full px-4 md:px-8 pb-4 scrollbar-hide" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 100%)' }}>
            <div className="max-w-4xl mx-auto w-full space-y-6 pt-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] md:max-w-[75%] p-5 rounded-[28px] transition-transform hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 ${
                      msg.role === 'user' 
                        ? 'liquid-glass rounded-br-[8px] text-white' 
                        : 'liquid-glass-depth rounded-bl-[8px] text-white/95'
                    }`}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                       <div className="mb-3 flex flex-wrap gap-2">
                         {msg.attachments.map((url, idx) => (
                            <img key={idx} src={url} alt="Uploaded" className="max-w-full h-auto rounded-xl max-h-64 md:max-h-80 object-cover border border-white/20" />
                         ))}
                       </div>
                    )}
                    {msg.content && (
                       <div className="prose prose-invert prose-sm md:prose-base max-w-none">
                         <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              img: ({node, ...props}) => (
                                <span className="flex justify-center my-6 w-full">
                                  <img 
                                    className="liquid-glass-pill rounded-2xl max-w-full drop-shadow-2xl border border-white/10 p-2 bg-white/5 object-contain max-h-[300px]" 
                                    {...props} 
                                  />
                                </span>
                              ),
                              a: ({node, ...props}) => (
                                <a 
                                  {...props}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-5 py-3 mt-4 mb-2 font-medium text-white/90 no-underline liquid-glass-pill rounded-xl border border-white/10 hover:border-white/30 hover:-translate-y-1 transition-all shadow-lg group"
                                >
                                  <div className="bg-[#fab515] p-1.5 rounded-lg text-[#080B10] group-hover:scale-110 transition-transform">
                                    <FileDown className="w-4 h-4" />
                                  </div>
                                  <span>{props.children}</span>
                                </a>
                              )
                            }}
                         >
                            {msg.content}
                         </ReactMarkdown>
                       </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && !isActiveView && (
                 <div className="flex justify-start">
                   <div className="liquid-glass-depth p-4 rounded-[28px] rounded-bl-[8px] flex items-center justify-center">
                     <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        )}

        <div className="w-full bg-gradient-to-t from-[#080B10] via-[#080B10]/95 to-transparent pb-safe pt-8">
          {messages.length === 0 && (
            <div className="max-w-4xl mx-auto w-full px-4 md:px-8 mb-4 overflow-hidden">
              <div 
                ref={scrollContainerRef}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                className="flex overflow-x-auto scrollbar-hide gap-2 md:gap-3 pb-2 select-none"
              >
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="liquid-glass-pill rounded-full whitespace-nowrap px-4 py-2 text-white/90 font-medium text-sm md:text-base shrink-0 border-transparent hover:border-white/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto w-full px-4 md:px-8 mb-4">
            <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageSelect}
            />
            
            {selectedImage && (
              <div className="mb-3 flex items-center gap-3">
                 <div className="relative inline-block">
                   <img src={selectedImage.previewUrl} alt="Preview" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border-2 border-[#fab515]/50 shadow-lg" />
                   <button 
                     onClick={() => setSelectedImage(null)}
                     className="absolute -top-2 -right-2 bg-[#0d518E] text-white rounded-full p-1 border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:bg-white hover:text-[#0d518E] transition"
                   >
                     <X className="w-3 h-3 md:w-4 md:h-4" />
                   </button>
                 </div>
              </div>
            )}

            <div className="liquid-glass-depth rounded-[32px] p-2 md:p-3 flex items-center gap-2">
              <button 
                  onClick={() => setIsGalleryOpen(true)}
                  className="p-3 md:p-4 liquid-glass-pill rounded-full text-[#fab515] hover:text-[#fab515]/80 shrink-0 border border-[#fab515]/20"
                  title="Buscar nas Estruturas"
              >
                <ZoomIn className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 md:p-4 liquid-glass-pill rounded-full text-white/70 hover:text-white shrink-0"
                  title="Enviar imagem"
              >
                <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Digite sua dúvida aqui..."
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-base md:text-lg p-2 md:p-3"
              />
              {input.trim() || selectedImage ? (
                <button 
                  onClick={() => handleSend()}
                  className="p-3 md:p-4 bg-[#fab515] text-[#080B10] rounded-full hover:brightness-110 transition-all font-semibold shrink-0"
                >
                  <Send className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
                </button>
              ) : (
                <button 
                  onClick={handleMicClick}
                  className="p-3 md:p-4 liquid-glass-pill text-white rounded-full shrink-0"
                >
                  <Mic className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
