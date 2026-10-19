import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('achei_token')?.value;
  const { pathname } = request.nextUrl;

  // Rotas restritas que exigem login ativo obrigatoriamente (ex: área de perfil do estudante)
  const isProtectedRoute =
    pathname.startsWith('/perfio') ||
    pathname.startsWith('/perfil');

  // 1. Usuário NÃO autenticado tentando acessar rota restrita
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
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
