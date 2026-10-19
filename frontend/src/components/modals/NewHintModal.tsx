'use client';

import React, { useState } from 'react';
import { Item } from '../../types';
import { submitHint } from '../../services/api';
import { Dialog, Button, Input, Textarea, Badge } from '../ui';

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

  if (!item) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    if (!content.trim()) {
      setErrorMsg('Por favor, informe os detalhes do comentário para ajudar.');
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
      setErrorMsg(err.message || 'Erro ao enviar comentário. Tente novamente.');
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
        variant="secondary"
        size="sm"
        leftIcon="bx-send"
        onClick={handleSubmit}
        isLoading={submitting}
      >
        Publicar Comentário (+2 Karma)
      </Button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Comentários: ${item.title}`}
      subtitle="Ajude a encontrar o pertence compartilhando informações sobre onde ele foi avistado ou detalhes relevantes."
      badge={
        <div className="flex items-center gap-2">
          <Badge variant="blue" icon="bx-message-rounded-dots">
            COMENTÁRIO COLABORATIVO
          </Badge>
          <span className="text-xs text-slate-400 font-medium">Ganhe +2 Karma</span>
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

        {/* Onde viu */}
        <Input
          label="Onde você viu o pertence? (opcional)"
          leftIcon="bx-map-pin"
          value={locationSeen}
          onChange={(e) => setLocationSeen(e.target.value)}
          placeholder="Ex: Bloco R, Bancada do Laboratório 03 ou próximo à cantina..."
        />

        {/* Quando viu */}
        <Input
          label="Quando você viu? (opcional)"
          leftIcon="bx-time-five"
          value={timeSeen}
          onChange={(e) => setTimeSeen(e.target.value)}
          placeholder="Ex: Hoje por volta das 10h15 no intervalo..."
        />

        {/* Detalhes do comentário */}
        <Textarea
          label="Detalhes do seu Comentário"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ex: Vi alguém entregando a mochila para o monitor da sala 03 após o término da aula..."
          required
        />
      </form>
    </Dialog>
  );
};
