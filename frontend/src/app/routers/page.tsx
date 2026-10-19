'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Input } from '../../components/ui';
import { saveAuthSession, getCurrentUser, clearAuthSession, logoutUser } from '../../services/api';

interface ApiRouteDef {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: 'auth' | 'items' | 'claims' | 'hints' | 'users' | 'gamification';
  categoryLabel: string;
  title: string;
  description: string;
  requiresAuth: boolean;
  sampleBody?: object;
  queryParams?: string;
}

const API_ROUTES: ApiRouteDef[] = [
  // 1. Autenticação & Usuários
  {
    id: 'auth-login',
    method: 'POST',
    path: '/api/auth/login',
    category: 'auth',
    categoryLabel: 'Autenticação',
    title: 'Login de Estudante / Staff',
    description: 'Autentica credenciais institucionais e retorna token JWT com dados do usuário.',
    requiresAuth: false,
    sampleBody: {
      email: 'estudante@unochapeco.edu.br',
      password: 'suasenhaaqui'
    },
  },
  {
    id: 'auth-register',
    method: 'POST',
    path: '/api/auth/register',
    category: 'auth',
    categoryLabel: 'Autenticação',
    title: 'Cadastro de Novo Estudante',
    description: 'Registra novo estudante com e-mail institucional (@unochapeco.edu.br) e curso.',
    requiresAuth: false,
    sampleBody: {
      name: 'Estudante Novo',
      email: 'estudante.novo@unochapeco.edu.br',
      password: 'senha',
      academicCourse: 'Ciência da Computação'
    },
  },
  {
    id: 'auth-logout',
    method: 'POST',
    path: '/api/auth/logout',
    category: 'auth',
    categoryLabel: 'Autenticação',
    title: 'Logout e Revogação de Sessão',
    description: 'Invalida a sessão ativa do token no banco de dados e remove autorização.',
    requiresAuth: true,
  },
  {
    id: 'auth-sessions',
    method: 'GET',
    path: '/api/auth/sessions',
    category: 'auth',
    categoryLabel: 'Autenticação',
    title: 'Sessões Ativas do Usuário',
    description: 'Lista dispositivos e sessões conectadas do usuário no banco de dados.',
    requiresAuth: true,
  },
  {
    id: 'auth-logout-all',
    method: 'POST',
    path: '/api/auth/logout-all',
    category: 'auth',
    categoryLabel: 'Autenticação',
    title: 'Encerrar Todas as Sessões',
    description: 'Revoga todos os tokens e sessões ativas do usuário em todos os dispositivos.',
    requiresAuth: true,
  },
  {
    id: 'users-me',
    method: 'GET',
    path: '/api/users/me',
    category: 'users',
    categoryLabel: 'Usuários',
    title: 'Perfil do Usuário Logado',
    description: 'Retorna perfil completo com pontuação de Karma, reputação e blocos frequentes.',
    requiresAuth: true,
  },
  {
    id: 'users-me-items',
    method: 'GET',
    path: '/api/users/me/items',
    category: 'users',
    categoryLabel: 'Usuários',
    title: 'Minhas Publicações',
    description: 'Lista todos os itens achados e perdidos criados pelo usuário autenticado.',
    requiresAuth: true,
  },
  {
    id: 'users-me-saved',
    method: 'GET',
    path: '/api/users/me/saved',
    category: 'users',
    categoryLabel: 'Usuários',
    title: 'Itens Salvos / Favoritos',
    description: 'Lista itens marcados como favoritos pelo usuário logado.',
    requiresAuth: true,
  },

  // 2. Feed & Pertences
  {
    id: 'items-list',
    method: 'GET',
    path: '/api/items',
    category: 'items',
    categoryLabel: 'Itens & Feed',
    title: 'Listar Feed de Pertences',
    description: 'Retorna lista paginada de achados e perdidos com filtros por bloco, categoria e busca.',
    requiresAuth: false,
    queryParams: '?limit=10&page=1',
  },
  {
    id: 'items-create',
    method: 'POST',
    path: '/api/items',
    category: 'items',
    categoryLabel: 'Itens & Feed',
    title: 'Publicar Novo Pertence',
    description: 'Cadastra um novo pertence perdido ou achado no campus da Unochapecó.',
    requiresAuth: true,
    sampleBody: {
      title: 'Calculadora HP 50g',
      description: 'Esquecida no laboratório 2 do Bloco R após prova de cálculo.',
      type: 'LOST',
      blockId: 'SELECIONE_OU_DEIXE_VAZIO',
      categoryId: 'SELECIONE_OU_DEIXE_VAZIO',
      specificLocation: 'Bancada 14 - Bloco R'
    },
  },
  {
    id: 'items-get-one',
    method: 'GET',
    path: '/api/items/:id',
    category: 'items',
    categoryLabel: 'Itens & Feed',
    title: 'Detalhes de um Pertence',
    description: 'Retorna todas as informações, fotos, pistas e histórico de custódia do pertence.',
    requiresAuth: false,
  },

  // 3. Blocos e Categorias
  {
    id: 'campus-blocks',
    method: 'GET',
    path: '/api/campus-blocks',
    category: 'items',
    categoryLabel: 'Estrutura do Campus',
    title: 'Blocos Oficiais do Campus',
    description: 'Retorna todos os blocos e locais cadastrados (Bloco R, Bloco G, Cantina, Biblioteca, etc).',
    requiresAuth: false,
  },
  {
    id: 'categories',
    method: 'GET',
    path: '/api/categories',
    category: 'items',
    categoryLabel: 'Estrutura do Campus',
    title: 'Categorias de Pertences',
    description: 'Lista as categorias do sistema (Eletrônicos, Documentos, Chaves, Roupas, Garrafas, etc).',
    requiresAuth: false,
  },

  // 4. Reivindicações & PIN de Retirada
  {
    id: 'claims-create',
    method: 'POST',
    path: '/api/claims',
    category: 'claims',
    categoryLabel: 'Retirada & Segurança',
    title: 'Iniciar Reivindicação de Item',
    description: 'Solicita a posse de um item achado respondendo às perguntas de validação do dono.',
    requiresAuth: true,
    sampleBody: {
      itemId: 'ID_DO_ITEM',
      securityAnswers: 'A garrafa é preta com adesivo do mascote da Unochapecó na tampa.'
    },
  },
  {
    id: 'claims-validate-pin',
    method: 'POST',
    path: '/api/claims/validate-pin',
    category: 'claims',
    categoryLabel: 'Retirada & Segurança',
    title: 'Validar PIN de Devolução (6 Dígitos)',
    description: 'Valida presencialmente o código de entrega para concluir a devolução e creditar Karma.',
    requiresAuth: true,
    sampleBody: {
      pinCode: '748291',
      claimId: 'ID_DA_REIVINDICACAO'
    },
  },

  // 5. Comentários Comunitários
  {
    id: 'hints-create',
    method: 'POST',
    path: '/api/hints',
    category: 'hints',
    categoryLabel: 'Comentários Comunitários',
    title: 'Adicionar Comentário em um Item',
    description: 'Publica comentário ou informação útil que ajuda a localizar um pertence no campus.',
    requiresAuth: true,
    sampleBody: {
      itemId: 'ID_DO_ITEM',
      content: 'Vi alguém com esse fone perto do balcão da cantina do Bloco R por volta das 16h.'
    },
  },

  // 6. Gamificação & Ranking
  {
    id: 'rankings-list',
    method: 'GET',
    path: '/api/rankings',
    category: 'gamification',
    categoryLabel: 'Gamificação & Ranking',
    title: 'Classificação de Guardiões (Leaderboard)',
    description: 'Lista estudantes e colaboradores com maior pontuação de Karma na Unochapecó.',
    requiresAuth: false,
  },
  {
    id: 'badges-list',
    method: 'GET',
    path: '/api/badges',
    category: 'gamification',
    categoryLabel: 'Gamificação & Ranking',
    title: 'Lista de Medalhas & Conquistas',
    description: 'Retorna todas as insígnias desbloqueáveis por devoluções e comentários úteis.',
    requiresAuth: false,
  },
];

