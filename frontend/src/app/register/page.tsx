'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser, saveAuthSession } from '../../services/api';
import { Button, Input } from '../../components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [academicCourse, setAcademicCourse] = useState('Ciência da Computação');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 dígitos.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('Você precisa aceitar os termos de uso comunitário.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        academicCourse,
      });

      saveAuthSession(res.token, res.user);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar conta. O e-mail informado já pode estar em uso.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-brand-bg text-brand-dark font-sans min-h-screen flex flex-col justify-center items-center p-0 lg:p-6 selection:bg-brand-yellow selection:text-brand-dark">
      {/* Card Principal Split-Screen */}
      <div className="w-full max-w-5xl bg-white border border-brand-gray rounded-none lg:rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Lado Esquerdo: Pilares de Segurança & Confiança (Desktop) */}
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

            <div className="pt-2">
              <h2 className="text-2xl font-extrabold leading-snug">
                Crie seu perfil acadêmico e ajude a proteger os pertences no campus.
              </h2>
              <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                Exclusivo para estudantes, professores e colaboradores da Unochapecó.
              </p>
            </div>
          </div>

          {/* 3 Pilares de Segurança */}
          <div className="relative z-10 space-y-3.5 my-6">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-brand-yellow text-brand-dark flex items-center justify-center font-bold shrink-0 mt-0.5">
                <i className="bx bx-shield-quarter text-lg"></i>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Ambiente Verificado</h4>
                <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                  Cadastro vinculado ao e-mail institucional para segurança contra fraudes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-brand-lilac text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <i className="bx bx-map-pin text-lg"></i>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Notificações por Bloco</h4>
                <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                  Filtre e receba avisos específicos dos blocos onde você mais estuda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-white/20 text-brand-yellow flex items-center justify-center font-bold shrink-0 mt-0.5 border border-white/20">
                <i className="bx bx-check-double text-lg"></i>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Comunidade Solidária</h4>
                <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                  Histórico de itens devolvidos com reconhecimento público no ranking.
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 relative z-10 flex items-center justify-between border-t border-white/15 pt-3">
            <span>Campus Chapecó (Sede)</span>
            <span className="font-mono text-[11px] text-brand-yellow">uno.edu.br</span>
          </div>
        </div>

        {/* Lado Direito: Formulário de Cadastro */}
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
              Já tem conta? Entrar
            </Link>
          </div>

          {/* Cabeçalho */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
              Criar Conta Universitária
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Cadastre-se com seu e-mail institucional para ter acesso à rede do campus.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleRegister} className="space-y-3.5 my-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                <i className="bx bx-error-circle text-base shrink-0"></i>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Campo 1: Nome Completo */}
            <Input
              label="Nome Completo"
              leftIcon="bx-user"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Beatriz Oliveira Souza"
              required
            />

            {/* Campo 2: E-mail Institucional */}
            <Input
              label="E-mail Institucional"
              leftIcon="bx-envelope"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.nome@unochapeco.edu.br"
              helperText="Válido para domínios @unochapeco.edu.br ou @uno.br"
              required
            />

            {/* Curso */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-dark">
                Curso / Área de Graduação <span className="text-brand-blue ml-0.5">*</span>
              </label>
              <select
                value={academicCourse}
                onChange={(e) => setAcademicCourse(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs sm:text-sm text-brand-dark focus:bg-white focus:border-brand-blue outline-none transition-all"
              >
                <option value="Ciência da Computação">Ciência da Computação</option>
                <option value="Sistemas de Informação">Sistemas de Informação</option>
                <option value="Medicina">Medicina</option>
                <option value="Enfermagem">Enfermagem</option>
                <option value="Direito">Direito</option>
                <option value="Engenharia Civil">Engenharia Civil</option>
                <option value="Arquitetura e Urbanismo">Arquitetura e Urbanismo</option>
                <option value="Administração">Administração</option>
                <option value="Psicologia">Psicologia</option>
                <option value="Outro Curso / Servidor">Outro Curso / Servidor</option>
              </select>
            </div>

            {/* Grid com Senha e Confirmação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-dark">
                  Senha <span className="text-brand-blue ml-0.5">*</span>
                </label>
                <div className="relative flex items-center">
                  <i className="bx bx-lock-alt absolute left-3.5 text-slate-400 text-base pointer-events-none"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs sm:text-sm text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                  >
                    <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} text-base`}></i>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-dark">
                  Confirmar Senha <span className="text-brand-blue ml-0.5">*</span>
                </label>
                <div className="relative flex items-center">
                  <i className="bx bx-check-shield absolute left-3.5 text-slate-400 text-base pointer-events-none"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs sm:text-sm text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Termos de uso */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="leading-tight">
                  Concordo com os <strong>Termos de Uso Comunitário</strong> e me comprometo a colaborar de boa-fé na devolução de pertences.
                </span>
              </label>
            </div>

            {/* Botão de Cadastro */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              rightIcon="bx-user-plus"
              isLoading={loading}
              className="w-full mt-2"
            >
              Criar Minha Conta
            </Button>
          </form>

          {/* Rodapé: Link para Login */}
          <div className="pt-4 border-t border-brand-gray text-center text-xs text-slate-600">
            <span>Já possui uma conta ativa?</span>
            <Link href="/login" className="font-bold text-brand-blue hover:underline ml-1">
              Acessar minha conta
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
