'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '../../components/ui';

export default function PasswordRecoveryPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Por favor, informe seu e-mail institucional.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Simulação da chamada de recuperação
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 800);
  }

  return (
    <div className="bg-brand-bg text-brand-dark font-sans min-h-screen flex flex-col justify-center items-center p-0 lg:p-6 selection:bg-brand-yellow selection:text-brand-dark">
      {/* Card Principal Split-Screen */}
      <div className="w-full max-w-5xl bg-white border border-brand-gray rounded-none lg:rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        
        {/* Lado Esquerdo: Orientações de TI da Unochapecó (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-brand-blue via-brand-blue to-brand-blueHover text-white p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand-lilac/25 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-brand-yellow/15 blur-3xl pointer-events-none"></div>

          <div className="space-y-4 relative z-10">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="w-10 h-10 bg-brand-yellow text-brand-dark rounded-xl flex items-center justify-center font-extrabold text-2xl shadow-sm transition-transform group-hover:scale-105">
                <i className="bx bx-search"></i>
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight leading-none text-white">Achei</span>
                <span className="text-xs font-bold text-brand-yellow uppercase tracking-wider">Unochapecó</span>
              </div>
            </Link>

            <div className="pt-4">
              <h2 className="text-2xl font-extrabold leading-snug">
                Recuperação segura de acesso ao Achei.
              </h2>
              <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                Enviaremos um link de redefinição criptografado diretamente para sua caixa de entrada institucional.
              </p>
            </div>
          </div>

          {/* Dicas de Segurança da TI */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-yellow uppercase tracking-wider">
              <i className="bx bx-info-circle text-base"></i>
              <span>Dicas da TI Acadêmica</span>
            </div>

            <ul className="text-xs text-slate-200 space-y-2">
              <li className="flex items-start gap-2">
                <i className="bx bx-check text-brand-yellow mt-0.5"></i>
                <span>O link tem validade de 30 minutos por segurança.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="bx bx-check text-brand-yellow mt-0.5"></i>
                <span>Verifique a pasta de spam ou lixo eletrônico.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="bx bx-check text-brand-yellow mt-0.5"></i>
                <span>Nunca compartilhe seu código com terceiros no campus.</span>
              </li>
            </ul>
          </div>

          <div className="text-xs text-slate-300 relative z-10 flex items-center justify-between border-t border-white/15 pt-3">
            <span>Suporte: ti@unochapeco.edu.br</span>
            <span className="font-mono text-[11px] text-brand-yellow">uno.edu.br</span>
          </div>
        </div>

        {/* Lado Direito: Formulário de Recuperação */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          
          {/* Topo Mobile */}
          <div className="lg:hidden flex items-center justify-between border-b border-brand-gray pb-4 mb-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-brand-yellow text-brand-dark rounded-lg flex items-center justify-center font-extrabold text-lg">
                <i className="bx bx-search"></i>
              </span>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight leading-none text-brand-blue">Achei</span>
                <span className="text-[9px] font-bold text-brand-lilac uppercase tracking-wider">Unochapecó</span>
              </div>
            </Link>

            <Link href="/login" className="text-xs font-semibold text-brand-blue hover:underline">
              Voltar ao Login
            </Link>
          </div>

          {step === 1 ? (
            <div className="space-y-6 my-auto">
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
                  Esqueceu sua senha?
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Não se preocupe! Digite seu e-mail institucional e enviaremos as orientações para redefinir o acesso.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <i className="bx bx-error-circle text-base shrink-0"></i>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Input
                  label="E-mail Universitário Cadastrado"
                  leftIcon="bx-envelope"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.nome@unochapeco.edu.br"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  rightIcon="bx-send"
                  isLoading={loading}
                  className="w-full mt-2"
                >
                  Enviar Link de Recuperação
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-6 my-auto text-center py-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center text-3xl mx-auto shadow-xs border border-blue-200">
                <i className="bx bx-mail-send"></i>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-brand-dark">
                  Verifique sua Caixa de Entrada
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Enviamos as instruções e o link seguro para <strong>{email}</strong>. Siga as orientações contidas na mensagem para criar uma nova senha.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  Tentar outro e-mail
                </Button>
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    Ir para Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Rodapé: Link para Retornar ao Login */}
          <div className="pt-4 border-t border-brand-gray text-center text-xs text-slate-600">
            <span>Lembrou de suas credenciais?</span>
            <Link href="/login" className="font-bold text-brand-blue hover:underline ml-1">
              Voltar ao login
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
