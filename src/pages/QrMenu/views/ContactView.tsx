import React from 'react';
import {
    Clock,
    Instagram,
    MapPin,
    Phone,
    Wifi,
    MessageCircle,
    Navigation
} from 'lucide-react';

const ContactView: React.FC = () => {
    return (
        <main className="min-h-screen bg-[#FDFBF7] pb-32 px-5 pt-8 text-[#432818]">
            <header className="text-center mb-8">
                <p className="text-[#D4AF37] text-xs font-black tracking-[0.35em] uppercase mb-2">
                    İletişim
                </p>

                <h1 className="text-3xl font-black tracking-tight">
                    Motto Coffee
                </h1>

                <p className="text-[#432818]/55 font-semibold mt-2">
                    Wake up to a new motto!
                </p>
            </header>

            <section className="space-y-4">
                <InfoCard
                    icon={<MapPin size={22} />}
                    title="Adres"
                    text="İpek Yolu Caddesi Halkbank karşısı Altekin Plaza altı, Yüksekova / Hakkari"
                />

                <InfoCard
                    icon={<Phone size={22} />}
                    title="Telefon"
                    text="0545 560 92 45"
                />

                <InfoCard
                    icon={<Clock size={22} />}
                    title="Çalışma Saatleri"
                    text="08:00 - 01:00"
                />

                <InfoCard
                    icon={<Wifi size={22} />}
                    title="Wi-Fi"
                    text="motto2026"
                />

                <InfoCard
                    icon={<Instagram size={22} />}
                    title="Instagram"
                    text="@mottoyuksekova"
                />
            </section>

            <section className="grid grid-cols-3 gap-3 mt-7">
                <a
                    href="tel:05455609245"
                    className="h-16 rounded-[1.4rem] bg-[#432818] text-[#D4AF37] flex flex-col items-center justify-center gap-1 font-black text-xs shadow-lg shadow-[#432818]/15"
                >
                    <Phone size={19} />
                    Ara
                </a>

                <a
                    href="https://wa.me/905455609245"
                    target="_blank"
                    rel="noreferrer"
                    className="h-16 rounded-[1.4rem] bg-white text-[#432818] border border-[#432818]/10 flex flex-col items-center justify-center gap-1 font-black text-xs shadow-md shadow-[#432818]/5"
                >
                    <MessageCircle size={19} />
                    WhatsApp
                </a>

                <a
                    href="https://www.google.com/maps/search/?api=1&query=Motto+Coffee+Y%C3%BCksekova"
                    target="_blank"
                    rel="noreferrer"
                    className="h-16 rounded-[1.4rem] bg-white text-[#432818] border border-[#432818]/10 flex flex-col items-center justify-center gap-1 font-black text-xs shadow-md shadow-[#432818]/5"
                >
                    <Navigation size={19} />
                    Yol Tarifi
                </a>
            </section>
        </main>
    );
};

function InfoCard({
    icon,
    title,
    text
}: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (
        <div className="bg-white border border-[#432818]/10 rounded-[1.8rem] p-5 shadow-[0_10px_30px_rgba(67,40,24,0.06)] flex gap-4 items-start">
            <div className="w-12 h-12 rounded-[1.2rem] bg-[#432818]/5 text-[#432818] flex items-center justify-center shrink-0">
                {icon}
            </div>

            <div>
                <h3 className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.18em] mb-1">
                    {title}
                </h3>
                <p className="text-[#432818] font-semibold leading-relaxed">
                    {text}
                </p>
            </div>
        </div>
    );
}

export default ContactView;