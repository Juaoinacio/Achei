'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Item, Hint } from '../../types';
import {
  getItemHints,
  submitHint,
  markHintHelpful,
  toggleItemLike,
  toggleItemSave,
  getCurrentUser,
} from '../../services/api';
import { Avatar, Badge, Button, Toast } from '../ui';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  onItemUpdated?: () => void;
  onOpenClaimModal?: (item: Item) => void;
  onOpenPinModal?: (item: Item) => void;
  onOpenEditModal?: (item: Item) => void;
  autoFocusComment?: boolean;
}

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

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onItemUpdated,
  onOpenClaimModal,
  onOpenPinModal,
  onOpenEditModal,
  autoFocusComment = false,
}) => {
  const [hints, setHints] = useState<Hint[]>([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [markingHelpfulId, setMarkingHelpfulId] = useState<string | null>(null);
  const [commentError, setCommentError] = useState('');

  const commentInputRef = useRef<HTMLInputElement>(null);
  const currentUser = getCurrentUser();
  const isAuthor = currentUser && item && currentUser.id === item.authorId;
  const isLost = item?.type === 'LOST';

  // Sincroniza dados ao abrir o modal
  useEffect(() => {
    if (!isOpen || !item) {
      setHints([]);
      setNewComment('');
      setCommentError('');
      return;
    }

    setLiked(item.isLiked ?? false);
    setLikeCount(item._count?.likes ?? 0);
    setSaved(item.isSaved ?? false);

    if (item.hints && item.hints.length > 0) {
      const sorted = [...item.hints].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setHints(sorted);
    }

    async function loadHints() {
      setLoadingHints(true);
      try {
        const data = await getItemHints(item!.id);
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHints(sorted);
      } catch (err: any) {
        console.error('Erro ao carregar comentários:', err);
      } finally {
        setLoadingHints(false);
      }
    }

    loadHints();

    if (autoFocusComment) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, item, autoFocusComment]);

  // Bloqueio de scroll do body e tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  async function handleToggleLike() {
    if (!item || loadingLike) return;
    setLoadingLike(true);
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await toggleItemLike(item.id);
      setLiked(res.liked);
      setLikeCount(res.totalLikes);
      if (onItemUpdated) onItemUpdated();
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
      if (onItemUpdated) onItemUpdated();
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
        setHints((prev) => [createdHint, ...prev]);
      } else {
        const refreshed = await getItemHints(item.id);
        const sorted = [...refreshed].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHints(sorted);
      }
      setNewComment('');
      if (onItemUpdated) onItemUpdated();
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
      if (onItemUpdated) onItemUpdated();
    } catch (err: any) {
      setCommentError(err.message || 'Erro ao marcar comentário como útil.');
    } finally {
      setMarkingHelpfulId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-brand-dark/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Toast Flutuante com Timer e Animação Suave */}
      {commentError && (
        <Toast
          message={commentError}
          type="error"
          duration={4000}
          onClose={() => setCommentError('')}
        />
      )}

      {/* Modal Container inspirado no Instagram (tamanho fixo estático) */}
      <div className="relative bg-white rounded-2xl w-full max-w-5xl h-[92vh] sm:h-[88vh] lg:h-[650px] shadow-2xl overflow-hidden z-10 flex flex-col lg:grid lg:grid-cols-12 animate-in zoom-in-95 duration-150 border-0">
        
        {/* Botão Fechar Mobile Flutuante */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-brand-dark shadow-sm flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
          title="Fechar"
        >
          <i className="bx bx-x text-xl"></i>
        </button>

        {/* ==================================================== */}
        {/* COLUNA ESQUERDA (Visual da Imagem) - Fundo Claro     */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 bg-slate-100/90 relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden h-[260px] sm:h-[320px] lg:h-full lg:border-r border-b lg:border-b-0 border-slate-200/80">
          {/* Imagem ou Ilustração de Placeholder */}
          {item.photoUrl ? (
            <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden">
              <img
                src={item.photoUrl}
                alt={item.title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-xs"
              />
            </div>
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center text-slate-500 space-y-2.5">
              <div className="w-16 h-16 rounded-2xl bg-white text-brand-blue border border-brand-gray shadow-xs flex items-center justify-center text-3xl">
                <i className={`bx ${item.category?.iconName || 'bx-cube'}`}></i>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                  {item.category?.name || 'Pertence'}
                </span>
                <p className="text-xs font-semibold text-slate-600">
                  Sem foto anexada pelo autor
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* COLUNA DIREITA (Autor, Detalhes & Comentários) - 5 cols */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 flex flex-col h-full bg-white divide-y divide-brand-gray min-h-0 overflow-hidden">
          {/* 1. Perfil do Autor */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={item.author?.avatarUrl}
                name={item.author?.name || 'Estudante'}
                size="md"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-xs sm:text-sm text-brand-dark truncate">
                    {item.author?.name || 'Estudante'}
                  </h4>
                  {item.author?.role === 'STAFF_PORTARIA' && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      Portaria
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {item.author?.academicCourse || 'Comunidade Unochapecó'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isAuthor && onOpenEditModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenEditModal(item);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Editar ou cancelar sua publicação"
                >
                  <i className="bx bx-edit text-sm"></i>
                  <span>Editar</span>
                </button>
              )}

              {/* Karma Score do Autor */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold"
                title="Pontos de reputação comunitária"
              >
                <i className="bx bxs-star text-amber-500 text-xs"></i>
                <span>{item.author?.reputationScore ?? 0}</span>
              </div>

              {/* Botão Fechar Modal */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-brand-dark flex items-center justify-center transition-colors cursor-pointer ml-1"
                title="Fechar"
                aria-label="Fechar modal"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>
          </div>

          {/* 2. Cabeçalho Travado: Detalhes do Pertence (Título, Status, Localização) */}
          <div className="p-3.5 sm:p-4 shrink-0 bg-white space-y-2 border-b border-brand-gray relative z-20">
            {/* Metadados: Categoria • Tempo Relativo */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              {item.category && (
                <>
                  <span className="font-bold text-brand-blue">
                    {item.category.name}
                  </span>
                  <span>•</span>
                </>
              )}
              <span>Publicado {formatRelativeTime(item.createdAt)}</span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <h3 className="font-extrabold text-sm sm:text-base text-brand-dark leading-snug flex-1">
                {item.title}
              </h3>

              {/* Badges de Tipo e Status */}
              <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                {item.status === 'RETURNED' ? (
                  <Badge variant="returned" size="sm" icon="bx-check-double">
                    {isLost ? 'RECUPERADO' : 'DEVOLVIDO'}
                  </Badge>
                ) : isLost ? (
                  <Badge variant="lost" size="sm" icon="bx-help-circle">
                    PERDIDO
                  </Badge>
                ) : (
                  <Badge variant="found" size="sm" icon="bx-check-circle">
                    ACHADO
                  </Badge>
                )}

                {item.isUnderStaffCustody && (
                  <Badge variant="portaria" size="sm" icon="bx-shield-quarter">
                    PORTARIA
                  </Badge>
                )}

                {item.hasReward && (
                  <Badge variant="reward" size="sm" icon="bx-gift">
                    RECOMPENSA
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>

            {/* Localização */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-brand-dark text-xs font-semibold border border-slate-200">
                <i className="bx bx-buildings text-brand-blue"></i>
                <span>{item.block?.name || 'Campus Unochapecó'}</span>
                {item.specificLocation && (
                  <span className="text-slate-500">• {item.specificLocation}</span>
                )}
              </span>

              {item.custodyLocation && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
                  <i className="bx bx-map-pin"></i>
                  <span>Guarda: {item.custodyLocation}</span>
                </span>
              )}
            </div>

            {/* Banner de Item Concluído/Resolvido */}
            {item.status === 'RETURNED' && (
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-medium">
                <i className="bx bx-check-double text-lg text-emerald-700 shrink-0"></i>
                <span>
                  Este pertence foi marcado como <strong>{isLost ? 'recuperado pelo dono' : 'devolvido'}</strong> e o caso está encerrado com sucesso.
                </span>
              </div>
            )}
          </div>

          {/* 3. Cabeçalho Fixo dos Comentários */}
          <div className="px-3.5 sm:px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 z-10">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <i className="bx bx-message-rounded-dots text-brand-blue"></i>
              <span>Comentários {hints.length}</span>
            </h5>
            <span className="text-[11px] text-slate-400">
              Ajude com pistas e detalhes
            </span>
          </div>

          {/* 4. Área Exclusiva de Rolagem dos Comentários */}
          <div className="flex-1 min-h-0 p-3.5 sm:p-4 overflow-y-auto space-y-3 custom-scrollbar">

              {loadingHints ? (
                <div className="py-6 flex items-center justify-center text-slate-400 gap-2 text-xs">
                  <i className="bx bx-loader-alt bx-spin text-brand-blue text-base"></i>
                  <span>Carregando comentários...</span>
                </div>
              ) : hints.length === 0 ? (
                <div className="py-6 text-center px-4 space-y-1.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-lg mx-auto">
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
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1">
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
                          <div className="pt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold">
                              ⭐ Comentário Útil
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Autor pode marcar comentários úteis (exceto os próprios) */}
                      {isAuthor && !hint.isHelpful && hint.authorId !== currentUser?.id && (
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

          {/* 5. Rodapé Fixo com Ações & Envio de Comentário */}
          <div className="p-3 sm:p-3.5 bg-white border-t border-slate-200 space-y-2.5 shrink-0 z-20 relative shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            {/* Ações Sociais e Reivindicação */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {/* Curtir */}
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    liked
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-brand-gray text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Curtir publicação"
                >
                  <i
                    className={`bx ${liked ? 'bxs-heart text-rose-500' : 'bx-heart'} text-sm`}
                  ></i>
                  <span>{likeCount}</span>
                </button>

                {/* Salvar */}
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    saved
                      ? 'bg-blue-50 border-blue-200 text-brand-blue'
                      : 'bg-white border-brand-gray text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Salvar pertence"
                >
                  <i
                    className={`bx ${saved ? 'bxs-bookmark text-brand-blue' : 'bx-bookmark'} text-sm`}
                  ></i>
                  <span className="hidden sm:inline">Salvar</span>
                </button>
              </div>

              {/* Botões de Ação Principal */}
              <div className="flex items-center gap-1.5">
                {item.status === 'RETURNED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                    <i className="bx bx-check-double text-base"></i>
                    {isLost ? 'Pertence Recuperado' : 'Pertence Devolvido'}
                  </span>
                ) : (
                  <>
                    {!isLost && onOpenClaimModal && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon="bx-check-shield"
                        onClick={() => {
                          onClose();
                          onOpenClaimModal(item);
                        }}
                      >
                        É meu!
                      </Button>
                    )}

                    {item.isUnderStaffCustody && onOpenPinModal && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon="bx-key"
                        onClick={() => {
                          onClose();
                          onOpenPinModal(item);
                        }}
                        className="bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 font-bold"
                      >
                        PIN Portaria
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Input de Comentário */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-0.5">
              <input
                ref={commentInputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Deixe um comentário com pistas..."
                className="flex-1 px-3 py-1.5 bg-white border border-brand-gray rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
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
    </div>
  );
};
