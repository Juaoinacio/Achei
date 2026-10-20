'use client';

import React, { useState } from 'react';
import { Item } from '../../types';
import { toggleItemLike, toggleItemSave, getCurrentUser } from '../../services/api';
import { Button, Badge, Card, Avatar } from '../ui';

interface ItemCardProps {
  item: Item;
  onOpenClaimModal: (item: Item) => void;
  onOpenHintModal: (item: Item) => void;
  onOpenPinModal: (item: Item) => void;
  onOpenEditModal?: (item: Item) => void;
  onOpenDetailModal?: (item: Item, autoFocusComment?: boolean) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onOpenClaimModal,
  onOpenHintModal,
  onOpenPinModal,
  onOpenEditModal,
  onOpenDetailModal,
}) => {
  const currentUser = getCurrentUser();
  const isAuthor = currentUser && item && currentUser.id === item.authorId;
  const [liked, setLiked] = useState(item.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(item._count?.likes ?? 0);
  const [saved, setSaved] = useState(item.isSaved ?? false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  async function handleToggleLike() {
    if (loadingLike || isAuthor) return;
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
    if (loadingSave || isAuthor) return;
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

  const isLost = item.type === 'LOST';

  return (
    <Card hoverable className="space-y-3.5 transition-all hover:border-brand-blue/30">
      {/* Bloco Completo do Pertence - Abre Modal de Detalhes */}
      <div
        onClick={() => {
          if (onOpenDetailModal) {
            onOpenDetailModal(item);
          } else {
            onOpenHintModal(item);
          }
        }}
        className="block space-y-3.5 group cursor-pointer"
      >
        {/* Cabeçalho do Card: Autor e Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={item.author?.avatarUrl}
              name={item.author?.name || 'Estudante'}
              size="md"
            />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-brand-dark leading-tight group-hover:text-brand-blue transition-colors">
                {item.author?.name || 'Estudante'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {item.author?.academicCourse || 'Unochapecó'}
              </p>
            </div>
          </div>

          {/* Badges de Tipo & Custódia + Ação de Editar do Autor */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isAuthor && onOpenEditModal && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenEditModal(item);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-brand-blue hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 transition-colors cursor-pointer"
                title="Editar ou cancelar sua publicação"
              >
                <i className="bx bx-edit text-sm"></i>
                <span>Editar</span>
              </span>
            )}

            {item.status === 'RETURNED' ? (
              <Badge variant="returned" icon="bx-check-double">
                {isLost ? 'RECUPERADO' : 'DEVOLVIDO'}
              </Badge>
            ) : isLost ? (
              <Badge variant="lost" icon="bx-help-circle">
                PERDIDO
              </Badge>
            ) : (
              <Badge variant="found" icon="bx-check-circle">
                ACHADO
              </Badge>
            )}

            {item.isUnderStaffCustody && (
              <Badge variant="portaria" icon="bx-shield-quarter">
                PORTARIA
              </Badge>
            )}

            {item.hasReward && (
              <Badge variant="reward" icon="bx-gift">
                RECOMPENSA
              </Badge>
            )}
          </div>
        </div>

        {/* Foto do Pertence (se houver) */}
        {item.photoUrl && (
          <div className="rounded-xl overflow-hidden bg-slate-100 max-h-72 border border-brand-gray">
            <img
              src={item.photoUrl}
              alt={item.title}
              className="w-full h-56 sm:h-64 object-cover group-hover:scale-101 transition-transform duration-200"
            />
          </div>
        )}

        {/* Título & Descrição */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm sm:text-base text-brand-dark leading-snug group-hover:text-brand-blue transition-colors">
            {item.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Localização & Categoria */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-brand-dark font-medium border border-brand-gray group-hover:bg-slate-100 transition-colors">
            <i className="bx bx-buildings text-brand-blue"></i>
            <strong>{item.block?.name || 'Campus Chapecó'}</strong>
            {item.specificLocation && <span className="text-slate-400">• {item.specificLocation}</span>}
          </span>

          {item.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-brand-gray group-hover:bg-slate-100 transition-colors">
              <i className={`bx ${item.category.iconName || 'bx-tag'} text-brand-lilac`}></i>
              {item.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Ações de Rodapé: Curtir, Salvar, Pista e Reivindicação */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-brand-gray text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Se for o autor, exibe apenas contador informativo das curtidas da comunidade */}
          {isAuthor ? (
            likeCount > 0 ? (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-semibold"
                title="Curtidas recebidas da comunidade"
              >
                <i className="bx bxs-heart text-rose-500 text-sm"></i>
                <span>{likeCount}</span>
              </span>
            ) : null
          ) : (
            <>
              {/* Botão Curtir */}
              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  liked
                    ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold'
                    : 'bg-slate-50 border-brand-gray text-slate-600 hover:bg-slate-100'
                }`}
                title="Curtir publicação"
              >
                <i className={`bx ${liked ? 'bxs-heart text-rose-500' : 'bx-heart'} text-base`}></i>
                <span>{likeCount}</span>
              </button>

              {/* Botão Salvar */}
              <button
                onClick={handleToggleSave}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  saved
                    ? 'bg-blue-50 border-blue-200 text-brand-blue font-bold'
                    : 'bg-slate-50 border-brand-gray text-slate-600 hover:bg-slate-100'
                }`}
                title="Salvar pertence"
              >
                <i className={`bx ${saved ? 'bxs-bookmark text-brand-blue' : 'bx-bookmark'} text-base`}></i>
              </button>
            </>
          )}

          {/* Botão Comentários */}
          <button
            onClick={() => {
              if (onOpenDetailModal) {
                onOpenDetailModal(item, true);
              } else {
                onOpenHintModal(item);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-brand-gray text-slate-600 font-medium transition-colors cursor-pointer"
            title="Ver item e comentários"
          >
            <i className="bx bx-message-rounded-dots text-brand-blue text-base"></i>
            <span className="hidden sm:inline">Comentários</span>
            {item._count?.hints ? <span className="font-bold">{item._count.hints}</span> : null}
          </button>
        </div>

        {/* Ação Principal: Reivindicar ou Informar Avistamento */}
        <div>
          {item.status === 'RETURNED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
              <i className="bx bx-check-double text-base"></i>
              <span>{isLost ? 'Resolvido' : 'Devolvido'}</span>
            </span>
          ) : isLost ? (
            <Button
              variant="secondary"
              size="sm"
              leftIcon="bx-message-square-dots"
              onClick={() => {
                if (onOpenDetailModal) {
                  onOpenDetailModal(item, true);
                } else {
                  onOpenHintModal(item);
                }
              }}
            >
              Vi esse item!
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="primary"
                size="sm"
                leftIcon="bx-check-shield"
                onClick={() => onOpenClaimModal(item)}
              >
                É meu!
              </Button>

              {item.isUnderStaffCustody && (
                <button
                  onClick={() => onOpenPinModal(item)}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs transition-colors cursor-pointer"
                  title="Validar PIN na Portaria"
                >
                  <i className="bx bx-key text-sm"></i>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
