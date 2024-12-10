import React, { useState, useRef } from 'react';
import { Camera, Star, CheckCircle } from 'lucide-react';

const SignLanguageLearningApp = () => {
  const [currentWord, setCurrentWord] = useState('Hello');
  const [score, setScore] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleCapture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/png');
      setCapturedImage(imageDataUrl);
      
      // Simulated sign recognition logic
      const isCorrectSign = Math.random() > 0.5;
      handleSignRecognition(isCorrectSign);
    }
  };

  const handleSignRecognition = (isCorrect) => {
    if (isCorrect) {
      setScore(prev => prev + 10);
      setWordsLearned(prev => prev + 1);
      setFeedback('Chính xác! Tuyệt vời!');
      setCurrentWord('Thank You');
    } else {
      setFeedback('Hãy thử lại. Xem hướng dẫn bên dưới.');
    }
  };

  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
        {/* Header with Score */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Star className="text-yellow-400" />
            <span className="font-bold text-lg">{score} Điểm</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" />
            <span>{wordsLearned} Từ Đã Học</span>
          </div>
        </div>

        {/* Current Word Section */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Học Ký Hiệu: {currentWord}
          </h2>
          {feedback && (
            <div className={`mb-4 p-2 rounded ${feedback.includes('Chính xác') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {feedback}
            </div>
          )}
        </div>

        {/* Main Learning Area */}
        <div className="grid grid-cols-2 gap-6">
          {/* Video/Image Guide Section */}
          <div className="bg-blue-100 rounded-lg p-4 flex items-center justify-center">
            <div className="w-full h-64 bg-blue-200 rounded-md flex items-center justify-center text-blue-600">
              Video Hướng Dẫn
            </div>
          </div>

          {/* Camera Recognition Section */}
          <div className="bg-gray-100 rounded-lg p-4">
            <video 
              ref={videoRef} 
              className="w-full h-64 bg-gray-200 rounded-md mb-4"
              autoPlay 
              placeHolder="Bật camera"
            />
            <canvas 
              ref={canvasRef} 
              className="hidden" 
            />
            
            {/* Capture Button */}
            <button 
              onClick={handleCapture}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Chụp Ký Hiệu
            </button>

            {/* Captured Image Preview */}
            {capturedImage && (
              <div className="mt-4">
                <img 
                  src={capturedImage} 
                  alt="Captured Sign" 
                  className="w-full rounded-md"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignLanguageLearningApp;