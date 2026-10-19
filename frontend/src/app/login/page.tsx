'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, saveAuthSession } from '../../services/api';
import { Button, Input } from '../../components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Se já houver sessão ativa, sincroniza cookie e redireciona
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('achei_token') : null;
    const user = typeof window !== 'undefined' ? localStorage.getItem('achei_user') : null;
    if (token && user) {
      document.cookie = `achei_token=${token}; path=/; max-age=604800; SameSite=Lax`;
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      router.push(redirectParam && redirectParam !== '/login' ? redirectParam : '/');
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginUser({ email: email.trim(), password });
      saveAuthSession(res.token, res.user);

      let targetUrl = '/';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect');
        if (redirectParam && redirectParam !== '/login') {
          targetUrl = redirectParam;
        }
      }

      router.push(targetUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-brand-bg text-brand-dark font-sans min-h-screen flex flex-col justify-center items-center p-0 lg:p-6 selection:bg-brand-yellow selection:text-brand-dark">
      {/* Card Principal Split-Screen */}
      <div className="w-full max-w-5xl bg-white border border-brand-gray rounded-none lg:rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Lado Esquerdo: Banner Hero Institucional (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-brand-blue via-brand-blue to-brand-blueHover text-white p-10 flex-col justify-between relative overflow-hidden">
          {/* Círculos decorativos oficiais (Zero Green) */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand-lilac/25 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-brand-yellow/15 blur-3xl pointer-events-none"></div>

          {/* Topo da lateral */}
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
                A rede solidária de achados e perdidos da sua universidade.
              </h2>
              <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                Esqueceu sua garrafa, mochila ou fones em sala de aula? Nossa comunidade acadêmica te ajuda a recuperar com segurança.
              </p>
            </div>
          </div>

          {/* Estatísticas de Impacto no Campus */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-white/15 pb-2">
              <span className="text-slate-200">Impacto no Campus</span>
              <span className="font-bold text-brand-yellow">Campus Chapecó (Sede)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 rounded-lg bg-white/10">
                <p className="text-xl font-extrabold text-brand-yellow">340+</p>
                <p className="text-[11px] text-slate-200 font-medium">Itens Devolvidos</p>
              </div>
              <div className="p-2 rounded-lg bg-white/10">
                <p className="text-xl font-extrabold text-white">18 min</p>
                <p className="text-[11px] text-slate-200 font-medium">Tempo Médio 1º Comentário</p>
              </div>
            </div>
          </div>

          {/* Rodapé da lateral */}
          <div className="text-xs text-slate-300 relative z-10 flex items-center justify-between">
            <span>Apoio Institucional • DCE</span>
            <span className="font-mono text-[11px] text-brand-yellow">uno.edu.br</span>
          </div>
        </div>

        {/* Lado Direito: Formulário de Login */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          
          {/* Topo Mobile (visível quando a coluna hero está oculta) */}
          <div className="lg:hidden flex items-center justify-between border-b border-brand-gray pb-4 mb-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-brand-yellow text-brand-dark rounded-lg flex items-center justify-center font-extrabold text-lg">
                <i className="bx bx-search"></i>
              </span>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight leading-none text-brand-blue">Achei</span>
                <span className="text-[9px] font-bold text-brand-lilac uppercase tracking-wider">Unochapecó</span>
              </div>
            </Link>

            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-brand-blue flex items-center gap-1">
              <span>Visitar Feed</span>
              <i className="bx bx-chevron-right"></i>
            </Link>
          </div>

          {/* Cabeçalho do Formulário */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
              Acessar Conta
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Entre com suas credenciais acadêmicas para publicar itens e registrar comentários.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-4 my-6">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                <i className="bx bx-error-circle text-base shrink-0"></i>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Campo 1: E-mail Acadêmico ou RA */}
            <Input
              label="E-mail Institucional ou RA"
              leftIcon="bx-envelope"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.nome@unochapeco.edu.br ou RA"
              required
            />

            {/* Campo 2: Senha com Toggle de Visualização */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-brand-dark">
                  Senha <span className="text-brand-blue ml-0.5">*</span>
                </label>
                <Link href="/password" className="text-xs font-semibold text-brand-blue hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>

              <div className="relative flex items-center">
                <i className="bx bx-lock-alt absolute left-3.5 text-slate-400 text-base pointer-events-none"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-brand-gray rounded-xl text-xs sm:text-sm text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                  title={showPassword ? 'Ocultar Senha' : 'Ver Senha'}
                >
                  <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} text-lg`}></i>
                </button>
              </div>
            </div>

            {/* Lembrar de mim */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                />
                <span>Lembrar de mim neste navegador</span>
              </label>
            </div>

            {/* Botão de Ação Principal CTA (Amarelo Solar) */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              rightIcon="bx-right-arrow-alt"
              isLoading={loading}
              className="w-full mt-2"
            >
              Entrar na Minha Conta
            </Button>
          </form>

          {/* Rodapé: Link para Cadastro */}
          <div className="pt-4 border-t border-brand-gray text-center text-xs text-slate-600">
            <span>Ainda não possui conta no Achei?</span>
            <Link href="/register" className="font-bold text-brand-blue hover:underline ml-1">
              Criar conta universitária
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
