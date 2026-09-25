'use client';

import React, { useState, useRef } from 'react';
import { Item } from '../../types';
import { confirmPinDelivery } from '../../services/api';

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

  if (!isOpen || !item) return null;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setErrorMsg('Por favor, digite os 6 números do PIN de entrega.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // Usar claimId passado ou o claim pendente se houver
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative bg-white border border-brand-gray rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8 z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-brand-gray flex items-start justify-between bg-slate-50/60">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center text-xl mb-2">
              <i className="bx bx-key"></i>
            </div>
            <h3 className="text-lg font-bold text-brand-dark">Confirmar Entrega Presencial</h3>
            <p className="text-xs text-slate-500">
              Digite o PIN de 6 dígitos informado pelo proprietário para liberar a entrega.
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
          <div className="p-5 sm:p-6 space-y-4">
            
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

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 border-t border-brand-gray bg-slate-50/60 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-brand-gray hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={submitting || digits.join('').length !== 6}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blueHover text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i className="bx bx-check-circle text-base"></i>
              <span>{submitting ? 'Validando...' : 'Validar Devolução'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
