import 'dotenv/config';
import { prisma } from '../src/config/prisma';

export const initialCourses = [
  { name: 'Ciência da Computação', department: 'Ciências Exatas e Ambientais' },
  { name: 'Sistemas de Informação', department: 'Ciências Exatas e Ambientais' },
  { name: 'Medicina', department: 'Ciências da Saúde' },
  { name: 'Enfermagem', department: 'Ciências da Saúde' },
  { name: 'Direito', department: 'Ciências Humanas e Jurídicas' },
  { name: 'Engenharia Civil', department: 'Ciências Exatas e Ambientais' },
  { name: 'Arquitetura e Urbanismo', department: 'Ciências Exatas e Ambientais' },
  { name: 'Administração', department: 'Ciências Sociais Aplicadas' },
  { name: 'Psicologia', department: 'Ciências Humanas e Jurídicas' },
];

async function main() {
  console.log('🌱 Populando cursos acadêmicos oficiais da Unochapecó...');

  for (const course of initialCourses) {
    const record = await prisma.course.upsert({
      where: { name: course.name },
      update: { department: course.department },
      create: {
        name: course.name,
        department: course.department,
      },
    });
    console.log(`  ✓ Curso cadastrado: ${record.name} (${record.department})`);
  }

  console.log(`✅ ${initialCourses.length} cursos cadastrados com sucesso!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed de cursos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
