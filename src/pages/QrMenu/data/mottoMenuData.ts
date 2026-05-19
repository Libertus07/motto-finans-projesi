import { Product } from '../../../types';

export const MOTTO_MENU_CATEGORIES = [
    'İmza Kahveler',
    'Kokteyl & Özel İçecekler',
    'Soğuk Kahveler',
    'Soğuk İçecekler',
    'Sıcak Kahveler',
    'Sıcak İçecekler',
    'Pastalar',
    'Sütlü Tatlılar',
    'Milkshake & Frappe',
    'Frozen & Bubble Tea',
    'Dondurmalar',
    'Yöresel Kahveler'
];

export const MOTTO_MENU_PRODUCTS: Product[] = [
    { id: 'imza-1', name: 'Motto Special Latte', price: 175, cost: 0, category: 'İmza Kahveler', image: '☕', order: 1 },
    { id: 'imza-2', name: 'Antep Fıstıklı Latte', price: 195, cost: 0, category: 'İmza Kahveler', image: '☕', order: 2 },
    { id: 'imza-3', name: 'Lotus Latte', price: 195, cost: 0, category: 'İmza Kahveler', image: '☕', order: 3 },
    { id: 'imza-4', name: 'Oreo Latte', price: 195, cost: 0, category: 'İmza Kahveler', image: '☕', order: 4 },
    { id: 'imza-5', name: 'Nutella Cappuccino', price: 195, cost: 0, category: 'İmza Kahveler', image: '☕', order: 5 },

    { id: 'kokteyl-1', name: 'Italian Sodası', price: 160, cost: 0, category: 'Kokteyl & Özel İçecekler', image: '🍹', description: 'Bol buzlu ve canlandırıcı soda ferahlığı. Orman Meyveleri & Limon / Mango & Ananas', order: 10 },
    { id: 'kokteyl-2', name: 'Motto Kokteyl', price: 170, cost: 0, category: 'Kokteyl & Özel İçecekler', image: '🍹', description: 'Ananas ve portakalın eşsiz uyumu.', order: 11 },
    { id: 'kokteyl-3', name: 'Kuzu Kulağı', price: 170, cost: 0, category: 'Kokteyl & Özel İçecekler', image: '🍹', description: 'Motto’dan bir ilk. Alışılmadık ama bağımlılık yapacak bir tat.', order: 12 },
    { id: 'kokteyl-4', name: 'Beach of Motto', price: 170, cost: 0, category: 'Kokteyl & Özel İçecekler', image: '🍹', description: 'Narenciye ve kızılcığın enerjisiyle adeta bir sahil rüyası.', order: 13 },
    { id: 'kokteyl-5', name: 'Savaya', price: 170, cost: 0, category: 'Kokteyl & Özel İçecekler', image: '🍹', description: 'Şeftali ve narın yumuşak esintisiyle meyvemsi bir rüzgar.', order: 14 },

    { id: 'soguk-kahve-1', name: 'Iced Motto Special Latte', price: 175, cost: 0, category: 'Soğuk Kahveler', image: '🧊', order: 20 },
    { id: 'soguk-kahve-2', name: 'Iced Pistachio Latte', price: 195, cost: 0, category: 'Soğuk Kahveler', image: '🧊', order: 21 },
    { id: 'soguk-kahve-3', name: 'Iced Lotus Latte', price: 195, cost: 0, category: 'Soğuk Kahveler', image: '🧊', order: 22 },
    { id: 'soguk-kahve-4', name: 'Iced White Strawberry Latte', price: 195, cost: 0, category: 'Soğuk Kahveler', image: '🧊', order: 23 },
    { id: 'soguk-kahve-5', name: 'Iced Caffe Latte', price: 140, cost: 0, category: 'Soğuk Kahveler', image: '🧊', order: 24 },
    { id: 'soguk-kahve-6', name: 'Iced Caffe Mocha', price: 150, cost: 0, category: 'Soğuk Kahveler', image: '🧊', order: 25 },
    { id: 'soguk-kahve-7', name: 'Iced Madagaskar Latte', price: 160, cost: 0, category: 'Soğuk Kahveler', image: '🧊', order: 26 },

    { id: 'soguk-icecek-1', name: 'Sıkma Meyve Suyu', price: 150, cost: 0, category: 'Soğuk İçecekler', image: '🥤', description: 'Portakal / Nar', order: 30 },
    { id: 'soguk-icecek-2', name: 'Limonata', price: 140, cost: 0, category: 'Soğuk İçecekler', image: '🥤', order: 31 },
    { id: 'soguk-icecek-3', name: 'Monster Energy', price: 100, cost: 0, category: 'Soğuk İçecekler', image: '🥤', description: 'Ultra / Watermelon / Mango', order: 32 },
    { id: 'soguk-icecek-4', name: 'Churchill', price: 90, cost: 0, category: 'Soğuk İçecekler', image: '🥤', order: 33 },
    { id: 'soguk-icecek-5', name: 'Coca Cola', price: 80, cost: 0, category: 'Soğuk İçecekler', image: '🥤', order: 34 },
    { id: 'soguk-icecek-6', name: 'Fanta', price: 80, cost: 0, category: 'Soğuk İçecekler', image: '🥤', order: 35 },
    { id: 'soguk-icecek-7', name: 'Sprite', price: 80, cost: 0, category: 'Soğuk İçecekler', image: '🥤', order: 36 },

    { id: 'sicak-kahve-1', name: 'Americano', price: 135, cost: 0, category: 'Sıcak Kahveler', image: '🔥', order: 40 },
    { id: 'sicak-kahve-2', name: 'Filtre Kahve', price: 135, cost: 0, category: 'Sıcak Kahveler', image: '🔥', order: 41 },
    { id: 'sicak-kahve-3', name: 'Madagaskar Latte', price: 160, cost: 0, category: 'Sıcak Kahveler', image: '🔥', order: 42 },
    { id: 'sicak-kahve-4', name: 'Caffè Latte', price: 140, cost: 0, category: 'Sıcak Kahveler', image: '🔥', order: 43 },
    { id: 'sicak-kahve-5', name: 'Caffè Mocha', price: 150, cost: 0, category: 'Sıcak Kahveler', image: '🔥', order: 44 },
    { id: 'sicak-kahve-6', name: 'White Chocolate Mocha', price: 150, cost: 0, category: 'Sıcak Kahveler', image: '🔥', order: 45 },
    { id: 'sicak-kahve-7', name: 'Caramel Latte', price: 150, cost: 0, category: 'Sıcak Kahveler', image: '🔥', order: 46 },

    { id: 'sicak-icecek-1', name: 'Motto Special Atom Çayı', price: 175, cost: 0, category: 'Sıcak İçecekler', image: '🫖', description: 'Bitki ve meyvelerin balın doğallığıyla birleştiği özel kış çayı.', order: 50 },
    { id: 'sicak-icecek-2', name: 'Çay', price: 30, cost: 0, category: 'Sıcak İçecekler', image: '🫖', order: 51 },
    { id: 'sicak-icecek-3', name: 'Fincan Çay', price: 50, cost: 0, category: 'Sıcak İçecekler', image: '🫖', order: 52 },
    { id: 'sicak-icecek-4', name: 'Bitki Çayları', price: 165, cost: 0, category: 'Sıcak İçecekler', image: '🫖', description: 'Ihlamur, Hibiscus, Kış Çayı, Nane Limon, Orman Meyve, Elma, Kuşburnu, Ada, Yeşil, Papatya.', order: 53 },
    { id: 'sicak-icecek-5', name: 'Taneli Meyve Çayları', price: 125, cost: 0, category: 'Sıcak İçecekler', image: '🫖', description: 'Elma, karadut, kivi, nar, çilek, mandalina, kayısı, kuşburnu, nane limon, hurma, ballı muz.', order: 54 },

    { id: 'pasta-1', name: 'Special Tereyağlı Kruvasan', price: 280, cost: 0, category: 'Pastalar', image: '🥐', description: 'Çikolatalı & meyveli.', order: 60 },
    { id: 'pasta-2', name: 'Motto Spesiyal Profiterol', price: 250, cost: 0, category: 'Pastalar', image: '🍰', order: 61 },
    { id: 'pasta-3', name: 'Sufle', price: 240, cost: 0, category: 'Pastalar', image: '🍰', description: 'Dondurma +40 TL.', order: 62 },
    { id: 'pasta-4', name: 'San Sebastian', price: 240, cost: 0, category: 'Pastalar', image: '🍰', order: 63 },
    { id: 'pasta-5', name: 'Cheesecake Çeşitleri', price: 220, cost: 0, category: 'Pastalar', image: '🍰', order: 64 },
    { id: 'pasta-6', name: 'Tiramisu', price: 220, cost: 0, category: 'Pastalar', image: '🍰', order: 65 },
    { id: 'pasta-7', name: 'Browni', price: 220, cost: 0, category: 'Pastalar', image: '🍰', order: 66 },

    { id: 'sutlu-1', name: 'Magnolia', price: 190, cost: 0, category: 'Sütlü Tatlılar', image: '🍮', order: 70 },
    { id: 'sutlu-2', name: 'Fırın Sütlaç', price: 170, cost: 0, category: 'Sütlü Tatlılar', image: '🍮', order: 71 },
    { id: 'sutlu-3', name: 'Spangile', price: 170, cost: 0, category: 'Sütlü Tatlılar', image: '🍮', order: 72 },
    { id: 'sutlu-4', name: 'Çikolatalı Islak Kek', price: 170, cost: 0, category: 'Sütlü Tatlılar', image: '🍮', order: 73 },
    { id: 'sutlu-5', name: 'Frambuazlı Islak Kek', price: 170, cost: 0, category: 'Sütlü Tatlılar', image: '🍮', order: 74 },
    { id: 'sutlu-6', name: 'Lotuslu Islak Kek', price: 170, cost: 0, category: 'Sütlü Tatlılar', image: '🍮', order: 75 },

    { id: 'milkshake-1', name: 'Frappe Çeşitleri', price: 175, cost: 0, category: 'Milkshake & Frappe', image: '🥛', description: 'Vanilyalı, çikolatalı, çilekli, karamelli.', order: 80 },
    { id: 'milkshake-2', name: 'Nutella Milkshake', price: 170, cost: 0, category: 'Milkshake & Frappe', image: '🥛', order: 81 },
    { id: 'milkshake-3', name: 'Verde Blanc Milkshake', price: 170, cost: 0, category: 'Milkshake & Frappe', image: '🥛', order: 82 },
    { id: 'milkshake-4', name: 'Cinderella Milkshake', price: 170, cost: 0, category: 'Milkshake & Frappe', image: '🥛', order: 83 },

    { id: 'frozen-1', name: 'Mango & Ananas Frozen', price: 160, cost: 0, category: 'Frozen & Bubble Tea', image: '🧋', order: 90 },
    { id: 'frozen-2', name: 'Karpuz & Çilek Frozen', price: 160, cost: 0, category: 'Frozen & Bubble Tea', image: '🧋', order: 91 },
    { id: 'frozen-3', name: 'Yuzu & Şeftali Frozen', price: 160, cost: 0, category: 'Frozen & Bubble Tea', image: '🧋', order: 92 },
    { id: 'frozen-4', name: 'Ananas & Portakal & Limon Frozen', price: 160, cost: 0, category: 'Frozen & Bubble Tea', image: '🧋', order: 93 },
    { id: 'frozen-5', name: 'Orman Meyveli Frozen', price: 160, cost: 0, category: 'Frozen & Bubble Tea', image: '🧋', order: 94 },
    { id: 'frozen-6', name: 'Fresh Bubble', price: 170, cost: 0, category: 'Frozen & Bubble Tea', image: '🧋', description: 'Yeşil elma bubble’ları ve taze nane ferahlığı.', order: 95 },

    { id: 'dondurma-1', name: 'Porsiyon Dondurma', price: 180, cost: 0, category: 'Dondurmalar', image: '🍨', order: 100 },
    { id: 'dondurma-2', name: 'Vanilya Top', price: 50, cost: 0, category: 'Dondurmalar', image: '🍨', order: 101 },
    { id: 'dondurma-3', name: 'Çikolata Top', price: 50, cost: 0, category: 'Dondurmalar', image: '🍨', order: 102 },
    { id: 'dondurma-4', name: 'Karamel Top', price: 50, cost: 0, category: 'Dondurmalar', image: '🍨', order: 103 },
    { id: 'dondurma-5', name: 'Limon Top', price: 50, cost: 0, category: 'Dondurmalar', image: '🍨', order: 104 },
    { id: 'dondurma-6', name: 'Fıstık Top', price: 50, cost: 0, category: 'Dondurmalar', image: '🍨', order: 105 },
    { id: 'dondurma-7', name: 'Oreo Top', price: 50, cost: 0, category: 'Dondurmalar', image: '🍨', order: 106 },

    { id: 'yoresel-1', name: 'Türk Kahvesi', price: 110, cost: 0, category: 'Yöresel Kahveler', image: '☕', description: 'Double +20 TL.', order: 110 },
    { id: 'yoresel-2', name: 'Dibek Kahvesi', price: 125, cost: 0, category: 'Yöresel Kahveler', image: '☕', description: 'Double +20 TL.', order: 111 },
    { id: 'yoresel-3', name: 'Menengiç Kahvesi', price: 125, cost: 0, category: 'Yöresel Kahveler', image: '☕', description: 'Double +20 TL.', order: 112 },
    { id: 'yoresel-4', name: 'Osmanlı Kahvesi', price: 125, cost: 0, category: 'Yöresel Kahveler', image: '☕', description: 'Double +20 TL.', order: 113 },
    { id: 'yoresel-5', name: 'Damla Sakızlı Türk Kahvesi', price: 130, cost: 0, category: 'Yöresel Kahveler', image: '☕', description: 'Double +20 TL.', order: 114 },
    { id: 'yoresel-6', name: 'Dağ Çilekli Türk Kahvesi', price: 130, cost: 0, category: 'Yöresel Kahveler', image: '☕', description: 'Double +20 TL.', order: 115 }
];