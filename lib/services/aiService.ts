import { FaceAnalysisResult, FaceShape, FrameFitScore } from '@/lib/types/ai';
import { Product } from '@/lib/types/product';
import { products } from '@/data/products';

export class AiService {
  /**
   * Simulates AI face shape classification from camera input or uploaded image
   */
  static async analyzeFaceShape(imageSrc?: string): Promise<FaceAnalysisResult> {
    await new Promise((res) => setTimeout(res, 600)); // Simulate AI model inference

    // Return structured AI result based on deterministic mock engine or sample analysis
    const shapes: FaceShape[] = ['Oval', 'Round', 'Square', 'Heart', 'Diamond'];
    const randomIndex = imageSrc ? imageSrc.length % shapes.length : 0;
    const detectedShape = shapes[randomIndex];

    const shapeRules: Record<FaceShape, { recs: string[]; sizes: ('Small' | 'Medium' | 'Large')[]; desc: string }> = {
      Oval: {
        recs: ['Rectangle', 'Cat-Eye', 'Square', 'Aviator'],
        sizes: ['Medium', 'Large'],
        desc: 'Balanced proportions with high cheekbones and a gentle curve. Almost all frame shapes look stunning on you!',
      },
      Round: {
        recs: ['Square', 'Rectangle', 'Cat-Eye'],
        sizes: ['Medium', 'Large'],
        desc: 'Equal width and length with soft curves. Rectangular and square frames add sharpness and definition.',
      },
      Square: {
        recs: ['Round', 'Oval', 'Aviator'],
        sizes: ['Medium'],
        desc: 'Strong jawline and broad forehead. Rounded frames help soften angular facial contours.',
      },
      Heart: {
        recs: ['Cat-Eye', 'Round', 'Wayfarer'],
        sizes: ['Small', 'Medium'],
        desc: 'Broader forehead tapering down to a refined chin. Bottom-heavy or winged frames create harmony.',
      },
      Diamond: {
        recs: ['Cat-Eye', 'Oval', 'Rimless'],
        sizes: ['Small', 'Medium'],
        desc: 'Widest at high cheekbones with narrow forehead and chin. Cat-eye and detailed browlines highlight your eyes.',
      },
    };

    const rule = shapeRules[detectedShape];

    return {
      faceShape: detectedShape,
      confidence: 0.94,
      recommendedShapes: rule.recs,
      recommendedSizes: rule.sizes,
      description: rule.desc,
    };
  }

  /**
   * Calculates a personalized fit score for a given product and user metrics
   */
  static calculateFrameFitScore(product: Product, faceShape?: FaceShape, userWidthMm = 140): FrameFitScore {
    let score = 85;
    const reasons: string[] = [];

    // Measure frame width compatibility
    const widthDiff = Math.abs(product.measurements.frameWidth - userWidthMm);
    if (widthDiff <= 3) {
      score += 10;
      reasons.push(`Perfect width alignment (${product.measurements.frameWidth}mm vs ${userWidthMm}mm target).`);
    } else if (widthDiff <= 7) {
      score += 3;
      reasons.push(`Good width proportion for comfortable temple fit.`);
    } else {
      score -= 10;
      reasons.push(`Frame width differs by ${widthDiff}mm from your estimated size.`);
    }

    // Face shape compatibility check
    if (faceShape && product.faceShapes?.includes(faceShape)) {
      score += 5;
      reasons.push(`Frame shape (${product.frameShape}) complements your ${faceShape} face shape.`);
    }

    // Cap score between 0 and 100
    score = Math.min(100, Math.max(40, score));

    let fitStatus: FrameFitScore['fitStatus'] = 'Great Fit';
    if (score >= 90) fitStatus = 'Perfect Match';
    else if (score < 70) fitStatus = 'Borderline Fit';
    else if (score < 55) fitStatus = 'Not Recommended';

    return {
      productId: product.id,
      score,
      fitStatus,
      reasons,
    };
  }

  /**
   * Generates AI Eyewear Assistant conversational responses
   */
  static async generateAssistantResponse(userPrompt: string): Promise<{ text: string; recommendedProducts: Product[] }> {
    await new Promise((res) => setTimeout(res, 400));
    const promptLower = userPrompt.toLowerCase();

    let matchedProducts: Product[] = [];

    if (promptLower.includes('round') || promptLower.includes('circle')) {
      matchedProducts = (products as Product[]).filter((p) => p.frameShape === 'Round').slice(0, 2);
      return {
        text: "Round frames are timeless! They add a soft, elegant touch, especially for square or rectangular face shapes. Here are our top-rated round frames:",
        recommendedProducts: matchedProducts,
      };
    }

    if (promptLower.includes('sunglasses') || promptLower.includes('sun') || promptLower.includes('uv')) {
      matchedProducts = (products as Product[]).filter((p) => p.category === 'Sunglasses').slice(0, 2);
      return {
        text: "Protecting your eyes with 100% UV protection and style! Here are our favorite handcrafted sunglasses:",
        recommendedProducts: matchedProducts,
      };
    }

    if (promptLower.includes('blue') || promptLower.includes('screen') || promptLower.includes('computer') || promptLower.includes('work')) {
      matchedProducts = (products as Product[]).filter((p) => p.category === 'Blue-light').slice(0, 2);
      return {
        text: "For long screen hours, our BluCut anti-glare lenses filter harmful high-energy blue light to prevent eye fatigue. Take a look at these popular choices:",
        recommendedProducts: matchedProducts,
      };
    }

    if (promptLower.includes('recommend') || promptLower.includes('best') || promptLower.includes('popular')) {
      matchedProducts = (products as Product[]).filter((p) => p.isFeatured).slice(0, 2);
      return {
        text: "Here are StyleMe's top trending frames loved by thousands of customers for exceptional comfort and style:",
        recommendedProducts: matchedProducts,
      };
    }

    // Default fallback assistant message
    matchedProducts = (products as Product[]).slice(0, 2);
    return {
      text: "I'd love to help you find the perfect pair! Tell me about your preferred style (e.g. bold, classic, lightweight, sunglasses) or try our Virtual Try-On tool to test frames live.",
      recommendedProducts: matchedProducts,
    };
  }
}
