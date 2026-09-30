import 'dotenv/config';
import { prisma } from '../src/config/prisma';
import { seedCourses } from './seed-courses';
import { seedBlocks } from './seed-blocks';
import { seedCategories } from './seed-categories';
import { seedBadges } from './seed-badges';
import { seedAdmin } from './seed-admin';

async function main() {
  console.log('====================================================');
  console.log('🎓 SEED MESTRE: ECOSSISTEMA ACHEI UNOCHAPECÓ');
  console.log('====================================================');

  const startTime = Date.now();

  try {
    // 1. Cursos Acadêmicos Oficiais da Unochapecó
    console.log('\n[1/5] Cursos Acadêmicos:');
    await seedCourses();

    // 2. Blocos Oficiais do Campus Chapecó (10 Blocos)
    console.log('\n[2/5] Blocos do Campus:');
    await seedBlocks();

    // 3. Categorias Oficiais de Pertences
    console.log('\n[3/5] Categorias de Pertences:');
    await seedCategories();

    // 4. Medalhas e Gamificação (Badges)
    console.log('\n[4/5] Medalhas & Gamificação:');
    await seedBadges();

    // 5. Usuário Administrador do Sistema (admin.uno@unochapeco.edu.br)
    console.log('\n[5/5] Administrador Geral:');
    await seedAdmin();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n====================================================');
    console.log(`✨ SEED CONCLUÍDO COM SUCESSO EM ${elapsed}s!`);
    console.log('Toda a base institucional da Unochapecó está pronta.');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ Erro durante a execução do seed mestre:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
