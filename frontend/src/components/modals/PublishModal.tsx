'use client';

import React, { useState } from 'react';
import { CampusBlock, Category, ItemType } from '../../types';
import { createItem } from '../../services/api';

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

  if (!isOpen) return null;

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative bg-white border border-brand-gray rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-brand-gray flex items-start justify-between bg-slate-50/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-brand-yellow text-brand-dark">
                NOVA PUBLICAÇÃO
              </span>
              <span className="text-xs text-slate-400 font-medium">Campus Chapecó (Sede)</span>
            </div>
            <h3 className="text-lg font-bold text-brand-dark">Publicar Pertence no Feed</h3>
            <p className="text-xs text-slate-500">Ajude a comunidade acadêmica compartilhando detalhes do item.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-brand-dark flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <i className="bx bx-x text-xl"></i>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-180px)] overflow-y-auto custom-scrollbar">
            
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
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-dark">
                Título do Pertence <span className="text-brand-blue">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Fone JBL Tune 510 Preto, Carteira de Couro..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                required
              />
            </div>

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
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-dark">
                Descrição e Ponto Exato <span className="text-brand-blue">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Esqueci na bancada 4 do Laboratório de Redes logo após o intervalo das 20h30..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all resize-none"
                required
              />
            </div>

            {/* Local específico complementar */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-dark">
                Local Específico <span className="text-slate-400 font-normal">(Opcional: sala, laboratório, piso)</span>
              </label>
              <input
                type="text"
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                placeholder="Ex: Sala 204, 2º Andar, próximo aos bebedouros"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
              />
            </div>

            {/* URL da Foto (opcional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-dark">
                Foto do Item <span className="text-slate-400 font-normal">(URL da imagem)</span>
              </label>
              <div className="relative">
                <i className="bx bx-camera absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base"></i>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto-do-item.jpg"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                />
              </div>
            </div>

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
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Local da Custódia:</label>
                    <input
                      type="text"
                      value={custodyLocation}
                      onChange={(e) => setCustodyLocation(e.target.value)}
                      placeholder="Ex: Balcão da Portaria Bloco R"
                      className="w-full px-3 py-1.5 bg-white border border-brand-gray rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 border-t border-brand-gray bg-slate-50/60 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-brand-gray hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-brand-yellow hover:bg-brand-yellowHover text-brand-dark font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i className="bx bx-send text-base"></i>
              <span>{submitting ? 'Publicando...' : 'Publicar no Feed'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
