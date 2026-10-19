'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CampusBlock, Category, Item, ItemType } from '../types';
import { getCampusBlocks, getCategories, getFeedItems, getAuthToken, getCurrentUser } from '../services/api';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { RightSidebar } from '../components/common/RightSidebar';
import { ItemCard } from '../components/common/ItemCard';
import { MobileBottomNav } from '../components/common/MobileBottomNav';
import { Button, Card } from '../components/ui';
import { PublishModal } from '../components/modals/PublishModal';
import { ClaimModal } from '../components/modals/ClaimModal';
import { HandoffPinModal } from '../components/modals/HandoffPinModal';
import { NewHintModal } from '../components/modals/NewHintModal';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Validação de Sessão Obrigatória
  useEffect(() => {
    const token = getAuthToken();
    const user = getCurrentUser();
    if (!token || !user) {
      router.push('/login?redirect=/');
      return;
    }
    setCurrentUser(user);
    setAuthChecked(true);
  }, [router]);

  // Dados de Referência
  const [blocks, setBlocks] = useState<CampusBlock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Feed & Itens
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros Ativos
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [activeNavTab, setActiveNavTab] = useState('feed');

  // Modais
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedClaimItem, setSelectedClaimItem] = useState<Item | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedPinItem, setSelectedPinItem] = useState<Item | null>(null);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [selectedHintItem, setSelectedHintItem] = useState<Item | null>(null);

  // Carregar Blocos e Categorias no Mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const [blocksData, catsData] = await Promise.all([
          getCampusBlocks().catch(() => []),
          getCategories().catch(() => []),
        ]);
        setBlocks(blocksData);
        setCategories(catsData);
      } catch (e) {
        console.error('Erro ao carregar blocos/categorias:', e);
      }
    }
    loadMeta();
  }, []);

  // Carregar Itens da API baseado nos filtros de busca, bloco e categoria
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFeedItems({
        blockId: selectedBlockId !== 'all' ? selectedBlockId : undefined,
        categoryId: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
        q: searchTerm.trim() ? searchTerm.trim() : undefined,
        limit: 50,
      });

      let feedData = res.data;

      // Filtro local adicional caso a aba lateral seja "saved" ou "returned"
      if (activeNavTab === 'saved') {
        feedData = feedData.filter((i) => i.isSaved);
      } else if (activeNavTab === 'returned') {
        feedData = feedData.filter((i) => i.status === 'RETURNED');
      }

      setItems(feedData);
    } catch (err: any) {
      console.error('Erro ao buscar itens:', err);
      setError('Não foi possível conectar ao servidor da Unochapecó. Verifique se o backend está ativo.');
    } finally {
      setLoading(false);
    }
  }, [selectedBlockId, selectedCategoryId, searchTerm, activeNavTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  // Contagens para os botões de filtro
  const totalCount = items.length;
  const lostCount = items.filter((i) => i.type === 'LOST').length;
  const foundCount = items.filter((i) => i.type === 'FOUND').length;

  // Itens exibidos de acordo com a aba selecionada (Todos / Perdidos / Achados)
  const displayedItems = items.filter((item) => {
    if (typeFilter === 'ALL') return true;
    return item.type === typeFilter;
  });

  if (!authChecked) {
    return (
      <div className="bg-brand-bg min-h-screen flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-brand-yellow text-brand-dark rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-sm animate-pulse">
            <i className="bx bx-search"></i>
          </div>
          <span className="text-xl font-extrabold text-brand-blue tracking-tight">Achei Unochapecó</span>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-2">
            <i className="bx bx-loader-alt bx-spin text-brand-blue text-base"></i>
            <span>Verificando autenticação...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg text-brand-dark font-sans min-h-screen pb-20 lg:pb-12 selection:bg-brand-yellow selection:text-brand-dark">
      
      {/* 1. Header Oficial Unochapecó */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        userName={currentUser?.name}
        userAvatar={currentUser?.avatarUrl}
      />

      {/* 2. Barra de Busca Mobile */}
      <div className="md:hidden bg-white border-b border-brand-gray px-4 py-2.5 shadow-xs">
        <div className="relative">
          <i className="bx bx-search text-slate-400 text-lg absolute left-3 top-2.5"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por pertence, bloco ou sala..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-brand-gray rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 3. Carrossel Horizontal de Blocos no Mobile */}
      <div className="lg:hidden bg-white border-b border-brand-gray px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-2 shadow-xs">
        <button
          onClick={() => setSelectedBlockId('all')}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            selectedBlockId === 'all'
              ? 'bg-brand-blue text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-brand-gray'
          }`}
        >
          Todos os Blocos
        </button>
        {blocks.map((block) => {
          const isSelected = selectedBlockId === block.id;
          return (
            <button
              key={block.id}
              onClick={() => setSelectedBlockId(block.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-brand-blue text-white border-brand-blue font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-brand-gray'
              }`}
            >
              {block.name}
            </button>
          );
        })}
      </div>

      {/* 4. Container Principal com Grid de 3 Colunas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Coluna Esquerda: Navegação e Combobox de Blocos */}
          <Sidebar
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={(bId) => setSelectedBlockId(bId)}
            activeNavTab={activeNavTab}
            onSelectNavTab={(tab) => setActiveNavTab(tab)}
          />

          {/* Coluna Central: Feed Social de Pertences */}
          <section className="col-span-1 lg:col-span-6 space-y-4">
            
            {/* Abas Segmentadas de Filtro (Todos / Perdidos / Achados) */}
            <div className="flex items-center justify-between bg-white border border-brand-gray rounded-custom p-1.5 shadow-xs">
              <div className="flex items-center gap-1 w-full sm:w-auto">
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === 'ALL'
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todos ({totalCount})
                </button>
                <button
                  onClick={() => setTypeFilter('LOST')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === 'LOST'
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Perdidos ({lostCount})
                </button>
                <button
                  onClick={() => setTypeFilter('FOUND')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === 'FOUND'
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Achados ({foundCount})
                </button>
              </div>

              {/* Botão de Atualizar / Recarregar */}
              <div className="hidden sm:flex items-center gap-2 pr-2">
                <button
                  onClick={() => fetchItems()}
                  className="text-slate-400 hover:text-brand-blue text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Recarregar feed"
                >
                  <i className="bx bx-refresh text-base"></i>
                  <span>Atualizar</span>
                </button>
              </div>
            </div>

            {/* Filtro Rápido por Categorias */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    selectedCategoryId === 'all'
                      ? 'bg-brand-blue text-white border-brand-blue font-bold'
                      : 'bg-white text-slate-600 border-brand-gray hover:bg-slate-50'
                  }`}
                >
                  Todas Categorias
                </button>
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-brand-blue text-white border-brand-blue font-bold'
                          : 'bg-white text-slate-600 border-brand-gray hover:bg-slate-50'
                      }`}
                    >
                      <i className={`bx ${cat.iconName || 'bx-tag'} text-xs`}></i>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-custom p-4 text-xs text-rose-700 flex items-start justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <i className="bx bx-error-circle text-lg shrink-0"></i>
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => fetchItems()}
                  className="text-xs font-bold text-rose-800 underline hover:no-underline shrink-0 cursor-pointer"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && items.length === 0 && (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white border border-brand-gray rounded-custom p-5 space-y-3 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200"></div>
                        <div className="space-y-1">
                          <div className="w-28 h-3.5 bg-slate-200 rounded"></div>
                          <div className="w-20 h-2.5 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                      <div className="w-16 h-5 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                    <div className="w-full h-3 bg-slate-100 rounded"></div>
                    <div className="w-2/3 h-3 bg-slate-100 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Estado Vazio */}
            {!loading && displayedItems.length === 0 && (
              <Card className="text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center text-2xl mx-auto">
                  <i className="bx bx-search-alt"></i>
                </div>
                <h3 className="font-bold text-sm text-brand-dark">Nenhum pertence encontrado</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {typeFilter === 'LOST'
                    ? 'Nenhum pertence perdido cadastrado com os filtros selecionados.'
                    : typeFilter === 'FOUND'
                    ? 'Nenhum pertence achado cadastrado com os filtros selecionados.'
                    : searchTerm
                    ? `Nenhum resultado corresponde à busca "${searchTerm}". Tente outros termos ou limpe o filtro.`
                    : 'Não há publicações cadastradas com os filtros selecionados no momento.'}
                </p>
                {(searchTerm || selectedBlockId !== 'all' || selectedCategoryId !== 'all' || typeFilter !== 'ALL') && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon="bx-filter-alt"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedBlockId('all');
                      setSelectedCategoryId('all');
                      setTypeFilter('ALL');
                    }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </Card>
            )}

            {/* Lista dos Itens do Feed */}
            {displayedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onOpenClaimModal={(it) => {
                  setSelectedClaimItem(it);
                  setIsClaimModalOpen(true);
                }}
                onOpenHintModal={(it) => {
                  setSelectedHintItem(it);
                  setIsHintModalOpen(true);
                }}
                onOpenPinModal={(it) => {
                  setSelectedPinItem(it);
                  setIsPinModalOpen(true);
                }}
              />
            ))}

          </section>

          {/* Coluna Direita: Status da Portaria e Ranking Comunitário */}
          <RightSidebar />

        </div>
      </main>

      {/* 5. Navegação Inferior Mobile */}
      <MobileBottomNav
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        activeTab="feed"
      />

      {/* 6. Modais do Sistema */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={() => fetchItems()}
        blocks={blocks}
        categories={categories}
      />

      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => {
          setIsClaimModalOpen(false);
          setSelectedClaimItem(null);
        }}
        onSuccess={() => fetchItems()}
        item={selectedClaimItem}
      />

      <HandoffPinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setSelectedPinItem(null);
        }}
        onSuccess={() => fetchItems()}
        item={selectedPinItem}
      />

      <NewHintModal
        isOpen={isHintModalOpen}
        onClose={() => {
          setIsHintModalOpen(false);
          setSelectedHintItem(null);
        }}
        onSuccess={() => fetchItems()}
        item={selectedHintItem}
      />

    </div>
  );
}
