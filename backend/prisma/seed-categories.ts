import 'dotenv/config';
import { prisma } from '../src/config/prisma';

export const initialCategories = [
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

export async function seedCategories() {
  console.log('🏷️ Populando categorias oficiais de pertences...');

  for (const cat of initialCategories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        iconName: cat.iconName,
      },
      create: cat,
    });
    console.log(`  ✓ Categoria: ${record.name} (${record.slug})`);
  }

  console.log(`✅ ${initialCategories.length} categorias cadastradas com sucesso!`);
}

if (require.main === module) {
  seedCategories()
    .catch((e) => {
      console.error('❌ Erro no seed de categorias:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
