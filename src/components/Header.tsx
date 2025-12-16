import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { openCart, items } = useCart();
    // ... rest of component ...

    // In render:
                        <button onClick={(e) => {
                            e.preventDefault();
                            if (pathname === '/') {
                                window.dispatchEvent(new CustomEvent('navigate-to-store'));
                            } else {
                                router.push('/#products');
                            }
                        }} className="text-lilac-900 hover:text-gold-600 font-medium transition-colors tracking-wide text-sm uppercase cursor-pointer bg-transparent border-none p-0">
                            Productos
                        </button>
                        <Link href="/faq" className="text-lilac-900 hover:text-gold-600 font-medium transition-colors tracking-wide text-sm uppercase">
                            Preguntas Frecuentes
                        </Link>
                        <a href="https://www.instagram.com/alef.ec" target="_blank" rel="noopener noreferrer" className="text-lilac-900 hover:text-gold-600 transition-colors">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="https://wa.me/593983811117" target="_blank" rel="noopener noreferrer" className="text-lilac-900 hover:text-gold-600 transition-colors">
                            <Phone className="w-5 h-5" />
                        </a>
                    </nav >

        {/* Cart Icon */ }
        < div className = "flex items-center space-x-4" >
            <button
                onClick={openCart}
                className="relative p-2 text-lilac-800 hover:text-lilac-600 transition-colors hover:bg-lilac-100 rounded-full"
            >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-lilac-600 rounded-full">
                        {cartCount}
                    </span>
                )}
            </button>

    {/* Mobile Menu Button */ }
    <div className="md:hidden">
        <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-lilac-800 hover:text-lilac-600 focus:outline-none"
        >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
    </div>
                    </div >
                </div >
            </div >

        {/* Mobile Menu */ }
    {
        mobileMenuOpen && (
            <div className="md:hidden bg-lilac-50 border-t border-lilac-100">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link href="/#products" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-lilac-800 hover:text-lilac-600 hover:bg-lilac-100">
                        Productos
                    </Link>
                    <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-lilac-800 hover:text-lilac-600 hover:bg-lilac-100">
                        Preguntas Frecuentes
                    </Link>
                    <div className="flex space-x-4 px-3 py-2">
                        <a href="https://www.instagram.com/alef.ec" target="_blank" rel="noopener noreferrer" className="text-lilac-800">
                            <Instagram className="w-6 h-6" />
                        </a>
                        <a href="https://wa.me/593983811117" target="_blank" rel="noopener noreferrer" className="text-lilac-800">
                            <Phone className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </div>
        )
    }
        </header >
    );
}
