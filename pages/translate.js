import { useEffect, useRef, useState } from 'react';
import service from '../services/service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPaper } from '@fortawesome/free-solid-svg-icons';
import { Camera, Globe, Volume2, RefreshCw } from 'lucide-react';
const maxVideoSize = 224;
const LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '_NOTHING',
  '_SPACE',
];
const THRESHOLD = 5;

const THRESHOLDS = {
  S: 3,
  E: 5,
  A: 5,
  N: 6,
  R: 5,
};
/**
 * What we're going to render is:
 *
 * 1. A video component so the user can see what's on the camera.
 *
 * 2. A button to generate an image of the video, load OpenCV and
 * process the image.
 *
 * 3. A canvas to allow us to capture the image of the video and
 * show it to the user.
 */
export default function Page() {
  const videoElement = useRef(null);
  const canvasEl = useRef(null);
  const outputCanvasEl = useRef(null);
  let [letter, setLetter] = useState(null);
  let [loading, setLoading] = useState(true);
  let [fps, setFps] = useState(0);
  let [words, setWords] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  /**
   * In the onClick event we'll capture a frame within
   * the video to pass it to our service.
   */
  const handleSpeech = () => {
    speechSynthesis.speak(new SpeechSynthesisUtterance(words));
  }
  async function processImage() {
    if (
      videoElement !== null &&
      canvasEl !== null &&
      typeof videoElement.current !== 'undefined' &&
      videoElement.current !== null
    ) {
      let frames = 0;
      let start = Date.now();
      let prevLetter = '';
      let count = 0;
      let _words = '';

      const processWord = () => {
        let wordsSplit = _words.split(' ');
        fetch(`/api/autocorrect?word=${wordsSplit[wordsSplit.length - 1]}`)
          .then((res) => res.json())
          .then((json) => {
            const correctedWord = json['correctedWord'];
            speechSynthesis.speak(new SpeechSynthesisUtterance(correctedWord));
            wordsSplit.pop();
            _words =
              wordsSplit.join(' ') + ' ' + correctedWord.toUpperCase() + ' ';
            setWords(
              wordsSplit.join(' ') + ' ' + correctedWord.toUpperCase() + ' '
            );
          });
      };

      videoElement.current.addEventListener('ended', () => processWord());

      while (isTranslating && canvasEl.current) {
        const ctx = canvasEl.current.getContext('2d');
        ctx.drawImage(videoElement.current, 0, 0, maxVideoSize, maxVideoSize);
        const image = ctx.getImageData(0, 0, maxVideoSize, maxVideoSize);
        // Processing image
        const processedImage = await service.imageProcessing(image);
        // Render the processed image to the canvas
        const ctxOutput = outputCanvasEl.current.getContext('2d');
        ctxOutput.putImageData(processedImage.data.payload, 0, 0);

        const prediction = await service.predict(processedImage.data.payload);

        const predictedLetter = prediction.data.payload;
        const letterValue = LETTERS[predictedLetter];

        setLetter(letterValue);
        if (letterValue !== prevLetter) {
          if (
            !THRESHOLDS[prevLetter]
              ? count > THRESHOLD
              : count > THRESHOLDS[prevLetter]
          ) {
            if (prevLetter === '_SPACE') processWord();
            else {
              _words = _words + (prevLetter === '_NOTHING' ? '' : prevLetter);
              setWords(
                (state, props) =>
                  state + (prevLetter === '_NOTHING' ? '' : prevLetter)
              );
            }
          }
          count = 0;
        } else {
          count++;
        }
        prevLetter = letterValue;
        frames++;
        if (frames === 10) {
          setFps(10 / ((Date.now() - start) / 1000));
          frames = 0;
          start = Date.now();
        }
      }
    }
  }

  /**
   * In the useEffect hook we'll load the video
   * element to show what's on camera.
   */
  useEffect(() => {
    async function initCamera() {
      if(videoElement.current == null){
        return;
      }
      videoElement.current.width = maxVideoSize;
      videoElement.current.height = maxVideoSize;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'environment',
            width: maxVideoSize,
            height: maxVideoSize,
          },
        });
        videoElement.current.srcObject = stream;

        return new Promise((resolve) => {
          videoElement.current.onloadedmetadata = () => {
            resolve(videoElement.current);
          };
        });
      }
      const errorMessage =
        'This browser does not support video capture, or this device does not have a camera';
      alert(errorMessage);
      return Promise.reject(errorMessage);
    }

    async function load() {
      const videoLoaded = await initCamera();
      if(videoLoaded == null){
        return;
      }
      await service.load();
      videoLoaded.play();
      setTimeout(processImage, 0);
      setLoading(false);
      return videoLoaded;
    }

    if (isTranslating){
      load();
    }
  }, [isTranslating]);

  return (
    <>
    
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Dịch Ngôn Ngữ Ký Hiệu
          </h1>
          <div className="flex space-x-2">
            <button 
            //   onClick={handleLanguageChange}
              className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200"
            >
              <Globe size={20} />
            </button>
            <div className="bg-blue-100 text-blue-600 px-3 py-2 rounded-full">
              {/* {detectedLanguage} */}
            </div>
          </div>
        </div>

        {/* Main Translation Area */}
        <div className="grid grid-cols-2 gap-6">
          {/* Camera Section */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="w-full h-80 bg-gray-200 rounded-md mb-4 flex items-center justify-center relative">
              {isTranslating ? (
                <div style={{ display: loading ? 'none' : 'block' }}>
                    <div className="row justify-content-center">
                    <div className="col-xs-12 text-center">
                        <video className="video w-full h-full object-cover rounded-md" playsInline ref={videoElement} />
                    </div>
                    <canvas
                        style={{ display: 'none' }}
                        ref={canvasEl}
                        width={maxVideoSize}
                        height={maxVideoSize}
                    ></canvas>
                    <canvas
                        className="col-xs-12"
                        style={{ display: 'none' }}
                        ref={outputCanvasEl}
                        width={maxVideoSize}
                        height={maxVideoSize}
                    ></canvas>
                    </div>
                </div>
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
            //   onClick={handleToggleTranslation}
              onClick={() => setIsTranslating(!isTranslating)}
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
              {words ? (
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-700">{words}</p>
                </div>
              ) : (
                <p className="text-gray-500">Kết quả dịch sẽ hiển thị ở đây</p>
              )}
            </div>
            
            {/* Additional Translation Options */}
            <div className="flex space-x-2">
              <button 
                disabled={!words}
                className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 disabled:opacity-50"
                onClick={() => handleSpeech()}
              >
                <Volume2 size={20}
                />
              </button>
              <button 
                onClick={() => setWords('')}
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
    
    </>
  );
}
