'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductVariant } from '@/lib/productParser';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, ShoppingBag, Filter, X, Info, ChevronDown, ChevronUp, Check, Shirt, Phone } from 'lucide-react';

interface StoreProps {
    products: Product[];
    tzitzitImage: string | null;
}

export default function Store({ products, tzitzitImage }: StoreProps) {
    const { addToCart } = useCart();

    // View State
    const [viewState, setViewState] = useState<'landing' | 'store'>('landing');

    // Selections
    const [gender, setGender] = useState<string | null>(null);
    const [productType, setProductType] = useState<'camisa' | 'articulo' | null>(null);
    const [edition, setEdition] = useState<string | null>(null);
    const [model, setModel] = useState<string | null>(null);
    const [color, setColor] = useState<string | null>(null);

    // View State (Filters)
    const [viewEdition, setViewEdition] = useState<string | null>(null);
    const [viewModel, setViewModel] = useState<string | null>(null);
    const [viewColor, setViewColor] = useState<string | null>(null);

    // UI State
    const [upsellModalOpen, setUpsellModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [pendingAddToCart, setPendingAddToCart] = useState<{ product: Product, variant?: ProductVariant, isArticle: boolean } | null>(null);

    // Customization State
    const [size, setSize] = useState<string>('M');
    const [quantity, setQuantity] = useState<number>(1);
    const [tzitziyot, setTzitziyot] = useState<boolean>(false);

    // Scroll Logic
    useEffect(() => {
        if (gender && viewState === 'store') {
            // window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [gender, viewState]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (upsellModalOpen || detailModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [upsellModalOpen, detailModalOpen]);

    // Derived Options Logic
    const availableGenders = useMemo(() => {
        const genders = new Set<string>();
        products.forEach(p => p.genders.forEach(g => genders.add(g)));
        return Array.from(genders);
    }, [products]);

    const filteredProductsByGender = useMemo(() => {
        if (!gender) return products;
        return products.filter(p => p.genders.includes(gender));
    }, [products, gender]);

    const availableTypes = useMemo(() => {
        if (!gender) return [];
        const types = new Set<'camisa' | 'articulo'>();
        filteredProductsByGender.forEach(p => types.add(p.type));
        return Array.from(types);
    }, [gender, filteredProductsByGender]);

    const availableEditions = useMemo(() => {
        if (productType !== 'camisa') return [];
        const editions = new Set<string>();
        filteredProductsByGender.filter(p => p.type === 'camisa').forEach(p => p.editions.forEach(e => editions.add(e)));
        return Array.from(editions);
    }, [productType, filteredProductsByGender]);

    const availableModels = useMemo(() => {
        if (viewEdition === 'Personalizado') return [];
        if (!viewEdition) {
            const models = new Set<string>();
            filteredProductsByGender.filter(p => p.type === 'camisa').forEach(p => {
                p.variants.forEach(v => {
                    if (v.gender === gender && v.model) models.add(v.model);
                });
            });
            return Array.from(models).sort();
        }

        const activeProduct = products.find(p => p.type === 'camisa' && p.editions.includes(viewEdition));
        if (!activeProduct) return [];

        const models = new Set<string>();
        activeProduct.variants.forEach(v => {
            if (v.edition === viewEdition && v.gender === gender && v.model) models.add(v.model);
        });
        return Array.from(models).sort();
    }, [products, viewEdition, gender, filteredProductsByGender]);

    const availableColors = useMemo(() => {
        if (viewEdition === 'Personalizado') return [];
        const colors = new Set<string>();
        const collectColors = (variants: ProductVariant[]) => {
            variants.forEach(v => {
                const matchEdition = !viewEdition || v.edition === viewEdition;
                const matchModel = !viewModel || v.model === viewModel;
                if (matchEdition && matchModel && v.gender === gender && v.color) {
                    colors.add(v.color);
                }
            });
        };

        if (viewEdition) {
            const activeProduct = products.find(p => p.type === 'camisa' && p.editions.includes(viewEdition));
            if (activeProduct) collectColors(activeProduct.variants);
        } else {
            filteredProductsByGender.filter(p => p.type === 'camisa').forEach(p => collectColors(p.variants));
        }
        return Array.from(colors);
    }, [products, viewEdition, viewModel, gender, filteredProductsByGender]);

    // Auto-Select Logic
    useEffect(() => {
        if (viewState === 'store') {
            if (!gender && availableGenders.length === 1) setGender(availableGenders[0]);
            if (!gender && availableGenders.length > 0 && !gender) setGender(availableGenders[0]); // Default to first gender if entered directly?
        }
    }, [availableGenders, gender, viewState]);

    useEffect(() => {
        if (gender && !productType && availableTypes.length === 1) {
            setProductType(availableTypes[0]);
        }
    }, [availableTypes, gender, productType]);

    // Handlers
    const handleGenderChange = (val: string | null) => {
        setGender(val); setProductType(null);
        setEdition(null); setModel(null); setColor(null);
        setViewEdition(null); setViewModel(null); setViewColor(null);
    };
    const handleTypeChange = (val: 'camisa' | 'articulo' | null) => {
        setProductType(val);
        setEdition(null); setModel(null); setColor(null);
        setViewEdition(null); setViewModel(null); setViewColor(null);
    };
    const handleEditionChange = (val: string) => {
        if (edition !== val || viewEdition !== val) {
            setEdition(val); setModel(null); setColor(null);
            setViewEdition(val); setViewModel(null); setViewColor(null);
        }
    };
    const handleModelChange = (val: string | null) => {
        setModel(val); setColor(null);
        setViewModel(val); setViewColor(null);
    };
    const handleColorChange = (val: string | null) => {
        setColor(val);
        setViewColor(val);
    };

    const enterStore = () => {
        setViewState('store');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filter Logic Same as Before...
    const displayedMedia = useMemo(() => {
        if (productType === 'articulo') {
            return products.filter(p => p.type === 'articulo' && p.genders.includes(gender || '')); // Safe access
        }

        if (productType === 'camisa') {
            // If no filters...
            if (!viewEdition && !viewModel && !viewColor) {
                let allMedia: any[] = [];
                const matchingProducts = products.filter(p => p.type === 'camisa' && p.genders.includes(gender || ''));
                matchingProducts.forEach(prod => {
                    prod.variants.forEach(variant => {
                        if (variant.gender === gender) {
                            allMedia = [...allMedia, ...variant.media.map(m => ({ ...m, variant }))];
                        }
                    });
                });
                return Array.from(new Map(allMedia.map(m => [m.src, m])).values()).sort((a, b) => a.order - b.order);
            }

            // Filtering
            let allMedia: any[] = [];
            const matchingProducts = products.filter(p => p.type === 'camisa' && p.genders.includes(gender || ''));

            matchingProducts.forEach(prod => {
                if (viewEdition && !prod.editions.includes(viewEdition)) return;
                const matchingVariants = prod.variants.filter(v => {
                    const matchGender = v.gender === gender;
                    const matchEdition = !viewEdition || v.edition === viewEdition;
                    const matchModel = !viewModel || v.model === viewModel;
                    const matchColor = !viewColor || v.color === viewColor;
                    return matchGender && matchEdition && matchModel && matchColor;
                });
                matchingVariants.forEach(v => {
                    allMedia = [...allMedia, ...v.media.map(m => ({ ...m, variant: v }))];
                });
            });
            return Array.from(new Map(allMedia.map(m => [m.src, m])).values()).sort((a, b) => a.order - b.order);
        }
        return [];
    }, [products, gender, productType, viewEdition, viewModel, viewColor]);

    // Checkout Interactions (Same as before)
    const openDetailModal = (product: Product, variant?: ProductVariant, isArticle = false) => {
        setPendingAddToCart({ product, variant, isArticle });
        setQuantity(1);
        if (!isArticle && product.sizes?.length > 0) setSize(product.sizes[0]);
        else if (!isArticle) setSize('M');
        setDetailModalOpen(true);
    };

    const handleDetailModalAction = () => {
        if (!pendingAddToCart) return;
        const { product, variant, isArticle } = pendingAddToCart;
        if (isArticle) {
            finalizeAddToCart(false, product, variant, true);
        } else {
            setDetailModalOpen(false);
            setUpsellModalOpen(true);
        }
    };

    const finalizeAddToCart = (withTzitziyot: boolean, product: Product, variant?: ProductVariant, isArticle = false) => {
        addToCart({
            productId: product.id,
            productName: isArticle ? product.name : `Camisa ${edition || variant?.edition} ${edition === 'Personalizado' ? '(Personalizado)' : ''}`,
            quantity: quantity,
            price: isArticle ? (variant?.price || product.basePrice) : (variant?.price || product.basePrice) + (withTzitziyot ? 6 : 0),
            type: isArticle ? 'articulo' : 'camisa',
            attributes: {
                edition: edition || variant?.edition || undefined,
                model: model || variant?.model || undefined,
                color: color || variant?.color || undefined,
                size: isArticle ? undefined : size,
                tzitziyot: isArticle ? undefined : withTzitziyot,
                gender: gender!,
            },
            image: variant?.media[0]?.src || (displayedMedia[0] as any)?.src || '/placeholder.jpg'
        });
        setQuantity(1);
        setUpsellModalOpen(false);
        setDetailModalOpen(false);
        setPendingAddToCart(null);
    };

    // Horizontal Configurator
    const FilterBar = () => (
        <div className="bg-lilac-950/90 backdrop-blur-md rounded-2xl shadow-xl border border-lilac-900 p-4 sticky top-24 z-40 mb-8 mx-auto w-full">
            <div className="flex flex-col gap-4">

                {/* Top Row: Gender & Type */}
                <div className="flex flex-wrap justify-center items-center gap-4 border-b border-lilac-800 pb-4">
                    {availableGenders.length > 1 && (
                        <div className="flex bg-lilac-900/50 p-1 rounded-xl">
                            {availableGenders.map(g => (
                                <button key={g} onClick={() => handleGenderChange(g)} className={`py-2 px-6 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${gender === g ? 'bg-lilac-100 text-lilac-900 shadow-sm' : 'text-lilac-400 hover:text-lilac-200'}`}>
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}

                    {availableTypes.length > 1 && (
                        <div className="flex gap-2">
                            {availableTypes.map(t => (
                                <button key={t} onClick={() => handleTypeChange(t)} className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${productType === t ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/30' : 'bg-lilac-900/50 text-lilac-400 border border-lilac-700 hover:border-lilac-500'}`}>
                                    {t === 'camisa' ? 'Camisas' : 'Artículos'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Row: Specific Filters */}
                {productType === 'camisa' && (
                    <div className="flex flex-wrap justify-center items-center gap-4 animate-fade-in">
                        {/* Editions */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {availableEditions.map(e => (
                                <button key={e} onClick={() => handleEditionChange(e)} className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs transition-all border ${viewEdition === e ? 'bg-lilac-100 border-lilac-100 text-lilac-900 font-bold shadow-md' : 'bg-transparent border-lilac-700 text-lilac-300 hover:border-lilac-500'}`}>
                                    {e.replace(/_/g, ' ')}
                                </button>
                            ))}
                            <button
                                onClick={() => handleEditionChange('Personalizado')}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs transition-all border ${viewEdition === 'Personalizado' ? 'bg-gold-500 border-gold-500 text-white font-bold shadow-md' : 'bg-transparent border-gold-700/50 text-gold-500 hover:border-gold-500 hover:bg-gold-500/10'}`}
                            >
                                Personalizado
                            </button>
                        </div>

                        {/* Models */}
                        {viewEdition && viewEdition !== 'Personalizado' && (
                            <>
                                <div className="w-px h-8 bg-lilac-800 hidden sm:block"></div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {availableModels.map(m => (
                                        <button key={m} onClick={() => handleModelChange(m)} className={`flex items-center gap-1 py-1.5 px-3 rounded-lg border transition-all text-xs ${viewModel === m ? 'border-gold-500 bg-lilac-800 text-gold-400 shadow' : 'border-lilac-800 bg-lilac-900/40 text-lilac-400 hover:border-lilac-600'}`}>
                                            <Shirt className={`w-3 h-3 ${viewModel === m ? 'text-gold-500' : 'text-lilac-500'}`} />
                                            <span className="font-bold uppercase tracking-wider">{m.replace(/modelo_/g, '')}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Colors */}
                        {(viewModel && viewEdition !== 'Personalizado') && (
                            <>
                                <div className="w-px h-8 bg-lilac-800 hidden sm:block"></div>
                                <div className="flex flex-wrap gap-2 items-center justify-center">
                                    {availableColors.map(c => (
                                        <button key={c} onClick={() => handleColorChange(c)} title={c} className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all hover:scale-110 flex items-center justify-center ${viewColor === c ? 'ring-2 ring-offset-2 ring-offset-lilac-900 ring-gold-500 scale-110 border-white' : 'border-lilac-700 opacity-80 hover:opacity-100'}`} style={{ backgroundColor: c === 'blanco' ? '#fff' : c === 'negro' ? '#000' : c === 'blanco_hueso' ? '#F5F5DC' : c === 'verde_oliva' ? '#556B2F' : c === 'beige' ? '#F5F5DC' : c }}>
                                            {(c === 'blanco' || c === 'blanco_hueso') && viewColor === c && <Check className="w-4 h-4 text-black" />}
                                            {(c !== 'blanco' && c !== 'blanco_hueso') && viewColor === c && <Check className="w-4 h-4 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // Hash Navigation Logic
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#products') {
                setViewState('store');
                // Optional: scroll to it
                const el = document.getElementById('products');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
        };

        // Check on mount
        handleHashChange();

        // Listen for changes
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return (
        <div className="min-h-screen relative" id="products">
            {/* Modals remain the same ... */}
            {upsellModalOpen && pendingAddToCart && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-lilac-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setUpsellModalOpen(false)}>
                    {/* ... Upsell Content ... */}
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setUpsellModalOpen(false)} className="absolute top-4 right-4 text-lilac-400 hover:text-lilac-600 z-10"><X className="w-6 h-6" /></button>
                        <h3 className="text-xl font-bold text-lilac-900 mb-2">¿Deseas agregar Tzitziyot?</h3>
                        <p className="text-lilac-600 mb-6">Cumple con el mandamiento agregando Tzitziyot a tu camisa por solo <span className="font-bold">$6.00</span> adicionales.</p>
                        <div className="mb-6 rounded-xl overflow-hidden shadow-md border border-lilac-100 bg-lilac-50">
                            <img src={tzitzitImage || "/products/camisa_tzitziyot_add.jpeg"} alt="Camisa con Tzitziyot" className="w-full h-auto mix-blend-multiply" />
                        </div>
                        <div className="space-y-3">
                            <button onClick={() => finalizeAddToCart(true, pendingAddToCart.product, pendingAddToCart.variant, pendingAddToCart.isArticle)} className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"><ShoppingBag className="w-5 h-5" /> Sí, agregar (Total: ${((pendingAddToCart.product.basePrice || 0) + 6).toFixed(2)})</button>
                            <button onClick={() => finalizeAddToCart(false, pendingAddToCart.product, pendingAddToCart.variant, pendingAddToCart.isArticle)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl">No, gracias</button>
                        </div>
                    </div>
                </div>
            )}

            {detailModalOpen && pendingAddToCart && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-lilac-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setDetailModalOpen(false)}>
                    {/* ... Detail Content ... */}
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setDetailModalOpen(false)} className="absolute top-4 right-4 text-lilac-400 hover:text-lilac-600 z-10"><X className="w-6 h-6" /></button>
                        <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-inner relative flex items-center justify-center p-2">
                            {pendingAddToCart.variant?.media[0]?.type === 'video' ? (
                                <video src={pendingAddToCart.variant?.media[0]?.src} className="w-full h-full object-contain" muted loop autoPlay playsInline />
                            ) : (
                                <img src={pendingAddToCart.variant?.media[0]?.src || '/placeholder.jpg'} alt={pendingAddToCart.product.name} className="w-full h-full object-contain" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-2xl font-bold text-lilac-900 capitalize mb-1">{pendingAddToCart.product.name}</h3>
                            <p className="text-xl font-bold text-gold-600">${pendingAddToCart.variant?.price.toFixed(2)}</p>
                            {pendingAddToCart.product.description && <p className="text-sm text-lilac-600 bg-lilac-50 p-2 rounded-lg">{pendingAddToCart.product.description}</p>}
                        </div>
                        {((pendingAddToCart.product.sizes && pendingAddToCart.product.sizes.length > 0) || !pendingAddToCart.isArticle) && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-lilac-700">Talla:</label>
                                <div className="flex flex-wrap gap-2">
                                    {(pendingAddToCart.product.sizes && pendingAddToCart.product.sizes.length > 0) ? pendingAddToCart.product.sizes.map(s => (
                                        <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${size === s ? 'bg-lilac-900 text-white border-lilac-900' : 'bg-white text-lilac-600 border-lilac-200 hover:border-lilac-400'}`}>{s}</button>
                                    )) : (['S', 'M', 'L', 'XL'].map(s => (
                                        <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${size === s ? 'bg-lilac-900 text-white border-lilac-900' : 'bg-white text-lilac-600 border-lilac-200 hover:border-lilac-400'}`}>{s}</button>
                                    )))}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between border border-lilac-200 rounded-xl bg-lilac-50 px-4 py-2">
                            <span className="text-lilac-600 font-medium">Cantidad:</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-lilac-400 hover:text-lilac-900"><Minus className="w-4 h-4" /></button>
                                <span className="font-bold text-lilac-900 text-lg">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-lilac-400 hover:text-lilac-900"><Plus className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <button onClick={handleDetailModalAction} className="w-full bg-gold-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gold-700 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-2">
                            <ShoppingBag className="w-5 h-5" />
                            {pendingAddToCart.isArticle ? `Agregar al Carrito - $${((pendingAddToCart.variant?.price || 0) * quantity).toFixed(2)}` : 'Continuar'}
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT SWITCH */}
            {viewState === 'landing' ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[80vh] text-center animate-fade-in-up">
                    <div className="mb-4 text-gold-500">
                        {/* Optional Decorative Icon */}
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto opacity-80">
                            <path d="M12 0L14.5 9.5H24L16.5 15.5L19.5 24L12 18.5L4.5 24L7.5 15.5L0 9.5H9.5L12 0Z" />
                        </svg>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif font-bold text-lilac-950 mb-8 tracking-tight leading-tight">
                        ALEF
                    </h1>
                    <div className="max-w-2xl mx-auto space-y-6 text-xl text-lilac-800 leading-relaxed font-light">
                        <p>
                            Más que una marca, <strong>Alef</strong> es el comienzo.
                            Es la fusión entre la tradición milenaria y la estética contemporánea.
                        </p>
                        <p>
                            Nuestra misión es crear prendas que honren nuestra identidad judía con un diseño moderno,
                            elegante y con propósito espiritual, llevando la santidad a la vida cotidiana.
                        </p>
                    </div>

                    <div className="mt-16">
                        <button
                            onClick={enterStore}
                            className="group bg-lilac-950 text-white px-12 py-5 rounded-full text-xl font-bold uppercase tracking-widest shadow-xl hover:bg-gold-600 transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center gap-3"
                        >
                            Ver Productos
                            <ChevronDown className="w-6 h-6 group-hover:animate-bounce" />
                        </button>
                    </div>
                </div>
            ) : (
                /* STORE VIEW */
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

                    {/* Top Filter Bar */}
                    <FilterBar />

                    {/* Content */}
                    <div className="min-h-[50vh]">
                        {!gender && (
                            /* Should not happen if auto-select works, but safe fallback logic */
                            <div className="text-center p-10">Cargando productos...</div>
                        )}

                        {/* Articles Grid */}
                        {productType === 'articulo' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                                {(displayedMedia as Product[]).map((prod) => (
                                    <div key={prod.id} className="bg-white rounded-2xl shadow-sm border border-lilac-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer" onClick={() => openDetailModal(prod, prod.variants[0], true)}>
                                        <div className="aspect-square bg-lilac-50 relative overflow-hidden">
                                            {prod.variants[0]?.media[0]?.type === 'image' ? (
                                                <img src={prod.variants[0].media[0].src} alt={prod.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                            ) : (!prod.variants[0]?.media[0] ? null : (
                                                <video src={prod.variants[0]?.media[0]?.src} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" muted autoPlay loop playsInline />
                                            ))}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-lilac-900 mb-1 capitalize">{prod.name}</h3>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-xl font-bold text-lilac-600">${prod.basePrice.toFixed(2)}</span>
                                                <button className="bg-gold-600 text-white p-3 rounded-full hover:bg-gold-700 transition-colors shadow-md"><Plus className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Shirts Grid */}
                        {productType === 'camisa' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-32">
                                {(displayedMedia as any[]).map((media, idx) => (
                                    <div key={idx} onClick={() => {
                                        if (media.variant && productType === 'camisa') {
                                            if (media.variant.edition) setEdition(media.variant.edition);
                                            if (media.variant.model) setModel(media.variant.model);
                                            if (media.variant.color) setColor(media.variant.color);
                                            const parentProduct = products.find(p => p.variants && p.variants.some(v => v === media.variant));
                                            if (parentProduct) openDetailModal(parentProduct, media.variant, false);
                                        }
                                    }} className={`rounded-2xl overflow-hidden shadow-sm border bg-white cursor-pointer transition-all hover:shadow-md group ${media.variant?.model === model && media.variant?.color === color ? 'ring-2 ring-lilac-500 border-transparent' : 'border-lilac-100'}`}>
                                        <div className="relative aspect-[3/4] overflow-hidden">
                                            {media.type === 'video' ? (
                                                <video src={media.src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" controls playsInline />
                                            ) : (
                                                <img src={media.src} alt="Vista previa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {displayedMedia.length === 0 && (
                                    viewEdition === 'Personalizado' ? (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                                            {/* Personalizado Content (Same as before) */}
                                            <div className="bg-lilac-100/50 p-8 rounded-3xl border border-lilac-200 max-w-lg mx-auto">
                                                <h3 className="text-xl font-bold text-lilac-900 mb-4">Personaliza tu Camisa</h3>
                                                <p className="text-lilac-800 mb-6 leading-relaxed">Ponte en contacto con nosotros por WhatsApp.</p>
                                                <a href="https://wa.me/593000000000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-4 px-8 rounded-xl"><Phone className="w-5 h-5" /> WhatsApp</a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="col-span-full py-20 text-center text-lilac-400 border-2 border-dashed border-lilac-200 rounded-2xl bg-lilac-50/50">
                                            <p>No se encontraron imágenes.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
