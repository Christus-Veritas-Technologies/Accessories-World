'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderLinkProps {
  href: string;
  children: React.ReactNode;
}

export function HeaderLink({ href, children }: HeaderLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === pathname ||
    (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        textDecoration: 'none',
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        fontWeight: isActive ? 600 : 500,
        color: isActive ? '#DC2626' : 'rgb(75, 85, 99)',
        backgroundColor: isActive ? 'rgb(254, 242, 242)' : 'transparent',
        borderRadius: '0.375rem',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </Link>
  );
}
