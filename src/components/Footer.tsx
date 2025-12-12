'use client';

import React from 'react';
import { Instagram, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-lilac-950 border-t border-lilac-900 mt-20">
            <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
                <div className="flex justify-center space-x-8">
                    <a href="https://www.instagram.com/alef.ec" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 transition-colors">
                        <span className="sr-only">Instagram</span>
                        <Instagram className="h-6 w-6" />
                    </a>
                    <a href="https://wa.me/593983811117" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 transition-colors">
                        <span className="sr-only">WhatsApp</span>
                        <Phone className="h-6 w-6" />
                    </a>
                </div>
                <p className="mt-8 text-center text-sm text-lilac-200 font-serif tracking-wide opacity-80">
                    &copy; {new Date().getFullYear()} ALEF. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}
