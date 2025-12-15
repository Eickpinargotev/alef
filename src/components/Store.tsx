'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductVariant } from '@/lib/productParser';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, ShoppingBag, Filter, X, Info, ChevronDown, ChevronUp, Check, Shirt } from 'lucide-react';

interface StoreProps {
    products: Product[];
    tzitzitImage: string | null;
}

export default function Store({ products, tzitzitImage }: StoreProps) {
    const { addToCart } = useCart();

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

    // Scroll to top on gender change
    useEffect(() => {
        if (gender) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [gender]);

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

    const currentProduct = useMemo(() => {
        if (productType === 'articulo') return null;
        if (productType === 'camisa' && edition) {
            return products.find(p => p.type === 'camisa' && p.editions.includes(edition));
        }
        return null;
    }, [productType, edition, products]);

    const availableModels = useMemo(() => {
        // If we are filtering by "Personalizado", don't show models
        if (viewEdition === 'Personalizado') return [];

        // If no edition is selected yet in value path, we *could* show all models, 
        // OR we can restrict model implementation until an edition is chosen. 
        // Based on UI hierarchy, Edition comes first.
        if (!viewEdition) {
            // Find all models across all camisas for the current gender
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

        // Need a model to show colors? Not strictly, but usually hierarchy is Edition -> Model -> Color
        // If viewEdition is selected but viewModel is NOT, show all colors for that edition?
        // Or if nothing is selected?

        const colors = new Set<string>();

        // Helper to collect colors from variants
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
            // If no edition, search all camisas
            filteredProductsByGender.filter(p => p.type === 'camisa').forEach(p => collectColors(p.variants));
        }

        return Array.from(colors);
    }, [products, viewEdition, viewModel, gender, filteredProductsByGender]);

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

    // Display Logic
    const displayedMedia = useMemo(() => {
        if (productType === 'articulo') {
            return products.filter(p => p.type === 'articulo' && p.genders.includes(gender!));
        }

        if (productType === 'camisa') {
            // If no filters...
            if (!viewEdition && !viewModel && !viewColor) {
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

            // Filtering
            let allMedia: any[] = [];
            const matchingProducts = products.filter(p => p.type === 'camisa' && p.genders.includes(gender!));

            matchingProducts.forEach(prod => {
                // Check if product matches edition filter (if set). Product has editions array.
                // If viewEdition is set, the product MUST have it.
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

    // Checkout Interactions
    const openDetailModal = (product: Product, variant?: ProductVariant, isArticle = false) => {
        setPendingAddToCart({ product, variant, isArticle });
        // Set default quantity
        setQuantity(1);
        // If shirt, set size if available or default
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
            // For shirts, trigger Upsell
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
                                        ${viewEdition === e
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
                                    ${viewEdition === 'Personalizado'
                                        ? 'bg-gold-500 border-gold-500 text-white font-bold shadow-md'
                                        : 'bg-transparent border-gold-700/50 text-gold-500 hover:border-gold-500 hover:bg-gold-500/10'}
                                `}
                            >
                                Personalizado
                            </button>
                        </div>
                    </div>



                    {/* Model - Show if edition is selected OR if we just want to show models generally */}
                    {viewEdition && viewEdition !== 'Personalizado' && (
                        <div>
                            <h4 className="font-bold text-lilac-200 mb-3 text-xs uppercase tracking-widest">MODELO</h4>
                            <div className={`flex flex-wrap ${isMobile ? 'gap-3 overflow-x-auto pb-2 scrollbar-hide' : 'gap-2'}`}>
                                {availableModels.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => handleModelChange(m)}
                                        className={`flex flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-lg border transition-all text-xs ${viewModel === m ? 'border-gold-500 bg-lilac-800 text-gold-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'border-lilac-800 bg-lilac-900/40 text-lilac-400 hover:border-lilac-600 hover:bg-lilac-800/60'}`}
                                    >
                                        <Shirt className={`w-3 h-3 ${viewModel === m ? 'text-gold-500' : 'text-lilac-500'}`} />
                                        <span className="font-bold uppercase tracking-wider">{m.replace(/modelo_/g, '')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color */}
                    {(viewModel && viewEdition !== 'Personalizado') && (
                        <div>
                            <h4 className="font-bold text-lilac-200 mb-3 text-xs uppercase tracking-widest">COLOR</h4>
                            <div className="flex flex-wrap gap-3">
                                {availableColors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => handleColorChange(c)}
                                        title={c}
                                        className={`w-12 h-12 rounded-full border-2 shadow-sm transition-all hover:scale-110 flex items-center justify-center ${viewColor === c ? 'ring-2 ring-offset-2 ring-offset-lilac-900 ring-gold-500 scale-110 border-white' : 'border-lilac-700 opacity-80 hover:opacity-100'}`}
                                        style={{ backgroundColor: c === 'blanco' ? '#fff' : c === 'negro' ? '#000' : c === 'blanco_hueso' ? '#F5F5DC' : c === 'verde_oliva' ? '#556B2F' : c === 'beige' ? '#F5F5DC' : c }}
                                    >
                                        {(c === 'blanco' || c === 'blanco_hueso') && viewColor === c && <Check className="w-5 h-5 text-black" />}
                                        {(c !== 'blanco' && c !== 'blanco_hueso') && viewColor === c && <Check className="w-5 h-5 text-white" />}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-lilac-400 mt-2 font-medium capitalize">{viewColor?.replace(/_/g, ' ') || 'Selecciona un color'}</p>
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
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-lilac-950/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setUpsellModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform scale-100 transition-transform relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setUpsellModalOpen(false)} className="absolute top-4 right-4 text-lilac-400 hover:text-lilac-600 z-10">
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold text-lilac-900 mb-2">¿Deseas agregar Tzitziyot?</h3>
                        <p className="text-lilac-600 mb-6">
                            Cumple con el mandamiento agregando Tzitziyot a tu camisa por solo <span className="font-bold">$6.00</span> adicionales.
                        </p>

                        {/* Preview Image */}
                        <div className="mb-6 rounded-xl overflow-hidden shadow-md border border-lilac-100 bg-lilac-50">
                            <img
                                src={tzitzitImage || "/products/camisa_tzitziyot_add.jpeg"}
                                alt="Camisa con Tzitziyot"
                                className="w-full h-auto mix-blend-multiply"
                            />
                        </div>

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

            {/* Product Detail Modal (Shared) */}
            {detailModalOpen && pendingAddToCart && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-lilac-950/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setDetailModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform scale-100 transition-transform flex flex-col gap-4 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setDetailModalOpen(false)} className="absolute top-4 right-4 text-lilac-400 hover:text-lilac-600 z-10">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-inner relative flex items-center justify-center p-2">
                            {/* Display the image of the pending product */}
                            {pendingAddToCart.variant?.media[0]?.type === 'video' ? (
                                <video src={pendingAddToCart.variant?.media[0]?.src} className="w-full h-full object-contain" muted loop autoPlay playsInline />
                            ) : (
                                <img src={pendingAddToCart.variant?.media[0]?.src || '/placeholder.jpg'} alt={pendingAddToCart.product.name} className="w-full h-full object-contain" />
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="text-2xl font-bold text-lilac-900 capitalize mb-1">{pendingAddToCart.product.name}</h3>
                            <p className="text-xl font-bold text-gold-600">${pendingAddToCart.variant?.price.toFixed(2)}</p>
                            {pendingAddToCart.product.description && (
                                <p className="text-sm text-lilac-600 bg-lilac-50 p-2 rounded-lg">{pendingAddToCart.product.description}</p>
                            )}
                        </div>

                        {/* Size Selector for Articulos OR Camisas if they have sizes */}
                        {((pendingAddToCart.product.sizes && pendingAddToCart.product.sizes.length > 0) || !pendingAddToCart.isArticle) && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-lilac-700">Talla:</label>
                                <div className="flex flex-wrap gap-2">
                                    {(pendingAddToCart.product.sizes && pendingAddToCart.product.sizes.length > 0) ? pendingAddToCart.product.sizes.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${size === s ? 'bg-lilac-900 text-white border-lilac-900' : 'bg-white text-lilac-600 border-lilac-200 hover:border-lilac-400'}`}
                                        >
                                            {s}
                                        </button>
                                    )) : (
                                        ['S', 'M', 'L', 'XL'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setSize(s)}
                                                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${size === s ? 'bg-lilac-900 text-white border-lilac-900' : 'bg-white text-lilac-600 border-lilac-200 hover:border-lilac-400'}`}
                                            >
                                                {s}
                                            </button>
                                        ))
                                    )}
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

                        <button
                            onClick={handleDetailModalAction}
                            className="w-full bg-gold-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gold-700 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-2"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {pendingAddToCart.isArticle ? `Agregar al Carrito - $${((pendingAddToCart.variant?.price || 0) * quantity).toFixed(2)}` : 'Continuar'}
                        </button>
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
                                    <div
                                        key={prod.id}
                                        className="bg-white rounded-2xl shadow-sm border border-lilac-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                                        onClick={() => openDetailModal(prod, prod.variants[0], true)}
                                    >
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
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDetailModal(prod, prod.variants[0], true);
                                                    }}
                                                    className="bg-gold-600 text-white p-3 rounded-full hover:bg-gold-700 transition-colors shadow-md transform hover:scale-110 active:scale-95"
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
                                            <p className="font-bold text-lilac-100 font-serif tracking-wide">Viendo: <span className="text-gold-400 font-sans font-normal">{viewModel?.replace(/modelo_/g, 'Modelo ') || viewEdition?.replace(/_/g, ' ')} {viewColor && <span>- <span className="capitalize">{viewColor.replace(/_/g, ' ')}</span></span>}</span></p>
                                        </div>
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

                                                    // NEW: Open Detail Modal immediately
                                                    // Find the product that owns this variant
                                                    const parentProduct = products.find(p => p.variants && p.variants.some(v => v === media.variant));
                                                    if (parentProduct) {
                                                        openDetailModal(parentProduct, media.variant, false);
                                                    }
                                                }
                                            }}
                                            className={`rounded-2xl overflow-hidden shadow-sm border bg-white cursor-pointer transition-all hover:shadow-md group ${media.variant?.model === model && media.variant?.color === color ? 'ring-2 ring-lilac-500 border-transparent' : 'border-lilac-100'}`}
                                        >
                                            <div className="relative aspect-[3/4] overflow-hidden">
                                                {media.type === 'video' ? (
                                                    <video src={media.src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" controls playsInline />
                                                ) : (
                                                    <img src={media.src} alt="Vista previa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                )}
                                            </div>
                                            <div className="p-3 bg-lilac-50 text-xs text-lilac-600 hidden">
                                                Click para seleccionar
                                            </div>
                                        </div>
                                    ))}
                                    {displayedMedia.length === 0 && (
                                        viewEdition === 'Personalizado' ? (
                                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                                                <div className="bg-lilac-100/50 p-8 rounded-3xl border border-lilac-200 max-w-lg mx-auto">
                                                    <h3 className="text-xl font-bold text-lilac-900 mb-4">Personaliza tu Camisa</h3>
                                                    <p className="text-lilac-800 mb-6 leading-relaxed">
                                                        Para conocer más detalles sobre la personalización de las camisas, ponte en contacto con nosotros por WhatsApp para mostrarle las opciones disponibles.
                                                    </p>
                                                    <a
                                                        href="https://wa.me/593000000000?text=Hola,%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20camisas%20personalizadas"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                        </svg>
                                                        Contactar por WhatsApp
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="col-span-full py-20 text-center text-lilac-400 border-2 border-dashed border-lilac-200 rounded-2xl bg-lilac-50/50">
                                                <p>No se encontraron imágenes para esta selección.</p>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Sticky Action Footer for Shirts - REMOVED as it is replaced by Modal */}
                                {/* {(model) && color && edition !== 'Personalizado' && ( ... )} */}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
