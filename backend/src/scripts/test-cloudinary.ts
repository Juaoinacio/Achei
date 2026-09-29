import dotenv from 'dotenv';
import path from 'path';
import { CloudinaryService } from '../services/cloudinary.service';
import { CLOUDINARY_FOLDERS, cloudinary } from '../config/cloudinary';

dotenv.config();

async function main() {
  console.log('☁️  Iniciando teste de integração com o Cloudinary...');
  console.log(`📡 Cloud Name configurado: "${process.env.CLOUDINARY_CLOUD_NAME}"`);

  // 1. Testar Ping / Conexão
  try {
    const pingRes = await cloudinary.api.ping();
    console.log('✅ Conexão com Cloudinary bem-sucedida! Status:', pingRes.status);
  } catch (err: any) {
    console.error('❌ Erro de autenticação/conexão com o Cloudinary:', err.message);
    process.exit(1);
  }

  // 2. Criar Estrutura de Pastas Oficial do Projeto Achei
  console.log('\n📁 Criando e verificando pastas dentro do Cloudinary:');
  const folderResults = await CloudinaryService.createAcheiFolders();
  for (const res of folderResults) {
    console.log(`   📂 Pasta: [${res.folder}] -> ${res.success ? 'OK / Criada' : 'Falha'}`);
  }

  // 3. Upload de Imagens de Teste para Cada Pasta

  // A. Imagens de Brands (Marcas do projeto)
  console.log('\n🎨 1. Enviando imagens de Marca para [achei/brands]...');
  const brandImg1 = 'C:/Users/Joao inacio/.gemini/antigravity-cli/brain/a2486604-4e18-4fd7-972b-c587f2af4f48/brand_identity_final_1790194706362.jpg';
  const brandImg2 = 'C:/Users/Joao inacio/.gemini/antigravity-cli/brain/a2486604-4e18-4fd7-972b-c587f2af4f48/unochapeco_brand_board_1790194004446.jpg';

  try {
    const resBrand1 = await CloudinaryService.uploadImage(brandImg1, CLOUDINARY_FOLDERS.BRANDS, 'brand_identity_final');
    console.log(`   ✅ Brand 1 enviada: ${resBrand1.secure_url}`);

    const resBrand2 = await CloudinaryService.uploadImage(brandImg2, CLOUDINARY_FOLDERS.BRANDS, 'unochapeco_brand_board');
    console.log(`   ✅ Brand 2 enviada: ${resBrand2.secure_url}`);
  } catch (err: any) {
    console.warn('   ⚠️ Aviso ao subir imagens locais de brand:', err.message);
  }

  // B. Imagens de Itens Perdidos / Achados
  console.log('\n📦 2. Enviando imagens de teste para [achei/items]...');
  try {
    const itemImgUrl = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80';
    const resItem = await CloudinaryService.uploadImage(itemImgUrl, CLOUDINARY_FOLDERS.ITEMS, 'garrafa_stanley_teste');
    console.log(`   ✅ Item enviado: ${resItem.secure_url}`);
  } catch (err: any) {
    console.error('   ❌ Erro ao subir item de teste:', err.message);
  }

  // C. Imagens de Usuários (Avatares)
  console.log('\n👤 3. Enviando imagens de teste para [achei/users]...');
  try {
    const userImgUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
    const resUser = await CloudinaryService.uploadImage(userImgUrl, CLOUDINARY_FOLDERS.USERS, 'lucas_silva_avatar');
    console.log(`   ✅ Usuário enviado: ${resUser.secure_url}`);
  } catch (err: any) {
    console.error('   ❌ Erro ao subir usuário de teste:', err.message);
  }

  // D. Imagens de Banners
  console.log('\n🚩 4. Enviando banner de teste para [achei/banners]...');
  try {
    const bannerImgUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=400&q=80';
    const resBanner = await CloudinaryService.uploadImage(bannerImgUrl, CLOUDINARY_FOLDERS.BANNERS, 'banner_perfil_default');
    console.log(`   ✅ Banner enviado: ${resBanner.secure_url}`);
  } catch (err: any) {
    console.error('   ❌ Erro ao subir banner de teste:', err.message);
  }

  // 4. Listar Conteúdo da Pasta achei
  console.log('\n🔍 Verificando estrutura de subpastas criadas em "achei":');
  try {
    const subfolders = await cloudinary.api.sub_folders('achei');
    console.log('   Subpastas confirmadas no Cloudinary:', subfolders.folders.map((f: any) => f.name).join(', '));
  } catch (err: any) {
    console.log('   Nota sobre subpastas:', err.message);
  }

  console.log('\n🎉 Teste do Cloudinary finalizado com sucesso!');
}

main().catch((err) => {
  console.error('Erro na execução do teste:', err);
  process.exit(1);
});
