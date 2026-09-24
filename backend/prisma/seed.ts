import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma';
import { UserRole, ItemType, ItemStatus, ClaimStatus, NotificationType } from '@prisma/client';

async function main() {
  console.log('🌱 Iniciando seed do banco de dados Achei Unochapecó...');

  // 1. LIMPEZA SEGURA (opcional em ambiente dev)
  console.log('🧹 Limpando dados existentes...');
  await prisma.notification.deleteMany({});
  await prisma.handoffPin.deleteMany({});
  await prisma.claim.deleteMany({});
  await prisma.hint.deleteMany({});
  await prisma.itemLike.deleteMany({});
  await prisma.savedItem.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.campusBlock.deleteMany({});

  // 2. BLOCOS OFICIAIS DO CAMPUS
  console.log('📍 Cadastrando blocos oficiais da Unochapecó...');
  const blocksData = [
    {
      name: 'Bloco R',
      description: 'Laboratórios de Informática, Engenharias, Arquitetura e Tecnologia',
      campus: 'Campus Chapecó - Sede',
    },
    {
      name: 'Bloco G',
      description: 'Cursos da Área de Saúde, Enfermagem, Medicina e Laboratórios Biológicos',
      campus: 'Campus Chapecó - Sede',
    },
    {
      name: 'Bloco B',
      description: 'Salas de aula gerais, Ciências Humanas, Direito e Comunicação',
      campus: 'Campus Chapecó - Sede',
    },
    {
      name: 'Bloco A',
      description: 'Central de Atendimento Acadêmico, Financeiro e Registros',
      campus: 'Campus Chapecó - Sede',
    },
    {
      name: 'Biblioteca Central',
      description: 'Biblioteca Nelson Dall\'Agnol, salas de estudo coletivo e acervo físico',
      campus: 'Campus Chapecó - Sede',
    },
    {
      name: 'Cantina Central',
      description: 'Praça de alimentação central, lanchonetes e espaço de convivência',
      campus: 'Campus Chapecó - Sede',
    },
    {
      name: 'Complexo Esportivo',
      description: 'Ginásio poliesportivo, academia e quadras esportivas',
      campus: 'Campus Chapecó - Sede',
    },
    {
      name: 'Reitoria',
      description: 'Gabinete da Reitoria, Diretorias e órgãos executivos',
      campus: 'Campus Chapecó - Sede',
    },
    {
      name: 'Estacionamento Central',
      description: 'Estacionamento principal de estudantes e professores',
      campus: 'Campus Chapecó - Sede',
    },
  ];

  const blocks: Record<string, any> = {};
  for (const block of blocksData) {
    blocks[block.name] = await prisma.campusBlock.create({
      data: block,
    });
  }

  // 3. CATEGORIAS DE PERTENCES
  console.log('🏷️ Cadastrando categorias de pertences...');
  const categoriesData = [
    {
      name: 'Eletrônicos',
      slug: 'electronics',
      iconName: 'bx-devices',
    },
    {
      name: 'Documentos & Cartões',
      slug: 'documents',
      iconName: 'bx-id-card',
    },
    {
      name: 'Chaves',
      slug: 'keys',
      iconName: 'bx-key',
    },
    {
      name: 'Roupas & Vestuário',
      slug: 'clothing',
      iconName: 'bx-closet',
    },
    {
      name: 'Livros & Cadernos',
      slug: 'books',
      iconName: 'bx-book-bookmark',
    },
    {
      name: 'Óculos & Estojos',
      slug: 'glasses',
      iconName: 'bx-glasses',
    },
    {
      name: 'Garrafas & Térmicas',
      slug: 'bottles',
      iconName: 'bx-coffee',
    },
    {
      name: 'Outros',
      slug: 'other',
      iconName: 'bx-dots-horizontal-rounded',
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({
      data: cat,
    });
  }

  // 4. MEDALHAS E GAMIFICAÇÃO (BADGES)
  console.log('🏅 Cadastrando medalhas do sistema...');
  const badgesData = [
    {
      name: 'GOLD_GUARDIAN',
      title: 'Guardião de Ouro',
      description: 'Devolveu mais de 10 pertences aos legítimos donos na universidade.',
      icon: 'bx-award',
      thresholdPoints: 50,
    },
    {
      name: 'HINT_DETECTIVE',
      title: 'Detetive de Pistas',
      description: 'Enviou 5 ou mais pistas úteis que ajudaram a encontrar pertences.',
      icon: 'bx-search-alt',
      thresholdPoints: 25,
    },
    {
      name: 'CAMPUS_SHERIFF',
      title: 'Xerife do Campus',
      description: 'Entregou 5 itens sob custódia oficial na portaria ou balcão.',
      icon: 'bx-shield-quarter',
      thresholdPoints: 30,
    },
    {
      name: 'FIRST_RESCUE',
      title: 'Primeiro Resgate',
      description: 'Primeira devolução bem-sucedida confirmada pelo código PIN de 6 dígitos.',
      icon: 'bx-check-double',
      thresholdPoints: 10,
    },
    {
      name: 'HONEST_FINDER',
      title: 'Encontrador Confiável',
      description: 'Cadastrou 3 ou mais itens achados no campus com fotos nítidas.',
      icon: 'bx-heart',
      thresholdPoints: 15,
    },
  ];

  const badges: Record<string, any> = {};
  for (const b of badgesData) {
    badges[b.name] = await prisma.badge.create({
      data: b,
    });
  }

  // 5. USUÁRIOS DE TESTE
  console.log('👤 Criando usuários iniciais...');
  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  // Usuário 1: Estudante ativo
  const studentUser = await prisma.user.create({
    data: {
      name: 'Lucas da Silva',
      email: 'lucas.silva@unochapeco.edu.br',
      passwordHash: defaultPasswordHash,
      role: UserRole.STUDENT,
      academicCourse: 'Ciência da Computação',
      academicPeriod: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      banerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=400&q=80',
      isVerified: true,
      reputationScore: 45,
      frequentedBlocks: {
        connect: [{ id: blocks['Bloco R'].id }, { id: blocks['Biblioteca Central'].id }],
      },
    },
  });

  // Usuário 2: Estudante solicitante
  const claimantUser = await prisma.user.create({
    data: {
      name: 'Mariana Becker',
      email: 'mariana.becker@unochapeco.edu.br',
      passwordHash: defaultPasswordHash,
      role: UserRole.STUDENT,
      academicCourse: 'Arquitetura e Urbanismo',
      academicPeriod: 7,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      banerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&h=400&q=80',
      isVerified: true,
      reputationScore: 18,
      frequentedBlocks: {
        connect: [{ id: blocks['Bloco R'].id }, { id: blocks['Cantina Central'].id }],
      },
    },
  });

  // Usuário 3: Funcionário da Portaria / Staff
  const staffUser = await prisma.user.create({
    data: {
      name: 'Portaria Central - Bloco R',
      email: 'portaria.blocor@unochapeco.edu.br',
      passwordHash: defaultPasswordHash,
      role: UserRole.STAFF_PORTARIA,
      academicCourse: 'Segurança Patrimonial',
      academicPeriod: null,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      isVerified: true,
      reputationScore: 120,
      frequentedBlocks: {
        connect: [{ id: blocks['Bloco R'].id }],
      },
    },
  });

  // Usuário 4: Administrador
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador Achei Unochapecó',
      email: 'admin@unochapeco.edu.br',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
      academicCourse: 'DTI - Tecnologia da Informação',
      academicPeriod: null,
      isVerified: true,
      reputationScore: 500,
    },
  });

  // Conectar badges para usuários
  await prisma.userBadge.create({
    data: {
      userId: studentUser.id,
      badgeId: badges['HINT_DETECTIVE'].id,
    },
  });

  await prisma.userBadge.create({
    data: {
      userId: staffUser.id,
      badgeId: badges['CAMPUS_SHERIFF'].id,
    },
  });

  // 6. ITENS DE EXEMPLO NO FEED
  console.log('📦 Cadastrando publicações de exemplo no feed...');

  // Item 1: Perdido - Garrafa Stanley
  const itemLost = await prisma.item.create({
    data: {
      title: 'Garrafa Térmica Stanley Azul Marinho',
      description: 'Esqueci minha garrafa térmica azul marinho com adesivo do GitHub e da Unochapecó na bancada do Laboratório 04.',
      type: ItemType.LOST,
      status: ItemStatus.ACTIVE,
      categoryId: categories['bottles'].id,
      blockId: blocks['Bloco R'].id,
      specificLocation: 'Lab 04 - 2º Andar, bancada do fundo',
      photoUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
      hasReward: true,
      isUnderStaffCustody: false,
      authorId: studentUser.id,
    },
  });

  // Pista no Item 1
  await prisma.hint.create({
    data: {
      content: 'Vi uma garrafa parecida guardada no balcão de apoio da monitoria do Bloco R!',
      isHelpful: true,
      itemId: itemLost.id,
      authorId: claimantUser.id,
    },
  });

  // Item 2: Achado e sob custódia da Portaria - Molho de Chaves
  const itemFoundCustody = await prisma.item.create({
    data: {
      title: 'Molho de Chaves com Chaveiro da Unochapecó',
      description: 'Encontrado molho com 3 chaves residenciais e um chaveiro emborrachado vermelho da Unochapecó próximo às catracas.',
      type: ItemType.FOUND,
      status: ItemStatus.ACTIVE,
      categoryId: categories['keys'].id,
      blockId: blocks['Bloco R'].id,
      specificLocation: 'Catraca de entrada principal',
      photoUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
      hasReward: false,
      isUnderStaffCustody: true,
      custodyLocation: 'Guichê da Portaria do Bloco R (com vigia)',
      authorId: staffUser.id,
    },
  });

  // Claim no Item 2 com PIN de 6 dígitos gerado
  const claim = await prisma.claim.create({
    data: {
      itemId: itemFoundCustody.id,
      claimantId: claimantUser.id,
      status: ClaimStatus.APPROVED,
      secretDetails: 'Uma das chaves tem uma fita adesiva amarela e uma marca da Papaiz.',
      securityCode: '849201',
    },
  });

  // PIN de Entrega (HandoffPin) de 6 dígitos associado à Claim
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48); // Válido por 48 horas

  await prisma.handoffPin.create({
    data: {
      claimId: claim.id,
      code: '849201',
      expiresAt,
      attempts: 0,
      maxAttempts: 3,
      isUsed: false,
    },
  });

  // Item 3: Achado - Fone de Ouvido
  const itemFoundHeadphones = await prisma.item.create({
    data: {
      title: 'Estojo de Fone Sem Fio Branco (AirPods)',
      description: 'Estojo de fones de ouvido bluetooth branco encontrado sobre uma das mesas de estudo individual.',
      type: ItemType.FOUND,
      status: ItemStatus.ACTIVE,
      categoryId: categories['electronics'].id,
      blockId: blocks['Biblioteca Central'].id,
      specificLocation: 'Piso 2 - Mesa de estudo nº 14',
      photoUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
      hasReward: false,
      isUnderStaffCustody: false,
      authorId: studentUser.id,
    },
  });

  // Likes e Itens Salvos
  await prisma.itemLike.create({
    data: {
      itemId: itemLost.id,
      userId: claimantUser.id,
    },
  });

  await prisma.savedItem.create({
    data: {
      itemId: itemFoundCustody.id,
      userId: studentUser.id,
    },
  });

  // Notificação de exemplo
  await prisma.notification.create({
    data: {
      userId: claimantUser.id,
      type: NotificationType.CLAIM_REQUEST,
      title: 'Sua solicitação de retirada foi aprovada!',
      message: 'Apresente o PIN 849201 na Portaria do Bloco R para retirar o seu molho de chaves.',
      referenceId: itemFoundCustody.id,
      isRead: false,
    },
  });

  console.log('✅ Seed finalizado com sucesso!');
  console.log('----------------------------------------------------');
  console.log('🔑 Credenciais de Teste (Senha para todos: 123456):');
  console.log('- Estudante: lucas.silva@unochapeco.edu.br');
  console.log('- Estudante: mariana.becker@unochapeco.edu.br');
  console.log('- Portaria:  portaria.blocor@unochapeco.edu.br');
  console.log('- Admin:     admin@unochapeco.edu.br');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
