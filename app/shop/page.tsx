'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { products, Product } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';

const FILTER_OPTIONS = {
  gender: ['Men', 'Women', 'Unisex', 'Kids'],
  frameShape: ['Rectangle', 'Round', 'Cat-Eye', 'Square', 'Aviator', 'Oval'],
  faceShape: ['Oval', 'Round', 'Square', 'Heart', 'Diamond'],
  frameColor: ['Black', 'Brown', 'Gold', 'Silver', 'Blue', 'Transparent', 'Green', 'Pink', 'Rose Gold', 'Tortoise'],
  material: ['Acetate', 'Metal', 'TR90'],
  size: ['Small', 'Medium', 'Large'],
  lensType: ['Basic', 'Blue Light', 'Anti-Glare', 'UV Protection', 'Photochromic', 'Progressive'],
  priceRanges: [
    { label: 'Under ₹2,500', min: 0, max: 2500 },
    { label: '₹2,500 – ₹4,000', min: 2500, max: 4000 },
    { label: '₹4,000 – ₹6,000', min: 4000, max: 6000 },
    { label: '₹6,000+', min: 6000, max: 99999 },
  ],
};

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
  { value: 'discount', label: 'Discount (% OFF)' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const genderParam = searchParams.get('gender') || searchParams.get('g') || '';
  const shapeParam = searchParams.get('shape') || searchParams.get('frameShape') || searchParams.get('s') || '';
  const queryParam = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'popularity';

  const [filters, setFilters] = useState({
    category: categoryParam,
    gender: genderParam ? [genderParam] : ([] as string[]),
    material: [] as string[],
    frameShape: shapeParam ? [shapeParam] : ([] as string[]),
    faceShape: [] as string[],
    frameColor: [] as string[],
    lensType: [] as string[],
    size: [] as string[],
    priceRange: null as { min: number; max: number } | null,
  });

  const [sort, setSort] = useState(sortParam);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    setFilters((f) => ({
      ...f,
      category: categoryParam,
      gender: genderParam ? [genderParam] : f.gender,
      frameShape: shapeParam ? [shapeParam] : f.frameShape,
    }));
  }, [categoryParam, genderParam, shapeParam]);

  useEffect(() => {
    if (sortParam) setSort(sortParam);
  }, [sortParam]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, sort, queryParam]);

  // Canonical Data-Driven Filter Predicate
  const filtered = products.filter((p) => {
    // 1. Category Filter
    if (filters.category) {
      const catLower = filters.category.toLowerCase();
      const pCatLower = p.category.toLowerCase();
      if (pCatLower !== catLower) {
        // Special exception for Kids category vs Kids gender compatibility
        if (!(catLower === 'kids' && p.gender.toLowerCase() === 'kids')) {
          return false;
        }
      }
    }

    // 2. Gender Filter (Men includes Men + Unisex, Women includes Women + Unisex)
    if (filters.gender.length) {
      const matchesGender = filters.gender.some((g) => {
        const gNorm = g.trim().toLowerCase();
        const pGen = p.gender.trim().toLowerCase();
        const pCat = p.category.trim().toLowerCase();

        if (gNorm === 'men') return pGen === 'men' || pGen === 'unisex';
        if (gNorm === 'women') return pGen === 'women' || pGen === 'unisex';
        if (gNorm === 'unisex') return pGen === 'unisex';
        if (gNorm === 'kids') return pGen === 'kids' || pCat === 'kids';
        return pGen === gNorm;
      });
      if (!matchesGender) return false;
    }

    // 3. Frame Shape Filter (Normalized Case & Punctuation)
    if (filters.frameShape.length) {
      const matchesShape = filters.frameShape.some((s) => {
        const sNorm = s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const pNorm = p.frameShape.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        return sNorm === pNorm;
      });
      if (!matchesShape) return false;
    }

    // 4. Material Filter
    if (filters.material.length) {
      const matchesMat = filters.material.some((m) => p.material.toLowerCase() === m.toLowerCase());
      if (!matchesMat) return false;
    }

    // 5. Size Filter
    if (filters.size.length) {
      const matchesSize = filters.size.some((sz) => p.size.toLowerCase() === sz.toLowerCase());
      if (!matchesSize) return false;
    }

    // 6. Price Range Filter
    if (filters.priceRange && (p.price < filters.priceRange.min || p.price > filters.priceRange.max)) {
      return false;
    }

    // 7. Face Shape Filter
    if (filters.faceShape.length) {
      const match = filters.faceShape.some((fs) => {
        const fsNorm = fs.toLowerCase();
        return (
          p.faceShapes?.some((pfs) => pfs.toLowerCase() === fsNorm) ||
          (p.fitNote && p.fitNote.toLowerCase().includes(fsNorm)) ||
          (p.description && p.description.toLowerCase().includes(fsNorm))
        );
      });
      if (!match) return false;
    }

    // 8. Frame Color Filter
    if (filters.frameColor.length) {
      const colorMatch = filters.frameColor.some((fc) => {
        const fcNorm = fc.toLowerCase();
        return (
          (p.frameColor && p.frameColor.toLowerCase().includes(fcNorm)) ||
          p.color.toLowerCase().includes(fcNorm)
        );
      });
      if (!colorMatch) return false;
    }

    // 9. Lens Type Filter
    if (filters.lensType.length) {
      const lensMatch = filters.lensType.some((lt) => {
        const ltNorm = lt.toLowerCase();
        return (
          p.badges.some((b) => b.toLowerCase().includes(ltNorm)) ||
          p.description.toLowerCase().includes(ltNorm) ||
          p.category.toLowerCase().includes(ltNorm)
        );
      });
      if (!lensMatch) return false;
    }

    // 10. Search Query Filter
    if (queryParam) {
      const q = queryParam.toLowerCase();
      const textMatch =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.frameShape.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q);
      if (!textMatch) return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    if (sort === 'discount') {
      const discA = (a.originalPrice - a.price) / a.originalPrice;
      const discB = (b.originalPrice - b.price) / b.originalPrice;
      return discB - discA;
    }
    return b.reviewCount - a.reviewCount;
  });

  const displayedProducts = sorted.slice(0, page * ITEMS_PER_PAGE);

  const toggle = (key: keyof typeof filters, val: string) => {
    setFilters((f) => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  };

  const clearAll = () =>
    setFilters({
      category: '',
      gender: [],
      material: [],
      frameShape: [],
      faceShape: [],
      frameColor: [],
      lensType: [],
      size: [],
      priceRange: null,
    });

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    filters.gender.length +
    filters.material.length +
    filters.frameShape.length +
    filters.faceShape.length +
    filters.frameColor.length +
    filters.lensType.length +
    filters.size.length +
    (filters.priceRange ? 1 : 0);

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Page Header */}
      <div style={{ background: 'var(--color-cream)', padding: '2.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container">
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
            <Link href="/" style={{ color: 'var(--color-sage)' }}>Home</Link> › {filters.category || 'All Eyewear'}
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {filters.category || (queryParam ? `Results for "${queryParam}"` : 'Shop Eyewear')}
          </h1>
          <p style={{ color: 'var(--color-sage)' }}>Find your perfect frame. Stylish, comfortable and crafted for precision.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Mobile filter toggle */}
        <div className="mobile-filter-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.25rem', borderRadius: '50px',
              border: `1.5px solid ${activeFilterCount > 0 ? 'var(--color-forest)' : 'rgba(0,0,0,0.12)'}`,
              background: activeFilterCount > 0 ? 'rgba(32,56,46,0.06)' : 'white',
              color: activeFilterCount > 0 ? 'var(--color-forest)' : 'var(--color-espresso)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5h18M7 12h10M11 19h2" strokeLinecap="round" /></svg>
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            style={{ padding: '0.5rem 0.875rem', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: '50px', background: 'white', fontSize: '0.8rem', color: 'var(--color-espresso)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setFiltersOpen(false)} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '24px 24px 0 0', padding: '1.5rem', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} style={{ fontSize: '0.8rem', color: 'var(--color-terracotta)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Clear All ({activeFilterCount})
                  </button>
                )}
                <button onClick={() => setFiltersOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--color-muted)' }}>✕</button>
              </div>

              <FilterSection title="Category">
                {['Eyeglasses', 'Sunglasses', 'Blue-light', 'Kids'].map((cat) => (
                  <FilterChip key={cat} label={cat} active={filters.category.toLowerCase() === cat.toLowerCase()} onClick={() => setFilters((f) => ({ ...f, category: f.category.toLowerCase() === cat.toLowerCase() ? '' : cat }))} />
                ))}
              </FilterSection>

              <FilterSection title="Gender">
                {FILTER_OPTIONS.gender.map((g) => (
                  <FilterCheck
                    key={g} label={g}
                    checked={filters.gender.some((fg) => fg.toLowerCase() === g.toLowerCase())}
                    onChange={() => toggle('gender', g)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Frame Shape">
                {FILTER_OPTIONS.frameShape.map((s) => (
                  <FilterCheck
                    key={s} label={s}
                    checked={filters.frameShape.some((fs) => fs.toLowerCase().replace(/[^a-z0-9]/g, '') === s.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    onChange={() => toggle('frameShape', s)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Face Shape">
                {FILTER_OPTIONS.faceShape.map((fs) => (
                  <FilterCheck key={fs} label={fs} checked={filters.faceShape.includes(fs)} onChange={() => toggle('faceShape', fs)} />
                ))}
              </FilterSection>

              <FilterSection title="Frame Color">
                {FILTER_OPTIONS.frameColor.map((fc) => (
                  <FilterCheck key={fc} label={fc} checked={filters.frameColor.includes(fc)} onChange={() => toggle('frameColor', fc)} />
                ))}
              </FilterSection>

              <FilterSection title="Frame Material">
                {FILTER_OPTIONS.material.map((m) => (
                  <FilterCheck key={m} label={m} checked={filters.material.includes(m)} onChange={() => toggle('material', m)} />
                ))}
              </FilterSection>

              <FilterSection title="Lens Type">
                {FILTER_OPTIONS.lensType.map((lt) => (
                  <FilterCheck key={lt} label={lt} checked={filters.lensType.includes(lt)} onChange={() => toggle('lensType', lt)} />
                ))}
              </FilterSection>

              <FilterSection title="Price Range">
                {FILTER_OPTIONS.priceRanges.map((r) => (
                  <FilterCheck key={r.label} label={r.label} checked={filters.priceRange?.min === r.min} onChange={() => setFilters((f) => ({ ...f, priceRange: f.priceRange?.min === r.min ? null : r }))} />
                ))}
              </FilterSection>

              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                {activeFilterCount > 0 && <button onClick={() => { clearAll(); setFiltersOpen(false); }} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Clear All</button>}
                <button onClick={() => setFiltersOpen(false)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Apply Filters</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>

          {/* ── FILTERS SIDEBAR ── */}
          <aside style={{
            width: '260px', flexShrink: 0, position: 'sticky', top: '90px',
            background: 'white', borderRadius: 'var(--radius-lg)',
            padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)',
            maxHeight: 'calc(100vh - 110px)', overflowY: 'auto',
          }} className="filters-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem' }}>
              <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700 }}>Filters</h4>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} style={{ fontSize: '0.75rem', color: 'var(--color-terracotta)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Clear All ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Active filters pills */}
            {activeFilterCount > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                {filters.category && <span className="badge badge-sage" style={{ cursor: 'pointer' }} onClick={() => setFilters(f => ({ ...f, category: '' }))}>{filters.category} ✕</span>}
                {filters.gender.map(g => <span key={g} className="badge badge-sage" style={{ cursor: 'pointer' }} onClick={() => toggle('gender', g)}>{g} ✕</span>)}
                {filters.frameShape.map(s => <span key={s} className="badge badge-sage" style={{ cursor: 'pointer' }} onClick={() => toggle('frameShape', s)}>{s} ✕</span>)}
                {filters.faceShape.map(fs => <span key={fs} className="badge badge-sage" style={{ cursor: 'pointer' }} onClick={() => toggle('faceShape', fs)}>{fs} ✕</span>)}
                {filters.frameColor.map(fc => <span key={fc} className="badge badge-sage" style={{ cursor: 'pointer' }} onClick={() => toggle('frameColor', fc)}>{fc} ✕</span>)}
                {filters.material.map(m => <span key={m} className="badge badge-sage" style={{ cursor: 'pointer' }} onClick={() => toggle('material', m)}>{m} ✕</span>)}
                {filters.lensType.map(lt => <span key={lt} className="badge badge-sage" style={{ cursor: 'pointer' }} onClick={() => toggle('lensType', lt)}>{lt} ✕</span>)}
                {filters.priceRange && <span className="badge badge-sage" style={{ cursor: 'pointer' }} onClick={() => setFilters(f => ({ ...f, priceRange: null }))}>{filters.priceRange.min === 0 ? `< ₹${filters.priceRange.max}` : `₹${filters.priceRange.min}+`} ✕</span>}
              </div>
            )}

            {/* Category */}
            <FilterSection title="Category">
              {['Eyeglasses', 'Sunglasses', 'Blue-light', 'Kids'].map((cat) => (
                <FilterChip
                  key={cat} label={cat}
                  active={filters.category.toLowerCase() === cat.toLowerCase()}
                  onClick={() => setFilters((f) => ({ ...f, category: f.category.toLowerCase() === cat.toLowerCase() ? '' : cat }))}
                />
              ))}
            </FilterSection>

            {/* Gender */}
            <FilterSection title="Gender">
              {FILTER_OPTIONS.gender.map((g) => (
                <FilterCheck
                  key={g} label={g}
                  checked={filters.gender.some((fg) => fg.toLowerCase() === g.toLowerCase())}
                  onChange={() => toggle('gender', g)}
                />
              ))}
            </FilterSection>

            {/* Frame Shape */}
            <FilterSection title="Frame Shape">
              {FILTER_OPTIONS.frameShape.map((s) => (
                <FilterCheck
                  key={s} label={s}
                  checked={filters.frameShape.some((fs) => fs.toLowerCase().replace(/[^a-z0-9]/g, '') === s.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  onChange={() => toggle('frameShape', s)}
                />
              ))}
            </FilterSection>

            {/* Face Shape */}
            <FilterSection title="Face Shape">
              {FILTER_OPTIONS.faceShape.map((fs) => (
                <FilterCheck key={fs} label={fs} checked={filters.faceShape.includes(fs)} onChange={() => toggle('faceShape', fs)} />
              ))}
            </FilterSection>

            {/* Frame Color */}
            <FilterSection title="Frame Color">
              {FILTER_OPTIONS.frameColor.map((fc) => (
                <FilterCheck key={fc} label={fc} checked={filters.frameColor.includes(fc)} onChange={() => toggle('frameColor', fc)} />
              ))}
            </FilterSection>

            {/* Frame Material */}
            <FilterSection title="Frame Material">
              {FILTER_OPTIONS.material.map((m) => (
                <FilterCheck key={m} label={m} checked={filters.material.includes(m)} onChange={() => toggle('material', m)} />
              ))}
            </FilterSection>

            {/* Lens Type */}
            <FilterSection title="Lens Type">
              {FILTER_OPTIONS.lensType.map((lt) => (
                <FilterCheck key={lt} label={lt} checked={filters.lensType.includes(lt)} onChange={() => toggle('lensType', lt)} />
              ))}
            </FilterSection>

            {/* Size */}
            <FilterSection title="Size">
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {FILTER_OPTIONS.size.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggle('size', s)}
                    style={{
                      padding: '0.35rem 0.875rem', borderRadius: '50px',
                      border: `1.5px solid ${filters.size.includes(s) ? 'var(--color-forest)' : 'rgba(0,0,0,0.12)'}`,
                      background: filters.size.includes(s) ? 'var(--color-forest)' : 'white',
                      color: filters.size.includes(s) ? 'white' : 'var(--color-espresso)',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >{s}</button>
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range">
              {FILTER_OPTIONS.priceRanges.map((r) => (
                <FilterCheck
                  key={r.label} label={r.label}
                  checked={filters.priceRange?.min === r.min}
                  onChange={() => setFilters((f) => ({ ...f, priceRange: f.priceRange?.min === r.min ? null : r }))}
                />
              ))}
            </FilterSection>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <div style={{ flex: 1 }}>
            {/* Desktop sort & count bar */}
            <div className="desktop-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ color: 'var(--color-sage)', fontSize: '0.9rem' }}>
                Showing <strong style={{ color: 'var(--color-espresso)' }}>{displayedProducts.length}</strong> of <strong style={{ color: 'var(--color-espresso)' }}>{sorted.length}</strong> frames
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-sage)' }}>Sort by:</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  style={{ padding: '0.5rem 0.875rem', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: '50px', background: 'white', fontSize: '0.85rem', color: 'var(--color-espresso)', outline: 'none', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Mobile results count */}
            <p className="mobile-only" style={{ fontSize: '0.85rem', color: 'var(--color-sage)', marginBottom: '0.875rem' }}>
              Showing <strong style={{ color: 'var(--color-espresso)' }}>{displayedProducts.length}</strong> of <strong style={{ color: 'var(--color-espresso)' }}>{sorted.length}</strong> frames
            </p>

            {sorted.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👓</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: 'var(--color-plum)', marginBottom: '0.5rem' }}>No frames match your current filters.</h3>
                <p style={{ color: 'var(--color-sage)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>Try changing or clearing your active filters to view all available frames.</p>
                <button onClick={clearAll} className="btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 2rem' }}>Clear All Filters</button>
              </div>
            ) : (
              <>
                <div className="product-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination / Load More */}
                {displayedProducts.length < sorted.length && (
                  <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-sage)', marginBottom: '1rem' }}>
                      Showing {displayedProducts.length} of {sorted.length} frames
                    </p>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="btn-outline"
                      style={{ padding: '0.85rem 2.5rem', fontSize: '0.9rem' }}
                    >
                      Load More Frames ↓
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1rem' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: open ? '0.75rem' : 0 }}
      >
        <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>{title}</span>
        <svg width="12" height="12" fill="none" stroke="var(--color-sage)" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" />
        </svg>
      </button>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>{children}</div>}
    </div>
  );
}

function FilterCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: 'var(--color-forest)', width: '15px', height: '15px', cursor: 'pointer' }} />
      <span style={{ fontSize: '0.85rem', color: checked ? 'var(--color-plum)' : 'var(--color-espresso)', fontWeight: checked ? 600 : 400 }}>{label}</span>
    </label>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.35rem 0.875rem', borderRadius: '50px', width: '100%', textAlign: 'left',
        border: `1.5px solid ${active ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
        background: active ? 'rgba(32,56,46,0.08)' : 'white',
        color: active ? 'var(--color-forest)' : 'var(--color-espresso)',
        fontSize: '0.85rem', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s',
      }}
    >{label}</button>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="skeleton" style={{ width: '200px', height: '40px' }} /></div>}>
      <ShopContent />
    </Suspense>
  );
}
