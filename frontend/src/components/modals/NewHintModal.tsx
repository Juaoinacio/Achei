'use client';

import React, { useState } from 'react';
import { Item } from '../../types';
import { submitHint } from '../../services/api';

interface NewHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Item | null;
}

export const NewHintModal: React.FC<NewHintModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  item,
}) => {
  const [locationSeen, setLocationSeen] = useState('');
  const [timeSeen, setTimeSeen] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !item) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    if (!content.trim()) {
      setErrorMsg('Por favor, informe os detalhes da pista para ajudar.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const parts = [content.trim()];
      if (locationSeen.trim()) parts.push(`Local: ${locationSeen.trim()}`);
      if (timeSeen.trim()) parts.push(`Horário aproximado: ${timeSeen.trim()}`);
      const fullText = parts.join(' • ');

      await submitHint(item.id, fullText);

      setLocationSeen('');
      setTimeSeen('');
      setContent('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar pista. Tente novamente.');
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
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-brand-blue text-white flex items-center gap-1">
                <i className="bx bx-bulb text-xs"></i> PISTA COLABORATIVA
              </span>
              <span className="text-xs text-slate-400 font-medium">Ganhe +2 Karma</span>
            </div>
            <h3 className="text-lg font-bold text-brand-dark">
              Enviar Pista: {item.title}
            </h3>
            <p className="text-xs text-slate-500">
              Ajude a encontrar o pertence compartilhando informações sobre onde ele foi avistado.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-brand-dark flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <i className="bx bx-x text-xl"></i>
          </button>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-180px)] overflow-y-auto custom-scrollbar">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <i className="bx bx-error-circle text-base shrink-0"></i>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Onde viu */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-dark">
                Onde você viu o pertence?
              </label>
              <div className="relative">
                <i className="bx bx-map-pin absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type="text"
                  value={locationSeen}
                  onChange={(e) => setLocationSeen(e.target.value)}
                  placeholder="Ex: Bloco R, Bancada do Laboratório 03 ou próximo à cantina..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Quando viu */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-dark">
                Quando você viu?
              </label>
              <div className="relative">
                <i className="bx bx-time-five absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type="text"
                  value={timeSeen}
                  onChange={(e) => setTimeSeen(e.target.value)}
                  placeholder="Ex: Hoje por volta das 10h15 no intervalo..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Detalhes da pista */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-dark">
                Detalhes da sua Pista <span className="text-brand-blue">*</span>
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ex: Vi alguém entregando a mochila para o monitor da sala 03 após o término da aula..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all resize-none"
                required
              />
            </div>

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
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blueHover text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i className="bx bx-send text-base"></i>
              <span>{submitting ? 'Enviando...' : 'Publicar Pista (+2 Karma)'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
