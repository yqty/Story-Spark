import React, { useState, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { LocalizationProvider, useLocalization } from './contexts/LocalizationContext';
import type { PromptTemplate, StoryboardScene } from './types';
import { LOCAL_STORAGE_KEYS } from './constants';
import * as geminiService from './services/geminiService';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LoadingSpinner, TrashIcon, WandIcon, EditIcon } from './components/icons';

// Define components inside a single file as requested
// Child Component: PromptTemplateManager
const PromptTemplateManager: React.FC<{
  templates: PromptTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<PromptTemplate[]>>;
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
  onOptimizeTemplate: (templateId: string) => Promise<void>;
  optimizingTemplateId: string | null;
}> = ({ templates, setTemplates, selectedTemplateId, setSelectedTemplateId, onOptimizeTemplate, optimizingTemplateId }) => {
  const { t } = useLocalization();
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return;

    if (editingTemplateId) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplateId 
        ? { ...t, name: newTemplateName, content: newTemplateContent } 
        : t
      ));
    } else {
      const newTemplate: PromptTemplate = {
        id: Date.now().toString(),
        name: newTemplateName,
        content: newTemplateContent,
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
    handleCancelEdit();
  };
  
  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selectedTemplateId === id) {
        setSelectedTemplateId(null);
    }
    if (editingTemplateId === id) {
        handleCancelEdit();
    }
  };

  const handleEditClick = (template: PromptTemplate) => {
    setEditingTemplateId(template.id);
    setNewTemplateName(template.name);
    setNewTemplateContent(template.content);
    // Scroll form into view if on mobile
    const form = document.getElementById('template-form');
    form?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTemplateId(null);
    setNewTemplateName('');
    setNewTemplateContent('');
  };

  const editingTemplate = templates.find(t => t.id === editingTemplateId);
  const buttonClass = "p-1.5 text-base-content/60 dark:text-dark-content/60 rounded-full hover:bg-base-200 dark:hover:bg-dark-300 transition-colors";
  const dangerButtonClass = "p-1.5 text-red-500/80 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors";


  return (
    <div className="p-4 bg-base-100 dark:bg-dark-200 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">{t('promptTemplates')}</h2>
      <div className="space-y-2 flex-grow overflow-y-auto pr-2">
        {templates.map(template => (
          <div key={template.id} 
            className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-start ${selectedTemplateId === template.id ? 'bg-brand-secondary text-white' : 'bg-base-200 dark:bg-dark-300 hover:bg-blue-100 dark:hover:bg-dark-200'}`}
            onClick={() => setSelectedTemplateId(template.id)}>
            <div className="flex-1 mr-2">
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-xs opacity-70 mt-1 line-clamp-2">{template.content}</p>
            </div>
            <div className="flex items-center space-x-1">
                <button title={t('autoOptimize')} onClick={(e) => { e.stopPropagation(); onOptimizeTemplate(template.id); }} disabled={!!optimizingTemplateId} className={buttonClass}>
                    {optimizingTemplateId === template.id ? <LoadingSpinner className="w-4 h-4" /> : <WandIcon className="w-4 h-4" />}
                </button>
                 <button title={t('edit')} onClick={(e) => { e.stopPropagation(); handleEditClick(template); }} className={buttonClass}>
                    <EditIcon className="w-4 h-4" />
                </button>
                <button title={t('delete')} onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }} className={dangerButtonClass}>
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
          </div>
        ))}
      </div>
      <div id="template-form" className="mt-4 border-t border-base-200 dark:border-dark-300 pt-4">
        <h3 className="font-semibold mb-2">{editingTemplateId ? `${t('editTemplate')}: ${editingTemplate?.name}` : t('newTemplate')}</h3>
        <input type="text" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder={t('templateName')} className="w-full p-2 border rounded-md bg-base-100 dark:bg-dark-100 border-base-300 dark:border-dark-300 mb-2" />
        <textarea value={newTemplateContent} onChange={e => setNewTemplateContent(e.target.value)} placeholder={t('templateContent')} rows={4} className="w-full p-2 border rounded-md bg-base-100 dark:bg-dark-100 border-base-300 dark:border-dark-300 mb-2"></textarea>
        <div className="flex items-center gap-2">
            {editingTemplateId && (
                <button onClick={handleCancelEdit} className="w-full bg-base-200 dark:bg-dark-300 p-2 rounded-md hover:bg-base-300 dark:hover:bg-dark-200 transition-colors">{t('cancel')}</button>
            )}
            <button onClick={handleSaveTemplate} className="w-full bg-brand-primary text-white p-2 rounded-md hover:bg-blue-800 transition-colors">{editingTemplateId ? t('saveChanges') : t('addTemplate')}</button>
        </div>
      </div>
    </div>
  );
};

// Child Component: StoryCanvas
const StoryCanvas: React.FC<{
  story: string;
  setStory: (story: string) => void;
  onAutoFormat: () => Promise<void>;
  onGenerateStoryboard: () => Promise<void>;
  isProcessing: boolean;
  processingMessage: string;
}> = ({ story, setStory, onAutoFormat, onGenerateStoryboard, isProcessing, processingMessage }) => {
  const { t } = useLocalization();

  return (
    <div className="p-4 bg-base-100 dark:bg-dark-200 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t('storyCanvas')}</h2>
        <div className="flex space-x-2">
          <button onClick={onAutoFormat} disabled={!story || isProcessing} className="flex items-center gap-2 px-3 py-2 text-sm bg-brand-secondary text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            <WandIcon className="w-4 h-4"/> {t('autoFormat')}
          </button>
          <button onClick={onGenerateStoryboard} disabled={!story || isProcessing} className="px-3 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">{t('generateStoryboard')}</button>
        </div>
      </div>
      <div className="relative flex-grow">
        <textarea value={story} onChange={e => setStory(e.target.value)} placeholder={t('storyPlaceholder')} className="w-full h-full p-3 border rounded-md bg-base-100 dark:bg-dark-100 border-base-300 dark:border-dark-300 resize-none"></textarea>
        {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center rounded-md">
                <LoadingSpinner className="w-10 h-10 text-white"/>
                <p className="mt-4 text-white font-semibold">{processingMessage}</p>
            </div>
        )}
      </div>
    </div>
  );
};

// Child Component: StoryboardViewer
const StoryboardViewer: React.FC<{
  scenes: StoryboardScene[];
  onGenerateImage: (sceneIndex: number) => Promise<void>;
}> = ({ scenes, onGenerateImage }) => {
    const { t } = useLocalization();

    if (scenes.length === 0) {
        return (
            <div className="p-4 bg-base-100 dark:bg-dark-200 rounded-lg shadow-md h-full flex items-center justify-center">
                <p className="text-base-content/60 dark:text-dark-content/60">{t('noStoryboard')}</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-base-100 dark:bg-dark-200 rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4">{t('storyboard')}</h2>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {scenes.map((scene, index) => (
                    <div key={scene.sceneNumber} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-base-200 dark:bg-dark-300 rounded-lg">
                        <div className="md:col-span-2 space-y-2 text-sm">
                            <h3 className="font-bold text-lg">
                                {t('scene')} #{scene.sceneNumber}
                            </h3>
                            <p><strong className="font-semibold">{t('camera')}:</strong> {scene.cameraAngle}</p>
                            <p><strong className="font-semibold">{t('setting')}:</strong> {scene.setting}</p>
                            <p><strong className="font-semibold">{t('action')}:</strong> {scene.action}</p>
                            <p><strong className="font-semibold">{t('dialogue')}:</strong> <em>{scene.dialogue || 'N/A'}</em></p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                             {scene.imageLoading ? (
                                <div className="w-full h-32 bg-base-300 dark:bg-dark-200 rounded-md flex flex-col items-center justify-center">
                                    <LoadingSpinner />
                                    <p className="text-xs mt-2">{t('generatingImage')}</p>
                                </div>
                            ) : scene.imageUrl ? (
                                <img src={scene.imageUrl} alt={`Scene ${scene.sceneNumber}`} className="w-full h-auto object-cover rounded-md" />
                            ) : (
                                <div className="w-full h-32 bg-base-300 dark:bg-dark-200 rounded-md flex items-center justify-center">
                                    <p className="text-xs text-base-content/50 dark:text-dark-content/50">{t('visual')}</p>
                                </div>
                            )}
                            <button onClick={() => onGenerateImage(index)} disabled={scene.imageLoading} className="mt-2 w-full px-3 py-2 text-sm bg-brand-secondary text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                                {t('generateImage')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Child Component: StoryGeneratorControls
const StoryGeneratorControls: React.FC<{
    selectedTemplate: PromptTemplate | undefined;
    onGenerate: (prompt: string) => Promise<void>;
    isLoading: boolean;
}> = ({ selectedTemplate, onGenerate, isLoading }) => {
    const { t } = useLocalization();
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [storyTopic, setStoryTopic] = useState('');

    const variableRegex = /{{\s*(\w+)\s*}}/g;
    const placeholders = selectedTemplate ? [...new Set(Array.from(selectedTemplate.content.matchAll(variableRegex), m => m[1]))] : [];

    React.useEffect(() => {
        if (selectedTemplate) {
            const initialVars = placeholders.reduce((acc, key) => ({ ...acc, [key]: '' }), {});
            setVariables(initialVars);
            setStoryTopic('');
        } else {
            setVariables({});
            setStoryTopic('');
        }
    }, [selectedTemplate]);

    const handleVariableChange = (key: string, value: string) => {
        setVariables(prev => ({...prev, [key]: value}));
    };

    const handleGenerateClick = () => {
        if (!selectedTemplate) return;
        let filledTemplate = selectedTemplate.content;
        for (const key in variables) {
            filledTemplate = filledTemplate.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), variables[key]);
        }
        const finalPrompt = `Generate a story based on this topic: "${storyTopic}".\n\nFollow these instructions and template:\n${filledTemplate}`;
        onGenerate(finalPrompt);
    };

    return (
        <div className="p-4 bg-base-100 dark:bg-dark-200 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-bold mb-2">{t('storyGeneration')}</h2>
            {!selectedTemplate ? (
                <p className="text-base-content/60 dark:text-dark-content/60">{t('selectTemplate')}</p>
            ) : (
                <div>
                    <div className="mb-4">
                        <label htmlFor="storyTopic" className="block text-sm font-medium mb-1">{t('storyTopic')}</label>
                        <textarea
                            id="storyTopic"
                            rows={3}
                            value={storyTopic}
                            onChange={(e) => setStoryTopic(e.target.value)}
                            placeholder={t('storyTopicPlaceholder')}
                            className="w-full p-2 border rounded-md bg-base-100 dark:bg-dark-100 border-base-300 dark:border-dark-300 resize-none"
                        />
                    </div>
                    
                    {placeholders.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">{t('fillVariables')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {placeholders.map(key => (
                                    <div key={key}>
                                        <label htmlFor={key} className="block text-sm font-medium mb-1 capitalize">{key}</label>
                                        <input
                                            id={key}
                                            type="text"
                                            value={variables[key] || ''}
                                            onChange={(e) => handleVariableChange(key, e.target.value)}
                                            className="w-full p-2 border rounded-md bg-base-100 dark:bg-dark-100 border-base-300 dark:border-dark-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {placeholders.length === 0 && <p className="text-sm text-base-content/60 dark:text-dark-content/60 mb-4">{t('noVariables')}</p>}

                    <button
                        onClick={handleGenerateClick}
                        disabled={isLoading || !storyTopic.trim()}
                        className="w-full flex justify-center items-center gap-2 bg-brand-primary text-white p-2 rounded-md hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <LoadingSpinner /> : t('generateStory')}
                    </button>
                </div>
            )}
        </div>
    );
};


// AppContent, which contains the main logic and layout
const AppContent: React.FC = () => {
    const { t } = useLocalization();
    const [templates, setTemplates] = useLocalStorage<PromptTemplate[]>(LOCAL_STORAGE_KEYS.TEMPLATES, []);
    const [story, setStory] = useLocalStorage<string>(LOCAL_STORAGE_KEYS.STORY, '');
    const [storyboard, setStoryboard] = useLocalStorage<StoryboardScene[]>(LOCAL_STORAGE_KEYS.STORYBOARD, []);
    
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [optimizingTemplateId, setOptimizingTemplateId] = useState<string | null>(null);

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    const handleGenerateStory = useCallback(async (prompt: string) => {
        setIsGeneratingStory(true);
        try {
            const newStory = await geminiService.generateStory(prompt);
            setStory(newStory);
        } catch (error) {
            alert(t('errorOccurred'));
        } finally {
            setIsGeneratingStory(false);
        }
    }, [setStory, t]);

    const handleAutoFormat = useCallback(async () => {
        if (!story) return;
        setIsProcessing(true);
        setProcessingMessage(t('formattingStory'));
        try {
            const formattedStory = await geminiService.formatStory(story);
            setStory(formattedStory);
        } catch (error) {
            alert(t('errorOccurred'));
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
        }
    }, [story, setStory, t]);

    const handleGenerateStoryboard = useCallback(async () => {
        if (!story) return;
        setIsProcessing(true);
        setProcessingMessage(t('generatingStoryboard'));
        try {
            const scenes = await geminiService.generateStoryboard(story);
            setStoryboard(scenes);
        } catch (error) {
            alert(t('errorOccurred'));
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
        }
    }, [story, setStoryboard, t]);

    const handleGenerateImage = useCallback(async (sceneIndex: number) => {
        const scene = storyboard[sceneIndex];
        if (!scene) return;

        setStoryboard(prev => prev.map((s, i) => i === sceneIndex ? { ...s, imageLoading: true } : s));
        try {
            const imageUrl = await geminiService.generateImageForScene(scene.action);
            setStoryboard(prev => prev.map((s, i) => i === sceneIndex ? { ...s, imageUrl, imageLoading: false } : s));
        } catch (error) {
            alert(t('errorOccurred'));
            setStoryboard(prev => prev.map((s, i) => i === sceneIndex ? { ...s, imageLoading: false } : s));
        }
    }, [storyboard, setStoryboard, t]);
    
    const handleOptimizeTemplate = useCallback(async (templateId: string) => {
        const originalTemplate = templates.find(t => t.id === templateId);
        if (!originalTemplate) return;

        setOptimizingTemplateId(templateId);
        try {
            const optimizedContent = await geminiService.optimizeTemplate(originalTemplate.content);
            setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, content: optimizedContent } : t));
        } catch (error) {
            alert(t('errorOccurred'));
        } finally {
            setOptimizingTemplateId(null);
        }
    }, [templates, setTemplates, t]);

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-light">{t('appTitle')}</h1>
                <LanguageSwitcher />
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-10rem)]">
                <div className="lg:col-span-3 h-full">
                    <PromptTemplateManager 
                        templates={templates} 
                        setTemplates={setTemplates}
                        selectedTemplateId={selectedTemplateId}
                        setSelectedTemplateId={setSelectedTemplateId}
                        onOptimizeTemplate={handleOptimizeTemplate}
                        optimizingTemplateId={optimizingTemplateId}
                    />
                </div>
                <div className="lg:col-span-5 h-full flex flex-col gap-6">
                    <StoryGeneratorControls 
                        selectedTemplate={selectedTemplate}
                        onGenerate={handleGenerateStory}
                        isLoading={isGeneratingStory}
                    />
                    <div className="flex-grow">
                        <StoryCanvas
                            story={story}
                            setStory={setStory}
                            onAutoFormat={handleAutoFormat}
                            onGenerateStoryboard={handleGenerateStoryboard}
                            isProcessing={isProcessing}
                            processingMessage={processingMessage}
                        />
                    </div>
                </div>
                <div className="lg:col-span-4 h-full">
                    <StoryboardViewer scenes={storyboard} onGenerateImage={handleGenerateImage} />
                </div>
            main>
        </div>
    );
};


// The final exported App component wraps everything in the provider
const App = () => (
    <LocalizationProvider>
        <AppContent />
    </LocalizationProvider>
);

export default App;