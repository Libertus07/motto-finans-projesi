import React, { forwardRef } from 'react';
import { formatCurrency } from '../utils/helpers';

const Receipt = forwardRef(({ data }, ref) => {
    if (!data) return null;

    const { title, type, date, items, total } = data;

    return (
        <div ref={ref} id="printable-receipt" className="hidden print:block p-4 w-[80mm] mx-auto bg-white text-black font-mono text-xs leading-tight">
            {/* BAŞLIK */}
            <div className="text-center mb-4 border-b border-black pb-2 border-dashed">
                <h2 className="text-xl font-bold uppercase">Motto Coffee</h2>
                <p className="text-[10px] mt-1">İstanbul Şubesi</p>
                <p className="text-[10px]">Tel: 0212 555 00 00</p>
            </div>

            {/* FİŞ BİLGİLERİ */}
            <div className="mb-4 text-[10px]">
                <div className="flex justify-between">
                    <span>Tarih:</span>
                    <span>{new Date().toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between font-bold mt-1">
                    <span>{type || 'Adisyon'}:</span>
                    <span>{title}</span>
                </div>
            </div>

            {/* ÜRÜNLER */}
            <div className="border-b border-black pb-2 border-dashed mb-2">
                <div className="flex justify-between font-bold border-b border-black border-dashed mb-1 pb-1">
                    <span className="w-1/2">Ürün</span>
                    <span className="w-1/4 text-center">Adet</span>
                    <span className="w-1/4 text-right">Tutar</span>
                </div>
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between mb-1">
                        <span className="w-1/2 truncate">{item.name}</span>
                        <span className="w-1/4 text-center">x{item.quantity}</span>
                        <span className="w-1/4 text-right">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                ))}
            </div>

            {/* TOPLAM */}
            <div className="text-right text-lg font-bold mt-2">
                TOPLAM: {formatCurrency(total)} ₺
            </div>

            {/* ALT BİLGİ */}
            <div className="text-center mt-6 text-[10px] border-t border-black pt-2 border-dashed">
                <p>Afiyet Olsun!</p>
                <p>Bizi tercih ettiğiniz için teşekkürler.</p>
                <p className="mt-2">Mali değeri yoktur.</p>
            </div>
        </div>
    );
});

export default Receipt;