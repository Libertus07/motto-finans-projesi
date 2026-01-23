import React, { useState } from 'react';
import { Music, Play, SkipForward, Search, Heart, ListMusic } from 'lucide-react';

const JukeboxWidget: React.FC = () => {
    const [currentSong, setCurrentSong] = useState({
        title: 'Golden Age Jazz',
        artist: 'Motto Selection',
        cover: '🎷'
    });

    const [requests, setRequests] = useState([
        { id: 1, title: 'Autumn Leaves', artist: 'Cannonball Adderley', votes: 12, isVoted: false },
        { id: 2, title: 'Fly Me To The Moon', artist: 'Frank Sinatra', votes: 8, isVoted: true },
        { id: 3, title: 'Feeling Good', artist: 'Nina Simone', votes: 5, isVoted: false }
    ]);

    const handleVote = (id: number) => {
        setRequests(prev => prev.map(req => {
            if (req.id === id) {
                return { ...req, votes: req.isVoted ? req.votes - 1 : req.votes + 1, isVoted: !req.isVoted };
            }
            return req;
        }));
    };

    return (
        <div className="px-4 mt-6">
            <div className="bg-[#1a110d] rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/5">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>

                {/* Now Playing Section */}
                <div className="p-6 pb-4 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Music size={16} className="text-[#D4AF37]" />
                            <h3 className="text-[#FDFBF7] font-black font-cinzel text-xs tracking-[0.2em]">ŞU AN ÇALIYOR</h3>
                        </div>
                        <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-ping"></div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl backdrop-blur-sm border border-white/5">
                        <div className="w-16 h-16 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                            {currentSong.cover}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-[#FDFBF7] font-bold font-cinzel text-sm truncate">{currentSong.title}</h4>
                            <p className="text-white/40 text-[10px] font-medium tracking-widest uppercase mt-1">{currentSong.artist}</p>
                            <div className="flex gap-1 mt-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-[#D4AF37]' : 'bg-white/10'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Queue / Request Section */}
                <div className="px-6 py-6 pt-2 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ListMusic size={16} className="text-white/40" />
                            <span className="text-white/40 font-bold text-[10px] tracking-widest uppercase">SIRADAKİ İSTEKLER</span>
                        </div>
                        <button className="text-[#D4AF37] text-[10px] font-black font-cinzel tracking-widest flex items-center gap-1 hover:opacity-80">
                            TÜMÜ <SkipForward size={12} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {requests.map((song) => (
                            <div key={song.id} className="group flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all border border-transparent hover:border-white/5">
                                <div className="flex-1">
                                    <p className="text-white/90 font-bold text-xs font-cinzel truncate">{song.title}</p>
                                    <p className="text-white/30 text-[9px] font-medium mt-0.5">{song.artist}</p>
                                </div>
                                <button
                                    onClick={() => handleVote(song.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${song.isVoted ? 'bg-[#D4AF37] text-[#1a110d]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <Heart size={12} fill={song.isVoted ? 'currentColor' : 'none'} />
                                    <span className="text-[10px] font-black">{song.votes}</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Request Button */}
                    <button className="w-full mt-6 bg-[#D4AF37] text-[#1a110d] py-4 rounded-2xl font-black font-cinzel text-xs tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        <Search size={16} /> ŞARKI İSTEĞİNDE BULUN
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-16 -mb-16"></div>
            </div>
        </div>
    );
};

export default JukeboxWidget;
