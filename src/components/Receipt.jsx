// components/pos/Receipt.jsx
import React, { forwardRef, useState, useEffect } from 'react';
import { Coffee, Instagram, Wifi, MapPin, Phone } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const Receipt = forwardRef(({ data }, ref) => {
    // Math.random() yerine state kullanarak stabil bir ID üretimi sağlıyoruz
    const [orderNo, setOrderNo] = useState(null);

    useEffect(() => {
        if (data) {
            setOrderNo(data.subDetails?.orderNo || Math.floor(Math.random() * 8999) + 1000);
        }
    }, [data]);

    if (!data || !orderNo) return null;

    const { type, items, total, date, subDetails } = data;
    const rawTotal = subDetails?.rawTotal || total;
    const discount = subDetails?.discount || 0;

    return (
        <div ref={ref} className="w-[80mm] min-h-[120mm] bg-white text-black font-mono p-4 mx-auto antialiased">
            
            {/* --- 1. PREMIUM HEADER --- */}
            <div className="flex flex-col items-center mb-6">
                <div className="mb-2">
                    <Coffee size={28} strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl font-black tracking-[0.15em] mb-0.5">MOTTO</h1>
                <p className="text-[8px] tracking-[0.4em] font-light uppercase opacity-70 mb-4 text-center">
                    Roastery/Coffee/Patisserie
                </p>
                
                <div className="w-full flex items-center gap-2 mb-4">
                    <div className="flex-1 border-t border-black"></div>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Sipariş No: #{orderNo}</span>
                    <div className="flex-1 border-t border-black"></div>
                </div>

                <div className="text-center space-y-1 opacity-80 uppercase text-[8px] tracking-tighter">
                    <div className="flex items-center justify-center gap-1">
                        <MapPin size={8}/> <span>Cumhuriyet Cad. No:145/B Van</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                        <Phone size={8}/> <span>+90 (555) 123 45 67</span>
                    </div>
                </div>
            </div>

            {/* --- 2. TRANSACTION INFO --- */}
            <div className="flex justify-between text-[9px] font-bold border-y border-black py-2 mb-4">
                <div className="flex flex-col">
                    <span className="opacity-50 text-[7px]">TARİH</span>
                    <span>{date.split(' ')[0]}</span>
                </div>
                <div className="flex flex-col items-center border-x border-black/10 px-4">
                    <span className="opacity-50 text-[7px]">SAAT</span>
                    <span>{date.split(' ')[1]}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="opacity-50 text-[7px]">İŞLEM</span>
                    <span>{type || 'SATIŞ'}</span>
                </div>
            </div>

            {/* --- 3. ITEMS TABLE --- */}
            <div className="mb-6">
                <div className="flex justify-between text-[9px] font-black uppercase mb-2">
                    <span className="w-1/2">Açıklama</span>
                    <span className="w-[15%] text-center">Adet</span>
                    <span className="w-[35%] text-right">Tutar</span>
                </div>
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-[10px] leading-tight">
                            <div className="w-1/2 flex flex-col">
                                <span className="font-bold uppercase leading-none mb-0.5">{item.name}</span>
                                {item.option && <span className="text-[8px] italic opacity-60">+{item.option}</span>}
                            </div>
                            <span className="w-[15%] text-center font-medium">{item.quantity}</span>
                            <span className="w-[35%] text-right font-black tracking-tighter">
                                {formatCurrency(item.price * item.quantity)} ₺
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 4. CALCULATION --- */}
            <div className="space-y-1 border-t-2 border-black pt-2">
                <div className="flex justify-between text-[9px]">
                    <span className="opacity-70">ARA TOPLAM</span>
                    <span>{formatCurrency(rawTotal)} ₺</span>
                </div>
                
                {discount > 0 && (
                    <div className="flex justify-between text-[9px] font-bold">
                        <span className="opacity-70 uppercase">İNDİRİM / YUVARLAMA</span>
                        <span>-{formatCurrency(discount)} ₺</span>
                    </div>
                )}

                <div className="flex justify-between items-center py-2 mt-2 bg-black text-white px-2">
                    <span className="text-[11px] font-black tracking-widest uppercase">Genel Toplam</span>
                    <span className="text-lg font-black">{formatCurrency(total)} ₺</span>
                </div>
            </div>

            {/* --- 5. PREMIUM FOOTER --- */}
            <div className="mt-8 flex flex-col items-center">
                {/* Wifi & Info Box */}
                <div className="grid grid-cols-2 w-full gap-2 mb-6">
                    <div className="border border-black p-2 flex flex-col items-center justify-center text-center">
                        <Wifi size={14} className="mb-1"/>
                        <span className="text-[7px] font-bold uppercase opacity-50 leading-none">Guest Wifi</span>
                        <span className="text-[9px] font-black tracking-widest uppercase">motto2025</span>
                    </div>
                    <div className="border border-black p-2 flex flex-col items-center justify-center text-center">
                        <Instagram size={14} className="mb-1"/>
                        <span className="text-[7px] font-bold uppercase opacity-50 leading-none">Instagram</span>
                        <span className="text-[9px] font-black tracking-widest uppercase">@mottoyuksekova</span>
                    </div>
                </div>

                {/* QR Code Alanı */}
                <div className="w-full border-2 border-black p-2 flex items-center gap-4 mb-6">
                    <div className="p-1 bg-white border border-black shrink-0">
                        <a
                            href="https://me-qr.com"
                            target="_blank"
                            rel="noreferrer"
                            style={{ cursor: 'pointer', display: 'block' }}
                        >
                            <img
                                src="https://storage2.me-qr.com/qr/292842623.png?v=1766813340"
                                className="w-16 h-16 object-contain"
                                alt="Motto Coffee QR Code"
                            />
                        </a>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-tighter leading-none mb-1">
                            PUAN KAZAN / TAKİP ET
                        </span>
                        <span className="text-[8px] leading-tight opacity-70 italic">
                            Karekodu okutarak sadakat programımıza katılabilir, güncel kampanyalarımızdan haberdar olabilirsiniz.
                        </span>
                    </div>
                </div>

                <p className="text-[11px] font-black italic mb-1 uppercase tracking-wider">Kahvenin En İyi Hali</p>
                <p className="text-[8px] opacity-50 uppercase tracking-[0.2em] mb-4 text-center">Afiyet Olsun / Yine Bekleriz</p>
                
                <div className="text-[7px] opacity-30 tracking-[0.5em] overflow-hidden whitespace-nowrap">
                    *****************************************************
                </div>
            </div>
        </div>
    );
});

export default Receipt;