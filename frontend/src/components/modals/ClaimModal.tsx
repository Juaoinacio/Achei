'use client';

import React, { useState } from 'react';
import { Item } from '../../types';
import { submitClaim } from '../../services/api';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Item | null;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  item,
}) => {
  const [secretDetails, setSecretDetails] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('Portaria Central Bloco G (Intervalo Noturno)');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !item) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    if (!secretDetails.trim()) {
      setErrorMsg('Descreva características exclusivas que comprovem sua propriedade.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const fullDetails = `${secretDetails.trim()} [Ponto de Encontro Sugerido: ${meetingLocation}]`;
      await submitClaim(item.id, fullDetails);
      setSecretDetails('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar reivindicação. Tente novamente.');
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
                ITEM ACHADO
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {item.block?.name || 'Campus Unochapecó'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-brand-dark">Reivindicar: {item.title}</h3>
            <p className="text-xs text-slate-500">
              Envie detalhes que comprovem sua posse para retirar o item com o guardião.
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

            {/* Alerta de Segurança e Privacidade */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <i className="bx bx-shield-quarter text-base text-amber-700 mt-0.5 shrink-0"></i>
              <p className="leading-relaxed text-[11px]">
                <strong>Comprovação Sigilosa:</strong> Informe marcas exclusivas (arranhões, adesivos, número de série, conteúdo interno ou papel de parede). Suas respostas são enviadas ao guardião para validação segura.
              </p>
            </div>

            {/* Campo 1: Detalhes Secretos */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-dark">
                Detalhes Secretos / Características Únicas <span className="text-brand-blue">*</span>
              </label>
              <textarea
                rows={4}
                value={secretDetails}
                onChange={(e) => setSecretDetails(e.target.value)}
                placeholder="Ex: O chaveiro tem uma fita azul presa e a chave do carro tem uma pequena ranhura perto do logo..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all resize-none"
                required
              />
            </div>

            {/* Campo 2: Ponto de Encontro Sugerido */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-dark">
                Melhor Horário / Ponto de Encontro na Unochapecó
              </label>
              <select
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs text-brand-dark focus:bg-white focus:border-brand-blue outline-none transition-all"
              >
                <option value="Portaria Central Bloco G (Intervalo Noturno - 20:30)">
                  Portaria Central Bloco G (Intervalo Noturno - 20:30)
                </option>
                <option value="Portaria Bloco R (Intervalo Matutino - 09:40)">
                  Portaria Bloco R (Intervalo Matutino - 09:40)
                </option>
                <option value="Secretaria Acadêmica Bloco A (Tarde)">
                  Secretaria Acadêmica Bloco A (Tarde)
                </option>
                <option value="Biblioteca Central (Balcão de Empréstimo)">
                  Biblioteca Central (Balcão de Empréstimo)
                </option>
              </select>
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-brand-yellow hover:bg-brand-yellowHover text-brand-dark font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i className="bx bx-check-shield text-base"></i>
              <span>{submitting ? 'Enviando...' : 'Enviar Comprovação de Posse'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
