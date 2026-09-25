'use client';

import React from 'react';
import Link from 'next/link';

interface MobileBottomNavProps {
  onOpenPublishModal: () => void;
  activeTab?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenPublishModal,
  activeTab = 'feed',
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-gray px-6 py-2 flex items-center justify-between z-40 shadow-lg">
      <Link href="/" className={`flex flex-col items-center gap-1 ${activeTab === 'feed' ? 'text-brand-blue font-bold' : 'text-slate-500 hover:text-brand-blue'}`}>
        <i className="bx bx-home-alt-2 text-xl"></i>
        <span className="text-[10px]">Feed</span>
      </Link>

      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-slate-500 hover:text-brand-blue cursor-pointer">
        <i className="bx bx-search text-xl"></i>
        <span className="text-[10px]">Buscar</span>
      </button>

      {/* Botão Central Flutuante Publicar */}
      <button
        onClick={onOpenPublishModal}
        className="w-11 h-11 -mt-5 rounded-full bg-brand-yellow text-brand-dark flex items-center justify-center text-2xl font-bold shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        title="Publicar Item"
      >
        <i className="bx bx-plus"></i>
      </button>

      <Link href="/rank" className={`flex flex-col items-center gap-1 ${activeTab === 'rank' ? 'text-brand-blue font-bold' : 'text-slate-500 hover:text-brand-blue'}`}>
        <i className="bx bx-trophy text-xl text-brand-yellow"></i>
        <span className="text-[10px]">Ranking</span>
      </Link>

      <Link href="/perfio" className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-brand-blue font-bold' : 'text-slate-500 hover:text-brand-blue'}`}>
        <i className="bx bx-user text-xl"></i>
        <span className="text-[10px]">Perfil</span>
      </Link>
    </nav>
  );
};
