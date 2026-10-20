import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma';
import { UserRole } from '@prisma/client';

export const initialStudents = [
  {
    name: 'Lucas Silveira',
    email: 'lucas.silveira@unochapeco.edu.br',
    academicCourse: 'Ciência da Computação',
    academicPeriod: 6,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    banerUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    reputationScore: 45,
  },
  {
    name: 'Beatriz Zanin',
    email: 'beatriz.zanin@unochapeco.edu.br',
    academicCourse: 'Medicina',
    academicPeriod: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    banerUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    reputationScore: 32,
  },
  {
    name: 'Gabriel Santos',
    email: 'gabriel.santos@unochapeco.edu.br',
    academicCourse: 'Direito',
    academicPeriod: 8,
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    banerUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    reputationScore: 20,
  },
];

export async function seedStudents() {
  console.log('🎒 Populando 3 estudantes oficiais da Unochapecó...');

  const defaultPassword = 'barata123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  for (const student of initialStudents) {
    const record = await prisma.user.upsert({
      where: { email: student.email },
      update: {
        name: student.name,
        academicCourse: student.academicCourse,
        academicPeriod: student.academicPeriod,
        avatarUrl: student.avatarUrl,
        banerUrl: student.banerUrl,
        reputationScore: student.reputationScore,
        role: UserRole.STUDENT,
        isVerified: true,
      },
      create: {
        name: student.name,
        email: student.email,
        passwordHash,
        academicCourse: student.academicCourse,
        academicPeriod: student.academicPeriod,
        avatarUrl: student.avatarUrl,
        banerUrl: student.banerUrl,
        reputationScore: student.reputationScore,
        role: UserRole.STUDENT,
        isVerified: true,
      },
    });

    console.log(`  ✓ Estudante: ${record.name} (${record.academicCourse}) - ${record.reputationScore} Unopoints`);
  }

  console.log(`✅ ${initialStudents.length} estudantes cadastrados com sucesso! (Senha padrão: ${defaultPassword})`);
}

if (require.main === module) {
  seedStudents()
    .catch((e) => {
      console.error('❌ Erro no seed de estudantes:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
