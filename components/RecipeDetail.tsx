import React, { useState, useEffect } from 'react';
import type { Recipe } from '../types';
import { View } from '../types';
import SubscriptionModal from './SubscriptionModal';
import { PrintIcon, DownloadIcon } from './icons';

interface RecipeDetailProps {
  recipe: Recipe;
  youtubeChannel: string;
  onBack: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, youtubeChannel, onBack }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const subscribed = localStorage.getItem('isSubscribedToChannel') === 'true';
    setIsSubscribed(subscribed);
    if (!subscribed) {
      setShowModal(true);
    }
  }, []);

  const handleConfirmSubscription = () => {
    localStorage.setItem('isSubscribedToChannel', 'true');
    setIsSubscribed(true);
    setShowModal(false);
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    const content = `
الوصفة: ${recipe.name}
القسم: ${recipe.category}

المكونات:
${recipe.ingredients.map(ing => `- ${ing}`).join('\n')}

التعليمات:
${recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}
    `;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showModal && (
        <SubscriptionModal 
          youtubeChannel={youtubeChannel} 
          onConfirm={handleConfirmSubscription}
          onClose={onBack}
        />
      )}
      
      {!isSubscribed && <div className="h-screen"></div> /* Placeholder to prevent content flash */}

      {isSubscribed && (
        <>
        <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                #printable-recipe, #printable-recipe * {
                    visibility: visible;
                }
                #printable-recipe {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    direction: rtl;
                }
                .no-print {
                    display: none;
                }
            }
        `}</style>
        <div id="printable-recipe">
            <button onClick={onBack} className="no-print mb-6 text-amber-600 hover:text-amber-800 font-medium">العودة إلى كل الوصفات &rarr;</button>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-64 md:h-96 object-cover"/>
            <div className="p-6 md:p-10">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block bg-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full uppercase font-semibold tracking-wide mb-2">
                        {recipe.category}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{recipe.name}</h1>
                    </div>
                    <div className="flex space-x-3 no-print">
                        <button onClick={handlePrint} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-amber-500 transition-colors"><PrintIcon /></button>
                        <button onClick={handleDownload} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-amber-500 transition-colors"><DownloadIcon /></button>
                    </div>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-amber-400 pb-2">المكونات</h2>
                    <ul className="mt-4 space-y-2 text-gray-700 list-disc list-inside">
                    {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                    </ul>
                </div>
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-amber-400 pb-2">التعليمات</h2>
                    <ol className="mt-4 space-y-4 text-gray-700">
                    {recipe.instructions.map((inst, i) => (
                        <li key={i} className="flex">
                        <span className="bg-amber-500 text-white rounded-full h-8 w-8 text-center leading-8 font-bold ml-4 flex-shrink-0">{i+1}</span>
                        <p className="flex-1">{inst}</p>
                        </li>
                    ))}
                    </ol>
                </div>
                </div>
            </div>
            </div>
        </div>
        </>
      )}
    </div>
  );
};

export default RecipeDetail;