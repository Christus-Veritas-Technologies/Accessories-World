import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      padding: '3rem 1rem',
      background: 'white',
      borderTop: '1px solid rgb(229, 231, 235)',
      color: 'rgb(55, 65, 81)',
      marginTop: '4rem',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem',
        }}
          className="footer-grid"
        >
          <div>
            <Link
              href="/"
              style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', textDecoration: 'none' }}
            >
              <Image
                src="/logo-aw.jpg"
                alt="Accessories World"
                width={40}
                height={40}
                style={{ objectFit: 'cover', borderRadius: '0.375rem', border: '1px solid rgb(229,231,235)', flexShrink: 0 }}
              />
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgb(17,24,39)', margin: 0 }}>Accessories World</p>
                <p style={{ fontSize: '0.75rem', color: 'rgb(107,114,128)', margin: 0 }}>Mutare</p>
              </div>
            </Link>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'rgb(75,85,99)', margin: 0 }}>
              Quality accessories at affordable prices. Supporting Zimbabwean families with reliable products and excellent service.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(17,24,39)', margin: '0 0 1rem 0' }}>
              Pages
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { href: '/', label: 'Home' },
                { href: '/articles', label: 'Articles' },
                { href: '/about', label: 'About' },
                { href: 'https://accessoriesworldmutare.co.zw', label: 'Main Shop', external: true },
              ].map(({ href, label, external }) => (
                <li key={href} style={{ margin: 0 }}>
                  <a
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    style={{ color: 'rgb(75,85,99)', textDecoration: 'none', fontSize: '0.875rem' }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(17,24,39)', margin: '0 0 1rem 0' }}>
              Contact
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="tel:+263784923973" style={{ color: 'rgb(75,85,99)', textDecoration: 'none', fontSize: '0.875rem' }}>+263 78 492 3973</a></li>
              <li><a href="https://wa.me/263784923973" target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(75,85,99)', textDecoration: 'none', fontSize: '0.875rem' }}>WhatsApp</a></li>
              <li style={{ fontSize: '0.875rem', color: 'rgb(75,85,99)' }}>43 First Street, Mutare</li>
            </ul>
          </div>
        </div>

        <div style={{ paddingTop: '2rem', borderTop: '1px solid rgb(229,231,235)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8125rem', color: 'rgb(107,114,128)', margin: 0 }}>
            &copy; {year} Accessories World Zimbabwe. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
