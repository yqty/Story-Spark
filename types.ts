
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  cameraAngle: string;
  setting: string;
  action: string;
  dialogue: string;
  imageUrl?: string;
  imageLoading?: boolean;
}

export type Language = 'en' | 'zh';
