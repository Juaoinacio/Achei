'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge } from '../ui';

export const RightSidebar: React.FC = () => {
  return (
    <aside className="desktop-sidebar hidden xl:block xl:col-span-3 sticky top-[80px] space-y-5 self-start max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
      
      {/* Card da Central de Achados & Portaria */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2.5 border-b border-brand-gray pb-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-base border border-blue-200">
            <i className="bx bx-shield-quarter"></i>
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-dark">Central de Achados</h3>
            <p className="text-[10px] text-slate-500">Portaria Central • Bloco R</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Status do Balcão:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
              Aberto
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Horário:</span>
            <span className="font-semibold text-brand-dark">07:30 às 22:30</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Retirada Física:</span>
            <span className="font-semibold text-purple-700">Requer PIN 6 Dígitos</span>
          </div>
        </div>

        <div className="pt-2 border-t border-brand-gray text-[11px] text-slate-500 flex items-center gap-1.5">
          <i className="bx bx-info-circle text-brand-blue text-sm"></i>
          <span>Apresente documento estudantil com foto na entrega.</span>
        </div>
      </Card>

      {/* Card de Top Guardiões / Ranking Comunitário */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between border-b border-brand-gray pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <i className="bx bx-trophy text-brand-yellow text-base"></i>
            Top Guardiões
          </h3>
          <Link href="/rank" className="text-[11px] text-brand-blue font-semibold hover:underline">
            Ver Todos
          </Link>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* 1º Lugar */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-yellow text-brand-dark font-black text-[10px] flex items-center justify-center shadow-xs">1</span>
              <div>
                <p className="font-bold text-brand-dark text-xs">Lucas da Silva</p>
                <p className="text-[10px] text-slate-500">Ciência da Computação</p>
              </div>
            </div>
            <span className="font-extrabold text-amber-900 text-xs">45 pts</span>
          </div>

          {/* 2º Lugar */}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-brand-gray transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">2</span>
              <div>
                <p className="font-bold text-brand-dark text-xs">Mariana Becker</p>
                <p className="text-[10px] text-slate-500">Arquitetura</p>
              </div>
            </div>
            <span className="font-bold text-slate-700 text-xs">18 pts</span>
          </div>
        </div>
      </Card>

      {/* Links Institucionais e Rodapé */}
      <div className="px-2 text-[11px] text-slate-400 space-y-1">
        <p>Achei Unochapecó • Versão 1.0</p>
        <p>© 2026 Unochapecó. Todos os direitos reservados.</p>
      </div>

    </aside>
  );
};
