'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge } from '../components/ui';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="bg-brand-bg text-brand-dark font-sans min-h-screen flex flex-col justify-between selection:bg-brand-yellow selection:text-brand-dark">
      {/* Header Institucional Superior */}
      <header className="bg-brand-blue text-white sticky top-0 z-40 shadow-sm border-b border-brand-blueHover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 bg-brand-yellow text-brand-dark rounded-lg flex items-center justify-center font-extrabold text-xl shadow-sm transition-transform group-hover:scale-105">
              <i className="bx bx-search"></i>
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight leading-none text-white">Achei</span>
              <span className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider">Unochapecó</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-white/90 hover:text-white transition-colors">
              Feed Principal
            </Link>
            <span className="text-white/40">•</span>
            <Link href="/rank" className="text-xs font-semibold text-brand-yellow hover:underline transition-colors">
              Ranking Comunitário
            </Link>
          </div>
        </div>
      </header>

      {/* Corpo Central da Página 404 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col items-center justify-center text-center my-auto">
        {/* Ilustração Visual 404 Tema Achados & Perdidos */}
        <div className="mb-6 relative">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white border-2 border-brand-gray shadow-md flex items-center justify-center relative mx-auto transition-transform hover:scale-105">
            <i className="bx bx-compass text-5xl sm:text-7xl text-brand-blue animate-pulse"></i>
            
            {/* Lupa Flutuante em Amarelo Solar (#FFDC5D) */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-yellow text-brand-dark flex items-center justify-center absolute -bottom-2 -right-2 shadow-md border-2 border-white">
              <i className="bx bx-search text-xl sm:text-2xl font-bold"></i>
            </div>
          </div>
        </div>

        {/* Badge Tipográfica de Status (Zero Green) */}
        <div className="mb-3">
          <Badge variant="lost" className="px-3 py-1 font-extrabold text-xs uppercase tracking-wider">
            Pertence ou Página Perdida
          </Badge>
        </div>

        {/* Número 404 e Título */}
        <h1 className="text-6xl sm:text-8xl font-black text-brand-dark tracking-tight leading-none mb-3">
          404
        </h1>

        <h2 className="text-xl sm:text-3xl font-extrabold text-brand-dark max-w-lg mb-3">
          Ops! Essa página também se perdeu pelo campus da Unochapecó.
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-md leading-relaxed mb-8">
          Assim como aquela garrafa térmica esquecida na Cantina ou o casaco deixado no Bloco R, o endereço que você tentou acessar não está aqui. Mas não se preocupe, podemos te ajudar a encontrar o caminho de volta!
        </p>

        {/* Botões de Ação Principal */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-10">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              leftIcon="bx-home-alt-2"
              className="w-full sm:w-auto shadow-sm"
            >
              Voltar ao Feed Principal
            </Button>
          </Link>

          <Link href="/rank" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              leftIcon="bx-trophy"
              className="w-full sm:w-auto"
            >
              Ver Ranking de Guardiões
            </Button>
          </Link>
        </div>

        {/* Dicas Rápidas de Ajuda */}
        <Card className="p-5 max-w-lg w-full text-left bg-white border border-brand-gray">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <i className="bx bx-help-circle text-brand-blue text-base"></i>
            Procurando algo específico?
          </h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <i className="bx bx-check text-brand-blue font-bold"></i>
              <span>Verifique se o link foi digitado corretamente no navegador.</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="bx bx-check text-brand-blue font-bold"></i>
              <span>Use a busca no Feed para pesquisar pertences por bloco (ex: Bloco R, Bloco G).</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="bx bx-check text-brand-blue font-bold"></i>
              <span>Se você perdeu um pertence no campus, publique no Feed para a comunidade ajudar.</span>
            </li>
          </ul>
        </Card>
      </main>

      {/* Rodapé Simples */}
      <footer className="py-6 border-t border-brand-gray bg-white text-center text-xs text-slate-500">
        <p>© 2026 Achei Unochapecó — Todos os direitos reservados. Campus Chapecó (Sede).</p>
      </footer>
    </div>
  );
}