export default function RoutersPage() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [backendUrl, setBackendUrl] = useState('http://localhost:3333');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: number; duration: number; data: any; error?: string }>>({});

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    checkBackendHealth();
  }, []);

  async function checkBackendHealth() {
    try {
      const res = await fetch(`${backendUrl}/api/campus-blocks`, { method: 'GET' });
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  }

  async function handleQuickLogin(email: string, name: string, course: string) {
    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: '123456' }),
      });
      if (res.ok) {
        const data = await res.json();
        saveAuthSession(data.token, data.user);
        setCurrentUser(data.user);
        alert(`Logado com sucesso como: ${name} (${course})`);
      } else {
        alert('Usuário não autenticado. Verifique se o banco de dados possui o seed executado.');
      }
    } catch (err: any) {
      alert(`Falha na conexão: ${err.message}`);
    }
  }

  async function handleLogout() {
    await logoutUser();
    setCurrentUser(null);
  }

  async function handleTestRoute(route: ApiRouteDef) {
    setTestingId(route.id);
    const startTime = performance.now();
    const token = typeof window !== 'undefined' ? localStorage.getItem('achei_token') : null;

    let targetPath = route.path;
    if (route.queryParams) targetPath += route.queryParams;

    // Se a rota precisar de ID de exemplo, tenta substituir
    if (targetPath.includes(':id')) {
      targetPath = targetPath.replace(':id', 'mock-id-item');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const options: RequestInit = {
        method: route.method,
        headers,
      };
      if (route.sampleBody && ['POST', 'PUT'].includes(route.method)) {
        options.body = JSON.stringify(route.sampleBody);
      }

      const res = await fetch(`${backendUrl}${targetPath}`, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }

      setTestResults((prev) => ({
        ...prev,
        [route.id]: {
          status: res.status,
          duration,
          data,
        },
      }));
    } catch (err: any) {
      const endTime = performance.now();
      setTestResults((prev) => ({
        ...prev,
        [route.id]: {
          status: 0,
          duration: Math.round(endTime - startTime),
          data: null,
          error: err.message || 'Erro de rede',
        },
      }));
    } finally {
      setTestingId(null);
    }
  }

  const filteredRoutes = API_ROUTES.filter((r) => {
    const matchesCategory = activeCategory === 'ALL' || r.category === activeCategory;
    const matchesSearch =
      r.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-brand-bg text-brand-dark font-sans min-h-screen selection:bg-brand-yellow selection:text-brand-dark pb-16">
      {/* Header Institucional */}
      <header className="bg-brand-blue text-white sticky top-0 z-40 shadow-sm border-b border-brand-blueHover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 bg-brand-yellow text-brand-dark rounded-lg flex items-center justify-center font-extrabold text-xl shadow-sm transition-transform group-hover:scale-105">
              <i className="bx bx-search"></i>
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight leading-none text-white">Achei</span>
              <span className="text-[10px] font-semibold text-brand-yellow uppercase tracking-wider">Unochapecó</span>
            </div>
          </Link>

          {/* Status Backend */}
          <div className="flex items-center gap-3">
            <div
              onClick={checkBackendHealth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer text-xs font-semibold text-white transition-colors"
              title="Clique para testar conexão"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  backendOnline === true
                    ? 'bg-amber-400'
                    : backendOnline === false
                    ? 'bg-red-400'
                    : 'bg-slate-300 animate-pulse'
                }`}
              ></span>
              <span>{backendOnline ? 'Backend Online (Porta 3333)' : 'Backend Desconectado'}</span>
              <i className="bx bx-refresh text-sm"></i>
            </div>

            <Link href="/" className="text-xs font-bold text-brand-yellow hover:underline ml-2">
              Voltar ao Feed
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna Esquerda: Status do Servidor & Login Rápido de Teste */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="p-5 space-y-4 bg-white border border-brand-gray">
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-brand-gray pb-3">
                <i className="bx bx-server text-brand-blue text-lg"></i>
                Configuração do Backend
              </h2>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">URL Base da API:</label>
                <div className="flex gap-2">
                  <Input
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="http://localhost:3333"
                    className="font-mono text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={checkBackendHealth}>
                    Testar
                  </Button>
                </div>
              </div>

              {currentUser ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-blue">Sessão Autenticada</span>
                    <Badge variant="blue" className="text-[10px]">Ativo</Badge>
                  </div>
                  <p className="text-xs font-bold text-brand-dark">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-600">{currentUser.email}</p>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="w-full mt-2 text-xs">
                    Desconectar Sessão
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-brand-gray rounded-xl">
                  <p className="text-xs text-slate-600 mb-2 font-medium">Nenhum token JWT ativo no momento.</p>
                  <Link href="/login">
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Ir para Login
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Test Users Fast Switcher */}
            <Card className="p-5 space-y-3 bg-white border border-brand-gray">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-brand-gray pb-2">
                <i className="bx bx-user-check text-brand-lilac text-base"></i>
                Autenticação de Teste (1-Clique)
              </h3>
              <p className="text-xs text-slate-500">
                Loga instantaneamente com usuários padrão criados pelo seed:
              </p>

              <div className="space-y-2">

                <button
                  onClick={() => handleQuickLogin('portaria.blocor@unochapeco.edu.br', 'Portaria Bloco R', 'Staff')}
                  className="w-full text-left p-2.5 rounded-lg border border-brand-gray hover:border-brand-blue hover:bg-blue-50/50 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-xs text-brand-dark group-hover:text-brand-blue">Portaria Bloco R</p>
                    <p className="text-[10px] text-slate-500">Staff • Valida PIN presencial</p>
                  </div>
                  <Badge variant="yellow" className="text-[10px]">Logar</Badge>
                </button>
              </div>
            </Card>
          </aside>

          {/* Coluna Central: Lista de Endpoints & Execução Interativa */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Banner de Introdução */}
            <div className="bg-gradient-to-r from-brand-blue to-brand-blueHover text-white rounded-2xl p-6 shadow-sm">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-brand-yellow text-brand-dark mb-2">
                <i className="bx bx-check-circle"></i> Prisma 7 + PostgreSQL + Express 5
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight">Catálogo de Rotas & APIs</h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
                Explore os 15+ endpoints implementados no backend do Achei Unochapecó. Teste requisições em tempo real e inspecione payloads JSON.
              </p>
            </div>

            {/* Barra de Filtros por Categoria & Busca */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                {[
                  { id: 'ALL', label: 'Todas' },
                  { id: 'auth', label: 'Auth' },
                  { id: 'items', label: 'Itens' },
                  { id: 'claims', label: 'Retirada PIN' },
                  { id: 'hints', label: 'Comentários' },
                  { id: 'users', label: 'Usuários' },
                  { id: 'gamification', label: 'Rankings' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-brand-blue text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-brand-gray hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-64">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por rota ou nome..."
                  leftIcon="bx-search"
                />
              </div>
            </div>

            {/* Lista de Endpoints */}
            <div className="space-y-4">
              {filteredRoutes.map((route) => {
                const result = testResults[route.id];
                const isTesting = testingId === route.id;

                return (
                  <Card key={route.id} className="p-5 space-y-3 bg-white border border-brand-gray hover:border-slate-300 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-gray pb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-mono font-extrabold ${
                            route.method === 'GET'
                              ? 'bg-blue-100 text-brand-blue'
                              : route.method === 'POST'
                              ? 'bg-amber-100 text-amber-900'
                              : route.method === 'PUT'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {route.method}
                        </span>
                        <code className="text-xs sm:text-sm font-mono font-bold text-brand-dark">
                          {route.path}
                        </code>
                      </div>

                      <div className="flex items-center gap-2">
                        {route.requiresAuth && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-brand-gray flex items-center gap-1">
                            <i className="bx bx-lock-alt"></i> JWT
                          </span>
                        )}
                        <Badge variant="neutral" className="text-[10px]">
                          {route.categoryLabel}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-brand-dark">{route.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{route.description}</p>
                    </div>

                    {route.sampleBody && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-brand-gray text-[11px] font-mono text-slate-700">
                        <span className="font-sans font-bold text-[10px] text-slate-500 uppercase block mb-1">
                          Exemplo de Payload:
                        </span>
                        <pre className="overflow-x-auto">{JSON.stringify(route.sampleBody, null, 2)}</pre>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={isTesting ? 'bx-loader-alt bx-spin' : 'bx-play'}
                        onClick={() => handleTestRoute(route)}
                        disabled={isTesting}
                      >
                        {isTesting ? 'Executando...' : 'Testar Rota'}
                      </Button>

                      {result && (
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              result.status >= 200 && result.status < 300
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            Status: {result.status || 'Erro'}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{result.duration}ms</span>
                        </div>
                      )}
                    </div>

                    {result && (
                      <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-60 custom-scrollbar border border-slate-700">
                        {result.error ? (
                          <p className="text-red-400">Erro: {result.error}</p>
                        ) : (
                          <pre>{JSON.stringify(result.data, null, 2)}</pre>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
