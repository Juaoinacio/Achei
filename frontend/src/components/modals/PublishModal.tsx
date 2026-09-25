'use client';

import React, { useState } from 'react';
import { CampusBlock, Category, ItemType } from '../../types';
import { createItem } from '../../services/api';
import { Dialog, Button, Input, Textarea, Badge } from '../ui';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  blocks: CampusBlock[];
  categories: Category[];
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  blocks,
  categories,
}) => {
  const [type, setType] = useState<ItemType>('LOST');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [blockId, setBlockId] = useState(blocks[0]?.id || '');
  const [specificLocation, setSpecificLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [hasReward, setHasReward] = useState(false);
  const [isUnderStaffCustody, setIsUnderStaffCustody] = useState(false);
  const [custodyLocation, setCustodyLocation] = useState('Portaria Central');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar defaults se blocks ou categories carregarem depois
  React.useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    if (!blockId && blocks.length > 0) {
      setBlockId(blocks[0].id);
    }
  }, [categories, blocks, categoryId, blockId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Por favor, preencha o título e a descrição do pertence.');
      return;
    }
    if (!categoryId || !blockId) {
      setErrorMsg('Selecione uma categoria e um bloco.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await createItem({
        title: title.trim(),
        description: description.trim(),
        type,
        categoryId,
        blockId,
        specificLocation: specificLocation.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
        hasReward: type === 'LOST' ? hasReward : false,
        isUnderStaffCustody: type === 'FOUND' ? isUnderStaffCustody : false,
        custodyLocation: type === 'FOUND' && isUnderStaffCustody ? custodyLocation : undefined,
      });

      // Reset
      setTitle('');
      setDescription('');
      setSpecificLocation('');
      setPhotoUrl('');
      setHasReward(false);
      setIsUnderStaffCustody(false);

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao publicar item. Verifique sua conexão.');
    } finally {
      setSubmitting(false);
    }
  }

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClose}
        disabled={submitting}
      >
        Cancelar
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        leftIcon="bx-send"
        onClick={handleSubmit}
        isLoading={submitting}
      >
        Publicar no Feed
      </Button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Publicar Pertence no Feed"
      subtitle="Ajude a comunidade acadêmica compartilhando detalhes do item."
      badge={
        <div className="flex items-center gap-2">
          <Badge variant="yellow">NOVA PUBLICAÇÃO</Badge>
          <span className="text-xs text-slate-400 font-medium">Campus Chapecó (Sede)</span>
        </div>
      }
      footer={footer}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <i className="bx bx-error-circle text-base shrink-0"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tipo: Perdido ou Achado */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-brand-dark">O que aconteceu?</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('LOST')}
              className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                type === 'LOST'
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-brand-gray bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <i className="bx bx-search-alt text-base"></i>
              <span>Eu Perdi (Perdido)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('FOUND')}
              className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                type === 'FOUND'
                  ? 'border-brand-blue bg-blue-50 text-brand-blue'
                  : 'border-brand-gray bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <i className="bx bx-check-circle text-base"></i>
              <span>Eu Achei (Achado)</span>
            </button>
          </div>
        </div>

        {/* Título do Item */}
        <Input
          label="Título do Pertence"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Fone JBL Tune 510 Preto, Carteira de Couro..."
          required
        />

        {/* Categoria e Bloco */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-dark">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark focus:bg-white focus:border-brand-blue outline-none transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-dark">Bloco do Campus</label>
            <select
              value={blockId}
              onChange={(e) => setBlockId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark focus:bg-white focus:border-brand-blue outline-none transition-all"
            >
              {blocks.map((blk) => (
                <option key={blk.id} value={blk.id}>
                  {blk.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Descrição e Ponto Exato */}
        <Textarea
          label="Descrição e Ponto Exato"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Esqueci na bancada 4 do Laboratório de Redes logo após o intervalo das 20h30..."
          required
        />

        {/* Local específico complementar */}
        <Input
          label="Local Específico"
          helperText="Opcional: sala, laboratório, piso"
          value={specificLocation}
          onChange={(e) => setSpecificLocation(e.target.value)}
          placeholder="Ex: Sala 204, 2º Andar, próximo aos bebedouros"
        />

        {/* URL da Foto (opcional) */}
        <Input
          label="Foto do Item (URL)"
          leftIcon="bx-camera"
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://exemplo.com/foto-do-item.jpg"
        />

        {/* Opções contextuais: Recompensa ou Custódia */}
        {type === 'LOST' && (
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hasReward}
              onChange={(e) => setHasReward(e.target.checked)}
              className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
            />
            <div className="text-xs">
              <span className="font-bold text-amber-900">Oferecer Recompensa Simbólica</span>
              <p className="text-[11px] text-amber-800">Incentiva a comunidade a devolver o item rapidamente.</p>
            </div>
          </label>
        )}

        {type === 'FOUND' && (
          <div className="space-y-2 p-3 rounded-xl bg-blue-50/60 border border-blue-200">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnderStaffCustody}
                onChange={(e) => setIsUnderStaffCustody(e.target.checked)}
                className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
              />
              <div className="text-xs">
                <span className="font-bold text-brand-blue">Entregue na Portaria / Central de Achados</span>
                <p className="text-[11px] text-slate-600">O proprietário poderá resgatar presencialmente com o PIN de segurança.</p>
              </div>
            </label>

            {isUnderStaffCustody && (
              <Input
                label="Local da Custódia"
                value={custodyLocation}
                onChange={(e) => setCustodyLocation(e.target.value)}
                placeholder="Ex: Balcão da Portaria Bloco R"
              />
            )}
          </div>
        )}
      </form>
    </Dialog>
  );
};
