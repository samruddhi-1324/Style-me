import { Product } from './product';

export type FaceShape = 'Oval' | 'Round' | 'Square' | 'Heart' | 'Diamond';

export interface FaceAnalysisResult {
  faceShape: FaceShape;
  confidence: number;
  recommendedShapes: string[];
  recommendedSizes: ('Small' | 'Medium' | 'Large')[];
  description: string;
}

export interface FrameFitScore {
  productId: string;
  score: number; // 0 to 100
  fitStatus: 'Perfect Match' | 'Great Fit' | 'Borderline Fit' | 'Not Recommended';
  reasons: string[];
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
}
