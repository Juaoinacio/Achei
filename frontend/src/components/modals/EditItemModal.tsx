'use client';

import React, { useState, useEffect } from 'react';
import { CampusBlock, Category, Item } from '../../types';
import { updateItem, deleteItem, markItemAsReturned, uploadImageToCloudinary } from '../../services/api';
import { Dialog, Button, Input, Textarea, Badge } from '../ui';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedItem: Item) => void;
  onDeleteSuccess?: () => void;
  item: Item | null;
  blocks: CampusBlock[];
  categories: Category[];
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onDeleteSuccess,
  item,
  blocks,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [blockId, setBlockId] = useState('');
  const [specificLocation, setSpecificLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasReward, setHasReward] = useState(false);
  const [isUnderStaffCustody, setIsUnderStaffCustody] = useState(false);
  const [custodyLocation, setCustodyLocation] = useState('Portaria Central');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [returning, setReturning] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (item && isOpen) {
      setTitle(item.title || '');
      setDescription(item.description || '');
      setCategoryId(item.categoryId || (categories[0]?.id || ''));
      setBlockId(item.blockId || (blocks[0]?.id || ''));
      setSpecificLocation(item.specificLocation || '');
      setPhotoUrl(item.photoUrl || '');
      setHasReward(item.hasReward ?? false);
      setIsUnderStaffCustody(item.isUnderStaffCustody ?? false);
      setCustodyLocation(item.custodyLocation || 'Portaria Central');
      setConfirmDelete(false);
      setErrorMsg('');
    }
  }, [item, isOpen, categories, blocks]);

  if (!item) return null;

  const isLost = item.type === 'LOST';

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const res = await uploadImageToCloudinary(file, 'items');
      setPhotoUrl(res.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar imagem.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Por favor, preencha o título e a descrição.');
      return;
    }
    if (title.trim().length < 3) {
      setErrorMsg('O título deve conter no mínimo 3 caracteres.');
      return;
    }
    if (description.trim().length < 3) {
      setErrorMsg('A descrição deve conter no mínimo 3 caracteres.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await updateItem(item.id, {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        blockId,
        specificLocation: specificLocation.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
        hasReward: isLost ? hasReward : false,
        isUnderStaffCustody: !isLost ? isUnderStaffCustody : false,
        custodyLocation: !isLost && isUnderStaffCustody ? custodyLocation : undefined,
      });

      onSuccess(res.item);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar publicação.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkReturned() {
    if (!item) return;
    setReturning(true);
    setErrorMsg('');
    try {
      const res = await markItemAsReturned(item.id);
      onSuccess(res.item);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao marcar item como recuperado.');
    } finally {
      setReturning(false);
    }
  }

  async function handleDeleteItem() {
    if (!item) return;
    setDeleting(true);
    setErrorMsg('');
    try {
      await deleteItem(item.id);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao cancelar publicação.');
    } finally {
      setDeleting(false);
    }
  }

  const footer = (
    <div className="flex items-center justify-between w-full gap-2">
      <div>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer py-1.5 px-2"
          >
            <i className="bx bx-trash text-sm"></i>
            <span>Cancelar / Excluir</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg p-1.5">
            <span className="text-xs font-bold text-rose-700">Confirmar exclusão?</span>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteItem}
              className="text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded transition-colors cursor-pointer"
            >
              {deleting ? 'Excluindo...' : 'Sim, excluir'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-slate-500 hover:text-slate-700 px-1 py-1 cursor-pointer"
            >
              Não
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={submitting || deleting || returning}
        >
          Fechar
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          leftIcon="bx-save"
          onClick={handleSubmit}
          isLoading={submitting}
        >
          Salvar Alterações
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Publicação"
      subtitle="Atualize os dados do pertence ou encerre a publicação quando for recuperado."
      badge={
        <div className="flex items-center gap-2">
          {isLost ? (
            <Badge variant="lost" icon="bx-help-circle">
              ITEM PERDIDO
            </Badge>
          ) : (
            <Badge variant="found" icon="bx-check-circle">
              ITEM ACHADO
            </Badge>
          )}
          {item.status === 'RETURNED' && (
            <Badge variant="returned" icon="bx-check-double">
              DEVOLVIDO
            </Badge>
          )}
        </div>
      }
      footer={footer}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
            <i className="bx bx-error-circle text-base shrink-0"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Ação Rápida de Conclusão / Recuperação */}
        {item.status !== 'RETURNED' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg shrink-0">
                <i className="bx bx-check-double"></i>
              </span>
              <div>
                <p className="text-xs font-bold text-emerald-950">Pertence já foi recuperado / devolvido?</p>
                <p className="text-[11px] text-emerald-700">Encerre o ciclo marcando como resolvido.</p>
              </div>
            </div>
            <button
              type="button"
              disabled={returning}
              onClick={handleMarkReturned}
              className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              {returning ? 'Salvando...' : 'Marcar como Resolvido'}
            </button>
          </div>
        )}

        {/* Título */}
        <Input
          label="Título do Pertence"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Chaveiro com 3 chaves e fita azul Uno"
          required
        />

        {/* Categoria e Bloco */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Categoria <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-brand-gray rounded-lg text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Bloco do Campus <span className="text-rose-500">*</span>
            </label>
            <select
              value={blockId}
              onChange={(e) => setBlockId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-brand-gray rounded-lg text-xs sm:text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue"
              required
            >
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Local Específico */}
        <Input
          label="Local Específico (Opcional)"
          leftIcon="bx-map-pin"
          value={specificLocation}
          onChange={(e) => setSpecificLocation(e.target.value)}
          placeholder="Ex: Laboratório de Informática 03, Banco do 2º andar..."
        />

        {/* Descrição */}
        <Textarea
          label="Descrição Detalhada"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva detalhes que ajudem na identificação..."
          required
        />

        {/* Foto do Pertence */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-brand-dark">
            Foto do Pertence
          </label>

          {photoUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-brand-gray bg-slate-50 p-2 flex items-center gap-3">
              <img
                src={photoUrl}
                alt="Preview do pertence"
                className="w-20 h-20 object-cover rounded-lg border border-brand-gray"
              />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                  <i className="bx bx-check-circle text-base"></i> Foto cadastrada
                </p>
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <i className="bx bx-trash"></i> Remover foto
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 hover:border-brand-blue rounded-xl p-4 text-center bg-slate-50/50 transition-colors">
              <input
                type="file"
                id="edit-file-upload"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingImage}
                className="hidden"
              />
              <label
                htmlFor="edit-file-upload"
                className="cursor-pointer flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center text-xl">
                  {uploadingImage ? (
                    <i className="bx bx-loader-alt bx-spin"></i>
                  ) : (
                    <i className="bx bx-cloud-upload"></i>
                  )}
                </div>
                <span className="text-xs font-bold text-brand-blue">
                  {uploadingImage ? 'Enviando imagem...' : 'Enviar nova foto'}
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG até 10MB</span>
              </label>
            </div>
          )}
        </div>

        {/* Opções Específicas: Recompensa para LOST, Custódia para FOUND */}
        {isLost && (
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-brand-gray bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={hasReward}
              onChange={(e) => setHasReward(e.target.checked)}
              className="w-4 h-4 text-brand-blue rounded border-slate-300 focus:ring-brand-blue cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                <i className="bx bx-gift text-brand-yellow text-sm"></i>
                Oferecer Recompensa Simbólica
              </span>
              <p className="text-[11px] text-slate-500">
                Mostra um selo especial de recompensa no feed para incentivar a devolução.
              </p>
            </div>
          </label>
        )}

        {!isLost && (
          <div className="space-y-3 p-3 rounded-xl border border-brand-gray bg-slate-50/50">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnderStaffCustody}
                onChange={(e) => setIsUnderStaffCustody(e.target.checked)}
                className="w-4 h-4 text-brand-blue rounded border-slate-300 focus:ring-brand-blue cursor-pointer"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  <i className="bx bx-shield-quarter text-brand-blue text-sm"></i>
                  Entregue na Portaria / Central de Achados
                </span>
                <p className="text-[11px] text-slate-500">
                  O item está guardado sob custódia oficial com retirada via PIN de segurança.
                </p>
              </div>
            </label>

            {isUnderStaffCustody && (
              <Input
                label="Local da Custódia"
                leftIcon="bx-map-pin"
                value={custodyLocation}
                onChange={(e) => setCustodyLocation(e.target.value)}
                placeholder="Ex: Balcão da Portaria do Bloco R"
                required={isUnderStaffCustody}
              />
            )}
          </div>
        )}
      </form>
    </Dialog>
  );
};
