'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Avatar } from '../ui';
import { getCurrentUser, logoutUser, getAuthToken } from '../../services/api';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenPublishModal: () => void;
  userName?: string;
  userAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onOpenPublishModal,
  userName: propUserName,
  userAvatar: propUserAvatar,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const currentUser = getCurrentUser();
    if (token && currentUser) {
      setUser(currentUser);
      setIsLogged(true);
    } else {
      setUser(null);
      setIsLogged(false);
    }
  }, []);

  async function handleLogout() {
    await logoutUser();
    setIsLogged(false);
    setUser(null);
    router.push('/login');
  }

  const displayName = propUserName || user?.name;
  const displayAvatar = propUserAvatar || user?.avatarUrl;

  return (
    <header className="bg-brand-blue text-white sticky top-0 z-40 shadow-sm border-b border-brand-blueHover">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 bg-brand-yellow text-brand-dark rounded-lg flex items-center justify-center font-extrabold text-xl shadow-sm transition-transform group-hover:scale-105">
              <i className="bx bx-search"></i>
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight leading-none text-white">Achei</span>
              <span className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider">Unochapecó</span>
            </div>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-lg mx-4">
          <div className="relative w-full">
            <i className="bx bx-search text-slate-300 text-lg absolute left-3.5 top-2.5"></i>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por pertence (ex: garrafa, fone), bloco ou local..." 
              className="w-full pl-10 pr-12 py-2 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-brand-dark placeholder:text-slate-300 focus:placeholder:text-slate-400 rounded-lg text-sm border border-white/20 focus:border-white focus:outline-none transition-all"
            />
            <span className="absolute right-3 top-2 px-1.5 py-0.5 bg-white/20 text-white text-[10px] font-mono rounded">/</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isLogged ? (
            <>
              <Button
                variant="primary"
                size="sm"
                leftIcon="bx-plus"
                onClick={onOpenPublishModal}
                className="hidden sm:inline-flex"
              >
                Publicar Item
              </Button>

              <button className="relative w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer" title="Notificações e Alertas">
                <i className="bx bx-bell text-xl"></i>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-yellow ring-2 ring-brand-blue"></span>
              </button>

              <Link href="/perfio" className="flex items-center gap-2 pl-2 border-l border-white/15 cursor-pointer hover:opacity-90 transition-opacity">
                <Avatar src={displayAvatar} name={displayName || 'Estudante'} size="sm" />
                <span className="hidden xl:inline text-xs font-semibold text-white">{displayName || 'Estudante'}</span>
              </Link>

              {/* Botão de Logout com 1 Clique */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-white/15"
                title="Desconectar e Sair da Conta"
              >
                <i className="bx bx-log-out text-base text-brand-yellow"></i>
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="primary" size="sm" leftIcon="bx-log-in">
                  Entrar
                </Button>
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-white/35 text-white hover:bg-white/15 hover:border-white/60 transition-all select-none active:scale-95 cursor-pointer"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
