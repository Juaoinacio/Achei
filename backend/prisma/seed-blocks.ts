import 'dotenv/config';
import { prisma } from '../src/config/prisma';

export const initialBlocks = [
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
    name: 'Bloco C',
    description: 'Cursos de Pós-Graduação, Pesquisa, Mestrados e Auditório Nobre',
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
    name: 'Pollen Parque Tecnológico',
    description: 'Centro de Inovação, Incubadora de Empresas e Coworking Tecnológico',
    campus: 'Campus Chapecó - Sede',
  },
];

export async function seedBlocks() {
  console.log('📍 Populando os 10 blocos oficiais da Unochapecó...');

  for (const block of initialBlocks) {
    const record = await prisma.campusBlock.upsert({
      where: { name: block.name },
      update: {
        description: block.description,
        campus: block.campus,
      },
      create: block,
    });
    console.log(`  ✓ Bloco cadastrado: ${record.name} - ${record.description}`);
  }

  console.log(`✅ ${initialBlocks.length} blocos oficiais cadastrados com sucesso!`);
}

// Execução direta via terminal: npx tsx prisma/seed-blocks.ts
if (require.main === module) {
  seedBlocks()
    .catch((e) => {
      console.error('❌ Erro no seed de blocos:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
