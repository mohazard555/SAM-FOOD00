import React from 'react';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer group hover:shadow-xl"
      onClick={onClick}
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src={recipe.imageUrl} 
          alt={recipe.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      </div>
      <div className="p-5">
        <span className="inline-block bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide">
          {recipe.category}
        </span>
        <h3 className="mt-2 text-xl font-semibold text-gray-800 h-14">{recipe.name}</h3>
      </div>
    </div>
  );
};

export default RecipeCard;