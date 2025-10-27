import React, { useState, useRef } from 'react';
import type { AppData, Recipe, Ad, Settings } from '../types';
import { EditIcon, DeleteIcon, PlusIcon } from './icons';

interface AdminPanelProps {
  appData: AppData;
  onUpdate: (data: AppData) => Promise<void>;
  isDemoMode?: boolean;
}

type AdminTab = 'recipes' | 'ads' | 'settings';

const SETTINGS_LABELS: { [key in keyof Settings]: string } = {
  siteName: 'اسم الموقع',
  siteDescription: 'وصف الموقع',
  siteLogo: 'شعار الموقع',
  youtubeChannel: 'رابط قناة يوتيوب',
  gistId: 'معرف Gist',
  githubToken: 'رمز GitHub الشخصي',
  adminUser: 'اسم المستخدم للمسؤول',
  adminPass: 'كلمة مرور المسؤول',
};


const AdminPanel: React.FC<AdminPanelProps> = ({ appData, onUpdate, isDemoMode }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('recipes');
  const [isSaving, setIsSaving] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<Settings>(appData.settings);
  const [currentAds, setCurrentAds] = useState<Ad[]>(appData.ads);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (updatedData: AppData) => {
    setIsSaving(true);
    try {
      await onUpdate(updatedData);
    } catch (error) {
      alert(`خطأ في حفظ البيانات: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave({ ...appData, settings: currentSettings });
  };
  
  const handleAdChange = (index: number, field: keyof Ad, value: string) => {
    const newAds = [...currentAds];
    newAds[index] = {...newAds[index], [field]: value};
    setCurrentAds(newAds);
  };

  const handleAddAd = () => {
    setCurrentAds([...currentAds, { id: Date.now().toString(), text: '', link: '' }]);
  };

  const handleDeleteAd = (id: string) => {
    setCurrentAds(currentAds.filter(ad => ad.id !== id));
  };
  
  const handleSaveAds = () => {
    handleSave({ ...appData, ads: currentAds });
  };

  const handleRecipeSave = (recipe: Recipe) => {
    let updatedRecipes;
    if (currentRecipe && recipe.id === currentRecipe.id) {
        updatedRecipes = appData.recipes.map(r => r.id === recipe.id ? recipe : r);
    } else {
        const newRecipe = { ...recipe, id: recipe.id || Date.now().toString(), createdAt: recipe.createdAt || new Date().toISOString() };
        updatedRecipes = [newRecipe, ...appData.recipes];
    }
    handleSave({ ...appData, recipes: updatedRecipes });
    setIsRecipeModalOpen(false);
    setCurrentRecipe(null);
  };
  
  const handleRecipeDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من أنك تريد حذف هذه الوصفة؟")) {
        const updatedRecipes = appData.recipes.filter(r => r.id !== id);
        handleSave({ ...appData, recipes: updatedRecipes });
    }
  };
  
  const handleExport = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'recipe-hub-backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (importedData.settings && importedData.recipes && importedData.ads) {
            if (window.confirm("هل أنت متأكد من رغبتك في استيراد هذه البيانات؟ سيؤدي هذا إلى الكتابة فوق البيانات الحالية.")) {
              handleSave(importedData);
              setCurrentSettings(importedData.settings);
              setCurrentAds(importedData.ads);
            }
          } else {
            alert('تنسيق البيانات غير صالح.');
          }
        } catch (error) {
          alert('خطأ في تحليل ملف JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderRecipes = () => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">إدارة الوصفات</h3>
            <button onClick={() => { setCurrentRecipe(null); setIsRecipeModalOpen(true); }} className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center transition-colors">
                <PlusIcon className="w-5 h-5 ml-2" /> إضافة وصفة
            </button>
        </div>
        <div className="space-y-3">
            {appData.recipes.map(recipe => (
                <div key={recipe.id} className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                    <span>{recipe.name}</span>
                    <div className="space-x-2">
                        <button onClick={() => { setCurrentRecipe(recipe); setIsRecipeModalOpen(true); }} className="text-blue-500 hover:text-blue-700"><EditIcon /></button>
                        <button onClick={() => handleRecipeDelete(recipe.id)} className="text-red-500 hover:text-red-700"><DeleteIcon /></button>
                    </div>
                </div>
            ))}
        </div>
        {isRecipeModalOpen && <RecipeForm recipe={currentRecipe} onSave={handleRecipeSave} onClose={() => setIsRecipeModalOpen(false)} />}
    </div>
  );

  const renderAds = () => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">إدارة الإعلانات</h3>
            <button onClick={handleAddAd} className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center transition-colors">
                <PlusIcon className="w-5 h-5 ml-2" /> إضافة إعلان
            </button>
        </div>
        <div className="space-y-4">
            {currentAds.map((ad, index) => (
                <div key={ad.id} className="bg-gray-100 p-4 rounded-lg space-y-2">
                    <input type="text" placeholder="نص الإعلان" value={ad.text} onChange={e => handleAdChange(index, 'text', e.target.value)} className="w-full p-2 border rounded"/>
                    <input type="text" placeholder="رابط الإعلان" value={ad.link} onChange={e => handleAdChange(index, 'link', e.target.value)} className="w-full p-2 border rounded"/>
                    <button onClick={() => handleDeleteAd(ad.id)} className="text-red-500 hover:text-red-700 text-sm">إزالة</button>
                </div>
            ))}
        </div>
        <button onClick={handleSaveAds} className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors" disabled={isSaving}>
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعلانات'}
        </button>
    </div>
  );

  const renderSettings = () => (
    <form onSubmit={handleSaveSettings} className="space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2">إعدادات الموقع</h3>
        {(Object.keys(currentSettings) as Array<keyof Settings>).map(key => (
            <div key={key}>
                <label className="block text-sm font-medium text-gray-700">{SETTINGS_LABELS[key]}</label>
                <input dir="ltr" type={key === 'adminPass' || key === 'githubToken' ? 'password' : 'text'} value={currentSettings[key]} onChange={e => setCurrentSettings({...currentSettings, [key]: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
            </div>
        ))}
        <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors" disabled={isSaving}>
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
        <h3 className="text-xl font-semibold border-b pb-2 pt-6">إدارة البيانات</h3>
        <div className="flex space-x-4">
            <button type="button" onClick={handleExport} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">تصدير البيانات</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">استيراد البيانات</button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
        </div>
    </form>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isDemoMode && (
          <div className="bg-yellow-100 border-r-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
              <p className="font-bold">الإعداد مطلوب</p>
              <p>يعمل تطبيقك في الوضع المحلي. يرجى تكوين معرف GitHub Gist ورمز الوصول الشخصي في علامة التبويب <strong>الإعدادات</strong> والحفظ لتمكين مزامنة البيانات.</p>
          </div>
      )}
      <h2 className="text-3xl font-bold mb-6">لوحة التحكم</h2>
      <div className="flex border-b mb-6">
        {(['recipes', 'ads', 'settings'] as AdminTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize px-4 py-2 -mb-px ${activeTab === tab ? 'border-b-2 border-amber-500 text-amber-600 font-semibold' : 'text-gray-500'}`}>
            {tab === 'recipes' ? 'الوصفات' : tab === 'ads' ? 'الإعلانات' : 'الإعدادات'}
          </button>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'recipes' && renderRecipes()}
        {activeTab === 'ads' && renderAds()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};


interface RecipeFormProps {
    recipe: Recipe | null;
    onSave: (recipe: Recipe) => void;
    onClose: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipe, onSave, onClose }) => {
    const [formData, setFormData] = useState<Recipe>(recipe || {
        id: '',
        name: '',
        category: '',
        imageUrl: '',
        ingredients: [''],
        instructions: [''],
        createdAt: new Date().toISOString()
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleListChange = (type: 'ingredients' | 'instructions', index: number, value: string) => {
        const newList = [...formData[type]];
        newList[index] = value;
        setFormData({ ...formData, [type]: newList });
    };

    const addListItem = (type: 'ingredients' | 'instructions') => {
        setFormData({ ...formData, [type]: [...formData[type], ''] });
    };

    const removeListItem = (type: 'ingredients' | 'instructions', index: number) => {
        if (formData[type].length > 1) {
            const newList = formData[type].filter((_, i) => i !== index);
            setFormData({ ...formData, [type]: newList });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-4">{recipe ? 'تعديل' : 'إضافة'} وصفة</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="اسم الوصفة" className="w-full p-2 border rounded" required />
                    <input name="category" value={formData.category} onChange={handleChange} placeholder="القسم" className="w-full p-2 border rounded" required />
                    <input dir="ltr" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="رابط الصورة" className="w-full p-2 border rounded" required />
                    
                    <div>
                        <label className="font-semibold">المكونات</label>
                        {formData.ingredients.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 my-1">
                                <input value={item} onChange={(e) => handleListChange('ingredients', index, e.target.value)} className="w-full p-2 border rounded" />
                                <button type="button" onClick={() => removeListItem('ingredients', index)} className="text-red-500 p-1 rounded-full hover:bg-red-100">&ndash;</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem('ingredients')} className="text-sm text-blue-500 mt-1">إضافة مكون</button>
                    </div>

                    <div>
                        <label className="font-semibold">التعليمات</label>
                        {formData.instructions.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 my-1">
                                <textarea value={item} onChange={(e) => handleListChange('instructions', index, e.target.value)} className="w-full p-2 border rounded" rows={2} />
                                <button type="button" onClick={() => removeListItem('instructions', index)} className="text-red-500 p-1 rounded-full hover:bg-red-100">&ndash;</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem('instructions')} className="text-sm text-blue-500 mt-1">إضافة تعليمة</button>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">إلغاء</button>
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">حفظ الوصفة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminPanel;