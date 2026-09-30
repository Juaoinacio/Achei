import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma';
import { UserRole } from '@prisma/client';

export async function seedAdmin() {
  console.log('⚡ Iniciando seed do usuário Administrador...');

  const email = 'admin.uno@unochapeco.edu.br';
  const plainPassword = 'barata123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      isVerified: true,
    },
    create: {
      name: 'Administrador Unochapecó',
      email,
      passwordHash,
      role: UserRole.ADMIN,
      academicCourse: 'DTI - Tecnologia da Informação',
      academicPeriod: null,
      isVerified: true,
      reputationScore: 500,
    },
  });

  console.log('✅ Usuário Administrador pronto para uso:');
  console.log('--------------------------------------------------');
  console.log(`🆔 ID:      ${admin.id}`);
  console.log(`👤 Nome:    ${admin.name}`);
  console.log(`📧 E-mail:  ${admin.email}`);
  console.log(`🔑 Senha:   ${plainPassword}`);
  console.log(`🛡️ Papel:   ${admin.role}`);
  console.log('--------------------------------------------------');
  return admin;
}

if (require.main === module) {
  seedAdmin()
    .catch((e) => {
      console.error('❌ Erro ao criar usuário admin:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
