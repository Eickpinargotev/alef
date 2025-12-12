'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductVariant } from '@/lib/productParser';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, ShoppingBag, Filter, X, Info, ChevronDown, ChevronUp, Check, Shirt } from 'lucide-react';

interface StoreProps {
    products: Product[];
}

export default function Store({ products }: StoreProps) {
    const { addToCart } = useCart();

    // Selections
    const [gender, setGender] = useState<string | null>(null);
    const [productType, setProductType] = useState<'camisa' | 'articulo' | null>(null);
    const [edition, setEdition] = useState<string | null>(null);
    const [model, setModel] = useState<string | null>(null);
    const [color, setColor] = useState<string | null>(null);

    // UI State
    const [upsellModalOpen, setUpsellModalOpen] = useState(false);
    const [pendingAddToCart, setPendingAddToCart] = useState<{ product: Product, variant?: ProductVariant, isArticle: boolean } | null>(null);

    // Customization State
    const [size, setSize] = useState<string>('M');
    const [quantity, setQuantity] = useState<number>(1);
    const [tzitziyot, setTzitziyot] = useState<boolean>(false);

    // Scroll to top on gender change
    useEffect(() => {
        if (gender) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [gender]);

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

    const currentProduct = useMemo(() => {
        if (productType === 'articulo') return null;
        if (productType === 'camisa' && edition) {
            return products.find(p => p.type === 'camisa' && p.editions.includes(edition));
        }
        return null;
    }, [productType, edition, products]);

    const availableModels = useMemo(() => {
        if (!currentProduct || edition === 'Personalizado') return [];
        const models = new Set<string>();
        currentProduct.variants.forEach(v => {
            if (v.edition === edition && v.gender === gender && v.model) models.add(v.model);
        });
        return Array.from(models).sort();
    }, [currentProduct, edition, gender]);

    const availableColors = useMemo(() => {
        if (edition === 'Personalizado') return ['blanco', 'negro', 'azul', 'gris', 'beige', 'verde'];
        if (!currentProduct) return [];
        if (!model && edition !== 'Personalizado') return [];

        const colors = new Set<string>();
        currentProduct.variants.forEach(v => {
            if (v.edition === edition && v.gender === gender && (v.model === model) && v.color) {
                colors.add(v.color);
            }
        });
        return Array.from(colors);
    }, [currentProduct, edition, gender, model]);

    // Auto-Select Logic
    useEffect(() => {
        if (!gender && availableGenders.length === 1) {
            setGender(availableGenders[0]);
        }
    }, [availableGenders, gender]);

    useEffect(() => {
        if (gender && !productType && availableTypes.length === 1) {
            setProductType(availableTypes[0]);
        }
    }, [availableTypes, gender, productType]);

    // Handlers
    const handleGenderChange = (val: string | null) => {
        setGender(val); setProductType(null); setEdition(null); setModel(null); setColor(null);
    };
    const handleTypeChange = (val: 'camisa' | 'articulo' | null) => {
        setProductType(val); setEdition(null); setModel(null); setColor(null);
    };
    const handleEditionChange = (val: string) => {
        if (edition !== val) {
            setEdition(val); setModel(null); setColor(null);
        }
    };
    const handleModelChange = (val: string | null) => {
        setModel(val); setColor(null);
    };

    // Display Logic
    const displayedMedia = useMemo(() => {
        if (productType === 'articulo') {
            return products.filter(p => p.type === 'articulo' && p.genders.includes(gender!));
        }

        if (productType === 'camisa') {
            if (!edition && !model && !color) {
                let allMedia: any[] = [];
                const matchingProducts = products.filter(p => p.type === 'camisa' && p.genders.includes(gender!));
                matchingProducts.forEach(prod => {
                    prod.variants.forEach(variant => {
                        if (variant.gender === gender) {
                            allMedia = [...allMedia, ...variant.media.map(m => ({ ...m, variant }))];
                        }
                    });
                });
                return Array.from(new Map(allMedia.map(m => [m.src, m])).values()).sort((a, b) => a.order - b.order);
            }

            const activeProduct = products.find(p => p.type === 'camisa' && p.editions.includes(edition! || ''));
            if (activeProduct) {
                const matchingVariants = activeProduct.variants.filter(v => {
                    const matchGender = v.gender === gender;
                    const matchEdition = !edition || v.edition === edition;
                    const matchModel = !model || v.model === model;
                    const matchColor = !color || v.color === color;
                    return matchGender && matchEdition && matchModel && matchColor;
                });

                let allMedia: any[] = [];
                matchingVariants.forEach(v => {
                    allMedia = [...allMedia, ...v.media.map(m => ({ ...m, variant: v }))];
                });
                return Array.from(new Map(allMedia.map(m => [m.src, m])).values()).sort((a, b) => a.order - b.order);
            }
        }
        return [];
    }, [products, gender, productType, edition, model, color]);

    // Checkout Interactions
    const initiateAddToCart = (product: Product, variant?: ProductVariant, isArticle = false) => {
        if (!isArticle && !color && edition !== 'Personalizado') {
            alert('Por favor selecciona un color.');
            return;
        }
        setPendingAddToCart({ product, variant, isArticle });

        if (!isArticle && productType === 'camisa') {
            setUpsellModalOpen(true);
        } else {
            finalizeAddToCart(false, product, variant, isArticle);
        }
    };

    const finalizeAddToCart = (withTzitziyot: boolean, product: Product, variant?: ProductVariant, isArticle = false) => {
        addToCart({
            productId: product.id,
            productName: isArticle ? product.name : `Camisa ${edition} ${edition === 'Personalizado' ? '(Personalizado)' : ''}`,
            quantity: quantity,
            price: isArticle ? (variant?.price || product.basePrice) : (currentProduct?.basePrice || 0) + (withTzitziyot ? 6 : 0),
            type: isArticle ? 'articulo' : 'camisa',
            attributes: {
                edition: edition || undefined,
                model: model || undefined,
                color: color || undefined,
                size: isArticle ? undefined : size,
                tzitziyot: isArticle ? undefined : withTzitziyot,
                gender: gender!,
            },
            image: variant?.media[0]?.src || (displayedMedia[0] as any)?.src || '/placeholder.jpg'
        });
        setQuantity(1);
        setUpsellModalOpen(false);
        setPendingAddToCart(null);
    };

    // Configurator Component
    const Configurator = ({ isMobile = false }) => (
        <div className={`space-y-6 ${isMobile ? 'pb-2' : ''}`}>
            {!isMobile && availableGenders.length > 1 && (
                <div className="mb-6 pb-6 border-b border-lilac-800">
                    <div className="flex bg-lilac-900/50 p-1 rounded-xl">
                        {availableGenders.map(g => (
                            <button
                                key={g}
                                onClick={() => handleGenderChange(g)}
                                className={`flex-1 py-2 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${gender === g ? 'bg-lilac-100 text-lilac-900 shadow-sm' : 'text-lilac-400 hover:text-lilac-200'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Type Selection */}
            {availableTypes.length > 1 && (
                <div>
                    <h4 className="font-bold text-lilac-200 mb-3 text-xs uppercase tracking-widest">TIPO DE PRODUCTO</h4>
                    <div className={`flex ${isMobile ? 'gap-3 overflow-x-auto pb-2 scrollbar-hide' : 'gap-4 border-b border-lilac-800 pb-1'}`}>
                        {availableTypes.map(t => (
                            <button
                                key={t}
                                onClick={() => handleTypeChange(t)}
                                className={`
                                whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all
                                ${productType === t
                                        ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/30'
                                        : 'bg-lilac-900/50 text-lilac-400 border border-lilac-700 hover:border-lilac-500'}
                            `}
                            >
                                {t === 'camisa' ? 'Camisas' : 'Artículos'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Shirt Options */}
            {productType === 'camisa' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Edition */}
                    <div>
                        <label className="font-bold text-lilac-200 mb-3 text-xs uppercase tracking-widest block">EDICIÓN</label>
                        <div className={`flex ${isMobile ? 'gap-3 overflow-x-auto pb-2 scrollbar-hide' : 'flex-wrap gap-2'}`}>
                            {availableEditions.map(e => (
                                <button
                                    key={e}
                                    onClick={() => handleEditionChange(e)}
                                    className={`
                                        whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all border
                                        ${edition === e
                                            ? 'bg-lilac-100 border-lilac-100 text-lilac-900 font-bold shadow-md'
                                            : 'bg-transparent border-lilac-700 text-lilac-300 hover:border-lilac-500'}
                                    `}
                                >
                                    {e.replace(/_/g, ' ')}
                                </button>
                            ))}
                            <button
                                onClick={() => handleEditionChange('Personalizado')}
                                className={`
                                    whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all border
                                    ${edition === 'Personalizado'
                                        ? 'bg-gold-500 border-gold-500 text-white font-bold shadow-md'
                                        : 'bg-transparent border-gold-700/50 text-gold-500 hover:border-gold-500 hover:bg-gold-500/10'}
                                `}
                            >
                                Personalizado
                            </button>
                        </div>
                    </div>

                    {/* Model */}
                    {edition && edition !== 'Personalizado' && (
                        <div>
                            <h4 className="font-bold text-lilac-200 mb-3 text-xs uppercase tracking-widest">MODELO</h4>
                            <div className={`grid ${isMobile ? 'grid-flow-col auto-cols-max gap-3 overflow-x-auto pb-2 scrollbar-hide' : 'grid-cols-2 gap-2'}`}>
                                {availableModels.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => handleModelChange(m)}
                                        className={`flex flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all min-w-[100px] ${model === m ? 'border-gold-500 bg-lilac-800 text-gold-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'border-lilac-800 bg-lilac-900/40 text-lilac-400 hover:border-lilac-600 hover:bg-lilac-800/60'}`}
                                    >
                                        <Shirt className={`w-4 h-4 ${model === m ? 'text-gold-500' : 'text-lilac-500'}`} />
                                        <span className="text-sm font-bold uppercase tracking-widest">{m.replace(/modelo_/g, '')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color */}
                    {(model || edition === 'Personalizado') && (
                        <div>
                            <h4 className="font-bold text-lilac-200 mb-3 text-xs uppercase tracking-widest">COLOR</h4>
                            <div className="flex flex-wrap gap-3">
                                {availableColors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        title={c}
                                        className={`w-12 h-12 rounded-full border-2 shadow-sm transition-all hover:scale-110 flex items-center justify-center ${color === c ? 'ring-2 ring-offset-2 ring-offset-lilac-900 ring-gold-500 scale-110 border-white' : 'border-lilac-700 opacity-80 hover:opacity-100'}`}
                                        style={{ backgroundColor: c === 'blanco' ? '#fff' : c === 'negro' ? '#000' : c === 'blanco_hueso' ? '#F5F5DC' : c === 'verde_oliva' ? '#556B2F' : c === 'beige' ? '#F5F5DC' : c }}
                                    >
                                        {(c === 'blanco' || c === 'blanco_hueso') && color === c && <Check className="w-5 h-5 text-black" />}
                                        {(c !== 'blanco' && c !== 'blanco_hueso') && color === c && <Check className="w-5 h-5 text-white" />}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-lilac-400 mt-2 font-medium capitalize">{color?.replace(/_/g, ' ') || 'Selecciona un color'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative" id="store">
            {/* Upsell Modal */}
            {upsellModalOpen && pendingAddToCart && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-lilac-950/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform scale-100 transition-transform">
                        <h3 className="text-xl font-bold text-lilac-900 mb-2">¿Deseas agregar Tzitziyot?</h3>
                        <p className="text-lilac-600 mb-6">
                            Cumple con el mandamiento agregando Tzitziyot a tu camisa por solo <span className="font-bold">$6.00</span> adicionales.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => finalizeAddToCart(true, pendingAddToCart.product, pendingAddToCart.variant, pendingAddToCart.isArticle)}
                                className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Sí, agregar (Total: ${((pendingAddToCart.product.basePrice || 0) + 6).toFixed(2)})
                            </button>
                            <button
                                onClick={() => finalizeAddToCart(false, pendingAddToCart.product, pendingAddToCart.variant, pendingAddToCart.isArticle)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
                            >
                                No, gracias
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Gender Selection - Show only if not selected AND multiple exist */}
            {!gender && availableGenders.length > 1 ? (
                <div className="text-center animate-fade-in-up py-12">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-lilac-900 mb-6 tracking-tight">Alef</h1>
                    <p className="text-lilac-800 mb-12 text-xl font-medium tracking-wide">Moda con propósito y elegancia ancestral.</p>
                    <h2 className="text-2xl font-serif font-bold text-lilac-800 mb-8 tracking-wide">Selecciona tu categoría</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        {availableGenders.map(g => (
                            <button
                                key={g}
                                onClick={() => handleGenderChange(g)}
                                className="bg-white hover:bg-lilac-50 text-lilac-900 text-xl font-serif font-bold py-8 px-12 rounded-sm shadow-md border border-lilac-200 transition-all transform hover:-translate-y-1 hover:shadow-xl uppercase tracking-widest"
                            >
                                {g.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 relative items-start">

                    {/* MOBILE CONFIGURATOR (Inline) */}
                    <div className="lg:hidden w-full bg-lilac-950 p-5 rounded-2xl shadow-xl border border-lilac-900 mb-6">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-lilac-800">
                            <h3 className="text-lg font-bold text-white">Personaliza tu Estilo</h3>
                            {availableGenders.length > 1 && (
                                <div className="flex bg-lilac-900/50 p-1 rounded-lg">
                                    {availableGenders.map(g => (
                                        <button
                                            key={g}
                                            onClick={() => handleGenderChange(g)}
                                            className={`py-1 px-3 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${gender === g ? 'bg-lilac-100 text-lilac-900 shadow-sm' : 'text-lilac-400 hover:text-lilac-200'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Configurator isMobile={true} />
                    </div>

                    {/* DESKTOP SIDEBAR */}
                    <aside className="hidden lg:block w-1/4 bg-lilac-950 p-6 rounded-2xl shadow-xl border border-lilac-900 sticky top-24 h-fit z-40">
                        <h3 className="text-xl font-bold text-white mb-6">Personaliza</h3>
                        <Configurator isMobile={false} />
                    </aside>

                    {/* Main Content Area */}
                    <div className="w-full lg:w-3/4 min-h-[50vh]">
                        {!productType && (
                            <div className="flex flex-col items-center justify-center py-20 text-lilac-300">
                                <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                                    <ShoppingBag className="w-12 h-12" />
                                </div>
                                <p className="text-lg font-medium text-lilac-400">Selecciona un tipo de producto</p>
                            </div>
                        )}

                        {/* Articles Grid */}
                        {productType === 'articulo' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                                {(displayedMedia as Product[]).map((prod) => (
                                    <div key={prod.id} className="bg-white rounded-2xl shadow-sm border border-lilac-100 overflow-hidden hover:shadow-lg transition-all group">
                                        <div className="aspect-square bg-lilac-50 relative">
                                            {prod.variants[0]?.media[0]?.type === 'image' ? (
                                                <img src={prod.variants[0].media[0].src} alt={prod.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                            ) : (!prod.variants[0]?.media[0] ? null : (
                                                <video src={prod.variants[0]?.media[0]?.src} className="object-cover w-full h-full" muted autoPlay loop playsInline />
                                            ))}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-lilac-900 mb-1 capitalize">{prod.name}</h3>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-xl font-bold text-lilac-600">${prod.basePrice.toFixed(2)}</span>
                                                <button
                                                    onClick={() => initiateAddToCart(prod, prod.variants[0], true)}
                                                    className="bg-gold-600 text-white p-3 rounded-full hover:bg-gold-700 transition-colors shadow-md"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Shirt Display & Sticky Action Bar */}
                        {productType === 'camisa' && (
                            <div className="relative">
                                {/* Back Button Logic */}
                                {(model || (edition && edition !== 'Personalizado' && color)) && (
                                    <div className="mb-6 flex justify-between items-center bg-lilac-900 p-4 rounded-xl border border-lilac-800 shadow-inner">
                                        <div>
                                            <p className="font-bold text-lilac-100 font-serif tracking-wide">Viendo: <span className="text-gold-400 font-sans font-normal">{model?.replace(/modelo_/g, 'Mod ') || edition?.replace(/_/g, ' ')} - <span className="capitalize">{color?.replace(/_/g, ' ')}</span></span></p>
                                        </div>
                                        <button
                                            onClick={() => { setModel(null); setColor(null); setEdition(null); }}
                                            className="text-sm font-bold text-lilac-300 hover:text-white underline transition-colors"
                                        >
                                            Ver todos los modelos
                                        </button>
                                    </div>
                                )}

                                {/* Gallery */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                                    {(displayedMedia as any[]).map((media, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                if (media.variant && productType === 'camisa') {
                                                    if (media.variant.edition) setEdition(media.variant.edition);
                                                    if (media.variant.model) setModel(media.variant.model);
                                                    if (media.variant.color) setColor(media.variant.color);
                                                }
                                            }}
                                            className={`rounded-2xl overflow-hidden shadow-sm border bg-white cursor-pointer transition-all hover:shadow-md ${media.variant?.model === model && media.variant?.color === color ? 'ring-2 ring-lilac-500 border-transparent' : 'border-lilac-100'}`}
                                        >
                                            <div className="relative aspect-[3/4]">
                                                {media.type === 'video' ? (
                                                    <video src={media.src} className="w-full h-full object-cover" controls playsInline />
                                                ) : (
                                                    <img src={media.src} alt="Vista previa" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="p-3 bg-lilac-50 text-xs text-lilac-600 lg:group-hover:block hidden">
                                                Click para seleccionar
                                            </div>
                                        </div>
                                    ))}
                                    {displayedMedia.length === 0 && (
                                        <div className="col-span-full py-20 text-center text-lilac-400 border-2 border-dashed border-lilac-200 rounded-2xl bg-lilac-50/50">
                                            <p>No se encontraron imágenes para esta selección.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Sticky Action Footer for Shirts */}
                                {(model || edition === 'Personalizado') && color && (
                                    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-96 bg-white p-5 rounded-3xl shadow-2xl border border-lilac-100 z-50 animate-slide-up">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lilac-900 text-lg">Tu Elección</h3>
                                                    <p className="text-sm text-lilac-500 capitalize">{color.replace(/_/g, ' ') || 'Color'} • {size}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-2xl font-bold text-lilac-900">${((currentProduct?.basePrice || 35.40) + (tzitziyot ? 6 : 0)).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Size Selector */}
                                                <select
                                                    value={size}
                                                    onChange={(e) => setSize(e.target.value)}
                                                    className="w-full p-3 rounded-xl bg-lilac-50 border border-lilac-200 text-lilac-900 font-medium focus:ring-2 focus:ring-lilac-400"
                                                >
                                                    {['S', 'M', 'L', 'XL'].map(s => <option key={s} value={s}>Talla {s}</option>)}
                                                </select>

                                                {/* Quantity */}
                                                <div className="flex items-center justify-between border border-lilac-200 rounded-xl bg-lilac-50 px-2">
                                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-lilac-400 hover:text-lilac-900"><Minus className="w-4 h-4" /></button>
                                                    <span className="font-bold text-lilac-900">{quantity}</span>
                                                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-lilac-400 hover:text-lilac-900"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => initiateAddToCart(currentProduct!, undefined, false)}
                                                className="w-full bg-gold-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gold-700 transition-all transform active:scale-95 flex items-center justify-center gap-2 tracking-wide"
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                                AGREGAR AL CARRITO
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
