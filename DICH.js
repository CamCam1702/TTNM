import React, { useState, useRef } from 'react';
import { Camera, Globe, Volume2, RefreshCw } from 'lucide-react';

const SignLanguageTranslationApp = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('ASL');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Simulated translation function
  const simulateTranslation = () => {
    const possibleTranslations = [
      'Xin chào', 
      'Tôi khỏe', 
      'Cảm ơn bạn', 
      'Rất vui được gặp bạn',
      'Tôi cần giúp đỡ'
    ];
    return possibleTranslations[Math.floor(Math.random() * possibleTranslations.length)];
  };

  const handleToggleTranslation = () => {
    setIsTranslating(!isTranslating);
    if (!isTranslating) {
      // Simulate real-time translation
      const translationInterval = setInterval(() => {
        const newTranslation = simulateTranslation();
        setTranslatedText(newTranslation);
      }, 2000);

      // Clean up interval when stopping
      return () => clearInterval(translationInterval);
    }
  };

  const handleLanguageChange = () => {
    const languages = ['ASL', 'BSL', 'Vietnamese Sign Language'];
    const currentIndex = languages.indexOf(detectedLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setDetectedLanguage(languages[nextIndex]);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Dịch Ngôn Ngữ Ký Hiệu
          </h1>
          <div className="flex space-x-2">
            <button 
              onClick={handleLanguageChange}
              className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200"
            >
              <Globe size={20} />
            </button>
            <div className="bg-blue-100 text-blue-600 px-3 py-2 rounded-full">
              {detectedLanguage}
            </div>
          </div>
        </div>

        {/* Main Translation Area */}
        <div className="grid grid-cols-2 gap-6">
          {/* Camera Section */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="w-full h-80 bg-gray-200 rounded-md mb-4 flex items-center justify-center relative">
              {isTranslating ? (
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover rounded-md"
                  autoPlay 
                  placeholder="Đang nhận diện"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4" />
                  <p>Nhấn nút để bắt đầu dịch</p>
                </div>
              )}
              
              {/* Translation Status Indicator */}
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${isTranslating ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            
            {/* Translation Control Button */}
            <button 
              onClick={handleToggleTranslation}
              className={`w-full py-3 rounded-lg text-white font-bold transition-colors ${
                isTranslating 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isTranslating ? 'Dừng Dịch' : 'Bắt Đầu Dịch'}
            </button>
          </div>

          {/* Translation Result Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="bg-white rounded-lg h-80 p-4 shadow-inner mb-4 flex items-center justify-center">
              {translatedText ? (
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-700">{translatedText}</p>
                </div>
              ) : (
                <p className="text-gray-500">Kết quả dịch sẽ hiển thị ở đây</p>
              )}
            </div>
            
            {/* Additional Translation Options */}
            <div className="flex space-x-2">
              <button 
                disabled={!translatedText}
                className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 disabled:opacity-50"
              >
                <Volume2 size={20} />
              </button>
              <button 
                onClick={() => setTranslatedText('')}
                className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="text-center text-xs text-gray-500 mt-4">
          Dữ liệu của bạn được xử lý riêng tư và an toàn
        </div>
      </div>
    </div>
  );
};

export default SignLanguageTranslationApp;