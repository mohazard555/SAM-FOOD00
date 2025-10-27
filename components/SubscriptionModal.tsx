import React from 'react';
import { CloseIcon } from './icons';

interface SubscriptionModalProps {
  youtubeChannel: string;
  onConfirm: () => void;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ youtubeChannel, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-2 left-2 text-gray-400 hover:text-gray-600">
            <CloseIcon />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">افتح الوصفة</h2>
        <p className="text-gray-600 mb-6">لعرض الوصفة الكاملة، يرجى الاشتراك في قناتنا على يوتيوب أولاً. دعمكم يساعدنا على إنشاء المزيد من المحتوى اللذيذ!</p>
        <a 
          href={youtubeChannel} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full inline-block bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 mb-4"
        >
          اشترك في قناة اليوتيوب
        </a>
        <button 
          onClick={onConfirm}
          className="w-full bg-amber-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-600 transition-colors duration-300"
        >
          لقد اشتركت!
        </button>
        <p className="text-xs text-gray-400 mt-4">ملاحظة: هذا يعتمد على الثقة. شكرا لدعمكم!</p>
      </div>
    </div>
  );
};

export default SubscriptionModal;