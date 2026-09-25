'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { CampusBlock } from '../../types';

interface SidebarProps {
  blocks: CampusBlock[];
  selectedBlockId: string;
  onSelectBlock: (blockId: string) => void;
  activeNavTab: string;
  onSelectNavTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  activeNavTab,
  onSelectNavTab,
}) => {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [comboboxSearch, setComboboxSearch] = useState('');
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Fecha o combobox ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setComboboxOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedLabel = selectedBlockId === 'all' || !selectedBlock
    ? 'Todos os Blocos'
    : selectedBlock.name;

  const filteredBlocks = blocks.filter((b) =>
    b.name.toLowerCase().includes(comboboxSearch.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(comboboxSearch.toLowerCase()))
  );

  return (
    <aside className="desktop-sidebar hidden lg:block lg:col-span-3 sticky top-[80px] space-y-5 self-start max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pr-1">
      
      {/* Menu Principal de Navegação */}
      <div className="bg-white border border-brand-gray rounded-custom p-3 shadow-xs space-y-1">
        <button
          onClick={() => onSelectNavTab('feed')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer text-left ${
            activeNavTab === 'feed'
              ? 'bg-brand-blue text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-brand-blue font-medium'
          }`}
        >
          <i className="bx bx-home-alt-2 text-lg"></i>
          <span>Feed Principal</span>
        </button>

        <button
          onClick={() => onSelectNavTab('my-items')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer text-left ${
            activeNavTab === 'my-items'
              ? 'bg-brand-blue text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-brand-blue font-medium'
          }`}
        >
          <i className="bx bx-user text-lg"></i>
          <span>Minhas Publicações</span>
        </button>

        <button
          onClick={() => onSelectNavTab('saved')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer text-left ${
            activeNavTab === 'saved'
              ? 'bg-brand-blue text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-brand-blue font-medium'
          }`}
        >
          <i className="bx bx-bookmark text-lg"></i>
          <span>Itens Salvos</span>
        </button>

        <button
          onClick={() => onSelectNavTab('returned')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer text-left ${
            activeNavTab === 'returned'
              ? 'bg-brand-blue text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-brand-blue font-medium'
          }`}
        >
          <i className="bx bx-check-shield text-lg text-brand-blue"></i>
          <span>Devolvidos com Sucesso</span>
        </button>

        <Link
          href="/rank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-brand-blue font-medium text-sm transition-colors"
        >
          <i className="bx bx-trophy text-lg text-brand-yellow"></i>
          <span>Ranking Comunitário</span>
        </Link>
      </div>

      {/* Filtro por Blocos Oficiais da Unochapecó (Combobox estilo shadcn/ui) */}
      <div className="bg-white border border-brand-gray rounded-custom p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-brand-gray pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <i className="bx bx-map text-brand-blue text-sm"></i>
            Filtrar por Bloco
          </h3>
          {selectedBlockId !== 'all' && (
            <button
              onClick={() => onSelectBlock('all')}
              className="text-[11px] text-brand-blue font-semibold hover:underline cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Combobox Container */}
        <div className="relative" ref={comboboxRef}>
          <button
            type="button"
            onClick={() => setComboboxOpen(!comboboxOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-brand-gray rounded-xl text-xs font-medium text-brand-dark transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <i className="bx bx-buildings text-brand-blue text-sm"></i>
              <span className="font-semibold truncate">{selectedLabel}</span>
            </span>
            <i className={`bx bx-chevron-down text-slate-400 text-base transition-transform ${comboboxOpen ? 'rotate-180' : ''}`}></i>
          </button>

          {/* Popover com Campo de Busca e Lista */}
          {comboboxOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-brand-gray rounded-xl shadow-xl z-30 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="relative">
                <i className="bx bx-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  value={comboboxSearch}
                  onChange={(e) => setComboboxSearch(e.target.value)}
                  placeholder="Pesquisar bloco ou local..."
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-brand-gray rounded-lg text-xs text-brand-dark placeholder-slate-400 focus:bg-white focus:border-brand-blue focus:outline-none transition-colors"
                />
              </div>

              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5 text-xs">
                {/* Opção Todos */}
                <div
                  onClick={() => {
                    onSelectBlock('all');
                    setComboboxOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    selectedBlockId === 'all' ? 'bg-blue-50 font-bold text-brand-blue' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <i className={`bx bx-check text-brand-blue text-sm ${selectedBlockId === 'all' ? 'opacity-100' : 'opacity-0'}`}></i>
                    <span>Todos os Blocos</span>
                  </span>
                </div>

                {/* Lista dos Blocos da Unochapecó vindos da API */}
                {filteredBlocks.map((block) => {
                  const isSelected = selectedBlockId === block.id;
                  return (
                    <div
                      key={block.id}
                      onClick={() => {
                        onSelectBlock(block.id);
                        setComboboxOpen(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 font-bold text-brand-blue' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <i className={`bx bx-check text-brand-blue text-sm shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`}></i>
                        <span className="truncate">{block.name}</span>
                      </span>
                      {block._count?.items !== undefined && (
                        <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                          {block._count.items}
                        </span>
                      )}
                    </div>
                  );
                })}

                {filteredBlocks.length === 0 && (
                  <p className="text-center py-3 text-slate-400 text-xs">Nenhum bloco encontrado.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
};
