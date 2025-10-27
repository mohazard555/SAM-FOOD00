import React, { useState, useEffect, useCallback } from 'react';
import type { AppData } from './types';
import { View } from './types';
import { fetchGistData, updateGistData } from './services/gistService';
import { DEFAULT_APP_DATA } from './defaultData';

import Header from './components/Header';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import AdBanner from './components/AdBanner';

const DEFAULT_GIST_ID = "YOUR_GIST_ID_HERE";

const App: React.FC = () => {
    const [appData, setAppData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    
    const [currentView, setCurrentView] = useState<View>(View.Home);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginError, setLoginError] = useState<string | undefined>(undefined);

    const loadData = useCallback(async (gistId: string) => {
        setIsLoading(true);
        setError(null);
        setIsDemoMode(false);

        if (!gistId || gistId === DEFAULT_GIST_ID) {
            console.log("Running in setup mode. Please configure your Gist ID in the admin panel.");
            const data = DEFAULT_APP_DATA;
            setAppData(data);
            document.title = data.settings.siteName;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', data.settings.siteDescription);
            }
            setIsDemoMode(true);
            setIsLoading(false);
            return;
        }

        try {
            const data = await fetchGistData(gistId);
            if (data) {
                setAppData(data);
                document.title = data.settings.siteName;
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) {
                    metaDesc.setAttribute('content', data.settings.siteDescription);
                }
                if (sessionStorage.getItem('gistId') !== data.settings.gistId) {
                    sessionStorage.setItem('gistId', data.settings.gistId);
                }
            } else {
                setError(`لا يمكن تحميل البيانات. تأكد من صحة معرف Gist وأن Gist يحتوي على ملف 'recipe-hub-data.json'.`);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`فشل في جلب البيانات من Gist. تحقق من اتصالك بالشبكة ومعرف Gist. الخطأ: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const sessionGistId = sessionStorage.getItem('gistId');
        loadData(sessionGistId || DEFAULT_GIST_ID);
    }, [loadData]);


    const handleUpdate = async (newData: AppData) => {
        const { gistId, githubToken } = newData.settings;

        const canUpdateGist = gistId && gistId !== DEFAULT_GIST_ID && githubToken;

        if (canUpdateGist) {
            try {
                await updateGistData(gistId, githubToken, newData);
                setAppData(newData);
                alert("تم حفظ البيانات بنجاح في GitHub Gist!");

                if (!appData || gistId !== appData.settings.gistId) {
                    sessionStorage.setItem('gistId', gistId);
                    window.location.reload();
                }
            } catch (error) {
                console.error("Failed to update Gist:", error);
                throw error; 
            }
        } else {
            setAppData(newData);
            if (isDemoMode) {
                 alert("تم تحديث الإعدادات محليًا. قدم معرف Gist ورمز وصول صالحين في الإعدادات لمزامنة تغييراتك.");
            } else {
                 throw new Error("لا يمكن الحفظ: معرف Gist أو رمز GitHub مفقود في الإعدادات.");
            }
        }
    };
    
    const handleLogin = (user: string, pass: string) => {
        if (appData && user === appData.settings.adminUser && pass === appData.settings.adminPass) {
            setIsLoggedIn(true);
            setCurrentView(View.Admin);
            setLoginError(undefined);
        } else {
            setLoginError("اسم المستخدم أو كلمة المرور غير صالحة.");
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentView(View.Home);
    };

    const handleNavigate = (view: View, recipeId?: string) => {
        setCurrentView(view);
        if (recipeId) setSelectedRecipeId(recipeId);
        window.scrollTo(0, 0);
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10">جاري تحميل الوصفات...</div>;
        }
        if (error) {
            return <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg max-w-4xl mx-auto my-4 border border-red-200">
                <h3 className="font-bold text-lg mb-2">خطأ في التطبيق</h3>
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-4 text-gray-500">إذا كانت هذه هي المرة الأولى التي تشغل فيها التطبيق، يرجى تسجيل الدخول باستخدام المستخدم: 'admin' وكلمة المرور: 'password' لتكوين إعداداتك.</p>
            </div>;
        }
        if (!appData) {
            return <div className="text-center p-10">لا توجد بيانات متاحة.</div>;
        }

        switch (currentView) {
            case View.RecipeDetail:
                const recipe = appData.recipes.find(r => r.id === selectedRecipeId);
                return recipe ? <RecipeDetail recipe={recipe} youtubeChannel={appData.settings.youtubeChannel} onBack={() => handleNavigate(View.Home)} /> : <div>الوصفة غير موجودة</div>;
            
            case View.Login:
                return <Login onLogin={handleLogin} error={loginError} />;
            
            case View.Admin:
                return isLoggedIn ? <AdminPanel appData={appData} onUpdate={handleUpdate} isDemoMode={isDemoMode} /> : <Login onLogin={handleLogin} error="يرجى تسجيل الدخول للوصول إلى لوحة التحكم." />;

            case View.Home:
            default:
                const sortedRecipes = [...appData.recipes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                return (
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <AdBanner ads={appData.ads} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {sortedRecipes.map(recipe => (
                                <RecipeCard key={recipe.id} recipe={recipe} onClick={() => handleNavigate(View.RecipeDetail, recipe.id)} />
                            ))}
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-stone-50 text-gray-800 font-sans">
            {appData && <Header settings={appData.settings} isLoggedIn={isLoggedIn} onNavigate={handleNavigate} onLogout={handleLogout} />}
            <main>
                {renderContent()}
            </main>
            <footer className="text-center py-4 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} {appData?.settings.siteName || 'مطبخ الشيف'}. جميع الحقوق محفوظة.</p>
            </footer>
        </div>
    );
};

export default App;