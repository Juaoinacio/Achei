import { app } from '../server';
import http from 'http';

async function testEndpoint() {
  console.log('🧪 Iniciando teste do endpoint POST /api/upload...');
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(3338, () => {
      console.log('📡 Servidor de teste temporário iniciado na porta 3338');
      resolve();
    });
  });

  try {
    // Cria um buffer simulando um arquivo de imagem PNG de 1x1 pixel
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82
    ]);

    const blob = new Blob([pngHeader], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, 'teste_unitario.png');
    formData.append('folder', 'items');

    const res = await fetch('http://localhost:3338/api/upload', {
      method: 'POST',
      body: formData,
    });

    const status = res.status;
    const data = await res.json();

    console.log(`📥 Resposta HTTP: ${status}`);
    console.log('📄 Dados retornados:', data);

    if (status === 201 && data.url && data.url.includes('cloudinary.com')) {
      console.log('✅ Endpoint POST /api/upload validado com sucesso com Cloudinary!');
    } else {
      console.error('❌ Falha na validação do upload:', data);
      process.exitCode = 1;
    }
  } catch (err: any) {
    console.error('❌ Erro durante o teste do endpoint:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    console.log('🛑 Servidor de teste encerrado.');
  }
}

testEndpoint();
