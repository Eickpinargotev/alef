'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    cartId: string;
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    type: 'camisa' | 'articulo';
    attributes: {
        edition?: string;
        model?: string;
        color?: string;
        size?: string;
        tzitziyot?: boolean;
        gender?: string;
    };
    image: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'cartId'>) => void;
    removeFromCart: (cartId: string) => void;
    clearCart: () => void;
    total: number;
    isOpen: boolean;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load cart from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('alef-cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    // Save cart to local storage on change
    useEffect(() => {
        localStorage.setItem('alef-cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: Omit<CartItem, 'cartId'>) => {
        setItems((prev) => {
            // Check if identical item exists
            const existing = prev.find(
                (item) =>
                    item.productId === newItem.productId &&
                    JSON.stringify(item.attributes) === JSON.stringify(newItem.attributes)
            );

            if (existing) {
                return prev.map((item) =>
                    item.cartId === existing.cartId
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }

            return [...prev, { ...newItem, cartId: crypto.randomUUID() }];
        });
        setIsOpen(true);
    };

    const removeFromCart = (cartId: string) => {
        setItems((prev) => prev.filter((item) => item.cartId !== cartId));
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                clearCart,
                total,
                isOpen,
                toggleCart: () => setIsOpen((prev) => !prev),
                openCart: () => setIsOpen(true),
                closeCart: () => setIsOpen(false),
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
