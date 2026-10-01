export interface CartTotals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
}

export class CartService {
  static FREE_SHIPPING_THRESHOLD = 999;
  static TAX_RATE = 0.12; // 12% GST

  /**
   * Calculates comprehensive cart financial breakdown
   */
  static calculateTotals(subtotal: number, discountAmount = 0): CartTotals {
    const shipping = subtotal >= this.FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 99;
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = Math.round(taxableSubtotal * this.TAX_RATE);
    const total = Math.max(0, taxableSubtotal + shipping);
    const remainingForFreeShipping = Math.max(0, this.FREE_SHIPPING_THRESHOLD - subtotal);

    return {
      subtotal,
      discount: discountAmount,
      tax,
      shipping,
      total,
      freeShippingThreshold: this.FREE_SHIPPING_THRESHOLD,
      remainingForFreeShipping,
    };
  }

  /**
   * Validates promo / coupon codes
   */
  static async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string }> {
    await new Promise((res) => setTimeout(res, 50));
    const cleanCode = code.trim().toUpperCase();

    if (cleanCode === 'STYLE10' || cleanCode === 'WELCOME10') {
      const discount = Math.round(subtotal * 0.1);
      return { valid: true, discount, message: '10% discount applied!' };
    }

    if (cleanCode === 'FIRST500') {
      const discount = Math.min(500, subtotal);
      return { valid: true, discount, message: '₹500 flat discount applied!' };
    }

    return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
  }
}
