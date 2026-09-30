'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  getMyProfile,
  getMyItems,
  getMySavedItems,
  updateMyProfile,
  getCampusBlocks,
  uploadImageToCloudinary,
  clearAuthSession,
} from '../../services/api';
import { Item, UserSummary, CampusBlock } from '../../types';
import { Header } from '../../components/common/Header';
import { ItemCard } from '../../components/common/ItemCard';
import { MobileBottomNav } from '../../components/common/MobileBottomNav';
import { Card, Badge, Button, Avatar, Dialog, Input, CourseCombobox } from '../../components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'my-items' | 'saved' | 'returned'>('my-items');
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [savedItems, setSavedItems] = useState<Item[]>([]);
  const [campusBlocks, setCampusBlocks] = useState<CampusBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Notificação toast para ações diretas
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal de Edição de Perfil
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editPeriod, setEditPeriod] = useState<number | ''>('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editBanerUrl, setEditBanerUrl] = useState('');
  const [editBlockIds, setEditBlockIds] = useState<string[]>([]);

  // Estados de upload e salvamento
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [directUploadingBanner, setDirectUploadingBanner] = useState(false);
  const [directUploadingAvatar, setDirectUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [modalError, setModalError] = useState('');

  // Refs para inputs de arquivo
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const directAvatarInputRef = useRef<HTMLInputElement>(null);
  const directBannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfileData() {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('achei_token') : null;
        const localUser = getCurrentUser();

        if (!token) {
          router.push('/login?redirect=/perfio');
          return;
        }

        const [profile, blocksData, itemsData, savedData] = await Promise.all([
          getMyProfile().catch(() => localUser),
          getCampusBlocks().catch(() => []),
          getMyItems().catch(() => []),
          getMySavedItems().catch(() => []),
        ]);

        if (!profile && !localUser) {
          clearAuthSession();
          router.push('/login?redirect=/perfio');
          return;
        }

        const activeUser = profile || localUser;
        setUser(activeUser);
        setCampusBlocks(blocksData || []);
        setMyItems(itemsData || []);
        setSavedItems(savedData || []);

        if (activeUser) {
          syncEditState(activeUser);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [router]);

  function syncEditState(targetUser: UserSummary) {
    setEditName(targetUser.name || '');
    setEditCourse(targetUser.academicCourse || '');
    setEditPeriod(targetUser.academicPeriod ?? '');
    setEditAvatarUrl(targetUser.avatarUrl || '');
    setEditBanerUrl(targetUser.banerUrl || '');
    setEditBlockIds(targetUser.frequentedBlocks ? targetUser.frequentedBlocks.map((b) => b.id) : []);
  }

  function handleOpenEditModal() {
    if (user) {
      syncEditState(user);
    }
    setModalError('');
    setIsEditModalOpen(true);
  }

  // Upload DIRETO de Capa / Banner (Pela tela de perfil) e salvamento imediato
  async function handleDirectBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotificationMsg({ type: 'error', text: 'Por favor, selecione uma imagem válida (PNG, JPG, WEBP).' });
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setNotificationMsg({ type: 'error', text: 'A capa do perfil deve ter no máximo 8MB.' });
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }

    setDirectUploadingBanner(true);
    try {
      // 1. Upload da imagem para o Cloudinary
      const res = await uploadImageToCloudinary(file, 'banners');

      // 2. Salva a URL retornada do Cloudinary no banco de dados imediatamente
      const updated = await updateMyProfile({
        banerUrl: res.url,
      });

      setUser(updated);
      setEditBanerUrl(res.url);
      setNotificationMsg({ type: 'success', text: 'Capa do perfil atualizada e salva com sucesso!' });
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err: any) {
      console.error('Erro ao salvar capa no Cloudinary:', err);
      setNotificationMsg({ type: 'error', text: err.message || 'Erro ao enviar capa para o Cloudinary.' });
      setTimeout(() => setNotificationMsg(null), 4000);
    } finally {
      setDirectUploadingBanner(false);
      if (directBannerInputRef.current) directBannerInputRef.current.value = '';
    }
  }

  // Upload DIRETO de Foto de Perfil (Pelo avatar) e salvamento imediato
  async function handleDirectAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotificationMsg({ type: 'error', text: 'Por favor, selecione uma imagem válida (PNG, JPG, WEBP).' });
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotificationMsg({ type: 'error', text: 'A foto de perfil deve ter no máximo 5MB.' });
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }

    setDirectUploadingAvatar(true);
    try {
      // 1. Upload da imagem para o Cloudinary
      const res = await uploadImageToCloudinary(file, 'users');

      // 2. Salva a URL retornada do Cloudinary no banco de dados imediatamente
      const updated = await updateMyProfile({
        avatarUrl: res.url,
      });

      setUser(updated);
      setEditAvatarUrl(res.url);
      setNotificationMsg({ type: 'success', text: 'Foto de perfil atualizada e salva com sucesso!' });
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err: any) {
      console.error('Erro ao salvar foto de perfil no Cloudinary:', err);
      setNotificationMsg({ type: 'error', text: err.message || 'Erro ao enviar foto para o Cloudinary.' });
      setTimeout(() => setNotificationMsg(null), 4000);
    } finally {
      setDirectUploadingAvatar(false);
      if (directAvatarInputRef.current) directAvatarInputRef.current.value = '';
    }
  }

  // Upload de Foto de Perfil no Modal
  async function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError('A imagem de perfil deve ter no máximo 5MB.');
      return;
    }

    setUploadingAvatar(true);
    setModalError('');
    try {
      const res = await uploadImageToCloudinary(file, 'users');
      setEditAvatarUrl(res.url);
    } catch (err: any) {
      setModalError(err.message || 'Falha ao enviar a foto de perfil.');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  }

  // Upload de Capa / Banner no Modal
  async function handleBannerFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setModalError('A capa do perfil deve ter no máximo 8MB.');
      return;
    }

    setUploadingBanner(true);
    setModalError('');
    try {
      const res = await uploadImageToCloudinary(file, 'banners');
      setEditBanerUrl(res.url);
    } catch (err: any) {
      setModalError(err.message || 'Falha ao enviar o banner de capa.');
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  }

  // Alternar seleção de bloco frequentado
  function toggleBlockSelection(blockId: string) {
    if (editBlockIds.includes(blockId)) {
      setEditBlockIds(editBlockIds.filter((id) => id !== blockId));
    } else {
      setEditBlockIds([...editBlockIds, blockId]);
    }
  }

  // Salvar Edição Completa do Perfil no Modal
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim() || editName.trim().length < 3) {
      setModalError('O nome deve conter pelo menos 3 caracteres.');
      return;
    }

    setSavingProfile(true);
    setModalError('');
    try {
      const updated = await updateMyProfile({
        name: editName.trim(),
        academicCourse: editCourse.trim() ? editCourse.trim() : null,
        academicPeriod: editPeriod ? Number(editPeriod) : null,
        avatarUrl: editAvatarUrl.trim() ? editAvatarUrl.trim() : null,
        banerUrl: editBanerUrl.trim() ? editBanerUrl.trim() : null,
        frequentedBlockIds: editBlockIds,
      });

      setUser(updated);
      setIsEditModalOpen(false);
      setNotificationMsg({ type: 'success', text: 'Perfil salvo com sucesso!' });
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setModalError(err.message || 'Erro ao salvar alterações no perfil.');
    } finally {
      setSavingProfile(false);
    }
  }

  // Filtragem de Itens por Aba
  let displayedItems: Item[] = [];
  if (activeTab === 'my-items') {
    displayedItems = myItems;
  } else if (activeTab === 'saved') {
    displayedItems = savedItems;
  } else if (activeTab === 'returned') {
    displayedItems = myItems.filter((i) => i.status === 'RETURNED');
  }

  if (searchTerm.trim()) {
    displayedItems = displayedItems.filter(
      (i) =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const returnedCount = myItems.filter((i) => i.status === 'RETURNED').length;

  return (
    <div className="bg-brand-bg text-brand-dark font-sans min-h-screen pb-24 selection:bg-brand-yellow selection:text-brand-dark">
      {/* 1. Header Oficial */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenPublishModal={() => router.push('/')}
        userName={user?.name || 'Estudante'}
        userAvatar={user?.avatarUrl || undefined}
      />

      {/* Notificação Toast Flutuante */}
      {notificationMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
            notificationMsg.type === 'success'
              ? 'bg-brand-blue text-white border-blue-400/30'
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          <i
            className={`bx ${
              notificationMsg.type === 'success' ? 'bx-check-circle text-brand-yellow' : 'bx-error-circle'
            } text-base`}
          ></i>
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* 2. Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Banner de Capa & Cabeçalho do Perfil */}
        <div className="bg-white border border-brand-gray rounded-custom overflow-hidden shadow-xs mb-6">
          {/* Inputs Ocultos para Upload Direto */}
          <input
            ref={directBannerInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleDirectBannerChange}
          />
          <input
            ref={directAvatarInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleDirectAvatarChange}
          />

          {/* Capa com Imagem do Usuário ou Gradiente Oficial (Zero Green) */}
          <div
            className="h-36 sm:h-52 relative overflow-hidden bg-cover bg-center transition-all"
            style={{
              backgroundImage: user?.banerUrl ? `url(${user.banerUrl})` : undefined,
              background: !user?.banerUrl
                ? 'linear-gradient(135deg, #1C4398 0%, #17377D 50%, #AC80CE 100%)'
                : undefined,
            }}
          >
            {/* Scrim e Efeitos de Profundidade */}
            {user?.banerUrl ? (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/20" />
            ) : (
              <>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-brand-yellow/15 blur-2xl pointer-events-none" />
                <div className="absolute left-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
              </>
            )}

            {/* Tag Campus Chapecó */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
              <span className="px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20 flex items-center gap-1.5 shadow-xs">
                <i className="bx bx-buildings text-brand-yellow"></i>
                <span>Unochapecó</span>
              </span>
            </div>

            {/* Atalho Rápido para Alterar Capa Direto na Tela */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10">
              <button
                type="button"
                disabled={directUploadingBanner}
                onClick={() => directBannerInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/20 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-70"
              >
                {directUploadingBanner ? (
                  <>
                    <i className="bx bx-loader-alt animate-spin text-brand-yellow text-sm"></i>
                    <span>Salvando Capa...</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-camera text-brand-yellow text-sm"></i>
                    <span className="hidden sm:inline">Alterar Capa</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dados do Estudante + Ações */}
          <div className="px-4 sm:px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
              {/* Avatar e Identificação */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3.5">
                <div className="relative group self-start sm:self-auto">
                  <Avatar
                    src={user?.avatarUrl}
                    name={user?.name || 'Estudante'}
                    size="lg"
                    className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-white text-3xl shadow-md rounded-2xl object-cover bg-white"
                  />
                  <button
                    type="button"
                    disabled={directUploadingAvatar}
                    onClick={() => directAvatarInputRef.current?.click()}
                    title="Alterar foto de perfil"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-brand-blue text-white shadow-md flex items-center justify-center border-2 border-white hover:bg-blue-800 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {directUploadingAvatar ? (
                      <i className="bx bx-loader-alt animate-spin text-sm"></i>
                    ) : (
                      <i className="bx bx-camera text-sm"></i>
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark">
                      {user?.name || 'Estudante Unochapecó'}
                    </h1>
                    {user?.isVerified ? (
                      <Badge variant="yellow">VERIFICADO</Badge>
                    ) : (
                      <Badge variant="blue">ESTUDANTE</Badge>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-brand-blue">
                    {user?.academicCourse || 'Graduação'}
                    {user?.academicPeriod ? ` • ${user.academicPeriod}º Período` : ''}
                    {' '}• Estudante Ativo
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <i className="bx bx-buildings text-brand-lilac"></i>
                      <span>Campus Chapecó</span>
                    </span>
                    {user?.email && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {user.email}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Blocos Habituaís do Usuário */}
                  {user?.frequentedBlocks && user.frequentedBlocks.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-0.5">
                        <i className="bx bx-map-pin text-brand-blue"></i>
                        Blocos:
                      </span>
                      {user.frequentedBlocks.map((blk) => (
                        <span
                          key={blk.id}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                        >
                          {blk.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação do Perfil (Sem botão de sair) */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon="bx-edit"
                  onClick={handleOpenEditModal}
                >
                  Editar Perfil
                </Button>
              </div>
            </div>

            {/* Indicadores de Impacto Comunitário */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-brand-gray">
              <div className="p-3 rounded-xl bg-slate-50 border border-brand-gray">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Publicações</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-brand-dark">{myItems.length}</span>
                  <span className="text-xs text-slate-400 font-medium">itens</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-brand-gray">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Devolvidos</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-brand-blue">{returnedCount}</span>
                  <span className="text-xs text-slate-400 font-medium">resolvidos</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-brand-gray">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Itens Salvos</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-brand-lilac">{savedItems.length}</span>
                  <span className="text-xs text-slate-400 font-medium">favoritos</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-brand-gray">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Karma Uno</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-amber-900">{user?.reputationScore ?? 0}</span>
                  <span className="text-xs text-slate-400 font-medium">pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Abas e Lista de Pertences */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Informações Institucionais */}
          <aside className="hidden lg:block lg:col-span-4 space-y-5">
            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b border-brand-gray pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <i className="bx bx-shield-quarter text-brand-blue text-sm"></i>
                  Segurança & Verificação
                </h3>
              </div>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <i className="bx bx-check text-brand-blue text-base mt-0.5"></i>
                  <span>E-mail institucional autenticado no campus.</span>
                </div>
                <div className="flex items-start gap-2">
                  <i className="bx bx-check text-brand-blue text-base mt-0.5"></i>
                  <span>Vínculo acadêmico ativo na Unochapecó.</span>
                </div>
                <div className="flex items-start gap-2">
                  <i className="bx bx-check text-brand-blue text-base mt-0.5"></i>
                  <span>Código de segurança com validação presencial por PIN.</span>
                </div>
              </div>
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b border-brand-gray pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <i className="bx bx-trophy text-brand-yellow text-sm"></i>
                  Status no Ranking
                </h3>
                <Link href="/rank" className="text-[11px] text-brand-blue font-semibold hover:underline">
                  Ver Leaderboard
                </Link>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você acumulou <strong>{user?.reputationScore ?? 0} pontos de Karma</strong> este semestre e está elegível a insígnias de guardião da comunidade.
              </p>
            </Card>
          </aside>

          {/* Coluna Direita: Abas e Feed de Itens Pessoais */}
          <section className="col-span-1 lg:col-span-8 space-y-4">
            {/* Abas de Navegação */}
            <div className="flex items-center gap-1 bg-white border border-brand-gray rounded-custom p-1.5 shadow-xs overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('my-items')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'my-items'
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Minhas Publicações ({myItems.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'saved'
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Itens Salvos ({savedItems.length})
              </button>
              <button
                onClick={() => setActiveTab('returned')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'returned'
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Devolvidos ({returnedCount})
              </button>
            </div>

            {/* Lista dos Itens */}
            {loading && (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-white border border-brand-gray rounded-custom p-5 space-y-3 animate-pulse">
                    <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                    <div className="w-full h-3 bg-slate-100 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {!loading && displayedItems.length === 0 && (
              <Card className="text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center text-2xl mx-auto">
                  <i className="bx bx-folder-open"></i>
                </div>
                <h3 className="font-bold text-sm text-brand-dark">Nenhum item nesta aba</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {activeTab === 'my-items' && 'Você ainda não publicou nenhum pertence perdido ou achado.'}
                  {activeTab === 'saved' && 'Você ainda não salvou nenhum pertence nos favoritos.'}
                  {activeTab === 'returned' && 'Nenhum dos seus itens foi marcado como devolvido ainda.'}
                </p>
                <Link href="/">
                  <Button variant="primary" size="sm" leftIcon="bx-home">
                    Explorar Feed do Campus
                  </Button>
                </Link>
              </Card>
            )}

            {displayedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onOpenClaimModal={() => {}}
                onOpenHintModal={() => {}}
                onOpenPinModal={() => {}}
              />
            ))}
          </section>
        </div>
      </main>

      {/* 3. Modal Completo de Edição de Perfil */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Perfil do Estudante"
        subtitle="Atualize sua foto, capa, curso e blocos para personalizar sua experiência na Unochapecó."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              disabled={savingProfile || uploadingAvatar || uploadingBanner}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveProfile}
              isLoading={savingProfile}
              disabled={uploadingAvatar || uploadingBanner}
            >
              Salvar Alterações
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Mensagem de Erro no Modal */}
          {modalError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <i className="bx bx-error-circle text-base flex-shrink-0"></i>
              <span>{modalError}</span>
            </div>
          )}

          {/* Seção 1: Mídia Visual (Capa e Avatar) */}
          <div className="space-y-3 p-3.5 bg-slate-50 border border-brand-gray rounded-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <i className="bx bx-image text-brand-blue text-sm"></i>
              Personalização Visual
            </h4>

            {/* Upload de Capa / Banner */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Capa do Perfil (Banner)
              </label>

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleBannerFileChange}
              />

              <div className="relative rounded-lg overflow-hidden border border-slate-200 h-24 bg-gradient-to-r from-brand-blue via-brand-blue to-brand-lilac flex items-center justify-between px-4">
                {editBanerUrl && (
                  <img
                    src={editBanerUrl}
                    alt="Prévia da Capa"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {editBanerUrl && <div className="absolute inset-0 bg-black/30" />}

                <div className="relative z-10 text-white text-xs font-semibold drop-shadow-sm">
                  {editBanerUrl ? 'Capa personalizada ativa' : 'Gradiente padrão Unochapecó'}
                </div>

                <div className="relative z-10 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white/90 hover:bg-white text-slate-800 text-xs border-none"
                    leftIcon="bx-upload"
                    isLoading={uploadingBanner}
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    {editBanerUrl ? 'Trocar Capa' : 'Enviar Capa'}
                  </Button>

                  {editBanerUrl && (
                    <button
                      type="button"
                      title="Remover capa personalizada"
                      onClick={() => setEditBanerUrl('')}
                      className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs transition-colors cursor-pointer"
                    >
                      <i className="bx bx-trash text-sm"></i>
                    </button>
                  )}
                </div>
              </div>
              {editBanerUrl && (
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 truncate">
                  <i className="bx bx-cloud-check text-xs text-emerald-600 flex-shrink-0"></i>
                  <span className="truncate">Cloudinary: {editBanerUrl}</span>
                </div>
              )}
              <p className="text-[11px] text-slate-400 mt-1">Recomendado: 1200 x 300px (JPG ou PNG até 8MB).</p>
            </div>

            {/* Upload de Avatar / Foto de Perfil */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Foto de Perfil (Avatar)
              </label>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleAvatarFileChange}
              />

              <div className="flex items-center gap-3.5">
                <Avatar
                  src={editAvatarUrl || undefined}
                  name={editName || 'Estudante'}
                  size="md"
                  className="w-14 h-14 ring-2 ring-brand-blue/30 text-xl rounded-xl object-cover bg-white"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon="bx-camera"
                      isLoading={uploadingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {editAvatarUrl ? 'Trocar Foto' : 'Enviar Foto'}
                    </Button>

                    {editAvatarUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 text-xs"
                        onClick={() => setEditAvatarUrl('')}
                      >
                        Remover Foto
                      </Button>
                    )}
                  </div>
                  {editAvatarUrl && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[280px]">
                      <i className="bx bx-cloud-check text-xs text-emerald-600 flex-shrink-0"></i>
                      <span className="truncate">Cloudinary: {editAvatarUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Dados Cadastrais */}
          <div className="space-y-3.5">
            <Input
              label="Nome Completo *"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />

            <CourseCombobox
              label="Curso de Graduação"
              value={editCourse}
              onChange={setEditCourse}
            />

            {/* Período / Semestre */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Período / Semestre Atual
              </label>
              <select
                value={editPeriod}
                onChange={(e) => setEditPeriod(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-gray bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              >
                <option value="">Não informado</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>
                    {p}º Período / Semestre
                  </option>
                ))}
              </select>
            </div>

            {/* Blocos Mais Frequentados */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Blocos Mais Frequentados no Campus
                </label>
                <span className="text-[11px] text-brand-blue font-semibold">
                  {editBlockIds.length} selecionado{editBlockIds.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Selecione os blocos e locais que você mais costuma frequentar para refinar seu radar de achados e perdidos.
              </p>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-lg">
                {campusBlocks.length === 0 && (
                  <span className="text-xs text-slate-400 p-2">Carregando blocos da universidade...</span>
                )}
                {campusBlocks.map((blk) => {
                  const isSelected = editBlockIds.includes(blk.id);
                  return (
                    <button
                      key={blk.id}
                      type="button"
                      onClick={() => toggleBlockSelection(blk.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand-blue text-white border-brand-blue shadow-xs font-semibold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <i className={`bx ${isSelected ? 'bx-check' : 'bx-plus'} text-xs`}></i>
                      <span>{blk.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </form>
      </Dialog>

      {/* 4. Navegação Mobile */}
      <MobileBottomNav onOpenPublishModal={() => router.push('/')} activeTab="profile" />
    </div>
  );
}
