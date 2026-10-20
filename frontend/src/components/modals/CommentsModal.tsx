'use client';

import React, { useState, useEffect } from 'react';
import { Item, Hint } from '../../types';
import {
  getItemHints,
  submitHint,
  markHintHelpful,
  getCurrentUser,
} from '../../services/api';
import { Avatar, Badge, Button, Toast } from '../ui';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  onItemUpdated?: () => void;
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

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  item,
  onItemUpdated,
}) => {
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [markingHelpfulId, setMarkingHelpfulId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const currentUser = getCurrentUser();
  const isAuthor = currentUser && item && currentUser.id === item.authorId;

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

  // Carrega comentários ao abrir
  useEffect(() => {
    if (!isOpen || !item) {
      setHints([]);
      setNewComment('');
      setErrorMsg('');
      return;
    }

    async function loadHints() {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await getItemHints(item!.id);
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHints(sorted);
      } catch (err: any) {
        console.error('Erro ao carregar comentários:', err);
        setErrorMsg('Não foi possível carregar os comentários.');
      } finally {
        setLoading(false);
      }
    }

    loadHints();
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const isLost = item.type === 'LOST';

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    if (newComment.trim().length < 5) {
      setErrorMsg('O comentário deve conter no mínimo 5 caracteres.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await submitHint(item!.id, newComment.trim());
      const createdHint = res?.hint;
      if (createdHint) {
        setHints((prev) => [createdHint, ...prev]);
      } else {
        // Fallback: recarrega lista da API
        const refreshed = await getItemHints(item!.id);
        const sorted = [...refreshed].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHints(sorted);
      }
      setNewComment('');
      if (onItemUpdated) onItemUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao publicar comentário.');
    } finally {
      setSubmitting(false);
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
      setErrorMsg(err.message || 'Não foi possível marcar comentário como útil.');
    } finally {
      setMarkingHelpfulId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-dark/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Toast Flutuante com Timer e Animação Suave */}
      {errorMsg && (
        <Toast
          message={errorMsg}
          type="error"
          onClose={() => setErrorMsg('')}
        />
      )}

      <div className="relative bg-white border border-brand-gray rounded-2xl w-full max-w-lg md:max-w-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Cabeçalho inspirado no Instagram */}
        <div className="p-4 sm:p-5 border-b border-brand-gray bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <Avatar
              src={item.author?.avatarUrl}
              name={item.author?.name || 'Estudante'}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm text-brand-dark truncate">
                  {item.title}
                </h3>
                {isLost ? (
                  <Badge variant="lost" size="sm">
                    Perdido
                  </Badge>
                ) : (
                  <Badge variant="found" size="sm">
                    Achado
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
                <span>Por {item.author?.name || 'Estudante'}</span>
                <span>•</span>
                <span className="font-medium text-brand-blue truncate">
                  {item.block?.name || 'Campus Chapecó'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-brand-dark flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Fechar modal de comentários"
            >
              <i className="bx bx-x text-xl"></i>
            </button>
          </div>
        </div>

        {/* Lista de Comentários com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-white">
          {/* Item original / Resumo fixado no topo da conversa */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
            <Avatar
              src={item.author?.avatarUrl}
              name={item.author?.name || 'Estudante'}
              size="sm"
            />
            <div className="flex-1 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-brand-dark mr-1.5">
                {item.author?.name || 'Estudante'}
              </span>
              <span>{item.description}</span>
              <div className="text-[11px] text-slate-400 mt-1">
                {formatRelativeTime(item.createdAt)}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <i className="bx bx-loader-alt bx-spin text-2xl text-brand-blue"></i>
              <span className="text-xs">Carregando comentários...</span>
            </div>
          ) : hints.length === 0 ? (
            /* Empty State Acolhedor */
            <div className="py-12 flex flex-col items-center justify-center text-center px-4 space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center text-2xl">
                <i className="bx bx-message-rounded-dots"></i>
              </div>
              <h4 className="font-bold text-sm text-brand-dark">
                Nenhum comentário ainda
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Seja o primeiro a ajudar! Compartilhe informações de onde viu o pertence ou avise ao estudante.
              </p>
            </div>
          ) : (
            hints.map((hint) => {
              const isHintAuthor =
                currentUser && hint.authorId === currentUser.id;
              return (
                <div key={hint.id} className="flex items-start gap-3 group">
                  <Avatar
                    src={hint.author?.avatarUrl}
                    name={hint.author?.name || 'Estudante'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-brand-dark">
                            {hint.author?.name || 'Estudante'}
                          </span>
                          {hint.author?.academicCourse && (
                            <span className="text-[10px] text-slate-400">
                              • {hint.author.academicCourse}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(hint.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                        {hint.content}
                      </p>

                      {/* Badge Comentário Útil */}
                      {hint.isHelpful && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold">
                            <i className="bx bxs-star text-amber-500"></i>
                            ⭐ Comentário Útil
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ação para o autor marcar como útil */}
                    {isAuthor && !hint.isHelpful && hint.authorId !== currentUser?.id && (
                      <div className="mt-1 flex items-center gap-2 pl-1">
                        <button
                          onClick={() => handleMarkHelpful(hint.id)}
                          disabled={markingHelpfulId === hint.id}
                          className="text-[11px] font-semibold text-brand-blue hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {markingHelpfulId === hint.id ? (
                            <i className="bx bx-loader-alt bx-spin text-xs"></i>
                          ) : (
                            <i className="bx bx-star text-xs"></i>
                          )}
                          <span>Marcar como útil (+3 Unopoints)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé fixo com Input e botão Publicar estilo Instagram */}
        <form
          onSubmit={handleAddComment}
          className="p-3 sm:p-4 border-t border-brand-gray bg-slate-50/90 flex items-center gap-2 shrink-0"
        >
          <Avatar
            src={currentUser?.avatarUrl}
            name={currentUser?.name || 'Eu'}
            size="sm"
            className="hidden sm:block"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário para ajudar..."
              className="w-full pl-3 pr-3 py-2 bg-white border border-brand-gray rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
              disabled={submitting}
              maxLength={500}
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            isLoading={submitting}
            disabled={!newComment.trim() || submitting}
            className="shrink-0 font-bold"
          >
            Publicar
          </Button>
        </form>
      </div>
    </div>
  );
};
