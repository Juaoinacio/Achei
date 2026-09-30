import 'dotenv/config';
import { prisma } from '../src/config/prisma';

export const initialBadges = [
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

export async function seedBadges() {
  console.log('🏅 Populando medalhas e insígnias do sistema...');

  for (const b of initialBadges) {
    const record = await prisma.badge.upsert({
      where: { name: b.name },
      update: {
        title: b.title,
        description: b.description,
        icon: b.icon,
        thresholdPoints: b.thresholdPoints,
      },
      create: b,
    });
    console.log(`  ✓ Medalha: ${record.title} (${record.thresholdPoints} pts)`);
  }

  console.log(`✅ ${initialBadges.length} insígnias cadastradas com sucesso!`);
}

if (require.main === module) {
  seedBadges()
    .catch((e) => {
      console.error('❌ Erro no seed de medalhas:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
