import { Review, ReviewSummary } from '@/lib/types/review';

const mockReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'frame-001',
    author: 'Aarav M.',
    rating: 5,
    date: '2026-09-15',
    title: 'Super light and elegant!',
    comment: 'The tortoise color is even better in real life. Super comfortable for 8+ hour workdays.',
    verifiedPurchase: true,
    likes: 14,
    fitFeedback: 'True to Size',
  },
  {
    id: 'rev-2',
    productId: 'frame-001',
    author: 'Priya K.',
    rating: 4,
    date: '2026-08-28',
    title: 'Great quality acetate frame',
    comment: 'High build quality. Packaging felt premium too. Fits slightly wide on smaller faces.',
    verifiedPurchase: true,
    likes: 8,
    fitFeedback: 'Too Large',
  },
  {
    id: 'rev-3',
    productId: 'frame-002',
    author: 'Rohan S.',
    rating: 5,
    date: '2026-09-20',
    title: 'Best daily wear optical glasses',
    comment: 'TR90 material makes it almost weightless. Highly recommended if you hate heavy nose pads.',
    verifiedPurchase: true,
    likes: 21,
    fitFeedback: 'True to Size',
  },
];

export class ReviewService {
  static async getReviewsByProductId(productId: string): Promise<Review[]> {
    await new Promise((res) => setTimeout(res, 30));
    return mockReviews.filter((r) => r.productId === productId || productId === 'frame-001');
  }

  static async getReviewSummary(productId: string): Promise<ReviewSummary> {
    await new Promise((res) => setTimeout(res, 20));
    const reviews = await this.getReviewsByProductId(productId);
    
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScore = 0;

    reviews.forEach((r) => {
      totalScore += r.rating;
      const key = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      breakdown[key]++;
    });

    return {
      averageRating: reviews.length ? Number((totalScore / reviews.length).toFixed(1)) : 4.8,
      totalReviews: reviews.length || 48,
      ratingBreakdown: breakdown,
      fitPercentage: 92,
    };
  }

  static async submitReview(review: Omit<Review, 'id' | 'date' | 'likes' | 'verifiedPurchase'>): Promise<Review> {
    await new Promise((res) => setTimeout(res, 100));
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      verifiedPurchase: true,
    };
    mockReviews.unshift(newRev);
    return newRev;
  }
}
