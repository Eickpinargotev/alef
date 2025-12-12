'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
    {
        question: "¿Qué tipos de telas utilizan?",
        answer: "Utilizamos telas de alta calidad, seleccionadas por su comodidad y durabilidad, asegurando que cada prenda se sienta tan bien como se ve."
    },
    {
        question: "¿Realizan envíos a todo el país?",
        answer: "Sí, realizamos envíos a todo el Ecuador. El tiempo de entrega varía según la ciudad, pero generalmente toma entre 2 a 4 días hábiles."
    },
    {
        question: "¿Puedo personalizar mi pedido?",
        answer: "¡Absolutamente! Ofrecemos opciones de personalización en nuestras camisas, donde puedes elegir colores y tallas específicas. Selecciona la opción 'Personalizado' en la tienda."
    },
    {
        question: "¿Qué son los Tzitziyot?",
        answer: "Los Tzitziyot son flecos que se colocan en las esquinas de las prendas de cuatro puntas, cumpliendo con el mandamiento bíblico. Puedes agregarlos a cualquiera de nuestras camisas por un costo adicional."
    },
    {
        question: "¿Cuáles son los métodos de pago?",
        answer: "Aceptamos transferencias bancarias directas al Banco Bolivariano y Banco Pichincha. Los detalles se proporcionan al finalizar tu pedido."
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <main className="max-w-4xl mx-auto py-16 px-4 min-h-screen bg-lilac-50">
            <h1 className="text-4xl font-bold text-lilac-900 text-center mb-12">Preguntas Frecuentes</h1>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-lilac-100 overflow-hidden">
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-lilac-50 transition-colors"
                        >
                            <span className="font-semibold text-lilac-800">{faq.question}</span>
                            {openIndex === index ? (
                                <ChevronUp className="w-5 h-5 text-lilac-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-lilac-500" />
                            )}
                        </button>
                        {openIndex === index && (
                            <div className="px-6 pb-4 pt-0 text-lilac-600 animate-fade-in">
                                <p className="mt-2 text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}
