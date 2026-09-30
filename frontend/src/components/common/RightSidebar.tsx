'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Avatar } from '../ui';
import { getLeaderboard } from '../../services/api';

export const RightSidebar: React.FC = () => {
  const [guardians, setGuardians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadGuardians() {
      try {
        const res = await getLeaderboard().catch(() => null);
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];

        const academicOnly = list.filter(
          (u: any) => u.role !== 'ADMIN' && u.role !== 'STAFF_PORTARIA'
        );

        if (isMounted) {
          setGuardians(academicOnly);
        }
      } catch (e) {
        console.error('Erro ao carregar top guardiões:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadGuardians();
    return () => {
      isMounted = false;
    };
  }, []);

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

        {loading ? (
          <div className="py-3 space-y-2">
            <div className="h-8 bg-slate-100 rounded-lg animate-pulse"></div>
            <div className="h-8 bg-slate-100 rounded-lg animate-pulse"></div>
          </div>
        ) : guardians.length === 0 ? (
          <div className="py-6 px-3 text-center bg-slate-50/60 rounded-xl border border-dashed border-brand-gray space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <i className="bx bx-trophy text-lg"></i>
            </div>
            <p className="text-xs font-bold text-brand-dark">Nenhum guardião no ranking ainda</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Participe devolvendo pertences para pontuar e aparecer aqui!
            </p>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {guardians.slice(0, 5).map((guardian, index) => (
              <div
                key={guardian.id || index}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  index === 0
                    ? 'bg-amber-50/60 border border-amber-200/60'
                    : 'hover:bg-slate-50 border border-transparent hover:border-brand-gray'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center shadow-xs shrink-0 ${
                      index === 0
                        ? 'bg-brand-yellow text-brand-dark'
                        : index === 1
                        ? 'bg-slate-200 text-slate-700'
                        : index === 2
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <Avatar
                    name={guardian.name || 'Estudante'}
                    src={guardian.avatarUrl}
                    size="sm"
                    className="w-6 h-6 text-[10px] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-brand-dark text-xs truncate">{guardian.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{guardian.academicCourse || 'Graduação'}</p>
                  </div>
                </div>
                <span
                  className={`font-extrabold text-xs whitespace-nowrap ml-2 ${
                    index === 0 ? 'text-amber-900' : 'text-slate-700'
                  }`}
                >
                  {guardian.reputationScore ?? guardian.score ?? 0} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Links Institucionais e Rodapé */}
      <div className="px-2 text-[11px] text-slate-400 space-y-1">
        <p>Achei Unochapecó • Versão 1.0</p>
        <p>© 2026 Unochapecó. Todos os direitos reservados.</p>
      </div>

    </aside>
  );
};
