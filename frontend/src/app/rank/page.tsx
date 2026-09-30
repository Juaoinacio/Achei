'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLeaderboard, getBadgesList, getCurrentUser } from '../../services/api';
import { Header } from '../../components/common/Header';
import { MobileBottomNav } from '../../components/common/MobileBottomNav';
import { Card, Badge, Button, Avatar } from '../../components/ui';

interface LeaderboardUser {
  id: string;
  name: string;
  academicCourse: string;
  avatarUrl?: string | null;
  score: number;
  returnedCount?: number;
  foundCount?: number;
  hintsCount?: number;
}

export default function RankPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rankingCategory, setRankingCategory] = useState<'returned' | 'found' | 'lost'>('returned');
  const [period, setPeriod] = useState<'month' | 'semester' | 'all'>('semester');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadRankData() {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('achei_token') : null;
        const user = getCurrentUser();
        if (!token || !user) {
          router.push('/login?redirect=/rank');
          return;
        }
        setCurrentUser(user);

        const [rankRes, badgesRes] = await Promise.all([
          getLeaderboard().catch(() => null),
          getBadgesList().catch(() => null),
        ]);

        if (rankRes && Array.isArray(rankRes)) {
          setLeaderboard(rankRes);
        } else if (rankRes?.data && Array.isArray(rankRes.data)) {
          setLeaderboard(rankRes.data);
        } else {
          // Fallback de demonstração realista baseado na Unochapecó
          setLeaderboard([
            {
              id: '1',
              name: 'Lucas da Silva',
              academicCourse: 'Ciência da Computação',
              score: 45,
              returnedCount: 4,
              foundCount: 5,
              hintsCount: 5,
            },
            {
              id: '2',
              name: 'Mariana Becker',
              academicCourse: 'Arquitetura e Urbanismo',
              score: 32,
              returnedCount: 3,
              foundCount: 3,
              hintsCount: 2,
            },
            {
              id: '3',
              name: 'Pedro Henrique Zago',
              academicCourse: 'Medicina',
              score: 28,
              returnedCount: 2,
              foundCount: 4,
              hintsCount: 4,
            },
            {
              id: '4',
              name: 'Gabriela Siqueira',
              academicCourse: 'Direito',
              score: 22,
              returnedCount: 2,
              foundCount: 2,
              hintsCount: 1,
            },
            {
              id: '5',
              name: 'Felipe Alcantara',
              academicCourse: 'Engenharia Civil',
              score: 18,
              returnedCount: 1,
              foundCount: 2,
              hintsCount: 4,
            },
            {
              id: '6',
              name: 'Camila Fachinello',
              academicCourse: 'Psicologia',
              score: 14,
              returnedCount: 1,
              foundCount: 1,
              hintsCount: 2,
            },
          ]);
        }

        if (badgesRes && Array.isArray(badgesRes)) {
          setBadges(badgesRes);
        }
      } catch (err) {
        console.error('Erro ao carregar ranking:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRankData();
  }, [router]);

  const filteredLeaderboard = leaderboard.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.academicCourse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = filteredLeaderboard[0];
  const top2 = filteredLeaderboard[1];
  const top3 = filteredLeaderboard[2];
  const restList = filteredLeaderboard.slice(3);

  return (
    <div className="bg-brand-bg text-brand-dark font-sans min-h-screen pb-24 selection:bg-brand-yellow selection:text-brand-dark">
      {/* 1. Header Oficial */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenPublishModal={() => router.push('/')}
        userName={currentUser?.name || 'Lucas Mendes'}
        userAvatar={currentUser?.avatarUrl}
      />

      {/* 2. Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        
        {/* Banner de Destaque */}
        <div className="bg-gradient-to-r from-brand-blue via-brand-blue to-brand-blueHover text-white rounded-custom p-6 sm:p-8 shadow-xs mb-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-56 h-56 rounded-full bg-brand-lilac/25 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-brand-yellow/15 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-brand-yellow uppercase tracking-wider">
                <i className="bx bx-medal text-sm"></i>
                Reconhecimento Acadêmico Unochapecó
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ranking de Solidariedade Comunitária
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Descubra os estudantes e guardiões que mais colaboram na devolução e localização de pertences no campus.
              </p>
            </div>

            {/* Filtro de Período */}
            <div className="bg-white/10 border border-white/20 p-1 rounded-xl flex items-center gap-1 self-start md:self-center shrink-0">
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === 'month'
                    ? 'bg-brand-yellow text-brand-dark shadow-xs'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Este Mês
              </button>
              <button
                onClick={() => setPeriod('semester')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === 'semester'
                    ? 'bg-brand-yellow text-brand-dark shadow-xs'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Semestre 2026/1
              </button>
              <button
                onClick={() => setPeriod('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === 'all'
                    ? 'bg-brand-yellow text-brand-dark shadow-xs'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                Geral
              </button>
            </div>
          </div>
        </div>

        {/* Categorias do Ranking */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setRankingCategory('returned')}
            className={`p-4 rounded-custom text-left shadow-xs transition-all flex items-center justify-between cursor-pointer ${
              rankingCategory === 'returned'
                ? 'bg-white border-2 border-brand-blue ring-2 ring-blue-100'
                : 'bg-white border border-brand-gray hover:border-slate-300 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-yellow text-brand-dark flex items-center justify-center font-extrabold text-2xl shadow-xs shrink-0">
                <i className="bx bx-check-shield"></i>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">Top Devoluções</span>
                <h3 className="text-sm font-extrabold text-brand-dark">Mais Devolveram</h3>
                <p className="text-xs text-slate-500">Heróis do campus</p>
              </div>
            </div>
            <i className="bx bx-chevron-right text-xl text-brand-blue"></i>
          </button>

          <button
            onClick={() => setRankingCategory('found')}
            className={`p-4 rounded-custom text-left shadow-xs transition-all flex items-center justify-between cursor-pointer ${
              rankingCategory === 'found'
                ? 'bg-white border-2 border-brand-blue ring-2 ring-blue-100'
                : 'bg-white border border-brand-gray hover:border-slate-300 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-blue text-white flex items-center justify-center font-extrabold text-2xl shadow-xs shrink-0">
                <i className="bx bx-search"></i>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Top Localizadores</span>
                <h3 className="text-sm font-extrabold text-brand-dark">Mais Acharam</h3>
                <p className="text-xs text-slate-500">Guardiões dos blocos</p>
              </div>
            </div>
            <i className="bx bx-chevron-right text-xl text-slate-400"></i>
          </button>

          <button
            onClick={() => setRankingCategory('lost')}
            className={`p-4 rounded-custom text-left shadow-xs transition-all flex items-center justify-between cursor-pointer ${
              rankingCategory === 'lost'
                ? 'bg-white border-2 border-brand-blue ring-2 ring-blue-100'
                : 'bg-white border border-brand-gray hover:border-slate-300 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-lilac text-white flex items-center justify-center font-extrabold text-2xl shadow-xs shrink-0">
                <i className="bx bx-help-circle"></i>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mais Distraídos</span>
                <h3 className="text-sm font-extrabold text-brand-dark">Mais Perderam</h3>
                <p className="text-xs text-slate-500">Encontraram de volta</p>
              </div>
            </div>
            <i className="bx bx-chevron-right text-xl text-slate-400"></i>
          </button>
        </div>

        {/* Layout de 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Coluna Esquerda: Regras e Selos */}
          <aside className="hidden lg:block lg:col-span-4 space-y-5">
            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b border-brand-gray pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <i className="bx bx-award text-brand-yellow text-base"></i>
                  Como Ganhar Karma?
                </h3>
              </div>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-brand-gray">
                  <span className="w-7 h-7 rounded-lg bg-brand-yellow text-brand-dark font-extrabold flex items-center justify-center text-xs shrink-0">
                    +10
                  </span>
                  <div>
                    <h4 className="font-bold text-brand-dark text-xs">Devolução Presencial Confirmada</h4>
                    <p className="text-slate-500 text-[11px]">Validada na entrega através do código PIN de 6 dígitos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-brand-gray">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue font-extrabold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                    +2
                  </span>
                  <div>
                    <h4 className="font-bold text-brand-dark text-xs">Pista Útil Confirmada</h4>
                    <p className="text-slate-500 text-[11px]">Quando o proprietário confirma que sua dica ajudou a encontrar o pertence.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b border-brand-gray pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <i className="bx bx-shield-quarter text-brand-blue text-sm"></i>
                  Validação Transparente
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Todas as pontuações do ranking são auditadas pela equipe de suporte estudantil e garantidas pelo sistema de segurança com PIN único por resgate.
              </p>
            </Card>
          </aside>

          {/* Coluna Central: Pódio dos 3 Primeiros + Tabela */}
          <section className="col-span-1 lg:col-span-8 space-y-6">
            
            {/* Pódio dos 3 Primeiros */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-4">
              
              {/* 2º Lugar */}
              {top2 && (
                <Card className="text-center p-4 order-2 sm:order-1 border-slate-300 space-y-2 relative">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center mx-auto absolute -top-3 left-1/2 -translate-x-1/2 ring-2 ring-white">
                    2
                  </div>
                  <Avatar name={top2.name} size="md" className="mx-auto mt-2" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-brand-dark truncate">{top2.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{top2.academicCourse}</p>
                  </div>
                  <div className="pt-1">
                    <span className="text-lg font-extrabold text-slate-700">{top2.score} pts</span>
                  </div>
                </Card>
              )}

              {/* 1º Lugar (Destaque Amarelo Solar) */}
              {top1 && (
                <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-brand-yellow rounded-custom p-5 text-center order-1 sm:order-2 shadow-md space-y-2 relative -mt-4">
                  <div className="w-8 h-8 rounded-full bg-brand-yellow text-brand-dark font-black text-sm flex items-center justify-center mx-auto absolute -top-4 left-1/2 -translate-x-1/2 shadow-xs ring-4 ring-white">
                    <i className="bx bxs-crown text-base"></i>
                  </div>
                  <Avatar name={top1.name} size="lg" className="mx-auto mt-2 ring-2 ring-brand-yellow" />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-brand-yellow px-2 py-0.5 rounded-full">
                      LÍDER DO CAMPUS
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-brand-dark mt-1 truncate">{top1.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{top1.academicCourse}</p>
                  </div>
                  <div className="pt-2 border-t border-amber-200/60">
                    <span className="text-2xl font-black text-amber-900">{top1.score}</span>
                    <span className="text-xs text-amber-800 font-bold ml-1">pts</span>
                  </div>
                </div>
              )}

              {/* 3º Lugar */}
              {top3 && (
                <Card className="text-center p-4 order-3 sm:order-3 border-amber-200/80 space-y-2 relative">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center justify-center mx-auto absolute -top-3 left-1/2 -translate-x-1/2 ring-2 ring-white">
                    3
                  </div>
                  <Avatar name={top3.name} size="md" className="mx-auto mt-2" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-brand-dark truncate">{top3.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{top3.academicCourse}</p>
                  </div>
                  <div className="pt-1">
                    <span className="text-lg font-extrabold text-amber-900">{top3.score} pts</span>
                  </div>
                </Card>
              )}

            </div>

            {/* Tabela de Classificação do 4º ao 10º Lugar */}
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-brand-gray flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Classificação Geral ({filteredLeaderboard.length} Estudantes)
                </h3>
              </div>

              <div className="divide-y divide-brand-gray">
                {restList.map((item, index) => (
                  <div key={item.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {index + 4}
                      </span>
                      <Avatar name={item.name} size="sm" />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-brand-dark">{item.name}</h4>
                        <p className="text-[11px] text-slate-500">{item.academicCourse}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-brand-dark">{item.score} pts</span>
                        {item.returnedCount !== undefined && (
                          <p className="text-[10px] text-slate-400">{item.returnedCount} devoluções</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {restList.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Nenhum estudante adicional encontrado para esta busca.
                  </div>
                )}
              </div>
            </Card>

          </section>

        </div>
      </main>

      {/* 3. Navegação Mobile */}
      <MobileBottomNav onOpenPublishModal={() => router.push('/')} activeTab="rank" />
    </div>
  );
}
