import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/analyze', async (req, res) => {
  try {
    console.log('リクエストを受信しました');
    const { image } = req.body;
    const apiKey = process.env.VITE_CLAUDE_API_KEY;

    console.log('APIキー:', apiKey ? 'あり' : 'なし');

    if (!apiKey) {
      console.error('APIキーが設定されていません');
      return res.status(500).json({ error: 'APIキーが設定されていません' });
    }

    console.log('Claude APIにリクエスト送信中...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: image
              }
            },
            {
              type: 'text',
              text: `この顔写真を分析して、最も似ている動物を1つ選んでください。
                
以下のJSON形式で回答してください（JSONのみ、他の説明は不要）:
{
  "animal": "動物名（絵文字付き）",
  "similarity": 85,
  "traits": {
    "personality": "性格の説明",
    "likes": "好きなもの",
    "dislikes": "苦手なもの",
    "charm": "魅力ポイント"
  }
}

動物の候補: パンダ🐼、キツネ🦊、猫🐱、犬🐕、ライオン🦁、うさぎ🐰、コアラ🐨、ハムスター🐹、フクロウ🦉、ペンギン🐧など`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', response.status, errorText);
      return res.status(response.status).json({ error: `Claude API Error: ${errorText}` });
    }

    const data = await response.json();
    console.log('Claude APIからレスポンスを受信しました');
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: `APIリクエストに失敗しました: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`プロキシサーバーがポート${PORT}で起動しました`);
});
