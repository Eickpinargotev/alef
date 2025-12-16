'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Phone, CheckCircle, Copy } from 'lucide-react';

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeFromCart, total } = useCart();
    const [isCheckout, setIsCheckout] = useState(false);
    const [phone, setPhone] = useState('');
    const [orderGenerated, setOrderGenerated] = useState(false);
    const [loading, setLoading] = useState(false);

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCheckout = async () => {
        if (phone.length < 10) return;
        setLoading(true);

        const orderData = {
            customer: {
                phone: phone,
            },
            items: items.map(item => ({
                product: item.productName,
                quantity: item.quantity,
                price: item.price,
                attributes: item.attributes
            })),
            total: total,
            timestamp: new Date().toISOString()
        };

        try {
            // Send webhook
            await fetch('https://paneln8n.erickpinargote.com/webhook/alef', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            setOrderGenerated(true);
        } catch (error) {
            console.error('Error sending order', error);
            alert('Hubo un error generando la orden. Intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden">
            <div className="absolute inset-0 bg-lilac-950/50 backdrop-blur-sm" onClick={closeCart} />

            <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
                <div className="w-full h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-lilac-100 flex justify-between items-center bg-lilac-50">
                        <h2 className="text-xl font-bold text-lilac-900">
                            {isCheckout ? 'Finalizar Compra' : 'Tu Carrito'}
                        </h2>
                        <button onClick={closeCart} className="text-lilac-400 hover:text-lilac-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {!isCheckout ? (
                        /* Cart View */
                        <>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {items.length === 0 ? (
                                    <p className="text-center text-lilac-400 mt-10">Tu carrito está vacío.</p>
                                ) : (
                                    items.map(item => (
                                        <div key={item.cartId} className="flex gap-4 p-4 bg-lilac-50 rounded-xl border border-lilac-100">
                                            <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lilac-900 line-clamp-1">{item.productName}</h3>
                                                <div className="text-xs text-lilac-500 mt-1 space-y-1">
                                                    {item.attributes.model && <p>Modelo: {item.attributes.model.replace(/modelo_/g, '')}</p>}
                                                    {item.attributes.color && <p>Color: <span className="capitalize">{item.attributes.color}</span></p>}
                                                    {item.attributes.size && <p>Talla: {item.attributes.size}</p>}
                                                    {item.attributes.tzitziyot && <p className="text-lilac-700 font-medium">+ Tzitziyot</p>}
                                                </div>
                                                <div className="flex justify-between items-center mt-3">
                                                    <span className="font-bold text-lilac-800">${item.price.toFixed(2)}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-lilac-600">x{item.quantity}</span>
                                                        <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {items.length > 0 && (
                                <div className="p-6 border-t border-lilac-100 bg-lilac-50">
                                    <div className="flex justify-between text-lg font-bold text-lilac-900 mb-6">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={() => setIsCheckout(true)}
                                        className="w-full bg-gold-600 hover:bg-gold-700 text-white py-4 rounded-xl font-bold shadow-lg transition-colors tracking-wide uppercase"
                                    >
                                        PROCEDER AL PAGO
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Checkout View */
                        <div className="flex-1 overflow-y-auto p-6">
                            {!orderGenerated ? (
                                <div className="space-y-6">
                                    {/* Order Summary */}
                                    <div className="bg-lilac-50 p-4 rounded-xl border border-lilac-100">
                                        <h3 className="font-bold text-lilac-800 mb-3">Resumen del Pedido</h3>
                                        <div className="space-y-2 text-sm text-lilac-600 max-h-40 overflow-y-auto">
                                            {items.map(item => (
                                                <div key={item.cartId} className="flex justify-between">
                                                    <span>{item.quantity}x {item.productName}</span>
                                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between font-bold text-lilac-900 mt-4 pt-4 border-t border-lilac-200">
                                            <span>Total a Pagar</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Phone Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-lilac-700 mb-2">
                                            Número de Celular (Para seguimiento)
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lilac-400 w-5 h-5" />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Ej: 0983811117"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-lilac-300 focus:ring-2 focus:ring-lilac-500 focus:border-transparent outline-none transition-all text-lilac-900 placeholder-lilac-300"
                                            />
                                        </div>
                                        <p className="text-xs text-lilac-400 mt-1">Ingresa al menos 10 dígitos para continuar.</p>
                                    </div>

                                    <button
                                        disabled={phone.length < 10 || loading}
                                        onClick={handleCheckout}
                                        className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex justify-center items-center gap-2 tracking-wide uppercase ${phone.length >= 10 && !loading ? 'bg-gold-600 hover:bg-gold-500 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        {loading ? 'Procesando...' : 'GENERAR ORDEN'}
                                    </button>

                                    <button onClick={() => setIsCheckout(false)} className="w-full text-lilac-500 text-sm hover:underline">
                                        Volver al carrito
                                    </button>
                                </div>
                            ) : (
                                /* Payment & Success View */
                                <div className="space-y-8 animate-fade-in">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-lilac-900">¡Orden Generada!</h3>
                                        <p className="text-lilac-600 mt-2">Por favor realiza el pago a una de las siguientes cuentas:</p>
                                    </div>

                                    {/* Bank Details */}
                                    <div className="space-y-4">
                                        <div className="bg-white border border-lilac-200 p-4 rounded-xl relative group">
                                            <h4 className="font-bold text-lilac-800">Banco Bolivariano</h4>
                                            <p className="text-sm text-lilac-600">Ahorros</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="font-mono bg-lilac-50 px-2 py-1 rounded text-lilac-900 select-all">5456486</span>
                                                <button onClick={() => copyToClipboard('5456486')} className="text-lilac-400 hover:text-lilac-600"><Copy className="w-4 h-4" /></button>
                                            </div>
                                        </div>

                                        <div className="bg-white border border-lilac-200 p-4 rounded-xl relative group">
                                            <h4 className="font-bold text-lilac-800">Banco Pichincha</h4>
                                            <p className="text-sm text-lilac-600">Ahorros</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="font-mono bg-lilac-50 px-2 py-1 rounded text-lilac-900 select-all">2568679</span>
                                                <button onClick={() => copyToClipboard('2568679')} className="text-lilac-400 hover:text-lilac-600"><Copy className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* WhatsApp Trigger */}
                                    <div className="bg-lilac-100 p-6 rounded-2xl text-center">
                                        <p className="text-lilac-800 font-medium mb-4">
                                            Para confirmar tu pedido, envíanos el comprobante por WhatsApp:
                                        </p>
                                        <a
                                            href={`https://wa.me/593983811117?text=Hola Alef, adjunto mi comprobante de pago para la orden con celular ${phone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-full font-bold shadow-md transition-colors w-full"
                                        >
                                            <Phone className="w-5 h-5" />
                                            Confirmar en WhatsApp
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
