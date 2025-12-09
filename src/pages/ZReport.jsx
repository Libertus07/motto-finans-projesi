import React, { useState, useMemo } from 'react';
import { FileText, Printer, Coffee, DollarSign, CreditCard, Banknote, ChevronsRight, MinusCircle, PlusCircle } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import Receipt from '../components/Receipt'; // Yazdırma için

const ZReport = ({ transactions }) => {
    const [printData, setPrintData] = useState(null);
    const today = new Date().toISOString().split('T')[0];

    // --- RAPOR HESAPLAMALARI ---
    const report = useMemo(() => {
        const todaysTransactions = transactions.filter(t => t.date === today);

        const summary = todaysTransactions.reduce((acc, t) => {
            const amount = Number(t.amount);
            acc.totalTransactions += 1;

            if (t.type === 'income') {
                acc.grossSales += amount;
                if (t.subMethod && t.subMethod.includes('Kart')) acc.cardSales += amount;
                else acc.cashSales += amount;
            } else if (t.type === 'expense') {
                acc.totalExpense += amount;
            }
            return acc;
        }, { grossSales: 0, cashSales: 0, cardSales: 0, totalExpense: 0, totalTransactions: 0 });

        summary.netCiro = summary.grossSales - summary.totalExpense;
        return summary;
    }, [transactions, today]);

    // --- YAZDIRMA MANTIĞI ---
    const handlePrintZReport = () => {
        const reportItems = [
            { name: "TOPLAM CİRO", total: report.grossSales },
            { name: "TOPLAM GİDER", total: report.totalExpense * -1 },
            { name: "NAKİT SATIŞ", total: report.cashSales },
            { name: "KART SATIŞ", total: report.cardSales },
        ];
        
        setPrintData({
            title: `Günlük Z Raporu`,
            type: `TARİH: ${new Date().toLocaleDateString('tr-TR')}`,
            items: reportItems.map(item => ({
                name: item.name,
                quantity: 1,
                price: item.total
            })),
            total: report.netCiro
        });

        setTimeout(() => window.print(), 100);
    };

    // İkon Renkleri
    const color = report.netCiro >= 0 ? 'text-emerald-400' : 'text-red-400';

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="text-pink-400"/> Günlük Z Raporu</h2>
                <div className="text-sm text-slate-400">Tarih: <span className="font-bold text-white">{today}</span></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Net Ciro */}
                <div className={`bg-slate-800 p-5 rounded-2xl border ${report.netCiro >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'} flex flex-col justify-between`}>
                    <p className="text-xs text-slate-400 font-bold uppercase">Net Kasa (Ciro - Gider)</p>
                    <h3 className={`text-2xl font-extrabold ${color} mt-1`}>{formatCurrency(report.netCiro)} ₺</h3>
                </div>

                {/* Toplam Satış (Gross Ciro) */}
                <div className="bg-slate-800 p-5 rounded-2xl border border-indigo-500/30">
                    <p className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><Coffee size={14}/> Brüt Ciro</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{formatCurrency(report.grossSales)} ₺</h3>
                </div>
                
                {/* Nakit Satış */}
                <div className="bg-slate-800 p-5 rounded-2xl border border-amber-500/30">
                    <p className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><Banknote size={14}/> Nakit Satış</p>
                    <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{formatCurrency(report.cashSales)} ₺</h3>
                </div>

                {/* Kart Satış */}
                <div className="bg-slate-800 p-5 rounded-2xl border border-blue-500/30">
                    <p className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><CreditCard size={14}/> Kart Satış</p>
                    <h3 className="text-2xl font-extrabold text-blue-400 mt-1">{formatCurrency(report.cardSales)} ₺</h3>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h3 className="font-bold text-white mb-4">Gider / Toplam İşlem Özeti</h3>
                <div className="grid grid-cols-3 text-sm font-medium">
                    <p className="text-slate-400 flex items-center gap-2"><MinusCircle size={16} className="text-red-400"/> Toplam Gider</p>
                    <p className="text-right text-red-400 font-bold">{formatCurrency(report.totalExpense)} ₺</p>
                    <p className="text-right text-slate-500">{report.totalTransactions} İşlem</p>
                </div>
            </div>

            <button 
                onClick={handlePrintZReport} 
                className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-pink-900/30"
            >
                <Printer size={20}/> Z RAPORUNU YAZDIR
            </button>

            {/* GİZLİ FİŞ BİLEŞENİ (Yazdırma sırasında devreye girer) */}
            <Receipt data={printData} />
        </div>
    );
};

export default ZReport;