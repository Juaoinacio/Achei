'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../../types';
import { getCourses } from '../../services/api';

interface CourseComboboxProps {
  value: string;
  onChange: (courseName: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
}

export const CourseCombobox: React.FC<CourseComboboxProps> = ({
  value,
  onChange,
  label = 'Curso / Área de Graduação',
  placeholder = 'Selecione ou busque seu curso...',
  required = false,
  className = '',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Carrega os cursos da API do backend
  useEffect(() => {
    let isMounted = true;
    async function fetchCourses() {
      setLoading(true);
      try {
        const data = await getCourses();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      } catch (err) {
        console.error('Erro ao carregar cursos da universidade:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Foco no input de busca ao abrir o combobox
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.department && c.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCourse = courses.find((c) => c.name === value);

  function handleSelect(courseName: string) {
    onChange(courseName);
    setIsOpen(false);
  }

  return (
    <div className={`space-y-1.5 relative ${isOpen ? 'z-50' : 'z-20'} ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-brand-dark">
          {label} {required && <span className="text-brand-blue ml-0.5">*</span>}
        </label>
      )}

      {/* Botão de Trigger do Combobox */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-left flex items-center justify-between transition-all cursor-pointer ${
          isOpen
            ? 'border-brand-blue ring-2 ring-brand-blue/20 bg-white'
            : error
            ? 'border-red-400 bg-red-50/20'
            : 'border-brand-gray hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <i className="bx bx-graduation text-brand-blue text-base shrink-0"></i>
          {value ? (
            <span className="font-semibold text-brand-dark truncate">{value}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>

        <i
          className={`bx bx-chevron-down text-slate-400 text-lg transition-transform shrink-0 ${
            isOpen ? 'rotate-180 text-brand-blue' : ''
          }`}
        ></i>
      </button>

      {/* Dropdown Menu com Busca */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-brand-gray rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Campo de Busca Rápida */}
          <div className="p-2 border-b border-brand-gray bg-slate-50/60 sticky top-0">
            <div className="relative flex items-center">
              <i className="bx bx-search absolute left-2.5 text-slate-400 text-sm pointer-events-none"></i>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar cursos..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-brand-gray rounded-lg text-xs text-brand-dark placeholder:text-slate-400 focus:outline-none focus:border-brand-blue"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <i className="bx bx-x text-sm"></i>
                </button>
              )}
            </div>
          </div>

          {/* Lista com Rolagem */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1 divide-y divide-slate-100">
            {loading && courses.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <i className="bx bx-loader-alt bx-spin text-brand-blue text-sm"></i>
                <span>Carregando cursos oficiais...</span>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-600">Nenhum curso encontrado</p>
                <p className="text-[11px] text-slate-400">Tente buscar por outro termo.</p>
              </div>
            ) : (
              filteredCourses.map((course) => {
                const isSelected = course.name === value;
                return (
                  <button
                    key={course.id || course.name}
                    type="button"
                    onClick={() => handleSelect(course.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-50 text-brand-blue font-bold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-brand-blue'
                    }`}
                  >
                    <span className="truncate leading-snug text-xs">{course.name}</span>
                    {isSelected && (
                      <i className="bx bx-check text-brand-blue text-base shrink-0 ml-2"></i>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
};
