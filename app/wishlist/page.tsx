'use client';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { products } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import AuthGuard from '@/components/auth/AuthGuard';

function WishlistContent() {
  const { wishlist } = useStore();
  const wishlisted = products.filter((p) => wishlist.includes(p.id));

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ background: 'var(--color-cream)', padding: '2.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>Your Wishlist</h1>
          <p style={{ color: 'var(--color-sage)' }}>
            {wishlisted.length > 0 ? `${wishlisted.length} saved frame${wishlisted.length !== 1 ? 's' : ''}` : 'Your saved frames will appear here.'}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem' }}>
        {wishlisted.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🤍</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--color-plum)', marginBottom: '0.5rem' }}>Your saved frames will appear here.</h2>
            <p style={{ color: 'var(--color-sage)', marginBottom: '2rem' }}>Tap the heart icon on any frame to save it.</p>
            <Link href="/shop" className="btn-primary">Explore frames →</Link>
          </div>
        ) : (
          <div className="wishlist-grid grid-4" style={{ gap: '1.5rem' }}>
            {wishlisted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <AuthGuard redirectTo="/wishlist">
      <WishlistContent />
    </AuthGuard>
  );
}
