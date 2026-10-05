'use client';

import React, { useState } from 'react';
import { CampusBlock, Category, ItemType } from '../../types';
import { createItem, uploadImageToCloudinary } from '../../services/api';
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasReward, setHasReward] = useState(false);
  const [isUnderStaffCustody, setIsUnderStaffCustody] = useState(false);
  const [custodyLocation, setCustodyLocation] = useState('Portaria Central');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const res = await uploadImageToCloudinary(file, 'items');
      setPhotoUrl(res.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar imagem para o Cloudinary.');
    } finally {
      setUploadingImage(false);
    }
  }

  // Sincronizar defaults quando modal abre ou quando categorias e blocos carregam
  React.useEffect(() => {
    if (isOpen) {
      if ((!categoryId || !categories.some((c) => c.id === categoryId)) && categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      if ((!blockId || !blocks.some((b) => b.id === blockId)) && blocks.length > 0) {
        setBlockId(blocks[0].id);
      }
      setErrorMsg('');
    }
  }, [isOpen, categories, blocks, categoryId, blockId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Por favor, preencha o título e a descrição do pertence.');
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
    if (!categoryId || !blockId) {
      setErrorMsg('Selecione uma categoria e um bloco do campus.');
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

        {/* Upload de Foto via Cloudinary */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-brand-dark">Foto do Pertence</label>
            <span className="text-[10px] text-slate-400 font-medium">Cloudinary • achei/items</span>
          </div>

          {photoUrl ? (
            <div className="rounded-xl border border-brand-gray overflow-hidden bg-slate-50 p-2.5 flex items-center gap-3">
              <img
                src={photoUrl}
                alt="Preview do item"
                className="w-14 h-14 object-cover rounded-lg border border-brand-gray shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-dark flex items-center gap-1">
                  <i className="bx bx-check-circle text-amber-600"></i>
                  Foto anexada
                </p>
                <p className="text-[10px] text-slate-400 truncate">{photoUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => setPhotoUrl('')}
                className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-gray hover:border-brand-blue rounded-xl p-4 cursor-pointer bg-slate-50 hover:bg-white transition-all text-center group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
                <i className={`bx ${uploadingImage ? 'bx-loader-alt bx-spin text-brand-blue' : 'bx-cloud-upload text-slate-400 group-hover:text-brand-blue'} text-3xl mb-1 transition-colors`}></i>
                <p className="text-xs font-bold text-brand-dark group-hover:text-brand-blue">
                  {uploadingImage ? 'Enviando imagem para o Cloudinary...' : 'Clique para selecionar foto ou tirar pelo celular'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG ou WEBP (máx. 10MB)</p>
              </label>

              {/* Opção alternativa: URL direta */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">ou URL:</span>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://... (URL da foto externa)"
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-brand-gray rounded-lg text-xs text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue outline-none"
                />
              </div>
            </div>
          )}
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
