'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  getMyProfile,
  getMyItems,
  getMySavedItems,
  updateMyProfile,
  clearAuthSession,
} from '../../services/api';
import { Item, UserSummary } from '../../types';
import { Header } from '../../components/common/Header';
import { ItemCard } from '../../components/common/ItemCard';
import { MobileBottomNav } from '../../components/common/MobileBottomNav';
import { Card, Badge, Button, Avatar, Dialog, Input, CourseCombobox } from '../../components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'my-items' | 'saved' | 'returned'>('my-items');
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [savedItems, setSavedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Edição de Perfil
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    async function loadProfileData() {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('achei_token') : null;
        const localUser = getCurrentUser();

        if (!token) {
          router.push('/login?redirect=/perfio');
          return;
        }

        const profile = await getMyProfile().catch(() => localUser);
        if (!profile && !localUser) {
          clearAuthSession();
          router.push('/login?redirect=/perfio');
          return;
        }

        const activeUser = profile || localUser;
        setUser(activeUser);
        if (activeUser) {
          setEditName(activeUser.name || '');
          setEditCourse(activeUser.academicCourse || '');
        }

        const [itemsData, savedData] = await Promise.all([
          getMyItems().catch(() => []),
          getMySavedItems().catch(() => []),
        ]);
        setMyItems(itemsData || []);
        setSavedItems(savedData || []);
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [router]);

  function handleLogout() {
    clearAuthSession();
    router.push('/login');
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) return;

    setSavingProfile(true);
    try {
      const updated = await updateMyProfile({
        name: editName.trim(),
        academicCourse: editCourse.trim() || undefined,
      });
      setUser(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    } finally {
      setSavingProfile(false);
    }
  }

  // Filtragem de Itens por Aba
  let displayedItems: Item[] = [];
  if (activeTab === 'my-items') {
    displayedItems = myItems;
  } else if (activeTab === 'saved') {
    displayedItems = savedItems;
  } else if (activeTab === 'returned') {
    displayedItems = myItems.filter((i) => i.status === 'RETURNED');
  }

  if (searchTerm.trim()) {
    displayedItems = displayedItems.filter(
      (i) =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const returnedCount = myItems.filter((i) => i.status === 'RETURNED').length;

  return (
    <div className="bg-brand-bg text-brand-dark font-sans min-h-screen pb-24 selection:bg-brand-yellow selection:text-brand-dark">
      {/* 1. Header Oficial */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenPublishModal={() => router.push('/')}
        userName={user?.name || 'Estudante'}
        userAvatar={user?.avatarUrl || undefined}
      />

      {/* 2. Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Banner de Capa & Cabeçalho do Perfil */}
        <div className="bg-white border border-brand-gray rounded-custom overflow-hidden shadow-xs mb-6">
          {/* Capa com Gradiente Oficial (Zero Green) */}
          <div className="h-32 sm:h-44 bg-gradient-to-r from-brand-blue via-brand-blue to-brand-lilac relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-brand-yellow/15 blur-2xl"></div>
            <div className="absolute left-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-xl"></div>

            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-black/30 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15 flex items-center gap-1">
                <i className="bx bx-buildings text-brand-yellow"></i>
                <span>Unochapecó • Campus Chapecó</span>
              </span>
            </div>
          </div>

          {/* Dados do Estudante + Ações */}
          <div className="px-4 sm:px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
              
              {/* Avatar e Identificação */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3.5">
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.name || 'Estudante'}
                  size="lg"
                  className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-white text-3xl shadow-md rounded-2xl"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark">
                      {user?.name || 'Estudante Unochapecó'}
                    </h1>
                    <Badge variant="yellow">VERIFICADO</Badge>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-brand-blue">
                    {user?.academicCourse || 'Graduação'} • Estudante Ativo
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <i className="bx bx-buildings text-brand-lilac"></i>
                      <span>Campus Chapecó (Sede)</span>
                    </span>
                    {user?.email && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {user.email}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Perfil */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon="bx-edit"
                  onClick={() => {
                    setEditName(user?.name || '');
                    setEditCourse(user?.academicCourse || '');
                    setIsEditModalOpen(true);
                  }}
                >
                  Editar Perfil
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  leftIcon="bx-log-out"
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </div>

            </div>

            {/* Indicadores de Impacto Comunitário */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-brand-gray">
              <div className="p-3 rounded-xl bg-slate-50 border border-brand-gray">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Publicações</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-brand-dark">{myItems.length}</span>
                  <span className="text-xs text-slate-400 font-medium">itens</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-brand-gray">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Devolvidos</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-brand-blue">{returnedCount}</span>
                  <span className="text-xs text-slate-400 font-medium">resolvidos</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-brand-gray">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Itens Salvos</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-brand-lilac">{savedItems.length}</span>
                  <span className="text-xs text-slate-400 font-medium">favoritos</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-brand-gray">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Karma Uno</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-amber-900">{user?.reputationScore ?? 0}</span>
                  <span className="text-xs text-slate-400 font-medium">pts</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Abas e Lista de Pertences */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Coluna Esquerda: Informações Institucionais */}
          <aside className="hidden lg:block lg:col-span-4 space-y-5">
            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b border-brand-gray pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <i className="bx bx-shield-quarter text-brand-blue text-sm"></i>
                  Segurança & Verificação
                </h3>
              </div>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <i className="bx bx-check text-brand-blue text-base mt-0.5"></i>
                  <span>E-mail institucional autenticado no campus.</span>
                </div>
                <div className="flex items-start gap-2">
                  <i className="bx bx-check text-brand-blue text-base mt-0.5"></i>
                  <span>Vínculo acadêmico ativo na Unochapecó.</span>
                </div>
                <div className="flex items-start gap-2">
                  <i className="bx bx-check text-brand-blue text-base mt-0.5"></i>
                  <span>Código de segurança com validação presencial por PIN.</span>
                </div>
              </div>
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b border-brand-gray pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <i className="bx bx-trophy text-brand-yellow text-sm"></i>
                  Status no Ranking
                </h3>
                <Link href="/rank" className="text-[11px] text-brand-blue font-semibold hover:underline">
                  Ver Leaderboard
                </Link>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você acumulou <strong>{user?.reputationScore ?? 0} pontos de Karma</strong> este semestre e está elegível a insígnias de guardião da comunidade.
              </p>
            </Card>
          </aside>

          {/* Coluna Direita: Abas e Feed de Itens Pessoais */}
          <section className="col-span-1 lg:col-span-8 space-y-4">
            {/* Abas de Navegação */}
            <div className="flex items-center gap-1 bg-white border border-brand-gray rounded-custom p-1.5 shadow-xs overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('my-items')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'my-items'
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Minhas Publicações ({myItems.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'saved'
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Itens Salvos ({savedItems.length})
              </button>
              <button
                onClick={() => setActiveTab('returned')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'returned'
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Devolvidos ({returnedCount})
              </button>
            </div>

            {/* Lista dos Itens */}
            {loading && (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-white border border-brand-gray rounded-custom p-5 space-y-3 animate-pulse">
                    <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                    <div className="w-full h-3 bg-slate-100 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {!loading && displayedItems.length === 0 && (
              <Card className="text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center text-2xl mx-auto">
                  <i className="bx bx-folder-open"></i>
                </div>
                <h3 className="font-bold text-sm text-brand-dark">Nenhum item nesta aba</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {activeTab === 'my-items' && 'Você ainda não publicou nenhum pertence perdido ou achado.'}
                  {activeTab === 'saved' && 'Você ainda não salvou nenhum pertence nos favoritos.'}
                  {activeTab === 'returned' && 'Nenhum dos seus itens foi marcado como devolvido ainda.'}
                </p>
                <Link href="/">
                  <Button variant="primary" size="sm" leftIcon="bx-home">
                    Explorar Feed do Campus
                  </Button>
                </Link>
              </Card>
            )}

            {displayedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onOpenClaimModal={() => {}}
                onOpenHintModal={() => {}}
                onOpenPinModal={() => {}}
              />
            ))}
          </section>

        </div>
      </main>

      {/* 3. Modal de Edição de Perfil */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Informações do Perfil"
        subtitle="Atualize seus dados acadêmicos exibidos para a comunidade Unochapecó."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveProfile}
              isLoading={savingProfile}
            >
              Salvar Alterações
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Nome Completo"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <CourseCombobox
            label="Curso de Graduação"
            value={editCourse}
            onChange={setEditCourse}
          />
        </form>
      </Dialog>

      {/* 4. Navegação Mobile */}
      <MobileBottomNav onOpenPublishModal={() => router.push('/')} activeTab="profile" />
    </div>
  );
}
