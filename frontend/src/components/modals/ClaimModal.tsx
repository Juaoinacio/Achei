'use client';

import React, { useState } from 'react';
import { Item } from '../../types';
import { submitClaim } from '../../services/api';
import { Dialog, Button, Textarea, Badge } from '../ui';

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

  if (!item) return null;

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
        leftIcon="bx-check-shield"
        onClick={handleSubmit}
        isLoading={submitting}
      >
        Enviar Comprovação de Posse
      </Button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Reivindicar: ${item.title}`}
      subtitle="Envie detalhes que comprovem sua posse para retirar o item com o guardião."
      badge={
        <div className="flex items-center gap-2">
          <Badge variant="yellow">ITEM ACHADO</Badge>
          <span className="text-xs text-slate-400 font-medium">
            {item.block?.name || 'Campus Unochapecó'}
          </span>
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

        {/* Alerta de Segurança e Privacidade */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <i className="bx bx-shield-quarter text-base text-amber-700 mt-0.5 shrink-0"></i>
          <p className="leading-relaxed text-[11px]">
            <strong>Comprovação Sigilosa:</strong> Informe marcas exclusivas (arranhões, adesivos, número de série, conteúdo interno ou papel de parede). Suas respostas são enviadas ao guardião para validação segura.
          </p>
        </div>

        {/* Campo 1: Detalhes Secretos */}
        <Textarea
          label="Detalhes Secretos / Características Únicas"
          rows={4}
          value={secretDetails}
          onChange={(e) => setSecretDetails(e.target.value)}
          placeholder="Ex: O chaveiro tem uma fita azul presa e a chave do carro tem uma pequena ranhura perto do logo..."
          required
        />

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
      </form>
    </Dialog>
  );
};
