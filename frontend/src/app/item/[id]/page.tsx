'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Item, Hint, CampusBlock, Category } from '../../../types';
import {
  getItemById,
  getItemHints,
  submitHint,
  markHintHelpful,
  toggleItemLike,
  toggleItemSave,
  getCurrentUser,
  getAuthToken,
  getCampusBlocks,
  getCategories,
} from '../../../services/api';
import { Header } from '../../../components/common/Header';
import { Avatar, Badge, Button } from '../../../components/ui';
import { ClaimModal } from '../../../components/modals/ClaimModal';
import { HandoffPinModal } from '../../../components/modals/HandoffPinModal';
import { PublishModal } from '../../../components/modals/PublishModal';
import { EditItemModal } from '../../../components/modals/EditItemModal';

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'agora';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `há ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `há ${diffDays} d`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `há ${diffWeeks} sem`;
    return date.toLocaleDateString('pt-BR');
  } catch {
    return 'recentemente';
  }
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Social interactions
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // Comments / Hints
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [markingHelpfulId, setMarkingHelpfulId] = useState<string | null>(null);
  const [commentError, setCommentError] = useState('');

  // Modals
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [blocks, setBlocks] = useState<CampusBlock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const currentUser = getCurrentUser();
  const isAuthor = currentUser && item && currentUser.id === item.authorId;

  // Carrega blocos e categorias
  useEffect(() => {
    async function loadMeta() {
      try {
        const [blocksData, catsData] = await Promise.all([
          getCampusBlocks().catch(() => []),
          getCategories().catch(() => []),
        ]);
        setBlocks(blocksData);
        setCategories(catsData);
      } catch {}
    }
    loadMeta();
  }, []);

  // Carrega Item e Comentários
  useEffect(() => {
    if (!id) return;

    async function loadItemData() {
      setLoading(true);
      setError(null);
      try {
        const itemData = await getItemById(id);
        setItem(itemData);
        setLiked(itemData.isLiked ?? false);
        setLikeCount(itemData._count?.likes ?? 0);
        setSaved(itemData.isSaved ?? false);

        // Carrega as hints da rota específica ou usa as já aninhadas no item
        if (itemData.hints && itemData.hints.length > 0) {
          setHints(itemData.hints);
        } else {
          try {
            const hintsData = await getItemHints(id);
            setHints(hintsData);
          } catch {
            // Se falhar a rota de hints, mantém vazio
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar detalhes do item:', err);
        setError(err.message || 'Item não encontrado ou indisponível.');
      } finally {
        setLoading(false);
      }
    }

    loadItemData();
  }, [id]);

  async function handleToggleLike() {
    if (!item || loadingLike) return;
    setLoadingLike(true);
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await toggleItemLike(item.id);
      setLiked(res.liked);
      setLikeCount(res.totalLikes);
    } catch {
      setLiked(liked);
      setLikeCount(likeCount);
    } finally {
      setLoadingLike(false);
    }
  }

  async function handleToggleSave() {
    if (!item || loadingSave) return;
    setLoadingSave(true);
    setSaved(!saved);

    try {
      const res = await toggleItemSave(item.id);
      setSaved(res.saved);
    } catch {
      setSaved(saved);
    } finally {
      setLoadingSave(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!item || !newComment.trim() || submittingComment) return;

    if (newComment.trim().length < 5) {
      setCommentError('O comentário deve conter no mínimo 5 caracteres.');
      return;
    }

    setSubmittingComment(true);
    setCommentError('');

    try {
      const res = await submitHint(item.id, newComment.trim());
      const createdHint = res?.hint;
      if (createdHint) {
        setHints((prev) => [...prev, createdHint]);
      } else {
        const refreshed = await getItemHints(item.id);
        setHints(refreshed);
      }
      setNewComment('');
    } catch (err: any) {
      setCommentError(err.message || 'Erro ao publicar comentário.');
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleMarkHelpful(hintId: string) {
    if (markingHelpfulId) return;
    setMarkingHelpfulId(hintId);
    try {
      await markHintHelpful(hintId);
      setHints((prev) =>
        prev.map((h) => (h.id === hintId ? { ...h, isHelpful: true } : h))
      );
    } catch (err: any) {
      setCommentError(err.message || 'Erro ao marcar comentário como útil.');
    } finally {
      setMarkingHelpfulId(null);
    }
  }

  const isLost = item?.type === 'LOST';

  return (
    <div className="bg-brand-bg text-brand-dark font-sans min-h-screen pb-16 selection:bg-brand-yellow selection:text-brand-dark">
      {/* Header Global */}
      <Header
        searchTerm=""
        onSearchChange={() => {}}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Breadcrumb de Navegação */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-brand-blue bg-white border border-brand-gray px-3 py-1.5 rounded-xl shadow-xs transition-colors"
          >
            <i className="bx bx-arrow-back text-base"></i>
            <span>Voltar ao Feed</span>
          </Link>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Achei Unochapecó • Pertences do Campus
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-brand-gray rounded-2xl p-12 flex flex-col items-center justify-center gap-3 shadow-xs">
            <i className="bx bx-loader-alt bx-spin text-3xl text-brand-blue"></i>
            <span className="text-sm font-semibold text-slate-500">
              Carregando detalhes do pertence...
            </span>
          </div>
        )}

        {/* Error State */}
        {!loading && (error || !item) && (
          <div className="bg-white border border-brand-gray rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto">
              <i className="bx bx-error-circle"></i>
            </div>
            <h3 className="font-extrabold text-base text-brand-dark">
              Pertence não encontrado
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {error || 'Não encontramos a publicação solicitada. Ela pode ter sido removida ou resolvida.'}
            </p>
            <Button variant="primary" size="sm" onClick={() => router.push('/')}>
              Voltar à página inicial
            </Button>
          </div>
        )}

        {/* Conteúdo Principal: Layout Instagram Desktop/Mobile */}
        {!loading && item && (
          <div className="bg-white border border-brand-gray rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* ==================================================== */}
            {/* COLUNA ESQUERDA (Visual & Status) - 7 cols em desktop */}
            {/* ==================================================== */}
            <div className="lg:col-span-7 bg-slate-900/95 relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden min-h-[340px] lg:min-h-full">
              {/* Badges Flutuantes no Topo do Visual */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
                <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
                  {isLost ? (
                    <Badge variant="lost" size="md" icon="bx-help-circle">
                      PERDIDO
                    </Badge>
                  ) : (
                    <Badge variant="found" size="md" icon="bx-check-circle">
                      ACHADO
                    </Badge>
                  )}

                  {item.isUnderStaffCustody && (
                    <Badge variant="portaria" size="md" icon="bx-shield-quarter">
                      NA PORTARIA
                    </Badge>
                  )}

                  {item.hasReward && (
                    <Badge variant="reward" size="md" icon="bx-gift">
                      COM RECOMPENSA
                    </Badge>
                  )}
                </div>

                {item.status === 'RETURNED' && (
                  <Badge variant="returned" size="md" icon="bx-check-double">
                    DEVOLVIDO
                  </Badge>
                )}
              </div>

              {/* Imagem ou Container Ilustrado */}
              {item.photoUrl ? (
                <div className="w-full h-full flex items-center justify-center max-h-[520px]">
                  <img
                    src={item.photoUrl}
                    alt={item.title}
                    className="max-w-full max-h-[480px] object-contain rounded-xl shadow-lg"
                  />
                </div>
              ) : (
                <div className="w-full py-16 flex flex-col items-center justify-center text-center text-slate-300 space-y-3">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-4xl text-brand-yellow backdrop-blur-xs">
                    <i className={`bx ${item.category?.iconName || 'bx-cube'}`}></i>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                      {item.category?.name || 'Pertence'}
                    </span>
                    <p className="text-sm font-semibold text-white/90">
                      Sem foto anexada pelo autor
                    </p>
                  </div>
                </div>
              )}

              {/* Badges Flutuantes no Rodapé do Visual */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
                <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 text-white backdrop-blur-md text-xs font-semibold border border-white/20">
                    <i className="bx bx-buildings text-brand-yellow"></i>
                    <span>{item.block?.name || 'Campus Unochapecó'}</span>
                    {item.specificLocation && (
                      <span className="text-white/70">• {item.specificLocation}</span>
                    )}
                  </span>
                </div>

                {item.custodyLocation && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-900/80 text-white backdrop-blur-md text-xs font-medium border border-purple-400/30 pointer-events-auto">
                    <i className="bx bx-map-pin"></i>
                    <span>Guarda: {item.custodyLocation}</span>
                  </span>
                )}
              </div>
            </div>

            {/* ==================================================== */}
            {/* COLUNA DIREITA (Autor, Descrição & Thread Comentários) */}
            {/* ==================================================== */}
            <div className="lg:col-span-5 flex flex-col h-full bg-white divide-y divide-brand-gray">
              {/* 1. Perfil do Autor */}
              <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/60 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={item.author?.avatarUrl}
                    name={item.author?.name || 'Estudante'}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-sm text-brand-dark truncate">
                        {item.author?.name || 'Estudante'}
                      </h4>
                      {item.author?.role === 'STAFF_PORTARIA' && (
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          Portaria
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {item.author?.academicCourse || 'Comunidade Unochapecó'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAuthor && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
                      title="Editar ou cancelar sua publicação"
                    >
                      <i className="bx bx-edit text-sm"></i>
                      <span>Editar</span>
                    </button>
                  )}

                  {/* Karma Score do Autor */}
                  <div
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold"
                    title="Pontos de reputação comunitária"
                  >
                    <i className="bx bxs-star text-amber-500"></i>
                    <span>{item.author?.reputationScore ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* 2. Área de Conteúdo & Comentários com Scroll Vertical */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar max-h-[420px] lg:max-h-[380px]">
                {/* Título & Descrição do Autor */}
                <div className="space-y-2 pb-3 border-b border-slate-100">
                  <h1 className="font-extrabold text-base sm:text-lg text-brand-dark leading-snug">
                    {item.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <span>Publicado {formatRelativeTime(item.createdAt)}</span>
                    {item.category && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-brand-blue">
                          {item.category.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Feed de Comentários / Pistas */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Comentários {hints.length}
                    </h5>
                    <span className="text-[11px] text-slate-400">
                      Ajude com pistas e detalhes
                    </span>
                  </div>

                  {commentError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
                      <span>{commentError}</span>
                      <button
                        onClick={() => setCommentError('')}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <i className="bx bx-x"></i>
                      </button>
                    </div>
                  )}

                  {hints.length === 0 ? (
                    <div className="py-8 text-center px-4 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto">
                        <i className="bx bx-message-rounded-dots"></i>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Nenhum comentário ainda. Seja o primeiro a ajudar!
                      </p>
                    </div>
                  ) : (
                    hints.map((hint) => (
                      <div key={hint.id} className="flex items-start gap-2.5">
                        <Avatar
                          src={hint.author?.avatarUrl}
                          name={hint.author?.name || 'Estudante'}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-bold text-xs text-brand-dark">
                                {hint.author?.name || 'Estudante'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {formatRelativeTime(hint.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                              {hint.content}
                            </p>

                            {hint.isHelpful && (
                              <div className="pt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold">
                                  ⭐ Comentário Útil
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Se for o autor do item e o comentário não for útil */}
                          {isAuthor && !hint.isHelpful && (
                            <div className="mt-1 pl-1">
                              <button
                                onClick={() => handleMarkHelpful(hint.id)}
                                disabled={markingHelpfulId === hint.id}
                                className="text-[11px] font-semibold text-brand-blue hover:text-blue-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {markingHelpfulId === hint.id ? (
                                  <i className="bx bx-loader-alt bx-spin"></i>
                                ) : (
                                  <i className="bx bx-star"></i>
                                )}
                                <span>Marcar como útil (+3 Karma)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 3. Rodapé com Ações de Engajamento & Campo de Comentário */}
              <div className="p-4 sm:p-5 bg-slate-50/70 space-y-3 shrink-0">
                {/* Botões de Ação Social (Curtir, Salvar, Reivindicar) */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleLike}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        liked
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'bg-white border-brand-gray text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Curtir publicação"
                    >
                      <i
                        className={`bx ${liked ? 'bxs-heart text-rose-500' : 'bx-heart'} text-base`}
                      ></i>
                      <span>{likeCount}</span>
                    </button>

                    <button
                      onClick={handleToggleSave}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        saved
                          ? 'bg-blue-50 border-blue-200 text-brand-blue'
                          : 'bg-white border-brand-gray text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Salvar item"
                    >
                      <i
                        className={`bx ${saved ? 'bxs-bookmark text-brand-blue' : 'bx-bookmark'} text-base`}
                      ></i>
                      <span className="hidden sm:inline">Salvar</span>
                    </button>
                  </div>

                  {/* Ação Principal: Reivindicar / PIN */}
                  <div className="flex items-center gap-2">
                    {!isLost && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon="bx-check-shield"
                        onClick={() => setIsClaimModalOpen(true)}
                      >
                        É meu!
                      </Button>
                    )}

                    {item.isUnderStaffCustody && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon="bx-key"
                        onClick={() => setIsPinModalOpen(true)}
                        className="bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 font-bold"
                      >
                        PIN Portaria
                      </Button>
                    )}
                  </div>
                </div>

                {/* Formulário de Envio de Comentário */}
                <form
                  onSubmit={handleAddComment}
                  className="flex items-center gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Deixe um comentário com pistas..."
                    className="flex-1 px-3 py-2 bg-white border border-brand-gray rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                    disabled={submittingComment}
                    maxLength={500}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    isLoading={submittingComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="shrink-0 font-bold"
                  >
                    Publicar
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modais de Reivindicação, PIN e Publicação */}
      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={() => {
          if (item) getItemById(item.id).then(setItem);
        }}
        item={item}
      />

      <HandoffPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          if (item) getItemById(item.id).then(setItem);
        }}
        item={item}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={() => router.push('/')}
        blocks={blocks}
        categories={categories}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => setItem(updated)}
        onDeleteSuccess={() => {
          setIsEditModalOpen(false);
          router.push('/');
        }}
        item={item}
        blocks={blocks}
        categories={categories}
      />
    </div>
  );
}
