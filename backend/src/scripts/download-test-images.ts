import fs from 'fs';
import path from 'path';
import os from 'os';

const DESKTOP_DIR = path.join(os.homedir(), 'Desktop', 'Achei_Imagens_Teste');
const BRAIN_DIR = 'C:/Users/Joao inacio/.gemini/antigravity-cli/brain/a2486604-4e18-4fd7-972b-c587f2af4f48';

const ITEMS = [
  { name: '01_garrafa_termica_stanley.jpg', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' },
  { name: '02_fone_ouvido_bluetooth.jpg', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { name: '03_mochila_notebook.jpg', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { name: '04_molho_chaves_chaveiro.jpg', url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80' },
  { name: '05_caderno_universitario.jpg', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
  { name: '06_calculadora_cientifica.jpg', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80' },
  { name: '07_oculos_de_grau.jpg', url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80' },
  { name: '08_casaco_moletom.jpg', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80' },
  { name: '09_guarda_chuva.jpg', url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80' },
  { name: '10_estojo_canetas.jpg', url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80' },
];

const USERS = [
  { name: '01_avatar_lucas_silva.jpg', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: '02_avatar_mariana_becker.jpg', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: '03_avatar_guilherme_santos.jpg', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: '04_avatar_beatriz_lima.jpg', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: '05_avatar_rafael_costa.jpg', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: '06_avatar_camila_alves.jpg', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: '07_avatar_felipe_oliveira.jpg', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: '08_avatar_juliana_rocha.jpg', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: '09_avatar_rodrigo_mendes.jpg', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&h=400&q=80' },
  { name: '10_avatar_patricia_souza.jpg', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80' },
];

const BANNERS = [
  { name: '01_banner_campus_central.jpg', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&h=400&q=80' },
  { name: '02_banner_biblioteca_estudo.jpg', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&h=400&q=80' },
  { name: '03_banner_laboratorio_computacao.jpg', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&h=400&q=80' },
  { name: '04_banner_estudantes_convivencia.jpg', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&h=400&q=80' },
  { name: '05_banner_auditorio_evento.jpg', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&h=400&q=80' },
  { name: '06_banner_graduacao_futuro.jpg', url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&h=400&q=80' },
  { name: '07_banner_estacionamento_campus.jpg', url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&h=400&q=80' },
  { name: '08_banner_bloco_arquitetura.jpg', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=400&q=80' },
  { name: '09_banner_cantina_intervalo.jpg', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=400&q=80' },
  { name: '10_banner_gradiente_oficial.jpg', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=400&q=80' },
];

const BRANDS = [
  { name: '01_brand_identity_final.jpg', src: path.join(BRAIN_DIR, 'brand_identity_final_1790194706362.jpg') },
  { name: '02_unochapeco_brand_board.jpg', src: path.join(BRAIN_DIR, 'unochapeco_brand_board_1790194004446.jpg') },
  { name: '03_brand_identity_refined.jpg', src: path.join(BRAIN_DIR, 'brand_identity_refined_1790194476691.jpg') },
  { name: '04_brand_identity_board.jpg', src: path.join(BRAIN_DIR, 'brand_identity_board_1790193690239.jpg') },
  { name: '05_feed_principal_desktop.jpg', src: path.join(BRAIN_DIR, 'feed_principal_desktop_1790176681563.jpg') },
  { name: '06_feed_principal_mobile.jpg', src: path.join(BRAIN_DIR, 'feed_principal_mobile_1790176467264.jpg') },
  { name: '07_feed_typo_jakarta.jpg', src: path.join(BRAIN_DIR, 'feed_typo_jakarta_1790194270017.jpg') },
  { name: '08_feed_typo_dmsans.jpg', src: path.join(BRAIN_DIR, 'feed_typo_dmsans_1790194301840.jpg') },
  { name: '09_feed_typo_inter.jpg', src: path.join(BRAIN_DIR, 'feed_typo_inter_1790194239328.jpg') },
  { name: '10_achei_unochapeco_hero.jpg', src: path.join(BRAIN_DIR, 'brand_identity_final_1790194706362.jpg') },
];

async function downloadFile(url: string, dest: string): Promise<number> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha no download (${res.status}): ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(dest, buffer);
  return buffer.length;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  console.log('🚀 Criando estrutura de imagens de teste na Área de Trabalho...');
  console.log(`📁 Destino: ${DESKTOP_DIR}\n`);

  const folders = {
    items: path.join(DESKTOP_DIR, 'items'),
    users: path.join(DESKTOP_DIR, 'users'),
    banners: path.join(DESKTOP_DIR, 'banners'),
    brands: path.join(DESKTOP_DIR, 'brands'),
  };

  for (const dir of Object.values(folders)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 1. ITEMS
  console.log('📦 Baixando 10 imagens para [items]...');
  for (const item of ITEMS) {
    const dest = path.join(folders.items, item.name);
    try {
      const size = await downloadFile(item.url, dest);
      console.log(`   ✅ [items] ${item.name} (${formatBytes(size)})`);
    } catch (err: any) {
      console.error(`   ❌ [items] Erro ao baixar ${item.name}:`, err.message);
    }
  }

  // 2. USERS
  console.log('\n👤 Baixando 10 imagens para [users]...');
  for (const user of USERS) {
    const dest = path.join(folders.users, user.name);
    try {
      const size = await downloadFile(user.url, dest);
      console.log(`   ✅ [users] ${user.name} (${formatBytes(size)})`);
    } catch (err: any) {
      console.error(`   ❌ [users] Erro ao baixar ${user.name}:`, err.message);
    }
  }

  // 3. BANNERS
  console.log('\n🚩 Baixando 10 imagens para [banners]...');
  for (const banner of BANNERS) {
    const dest = path.join(folders.banners, banner.name);
    try {
      const size = await downloadFile(banner.url, dest);
      console.log(`   ✅ [banners] ${banner.name} (${formatBytes(size)})`);
    } catch (err: any) {
      console.error(`   ❌ [banners] Erro ao baixar ${banner.name}:`, err.message);
    }
  }

  // 4. BRANDS
  console.log('\n🎨 Copiando 10 imagens de Marca para [brands]...');
  for (const brand of BRANDS) {
    const dest = path.join(folders.brands, brand.name);
    try {
      if (fs.existsSync(brand.src)) {
        fs.copyFileSync(brand.src, dest);
        const stats = fs.statSync(dest);
        console.log(`   ✅ [brands] ${brand.name} (${formatBytes(stats.size)})`);
      } else {
        console.warn(`   ⚠️ [brands] Imagem fonte não encontrada: ${brand.src}`);
      }
    } catch (err: any) {
      console.error(`   ❌ [brands] Erro ao copiar ${brand.name}:`, err.message);
    }
  }

  console.log('\n✨ Todas as 40 imagens foram criadas na Área de Trabalho com sucesso!');
}

main().catch((err) => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
