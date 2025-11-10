import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, RefreshCw } from 'lucide-react';

// 型定義
interface AnimalTraits {
  personality: string;
  likes: string;
  dislikes: string;
  charm: string;
}

interface AnimalResult {
  animal: string;
  similarity: number;
  traits: AnimalTraits;
}

const AnimalMatcher: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnimalResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // 最大サイズを1920pxに制限
          const maxSize = 1920;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // JPEG形式で圧縮（品質0.8）
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file);
        setImage(compressedImage);
        setResult(null);
      } catch (error) {
        console.error('画像の圧縮に失敗しました:', error);
        alert('画像の読み込みに失敗しました');
      }
    }
  };

  const analyzeImage = async (): Promise<void> => {
    if (!image) return;
    
    setAnalyzing(true);
    
    try {

      // プロキシサーバー経由でAPI呼び出し
      const base64Image = image.split(',')[1];
      
      // 本番環境では /api/analyze、開発環境では localhost:3001
      const apiUrl = import.meta.env.PROD 
        ? '/api/analyze' 
        : 'http://localhost:3001/api/analyze';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Image
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`エラーが発生しました: ${errorData.error || 'サーバーエラー'}`);
        setAnalyzing(false);
        return;
      }

      const data: any = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      if (!data.content || !data.content[0]) {
        console.error('Invalid response format:', data);
        alert(`APIからの応答が不正です: ${JSON.stringify(data)}`);
        setAnalyzing(false);
        return;
      }
      
      const text = data.content[0].text;
      
      // JSONを抽出
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: AnimalResult = JSON.parse(jsonMatch[0]);
        setResult(parsed);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
    
    setAnalyzing(false);
  };

  const reset = (): void => {
    setImage(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8" />
            動物顔診断
            <Sparkles className="w-8 h-8" />
          </h1>
          <p className="text-white/90 text-lg">あなたに似ている動物を見つけよう！</p>
        </div>



        {/* メインコンテンツ */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          {!image ? (
            <div className="space-y-4">
              <div className="border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-400 transition-colors">
                <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-6">顔写真をアップロードしてください</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors font-semibold shadow-lg"
                  >
                    <Camera className="w-5 h-5" />
                    カメラで撮影
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition-colors font-semibold shadow-lg"
                  >
                    <Upload className="w-5 h-5" />
                    ファイルを選択
                  </button>
                </div>
                
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* アップロードされた画像 */}
              <div className="relative">
                <img
                  src={image}
                  alt="Uploaded"
                  className="w-full max-h-96 object-contain rounded-2xl"
                />
              </div>

              {/* 分析ボタン */}
              {!result && (
                <button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      動物診断スタート！
                    </>
                  )}
                </button>
              )}

              {/* 結果表示 */}
              {result && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-2">{result.animal.split(' ')[0]}</div>
                      <h2 className="text-3xl font-bold text-purple-800 mb-2">
                        {result.animal.split(' ')[1] || result.animal}
                      </h2>
                      <div className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        類似度 {result.similarity}%
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white rounded-xl p-4">
                        <h3 className="font-bold text-purple-800 mb-2">🌟 性格</h3>
                        <p className="text-gray-700">{result.traits.personality}</p>
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <h3 className="font-bold text-purple-800 mb-2">❤️ 好きなこと</h3>
                        <p className="text-gray-700">{result.traits.likes}</p>
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <h3 className="font-bold text-purple-800 mb-2">💔 苦手なこと</h3>
                        <p className="text-gray-700">{result.traits.dislikes}</p>
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <h3 className="font-bold text-purple-800 mb-2">✨ あなたの魅力</h3>
                        <p className="text-gray-700">{result.traits.charm}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={reset}
                    className="w-full bg-gray-600 text-white py-3 rounded-full font-semibold hover:bg-gray-700 transition-colors"
                  >
                    もう一度診断する
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="text-center mt-8 text-white/80 text-sm">
          <p>© 2025 動物顔診断 - Powered by Claude AI</p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AnimalMatcher;