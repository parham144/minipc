import React, { useState, useMemo } from 'react';
import { 
  productsData 
} from './data';
import { 
  Product, 
  CategoryType, 
  UseCaseType, 
  CartItem 
} from './types';
import { 
  Search, 
  ShoppingCart, 
  Cpu, 
  X, 
  Star, 
  Check, 
  RotateCcw, 
  Info, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  Sparkles, 
  Laptop, 
  Monitor, 
  Maximize2, 
  Percent, 
  Truck,
  Layers,
  Activity,
  Phone
} from 'lucide-react';

export default function App() {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<UseCaseType[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(80000000);
  const [minPrice, setMinPrice] = useState<number>(10000000);
  const [sortBy, setSortBy] = useState<'popular' | 'priceAsc' | 'priceDesc' | 'rating'>('popular');

  // Interactive UX States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  
  // Hardware Advisor States
  const [advisorBudget, setAdvisorBudget] = useState<number>(40000000);
  const [advisorUseCase, setAdvisorUseCase] = useState<UseCaseType>('office');
  const [advisorRecommendation, setAdvisorRecommendation] = useState<Product | null>(null);
  const [showAdvisorResult, setShowAdvisorResult] = useState(false);
  
  // AI Consultation States
  const [aiTab, setAiTab] = useState<'calc' | 'ai'>('calc');
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'سلام! من مشاور هوشمند و متخصص سخت‌افزار فروشگاه الوند هستم. سؤالی در مورد مینی‌کامپیوترها، سخت‌افزار، مقایسه پردازنده‌ها یا ابعاد مینی‌کیس‌ها دارید؟ یا مایلید بر اساس بودجه خود بهترین سیستم را به صورت هوشمند و زنده پیشنهاد دهم؟ خوشحال می‌شوم کمکتان کنم! 😊' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Checkout Form States
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Available brands in our data
  const brands = useMemo(() => {
    return Array.from(new Set(productsData.map(p => p.brand)));
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return productsData
      .filter(product => {
        const targetSearch = `${product.name} ${product.englishName} ${product.brand} ${product.shortDescription} ${product.specs.cpu}`.toLowerCase();
        if (searchQuery && !targetSearch.includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
          return false;
        }

        if (selectedUseCases.length > 0 && !selectedUseCases.includes(product.useCase)) {
          return false;
        }

        if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
          return false;
        }

        const actualPrice = product.discountPrice || product.price;
        if (actualPrice < minPrice || actualPrice > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const pA = a.discountPrice || a.price;
        const pB = b.discountPrice || b.price;
        
        if (sortBy === 'priceAsc') return pA - pB;
        if (sortBy === 'priceDesc') return pB - pA;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });
  }, [searchQuery, selectedCategories, selectedUseCases, selectedBrands, minPrice, maxPrice, sortBy]);

  // Advisor logic
  const handleCalculateAdvisor = () => {
    const matches = productsData.filter(product => {
      const price = product.discountPrice || product.price;
      return price <= advisorBudget && product.useCase === advisorUseCase;
    });

    if (matches.length > 0) {
      const best = matches.sort((a, b) => b.rating - a.rating)[0];
      setAdvisorRecommendation(best);
    } else {
      const underBudget = productsData.filter(product => {
        const price = product.discountPrice || product.price;
        return price <= advisorBudget;
      });
      if (underBudget.length > 0) {
        setAdvisorRecommendation(underBudget.sort((a, b) => b.rating - a.rating)[0]);
      } else {
        setAdvisorRecommendation(productsData.sort((a, b) => a.price - b.price)[0]);
      }
    }
    setShowAdvisorResult(true);
  };

  const handleSendAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userMsg = aiInput;
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsg,
          history: aiMessages
        }),
      });

      if (!res.ok) {
        throw new Error('مشکل در برقراری ارتباط با مشاور هوشمند');
      }

      const data = await res.json();
      setAiMessages(prev => [...prev, { role: 'assistant', text: data.response || "خطایی نامشخص ایجاد گردیده است." }]);
    } catch (err: any) {
      console.error(err);
      setAiMessages(prev => [...prev, { role: 'assistant', text: "❌ متاسفانه خطایی رخ داد. کلید API در Secrets وجود ندارد یا مشکلی پیش آمده است." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const formatPrice = (num: number) => {
    return num.toLocaleString('fa-IR') + ' تومان';
  };

  const getCategoryLabel = (cat: CategoryType) => {
    switch (cat) {
      case 'minipc': return 'مینی کامپیوتر';
      case 'minicase': return 'مینی کیس';
      case 'laptop': return 'لپ‌تاپ جیبی';
    }
  };

  const getUseCaseLabel = (uc: UseCaseType) => {
    switch (uc) {
      case 'office': return 'اداری و خانگی عمومی';
      case 'gaming': return 'گیمینگ و رندرینگ حرفه‌ای';
      case 'engineering': return 'برنامه‌نویسی و کارهای مهندسی';
      case 'portable': return 'کارهای پرتابل و مسافرتی مکرر';
    }
  };

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: qty } : item));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }, [cart]);

  // Comparison logic
  const toggleCompare = (product: Product) => {
    setCompareProducts(prev => {
      const alreadyChecked = prev.find(p => p.id === product.id);
      if (alreadyChecked) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 3) {
        alert('حداکثر امکان مقایسه همزمان ۳ کالا وجود دارد.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedUseCases([]);
    setSelectedBrands([]);
    setMinPrice(10000000);
    setMaxPrice(80000000);
    setSearchQuery('');
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !shippingAddress) {
      alert('لطفاً تمام اطلاعات ستاره‌دار را تکمیل کنید.');
      return;
    }
    setOrderCompleted(true);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans transition-all duration-300">
      
      {/* HEADER SECTION - Beautiful Blue and White Palette */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo and Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-blue-950 tracking-tight leading-none">مینی‌استور</h1>
                <span className="text-xs text-blue-600 font-medium mt-1 block">مرجع تخصصی مینی‌کامپیوتر و کیس‌های فشرده</span>
              </div>
            </div>

            {/* Global live search bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
              <input
                type="text"
                placeholder="جستجو در بین محبوب‌ترین مینی کیس‌ها و لپ‌تاپ‌ها..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pr-11 pl-4 py-2.5 text-base text-slate-800 placeholder-slate-400 outline-hidden transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-4 top-3 w-5 h-5 text-slate-400" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Top Navigation CTA & Tools */}
            <div className="flex items-center gap-4">
              
              {/* Quick Assistant recommendation shortcut */}
              <button
                onClick={() => {
                  const element = document.getElementById('consultant-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="hidden lg:flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                مشاور خرید هوشمند
              </button>

              {/* Compare Button with counter */}
              {compareProducts.length > 0 && (
                <button
                  onClick={() => setIsCompareOpen(true)}
                  className="relative flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-sm font-bold transition border border-slate-200 cursor-pointer"
                >
                  <Scale className="w-5 h-5 text-blue-600" />
                  <span className="hidden sm:inline">مقایسه دسکتاپ</span>
                  <span className="bg-blue-600 text-white font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {compareProducts.length}
                  </span>
                </button>
              )}

              {/* Shopping Cart trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-blue-600 text-white hover:bg-blue-700 p-2.5 sm:px-4 sm:py-2.5 rounded-xl flex items-center gap-2.5 transition shadow-lg shadow-blue-100 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline font-bold">سبد خرید</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:relative sm:top-0 sm:right-0 bg-white text-blue-700 font-extrabold rounded-full w-5.5 h-5.5 flex items-center justify-center text-xs shadow-xs">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE LIVE SEARCH PANEL */}
      <div className="md:hidden block bg-white px-4 py-3 border-b border-slate-100">
        <div className="relative">
          <input
            type="text"
            placeholder="جستجوی مینی کامپیوترها..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pr-11 pl-4 py-2.5 text-base text-slate-800 placeholder-slate-400 outline-hidden transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-4 top-3 w-5 h-5 text-slate-400" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-3 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
        
        {/* HERO BANNER - Elegant Layout and Copy */}
        <section className="bg-gradient-to-r from-blue-600/5 to-indigo-500/5 rounded-3xl border border-blue-50 overflow-hidden relative p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Copywriting */}
            <div className="lg:col-span-7 space-y-6 text-right z-10">
              <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4" />
                تحول در ابعاد، تبلور در قدرت
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                نسل جدید <span className="text-blue-600">مینی کامپیوتر‌ها</span> و لپ‌تاپ‌های فوق‌فشرده دسکتاپ
              </h2>
              
              <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                برترین تجهیزات تکنولوژی جهان با اشغال کمترین فضای ممکنه روی دسکتاپ کاری شما. دیگر نیازی به خرید کیس‌های غول‌آسا، پرصدا و پرمصرف نیست. بازدهی فوق‌العاده با پردازنده‌های روز دنیا در مینی‌کیس‌های بی‌صدا.
              </p>

              {/* Quick highlights */}
              <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
                <div className="flex items-center gap-2 text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                  <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse"></span>
                  <span className="font-semibold text-sm text-slate-800">۸۵٪ صرفه‌جویی در مصرف برق</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                  <span className="font-semibold text-sm text-slate-800">۹۰٪ فضای کوچک‌تر دسکتاپ</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  <span className="font-semibold text-sm text-slate-800">خنک‌کنندگی سایلنت فوق‌پایدار</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                  <span className="font-semibold text-sm text-slate-800">گارانتی تعویض و خدمات اصیل</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive SVG Schematic Component */}
            <div className="lg:col-span-5 h-full flex items-center justify-center z-10">
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-100/80 border border-slate-100 w-full max-w-md relative select-none">
                
                <span className="absolute top-4 right-4 bg-slate-100 text-slate-600 text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm">
                  System Schematic v4.1
                </span>

                <svg className="w-full h-auto aspect-square text-blue-600" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="25" y="25" width="150" height="150" rx="20" className="stroke-blue-600 stroke-2 fill-blue-50/20" />
                  
                  <line x1="25" y1="50" x2="175" y2="50" className="stroke-blue-100 stroke-1" strokeDasharray="3 3" />
                  <line x1="25" y1="75" x2="175" y2="75" className="stroke-blue-100 stroke-1" strokeDasharray="3 3" />
                  <line x1="25" y1="100" x2="175" y2="100" className="stroke-blue-100 stroke-1" strokeDasharray="3 3" />
                  <line x1="25" y1="125" x2="175" y2="125" className="stroke-blue-100 stroke-1" strokeDasharray="3 3" />
                  <line x1="25" y1="150" x2="175" y2="150" className="stroke-blue-100 stroke-1" strokeDasharray="3 3" />
                  
                  <line x1="50" y1="25" x2="50" y2="175" className="stroke-blue-100 stroke-1" strokeDasharray="3 3" />
                  <line x1="75" y1="25" x2="75" y2="175" className="stroke-blue-100 stroke-1" strokeDasharray="3 3" />
                  <line x1="100" y1="25" x2="100" y2="175" className="stroke-blue-100 stroke-1" strokeDasharray="3 3" />
                  <line x1="125" y1="25" x2="125" y2="175" className="stroke-blue-100 stroke-1" strokeDasharray="3 3" />
                  <line x1="150" y1="25" x2="150" y2="175" className="stroke-blue-100 stroke-1" strokeDasharray="3 3" />

                  <rect x="40" y="38" width="120" height="14" rx="3" className="stroke-blue-400 stroke-1 fill-blue-100/50" />
                  <line x1="48" y1="45" x2="152" y2="45" className="stroke-blue-300 stroke-1" />
                  <line x1="48" y1="41" x2="152" y2="41" className="stroke-blue-300 stroke-1" />
                  <line x1="48" y1="49" x2="152" y2="49" className="stroke-blue-300 stroke-1" />

                  <rect x="75" y="75" width="50" height="50" rx="8" className="stroke-blue-600 stroke-2 fill-white shadow-xs" />
                  <rect x="85" y="85" width="30" height="30" rx="4" className="stroke-blue-500 fill-blue-500/10 stroke-1" />
                  <text x="100" y="103" textAnchor="middle" className="fill-blue-700 text-[10px] font-bold font-sans">M2 / i7</text>
                  
                  <path d="M 60,110 L 75,100" className="stroke-blue-400 stroke-2" />
                  <path d="M 140,110 L 125,100" className="stroke-blue-400 stroke-2" />

                  <rect x="60" y="62" width="35" height="6" rx="1" className="stroke-blue-500 fill-blue-500/10 stroke-1" />
                  <rect x="105" y="62" width="35" height="6" rx="1" className="stroke-blue-500 fill-blue-500/10 stroke-1" />

                  <rect x="45" y="80" width="14" height="40" rx="2" className="stroke-blue-500 fill-blue-50 stroke-1" />
                  <circle cx="52" cy="112" r="2" className="fill-blue-500" />
                  <circle cx="52" cy="88" r="1.5" className="fill-slate-400" />

                  <rect x="78" y="152" width="20" height="10" rx="2" className="stroke-blue-500 fill-blue-100" />
                  <rect x="102" y="152" width="20" height="10" rx="2" className="stroke-slate-400 fill-slate-100" />
                  <circle cx="60" cy="157" r="4" className="stroke-blue-500 stroke-1" />
                  <circle cx="138" cy="157" r="3" className="stroke-blue-500 stroke-1" />
                </svg>

                <div className="text-center mt-4">
                  <h4 className="text-sm font-bold text-slate-800">کالبدشکافی مینی کیس‌های پیشرفته</h4>
                  <p className="text-xs text-slate-500 mt-1">ترازبندی بی عیب و نقص پورت‌ها، مادربورد فشرده و دفع بهینه حرارت</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* PRIMARY LAYOUT - Sticky Sidebar Filters + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* STICKY SIDEBAR FILTERS */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-24 self-start space-y-6 transition-all">
              
              {/* Filter Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-[#212529] text-lg">فیلترهای انتخابی</h3>
                </div>
                {(selectedCategories.length > 0 || selectedUseCases.length > 0 || selectedBrands.length > 0 || searchQuery !== '') && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-bold transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    پاکسازی همه
                  </button>
                )}
              </div>

              {/* CATEGORY FILTER */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-base">نوع دستگاه</h4>
                <div className="space-y-2">
                  {[
                    { id: 'minipc', label: 'مینی کامپیوتر' },
                    { id: 'minicase', label: 'مینی کیس نیمه‌آماده' },
                    { id: 'laptop', label: 'لپ‌تاپ جیبی همراه' }
                  ].map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id as CategoryType);
                    return (
                      <label 
                        key={cat.id} 
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-sm font-semibold cursor-pointer transition ${isChecked ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedCategories(prev => 
                                isChecked ? prev.filter(c => c !== cat.id) : [...prev, cat.id as CategoryType]
                              );
                            }}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500"
                          />
                          <span>{cat.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* USER CASE / CARBARI FILTER */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 text-base">نوع کاربری مدنظر</h4>
                <div className="space-y-2">
                  {[
                    { id: 'office', label: 'اداری و خانگی عمومی' },
                    { id: 'gaming', label: 'گیمینگ و رندرینگ' },
                    { id: 'engineering', label: 'برنامه‌نویسی و طراحی' },
                    { id: 'portable', label: 'مسافرتی و همراه اول' }
                  ].map((uc) => {
                    const isChecked = selectedUseCases.includes(uc.id as UseCaseType);
                    return (
                      <label 
                        key={uc.id} 
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-sm font-semibold cursor-pointer transition ${isChecked ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedUseCases(prev => 
                                isChecked ? prev.filter(u => u !== uc.id) : [...prev, uc.id as UseCaseType]
                              );
                            }}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500"
                          />
                          <span>{uc.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* BRAND FILTER */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 text-base">برند تولیدکننده</h4>
                <div className="grid grid-cols-2 gap-2">
                  {brands.map((brand) => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        onClick={() => {
                          setSelectedBrands(prev => 
                            isChecked ? prev.filter(b => b !== brand) : [...prev, brand]
                          );
                        }}
                        className={`p-2 rounded-xl text-center border text-sm font-bold transition flex items-center justify-center gap-1 cursor-pointer ${isChecked ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                        <span>{brand}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* INTERACTIVE PRICE RANGE SLIDER */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-base">محدوده قیمت</h4>
                  <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">تومان</span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 block">حداکثر بودجه خرید:</label>
                    <input
                      type="range"
                      min="10000000"
                      max="80000000"
                      step="1000000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-800 pt-1">
                      <span>{formatPrice(maxPrice)}</span>
                      <span className="text-slate-400">۸۰ میلیون</span>
                    </div>
                  </div>

                  {/* Speed presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      onClick={() => { setMinPrice(10000000); setMaxPrice(25000000); }}
                      className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 px-2 py-1.5 rounded-md border border-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      زیر ۲۵ م.ت
                    </button>
                    <button
                      onClick={() => { setMinPrice(25000000); setMaxPrice(50000000); }}
                      className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 px-2 py-1.5 rounded-md border border-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      ۲۵ تا ۵۰ م.ت
                    </button>
                    <button
                      onClick={() => { setMinPrice(50000000); setMaxPrice(80000000); }}
                      className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 px-2 py-1.5 rounded-md border border-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      بالای ۵۰ م.ت
                    </button>
                  </div>
                </div>
              </div>

              {/* Consultation Hotline Support widget */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-4.5 space-y-3 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <Phone className="w-24 h-24 text-white" />
                </div>
                <h5 className="font-bold text-sm tracking-wide text-blue-300">سوالی دارید؟ نیاز به مشاوره؟</h5>
                <p className="text-xs text-slate-300 leading-relaxed">کارشناسان مینی‌استور همواره آماده ارائه مشاوره فنی قبل از خرید جهت انتخاب بهترین کانفیگ به شما هستند.</p>
                <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-sm">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-base tracking-widest text-slate-100">۰۲۱-۹۱۰۳۱۰۱۰</span>
                </div>
              </div>

            </div>
          </aside>

          {/* MAIN PRODUCT LIST GRID */}
          <section className="lg:col-span-3 space-y-6">
            
            {/* Sorting, count and quick settings header */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-extrabold text-base sm:text-lg">لیست محصولات</span>
                <span className="bg-blue-50 text-blue-700 font-black px-2.5 py-1 rounded-lg text-sm">
                  {filteredProducts.length} دستگاه یافت شد
                </span>
              </div>

              {/* Sorting filters */}
              <div className="flex flex-wrap items-center gap-2 text-sm w-full sm:w-auto">
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">ترتیب نمایش:</span>
                <div className="grid grid-cols-4 bg-slate-50 p-1 rounded-xl w-full sm:w-auto gap-1">
                  {[
                    { id: 'popular', label: 'محبوب‌ترین' },
                    { id: 'rating', label: 'امتیار بالا' },
                    { id: 'priceAsc', label: 'ارزان‌ترین' },
                    { id: 'priceDesc', label: 'گران‌ترین' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSortBy(opt.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 cursor-pointer text-center ${sortBy === opt.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filters chips list */}
            {(selectedCategories.length > 0 || selectedUseCases.length > 0 || selectedBrands.length > 0 || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 bg-blue-50/40 border border-blue-50/80 p-3 rounded-xl">
                <span className="text-xs text-slate-500 font-bold">فیلترهای فعال:</span>
                
                {selectedCategories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1 bg-white text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-200">
                    {getCategoryLabel(cat)}
                    <button onClick={() => setSelectedCategories(c => c.filter(item => item !== cat))}>
                      <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                    </button>
                  </span>
                ))}
                
                {selectedUseCases.map(uc => (
                  <span key={uc} className="inline-flex items-center gap-1 bg-white text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-200">
                    {getUseCaseLabel(uc)}
                    <button onClick={() => setSelectedUseCases(u => u.filter(item => item !== uc))}>
                      <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                    </button>
                  </span>
                ))}

                {selectedBrands.map(brand => (
                  <span key={brand} className="inline-flex items-center gap-1 bg-white text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-200">
                    {brand}
                    <button onClick={() => setSelectedBrands(b => b.filter(item => item !== brand))}>
                      <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                    </button>
                  </span>
                ))}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-white text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-200">
                    کلیدواژه: {searchQuery}
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-3 h-3 text-red-500 hover:text-red-700" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Empty view state */}
            {filteredProducts.length === 0 && (
              <div className="bg-white border border-slate-200 text-center py-16 px-6 rounded-2xl flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">هیچ محصولی با شرایط شما یافت نشد!</h3>
                <p className="text-slate-500 text-sm max-w-md">محدوده قیمت یا تیک فیلترهای انتخابی خود را تغییر دهید تا محصولات بیشتری ظاهر شوند، یا به چت مشاور هوشمند پایین صفحه رجوع کنید.</p>
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition cursor-pointer"
                >
                  حذف تمامی فیلترهای کنونی
                </button>
              </div>
            )}

            {/* PRODUCT CARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const hasDiscount = !!product.discountPrice;
                const displayPrice = product.discountPrice || product.price;
                const isCompared = compareProducts.some(p => p.id === product.id);

                return (
                  <article 
                    key={product.id}
                    id={`product-card-${product.id}`}
                    className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col relative group hover:shadow-lg hover:shadow-slate-100 cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    
                    {/* Highlight Badge */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1 rounded-md tracking-wider">
                        {getCategoryLabel(product.category)}
                      </span>
                      {product.stockStatus === 'low' && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm">
                          رو به اتمام
                        </span>
                      )}
                    </div>

                    {/* Stock & Rating overlay top-left */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-100 text-xs font-bold text-slate-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                    </div>

                    {/* Styled Tech-icon graphic card top - Fits product category */}
                    <div className="h-44 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-6 relative group bg-linear-to-b from-[#f8f9fa] to-white">
                      
                      {product.category === 'minipc' ? (
                        <div className="w-24 h-24 bg-blue-100/40 rounded-xl border border-blue-200/50 flex flex-col items-center justify-center relative p-3">
                          <Cpu className="w-10 h-10 text-blue-600" />
                          <span className="text-[10px] font-mono font-bold text-slate-600 mt-2">{product.brand} PC</span>
                          <span className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                      ) : product.category === 'minicase' ? (
                        <div className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-300 flex flex-col items-center justify-center relative p-3">
                          <div className="w-full h-1.5 bg-slate-400 rounded-sm mb-1"></div>
                          <Layers className="w-8 h-8 text-slate-600" />
                          <span className="text-[9px] font-mono text-slate-500 mt-2">Mini Case 8L</span>
                          <span className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-blue-50 rounded-xl border border-blue-200 flex flex-col items-center justify-center relative p-2">
                          <Laptop className="w-10 h-10 text-indigo-600" />
                          <span className="text-[10px] font-mono font-bold text-slate-600 mt-2">10.1" Touch</span>
                          <span className="absolute top-2 right-2 w-2 h-1 bg-red-400 rounded-full animate-pulse"></span>
                        </div>
                      )}

                      {/* Prompt visual on hover */}
                      <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                        <span className="bg-white text-blue-700 font-extrabold text-xs px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm flex items-center gap-1 uppercase tracking-wide">
                          <Maximize2 className="w-3.5 h-3.5" />
                          مشاهده مشخصات دقیق
                        </span>
                      </div>
                    </div>

                    {/* Product Card Details */}
                    <div className="p-5 flex-1 flex flex-col space-y-3">
                      
                      <span className="text-xs text-blue-600 font-extrabold tracking-widest block uppercase">
                        {product.brand}
                      </span>

                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition">
                          {product.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 tracking-tight">
                          {product.englishName}
                        </p>
                      </div>

                      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>

                      {/* Key hardware attributes highlighted clearly */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-700 bg-slate-50/60 p-2 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate font-medium">{product.specs.cpu.split('(')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-[8px] shrink-0">R</span>
                          <span className="truncate font-medium">{product.specs.ram.split('(')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2 border-t border-slate-100/60 pt-1">
                          <span className="w-2.5 h-2.5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center font-bold text-[8px] shrink-0">S</span>
                          <span className="truncate font-medium text-slate-500">{product.specs.storage}</span>
                        </div>
                      </div>

                      {/* Pricing and discounts section */}
                      <div className="pt-2 flex items-baseline justify-between mt-auto">
                        <div className="flex flex-col">
                          {hasDiscount && (
                            <span className="text-xs line-through text-slate-400 font-medium">
                              {product.price.toLocaleString('fa-IR')}
                            </span>
                          )}
                          <span className="text-lg font-extrabold text-[#212529] tracking-tight">
                            {formatPrice(displayPrice)}
                          </span>
                        </div>
                        {hasDiscount && (
                          <span className="bg-red-50 text-red-700 text-xs font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Percent className="w-3 h-3" />
                            تخفیف ویژه
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Bottom Utility Actions */}
                    <div 
                      className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(product)}
                          className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>مقایسه فنی</span>
                      </label>

                      <button
                        onClick={() => addToCart(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 transition duration-200 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        افزودن به سبد
                      </button>
                    </div>

                  </article>
                );
              })}
            </div>

          </section>

        </div>

        {/* INTERACTIVE PURCHASE HARDWARE ASSISTANT / ADVISOR WIDGET */}
        <section id="consultant-section" className="bg-white p-6 sm:p-10 rounded-3xl border border-blue-100 shadow-md">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                کمک به انتخاب هوشمندانه مینی‌استور
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">راهنمای انتخاب و مشاوره تخصصی سخت‌افزار</h3>
              <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
                دو متد برای انتخاب با دقت سخت‌افزار در اختیار دارید؛ انتخاب سریع سیستم آفلاین یا چت زنده با مشاور هوش مصنوعی مستقر در سرور!
              </p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setAiTab('calc')}
                className={`flex-1 py-3 text-center rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-2 ${aiTab === 'calc' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
              >
                <Cpu className="w-4 h-4" />
                محاسبه‌گر خودکار (سریع)
              </button>
              <button
                type="button"
                onClick={() => setAiTab('ai')}
                className={`flex-1 py-3 text-center rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-2 ${aiTab === 'ai' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                مشاوره هوشمند هوش مصنوعی (AI)
              </button>
            </div>

            {/* CONTENT BASED ON ACTIVE TAB */}
            {aiTab === 'calc' ? (
              <div className="space-y-6">
                {/* Selector Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-right">
                  
                  {/* Budget slider step */}
                  <div className="space-y-3">
                    <label className="block text-slate-800 font-bold text-base">۱. حداکثر بودجه تقریبی شما چیست؟</label>
                    <input
                      type="range"
                      min="20000000"
                      max="80000000"
                      step="5000000"
                      value={advisorBudget}
                      onChange={(e) => setAdvisorBudget(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-xs text-slate-400 font-medium font-sans">سقف بودجه انتخابی:</span>
                      <span className="text-base font-extrabold text-blue-700">{formatPrice(advisorBudget)}</span>
                    </div>
                  </div>

                  {/* Usecase step */}
                  <div className="space-y-3">
                    <label className="block text-slate-800 font-bold text-base">۲. نوع کاربری اصلی شما چیست؟</label>
                    <select
                      value={advisorUseCase}
                      onChange={(e) => setAdvisorUseCase(e.target.value as UseCaseType)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden tracking-wide"
                    >
                      <option value="office">اداری سبک، وبگردی و حسابداری</option>
                      <option value="gaming">گیمینگ سنگین و رندرهای سه‌بعدی</option>
                      <option value="engineering">برنامه‌نویسی و اجرای مستمر کدهای مهندسی</option>
                      <option value="portable">مسافرت، پرتابل سبک و کارهای کارگاهی همراه</option>
                    </select>
                  </div>

                </div>

                {/* Diagnostic Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleCalculateAdvisor}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3 rounded-xl text-base transition-all transform hover:scale-105 shadow-md shadow-blue-100 cursor-pointer"
                  >
                    بررسی فاکتورهای فنی و ارائه پیشنهاد
                  </button>
                </div>

                {/* Dynamic visual Recommendation output */}
                {showAdvisorResult && advisorRecommendation && (
                  <div className="bg-gradient-to-l from-blue-500/5 to-indigo-500/5 border border-blue-200 p-6 rounded-2xl mt-4 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-pulse" />
                      </div>
                      <div className="space-y-2 text-right">
                        <h4 className="text-lg font-extrabold text-slate-900">دستگاه منتخب کارشناسان مینی‌استور:</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          با توجه به بودجه <span className="font-bold text-blue-700">{formatPrice(advisorBudget)}</span> و اولویت کاربری <span className="font-bold text-slate-800">«{getUseCaseLabel(advisorUseCase)}»</span>، بهترین گزینه کاندیدا که ویژگی فنی، حرارت، پورت پرسرعت و ارزندگی مالی را تضمین می‌کند مدل زیر است:
                        </p>
                      </div>
                    </div>

                    {/* Micro product block preview */}
                    <div className="bg-white p-4.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center font-mono font-bold text-blue-500 text-xs">
                          {advisorRecommendation.brand}
                        </div>
                        <div className="text-right">
                          <h5 className="font-extrabold text-slate-900">{advisorRecommendation.name}</h5>
                          <span className="text-xs text-slate-500 font-mono mt-1 block">{advisorRecommendation.englishName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 font-medium block">قیمت ویژه:</span>
                          <span className="font-extrabold text-slate-950 text-base">{formatPrice(advisorRecommendation.discountPrice || advisorRecommendation.price)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(advisorRecommendation)}
                          className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                        >
                          بررسی کامل فنی
                        </button>
                        <button
                          type="button"
                          onClick={() => addToCart(advisorRecommendation)}
                          className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs px-4 py-2 rounded-lg transition shadow-xs cursor-pointer"
                        >
                          خرید فوری
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // AI ASSISTANT CHAT CONTAINER
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 max-h-[380px] overflow-y-auto flex flex-col gap-4 text-right">
                  {aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === 'user' 
                          ? 'mr-auto items-start text-left' 
                          : 'ml-auto items-end text-right'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-black px-1 mb-1">
                        {msg.role === 'user' ? 'کاربر' : 'مشاور هوش مصنوعی الوند'}
                      </span>
                      <div
                        className={`rounded-2xl p-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-right ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tl-none font-bold'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tr-none shadow-xs'
                        }`}
                        dir="rtl"
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  
                  {aiLoading && (
                    <div className="ml-auto flex items-center gap-2 bg-white border border-slate-100 px-4 py-2.5 rounded-2xl text-xs text-slate-500 font-bold shadow-xs">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <span>در حال نگارش پاسخ تخصصی...</span>
                    </div>
                  )}
                </div>

                {/* Sender Form */}
                <form onSubmit={handleSendAiMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="سؤالی از پردازنده‌ها، تفاوت کیس‌ها، قیمت یا کاربری بپرسید..."
                    disabled={aiLoading}
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden text-right font-medium"
                    dir="rtl"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black px-5 py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    ارسال سؤال
                  </button>
                </form>

                <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
                  <span>🚀 پردازش زنده روی سرور با مدل هوشمند Gemini 3.5</span>
                  <span>🔒 پورت ۳۰۰۰ کاملاً امن به طوری که کلید سرقت نمی‌شود</span>
                </div>
              </div>
            )}

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-4 text-right">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <span className="text-white font-extrabold text-lg">مینی‌استور</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                مرجع انحصاری برای انتخاب راحت و سریع کامپیوترهای کوچک، مینی کیس‌های مهندسی و اداری و لپ‌تاپ‌های مسافرتی فوق سبک با گارانتی معتبر محصولات.
              </p>
            </div>

            <div className="space-y-3 text-right">
              <h4 className="text-white font-bold text-sm">دسته‌بندی‌های کالا</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><button onClick={() => { setSelectedCategories(['minipc']); }} className="hover:text-white transition cursor-pointer">مینی کامپیوترهای رومیزی</button></li>
                <li><button onClick={() => { setSelectedCategories(['minicase']); }} className="hover:text-white transition cursor-pointer">کیس‌های فوق فشرده دسکتاپ</button></li>
                <li><button onClick={() => { setSelectedCategories(['laptop']); }} className="hover:text-white transition cursor-pointer">مینی نوت‌بوک‌ها و لپ‌تاپ جیبی</button></li>
              </ul>
            </div>

            <div className="space-y-3 text-right">
              <h4 className="text-white font-bold text-sm">شرایط فروش و گارانتی</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>ضمانت ۷ روز بازگشت کالا</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  <span>ارسال سریع سراسر کشور</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  <span>پشتیبانی فنی ۲۴ ساعته</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 text-right">
              <h4 className="text-white font-bold text-sm">مجوزها و ارتباط با ما</h4>
              <p className="text-xs leading-relaxed">خیابان ولیعصر، تقاطع بزرگمهر، مجتمع کامپیوتر لادن، طبقه دوم، واحد ۲۴</p>
              <div className="text-xs text-slate-300 font-bold">تلفن: ۰۲۱-۹۱۰۳۱۰۱۰</div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-right">© ۱۴۰۵ تمامی حقوق برای فروشگاه مینی‌استور محفوظ است. طراحی شیک و خوانا متناسب با استانداردهای نوین تجربه کاربری.</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-slate-400">امنیت خرید تضمین شده است</span>
            </div>
          </div>
        </div>
      </footer>

      {/* PRODUCT SPEC DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative">
            
            {/* Close button top-left */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute left-4 top-4 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Heading Section */}
            <div className="space-y-2 text-right border-b border-slate-100 pb-5 pt-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-blue-100 text-blue-800 font-bold text-xs px-3 py-1 rounded-md">
                  {getCategoryLabel(selectedProduct.category)}
                </span>
                <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1 rounded-md">
                  برند: {selectedProduct.brand}
                </span>
                <span className="bg-indigo-50 text-indigo-800 font-bold text-xs px-3 py-1 rounded-md">
                  {getUseCaseLabel(selectedProduct.useCase)}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {selectedProduct.name}
              </h3>
              <p className="text-sm font-mono text-slate-400 tracking-tight">
                {selectedProduct.englishName}
              </p>
            </div>

            {/* Main Content Info - Simple double panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
              
              {/* Left Column - Beautiful Spec List Table */}
              <div className="lg:col-span-12 xl:col-span-7 space-y-4">
                <h4 className="font-extrabold text-slate-900 text-base border-r-4 border-blue-600 pr-2.5">جدول ریز مشخصات فنی دقیق دستگاه</h4>
                
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-sm">
                  {[
                    { label: 'پردازنده مرکزی (CPU)', value: selectedProduct.specs.cpu, icon: Cpu },
                    { label: 'حافظه موقت (RAM)', value: selectedProduct.specs.ram, icon: Laptop },
                    { label: 'حافظه ذخیره‌سازی سرعت بالا', value: selectedProduct.specs.storage, icon: Layers },
                    { label: 'کارت گرافیک مجتمع/مجزا', value: selectedProduct.specs.gpu, icon: Monitor },
                    { label: 'اتصالات پیش‌فرض به همراه بی سیم', value: selectedProduct.specs.ports.join(' / '), icon: Info },
                    { label: 'ابعاد دقیق شاسی به میلی‌متر', value: selectedProduct.specs.dimensions, icon: Maximize2 },
                    { label: 'وزن خالص بدنه دستگاه', value: selectedProduct.specs.weight, icon: Info },
                    { label: 'منبع تغذیه و شارژر', value: selectedProduct.specs.power, icon: Info },
                    { label: 'سیستم‌عامل‌های سازگار', value: selectedProduct.specs.os, icon: Info },
                    { label: 'قدرت و نوع فن خنک‌کننده', value: selectedProduct.specs.cooling, icon: RotateCcw }
                  ].map((spec, idx) => (
                    <div 
                      key={idx} 
                      className={`grid grid-cols-12 p-3 ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'} border-b border-slate-100 last:border-b-0 gap-2`}
                    >
                      <div className="col-span-4 font-bold text-slate-900 flex items-center gap-1.5">
                        <spec.icon className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{spec.label}</span>
                      </div>
                      <div className="col-span-8 text-slate-700 leading-relaxed font-sans">{spec.value}</div>
                    </div>
                  ))}
                </div>

                {/* Key selling features bullets */}
                <div className="bg-blue-50/55 p-4.5 rounded-2xl border border-blue-100 space-y-2">
                  <h5 className="font-bold text-blue-900 text-sm">مزایای منحصر‌به‌فرد از دیدگاه خریداران:</h5>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedProduct.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 pr-1.5">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0"></span>
                        <span className="leading-relaxed font-semibold">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column - Overview, graphic blueprint and purchase actions */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                
                {/* Product Long Description */}
                <div className="space-y-2.5">
                  <h4 className="font-extrabold text-slate-900 text-base">نقد و بررسی کارشناسی</h4>
                  <p className="text-slate-600 text-sm leading-relaxed text-justify">
                    {selectedProduct.longDescription}
                  </p>
                </div>

                {/* Simulated Diagnostic vector interface */}
                <div className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50 text-center space-y-3">
                  <span className="text-[10px] text-slate-400 font-mono block">DIAGNOSTIC AUTOMATED FAN FLOW</span>
                  
                  <div className="relative h-20 bg-white border border-slate-200 r-xl flex items-center justify-center overflow-hidden rounded-xl">
                    <div className="absolute inset-y-0 right-0 w-1/3 bg-blue-500/5 flex items-center justify-center text-blue-600 text-[10px] font-bold font-mono">
                      AIR INLET
                    </div>
                    <div className="w-3.5 h-3.5 bg-blue-600 rounded-full animate-pulse mr-20 ml-20"></div>
                    <div className="absolute inset-y-0 left-0 w-1/3 bg-red-500/5 flex items-center justify-center text-red-600 text-[10px] font-bold font-mono">
                      EXHAUST
                    </div>
                    <span className="text-xs text-slate-400 tracking-widest animate-pulse font-sans">◀ ◀ جریان باد هوشند سایلنت ◀ ◀</span>
                  </div>
                  <p className="text-xs text-slate-500">جریان هوای گردابی فعال در فرکانس لود حداکثری سیستم</p>
                </div>

                {/* Pricing & warranty section */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">پرداخت و گارانتی رسمی:</span>
                    <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {selectedProduct.warranty}
                    </span>
                  </div>

                  {/* Ultimate Price calculation */}
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                    <span className="text-sm text-slate-500 font-bold">مبلغ نهایی کالا:</span>
                    <div className="text-right">
                      {selectedProduct.discountPrice && (
                        <span className="text-xs line-through text-slate-400 block pb-1">
                          {selectedProduct.price.toLocaleString('fa-IR')}
                        </span>
                      )}
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {formatPrice(selectedProduct.discountPrice || selectedProduct.price)}
                      </span>
                    </div>
                  </div>

                  {/* Primary purchase CTA list */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      افزودن به سبد
                    </button>
                    <button
                      onClick={() => {
                        toggleCompare(selectedProduct);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm py-3 rounded-xl transition cursor-pointer"
                    >
                      {compareProducts.some(p => p.id === selectedProduct.id) ? 'حذف از مقایسه' : 'افزودن به مقایسه'}
                    </button>
                  </div>

                </div>

              </div>
              
            </div>

          </div>
        </div>
      )}

      {/* COMPARISON SLIDE SHEET DRAWERS */}
      {isCompareOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsCompareOpen(false)}
              className="absolute left-4 top-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-right pb-4 border-b border-slate-100 mt-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">میز مقایسه مشخصات فنی همزمان</h3>
              <p className="text-slate-500 text-sm">بررسی دقیق قطعات، پورت‌ها و تفاوت قیمت مینی‌دیوایس‌های انتخابی</p>
            </div>

            {compareProducts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-500 text-sm">هیچ کالایی برای مقایسه اضافه نشده است. چند محصول را از لیست انتخاب کنید.</p>
              </div>
            ) : (
              <div className="overflow-x-auto text-right">
                <table className="w-full text-right border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-3 font-extrabold text-slate-800 text-sm">ویژگی / کالا</th>
                      {compareProducts.map(product => (
                        <th key={product.id} className="p-3 font-extrabold text-slate-900 text-sm min-w-[200px] vertical-align-top">
                          <div className="flex flex-col space-y-1">
                            <span className="text-blue-600 text-xs block uppercase">{product.brand}</span>
                            <span className="line-clamp-2 leading-snug">{product.name}</span>
                            <button
                              onClick={() => toggleCompare(product)}
                              className="text-[11px] text-red-600 hover:text-red-700 font-bold pt-1 text-right flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> حذف کالا
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-800">نوع دستگاه</td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3 text-slate-600 font-medium">{getCategoryLabel(p.category)}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                      <td className="p-3 font-bold text-slate-800">پردازنده (CPU)</td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3 text-slate-700 font-sans">{p.specs.cpu}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-800">حافظه موقت (RAM)</td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3 text-slate-700 font-sans">{p.specs.ram}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                      <td className="p-3 font-bold text-slate-800">ظرفیت ذخیره (SSD)</td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3 text-slate-700 font-sans">{p.specs.storage}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-800">کارت گرافیک</td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3 text-slate-700 font-sans">{p.specs.gpu}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                      <td className="p-3 font-bold text-slate-800">ابعاد شاسی</td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3 text-slate-600">{p.specs.dimensions}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50/30">
                      <td className="p-3 font-bold text-slate-800">قیمت نهایی</td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3 font-black text-blue-800 text-base">
                          {formatPrice(p.discountPrice || p.price)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td></td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3">
                          <button
                            onClick={() => {
                              addToCart(p);
                              setIsCompareOpen(false);
                            }}
                            className="bg-blue-600 text-white font-extrabold text-xs px-3 py-2 rounded-lg hover:bg-blue-700 w-full transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> خرید آنلاین
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => setCompareProducts([])}
                className="text-xs text-red-600 hover:text-red-700 font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> پاک کردن کل میز مقایسه
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER (RIGHT-SIDE) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto relative border-r border-slate-100 text-right">
            
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-black text-slate-900">سبد خرید آنلاین</h3>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setShowCheckoutForm(false);
                    setOrderCompleted(false);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Confirmation Screen */}
              {orderCompleted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-950">سفارش شما با موفقیت ثبت شد!</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    کارشناسان مینی‌استور طی ۲ ساعت آینده جهت تایید فاکتور صادر شده و هماهنگی ارسال سریع با شماره همراه <span className="font-bold text-blue-700">{phoneNumber}</span> تماس خواهند گرفت.
                  </p>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500">شماره ارجاع فاکتور خرید:</div>
                    <div className="text-base font-extrabold text-slate-800 tracking-wider">MS-{Math.floor(100000 + Math.random() * 900000)}</div>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setOrderCompleted(false);
                      setShowCheckoutForm(false);
                    }}
                    className="bg-blue-600 text-white font-extrabold text-sm px-6 py-2 rounded-xl hover:bg-blue-700 w-full transition cursor-pointer"
                  >
                    بسیار عالی، بازگشت به فروشگاه
                  </button>
                </div>
              ) : showCheckoutForm ? (
                
                <form onSubmit={handleCheckoutSubmit} className="py-4 space-y-4">
                  <h4 className="font-bold text-slate-900 text-base">اطلاعات ارسال سفارش</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 font-bold block">نام و نام خانوادگی تحویل‌گیرنده *</label>
                    <input
                      type="text"
                      required
                      placeholder="مانند: علیرضا فغوانی"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-hidden font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 font-bold block">تلفن تماس مستقیم همراه *</label>
                    <input
                      type="tel"
                      required
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-hidden font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 font-bold block">آدرس دقیق پستی تحویل سفارش *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="استان، شهر، خیابان، کوچه، پلاک، واحد..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-hidden font-sans resize-none"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed space-y-1">
                    <div className="flex justify-between">
                      <span>جمع مبلغ کالاها:</span>
                      <span className="font-bold text-slate-900">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>هزینه بسته‌بندی و ارسال بیمه‌شده:</span>
                      <span className="font-bold">رایگان (ویژه امروز)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutForm(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition cursor-pointer"
                    >
                      ویرایش سبد کالا
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-xs cursor-pointer"
                    >
                      تایید نهایی و سفارش
                    </button>
                  </div>
                </form>

              ) : (

                <div className="py-4 divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <p className="text-slate-500 text-sm">سبد خرید شما در حال حاضر خالی است.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                      >
                        مشاهده لیست کالاها
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                      {cart.map((item) => {
                        const price = item.product.discountPrice || item.product.price;
                        return (
                          <div key={item.product.id} className="flex items-center gap-4 py-3 first:pt-0">
                            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] text-blue-600 border border-slate-200 shrink-0">
                              {item.product.brand}
                            </div>
                            <div className="flex-1 space-y-1 min-w-0">
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{item.product.name}</h5>
                              <span className="text-xs text-slate-500 font-mono tracking-tight block truncate text-slate-400">{item.product.englishName}</span>
                              <div className="text-xs text-blue-800 font-bold">{formatPrice(price)}</div>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-700 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-700 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Total balance and proceed checkout action */}
            {!orderCompleted && !showCheckoutForm && cart.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-slate-500 font-bold">جمع کل فاکتور خرید:</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 leading-none">{formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={() => setShowCheckoutForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3.5 rounded-xl transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  ادامه جهت ثبت نهایی آدرس
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
