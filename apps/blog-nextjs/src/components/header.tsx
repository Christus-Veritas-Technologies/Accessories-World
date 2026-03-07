import Image from 'next/image';
import Link from 'next/link';
import { SITE_TITLE } from '@/lib/consts';
import { HeaderLink } from './header-link';

export function Header() {
  return (
    <header style={{
      margin: 0,
      padding: '0 1rem',
      background: 'white',
      borderBottom: '1px solid rgb(229, 231, 235)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1280px',
        margin: '0 auto',
        height: '80px',
        gap: '2rem',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <Image
            src="/logo-aw.jpg"
            alt="Accessories World"
            width={40}
            height={40}
            style={{ objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid rgb(229,231,235)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'rgb(17,24,39)', lineHeight: 1.2 }}>
              {SITE_TITLE}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgb(107,114,128)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Blog
            </span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <HeaderLink href="/">Home</HeaderLink>
            <HeaderLink href="/blog">Articles</HeaderLink>
            <HeaderLink href="/about">About</HeaderLink>
          </div>
          <div style={{ marginLeft: '1rem', borderLeft: '1px solid rgb(229,231,235)', paddingLeft: '1rem' }}>
            <a
              href="https://accessoriesworld.co.zw"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: '#DC2626',
                color: 'white',
                borderRadius: '0.375rem',
                fontWeight: 500,
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              Shop Now
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
