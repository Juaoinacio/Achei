import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('achei_token')?.value;
  const { pathname } = request.nextUrl;

  // Rotas e recursos públicos que não exigem autenticação
  const isPublicRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/password') ||
    pathname.startsWith('/_not-found') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('favicon.ico');

  // 1. Usuário NÃO autenticado tentando acessar rota protegida (ex: /, /perfio, /rank, /routers)
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Usuário JÁ autenticado tentando acessar /login ou /register
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as requisições, exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico, SVGs, imagens públicas
     */
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
