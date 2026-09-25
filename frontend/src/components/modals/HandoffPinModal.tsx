'use client';

import React, { useState, useRef } from 'react';
import { Item } from '../../types';
import { confirmPinDelivery } from '../../services/api';
import { Dialog, Button } from '../ui';

interface HandoffPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: Item | null;
  claimId?: string;
}

export const HandoffPinModal: React.FC<HandoffPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  item,
  claimId,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!item) return null;

  function handleDigitChange(index: number, val: string) {
    const clean = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setDigits(newDigits);
    const nextFocus = Math.min(pasteData.length, 5);
    inputRefs.current[nextFocus]?.focus();
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setErrorMsg('Por favor, digite os 6 números do PIN de entrega.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const targetClaimId = claimId || 'sample-claim-id';
      await confirmPinDelivery(targetClaimId, code);
      setSuccessMsg('PIN validado com sucesso! +10 pontos creditados.');
      setTimeout(() => {
        setDigits(['', '', '', '', '', '']);
        setSuccessMsg('');
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Código PIN inválido ou expirado.');
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
        Voltar
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        leftIcon="bx-check-circle"
        onClick={() => handleSubmit()}
        isLoading={submitting}
        disabled={digits.join('').length !== 6}
      >
        Validar Devolução
      </Button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Entrega Presencial"
      subtitle="Digite o PIN de 6 dígitos informado pelo proprietário para liberar a entrega."
      badge={
        <div className="w-10 h-10 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center text-xl mb-1">
          <i className="bx bx-key"></i>
        </div>
      }
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <i className="bx bx-error-circle text-base shrink-0"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-blue-50 border border-brand-blue/30 text-brand-blue text-xs rounded-xl flex items-center gap-2 font-bold">
            <i className="bx bx-check-circle text-base shrink-0"></i>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Destaque de Gamificação e Recompensa */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-amber-50/50 border border-blue-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-yellow text-brand-dark font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
            +10
          </div>
          <div className="text-xs">
            <p className="font-bold text-brand-dark">Recompensa Comunitária</p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              A validação conclui o resgate, marca como <strong>DEVOLVIDO</strong> e credita 10 pontos ao ranking.
            </p>
          </div>
        </div>

        {/* 6-digit OTP Inputs */}
        <div className="space-y-2 pt-2">
          <label className="block text-center text-xs font-bold text-brand-dark uppercase tracking-wider">
            Código PIN de Confirmação (6 Dígitos)
          </label>

          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {digits.map((digit, idx) => (
              <React.Fragment key={idx}>
                {idx === 3 && <span className="text-slate-300 font-bold text-lg">-</span>}
                <input
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-extrabold text-brand-dark bg-slate-50 border-2 border-brand-gray rounded-xl focus:border-brand-blue focus:bg-white focus:outline-none transition-all shadow-xs"
                />
              </React.Fragment>
            ))}
          </div>

          <p className="text-center text-[11px] text-slate-400 pt-1">
            Pertence: <strong>{item.title}</strong>
          </p>
        </div>
      </div>
    </Dialog>
  );
};
