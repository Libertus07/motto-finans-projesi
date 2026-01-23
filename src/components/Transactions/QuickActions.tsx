import React from 'react';
import { Zap, Settings, X } from 'lucide-react';
import { QuickAction } from '../../types';

interface NewShortcut {
    label: string;
    type: string;
    desc: string;
}

interface QuickActionsProps {
    isPatron: boolean;
    isEditingShortcuts: boolean;
    setIsEditingShortcuts: (val: boolean) => void;
    newShortcut: NewShortcut;
    setNewShortcut: (val: NewShortcut) => void;
    handleAddQuickAction: () => void;
    quickActions: QuickAction[];
    applyQuickAction: (action: QuickAction) => void;
    handleDeleteQuickAction: (id: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
    isPatron,
    isEditingShortcuts,
    setIsEditingShortcuts,
    newShortcut,
    setNewShortcut,
    handleAddQuickAction,
    quickActions,
    applyQuickAction,
    handleDeleteQuickAction
}) => {
    return (
        <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-800/50 shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 shadow-lg">
                        <Zap size={20} strokeWidth={2.5} className="animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Motto Quick-Pad</h4>
                    </div>
                </div>
                {isPatron && (
                    <button
                        onClick={() => setIsEditingShortcuts(!isEditingShortcuts)}
                        className={`p-2.5 rounded-xl transition-all border ${isEditingShortcuts
                            ? 'bg-rose-500 text-white border-rose-400'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                    >
                        <Settings size={18} />
                    </button>
                )}
            </div>

            {isPatron && isEditingShortcuts && (
                <div className="mb-6 p-6 rounded-3xl bg-slate-950/80 border border-indigo-500/30 animate-in zoom-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            type="text"
                            placeholder="İşlem Adı"
                            value={newShortcut.label}
                            onChange={(e) => setNewShortcut({ ...newShortcut, label: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500"
                        />
                        <select
                            value={newShortcut.type}
                            onChange={(e) => setNewShortcut({ ...newShortcut, type: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-sm outline-none"
                        >
                            <option value="income">Gelir</option>
                            <option value="expense">Gider</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Açıklama"
                            value={newShortcut.desc}
                            onChange={(e) => setNewShortcut({ ...newShortcut, desc: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-sm outline-none"
                        />
                        <button
                            onClick={handleAddQuickAction}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black py-3 rounded-xl uppercase"
                        >
                            Ekle
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
                {quickActions?.map((action) => (
                    <div key={action.id} className="relative shrink-0 snap-center group/item">
                        <button
                            onClick={() => !isEditingShortcuts && applyQuickAction(action)}
                            className={`flex flex-col items-center justify-center w-[110px] h-[110px] rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden group/btn ${isEditingShortcuts
                                ? 'border-dashed border-slate-600 opacity-60'
                                : action.type === 'income'
                                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500'
                                    : 'bg-slate-800/40 border-slate-700 hover:border-indigo-500'
                                }`}
                        >
                            <div className={`mb-2 p-3 rounded-2xl ${action.type === 'income'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-900 text-slate-400'
                                }`}>
                                <span>{typeof action.icon === 'string' ? action.icon : (action.icon || '⚡')}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-200 uppercase tracking-tighter">
                                {action.label}
                            </span>
                            <div className={`absolute top-4 right-4 w-1.5 h-1.5 rounded-full ${action.type === 'income' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                                }`}></div>
                        </button>
                        {isEditingShortcuts && (
                            <button
                                onClick={() => handleDeleteQuickAction(action.id)}
                                className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1.5 border-2 border-slate-900"
                            >
                                <X size={10} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
