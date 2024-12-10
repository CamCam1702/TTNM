import { useEffect, useRef, useState } from "react";
import service from "../services/service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPaper } from "@fortawesome/free-solid-svg-icons";

// We'll limit the processing size to 200px.
const maxVideoSize = 224;
const LETTER_DATA = [
    { letter: "A", imageSrc: "Img/A.png" },
    { letter: "B", imageSrc: "Img/B.png" },
    { letter: "C", imageSrc: "Img/C.png" },
    { letter: "D", imageSrc: "Img/D.png" },
    { letter: "E", imageSrc: "Img/E.png" },
    { letter: "F", imageSrc: "Img/F.png" },
    { letter: "G", imageSrc: "Img/G.png" },
    { letter: "H", imageSrc: "Img/H.png" },
    { letter: "I", imageSrc: "Img/I.png" },
    { letter: "J", imageSrc: "Img/J.png" },
    { letter: "K", imageSrc: "Img/K.png" },
    { letter: "L", imageSrc: "Img/L.png" },
    { letter: "M", imageSrc: "Img/M.png" },
    { letter: "N", imageSrc: "Img/N.png" },
    { letter: "O", imageSrc: "Img/O.png" },
    { letter: "P", imageSrc: "Img/P.png" },
    { letter: "Q", imageSrc: "Img/Q.png" },
    { letter: "R", imageSrc: "Img/R.png" },
    { letter: "S", imageSrc: "Img/S.png" },
    { letter: "T", imageSrc: "Img/T.png" },
    { letter: "U", imageSrc: "Img/U.png" },
    { letter: "V", imageSrc: "Img/V.png" },
    { letter: "W", imageSrc: "Img/W.png" },
    { letter: "X", imageSrc: "Img/X.png" },
    { letter: "Y", imageSrc: "Img/Y.png" },
    { letter: "Z", imageSrc: "Img/Z.png" },
    { letter: "_NOTHING", imageSrc: "" },
    { letter: "_SPACE", imageSrc: "/images/sign-space.png" },
];

export default function Page() {
    const videoElement = useRef(null);
    const canvasEl = useRef(null);
    const outputCanvasEl = useRef(null);
    let [letter, setLetter] = useState(null);
    let [loading, setLoading] = useState(true);
    let [fps, setFps] = useState(0);
    let [word, setWord] = useState("Sign the next word");
    let [showCorrectImage, setShowCorrectImage] = useState(false);
    let [correctImageSrc, setCorrectImageSrc] = useState("");

    async function processImage() {
        if (
            videoElement !== null &&
            canvasEl !== null &&
            typeof videoElement.current !== "undefined" &&
            videoElement.current !== null
        ) {
            const ctx = canvasEl.current.getContext("2d");
            ctx.drawImage(videoElement.current, 0, 0, maxVideoSize, maxVideoSize);

            try {
                const image = ctx.getImageData(0, 0, maxVideoSize, maxVideoSize);
                const processedImage = await service.imageProcessing(image);

                const ctxOutput = outputCanvasEl.current.getContext("2d");
                ctxOutput.putImageData(processedImage.data.payload, 0, 0);

                const prediction = await service.predict(processedImage.data.payload);
                const predictedLetterIndex = prediction.data.payload;
                const { letter: letterValue, imageSrc } = LETTER_DATA[predictedLetterIndex];
                setLetter(letterValue);

                if (letterValue === "_SPACE") {
                    setWord(word + " ");
                    setShowCorrectImage(false);
                } else if (letterValue === "_NOTHING") {
                    setShowCorrectImage(false);
                } else {
                    if (letterValue === word[word.length - 1]) {
                        setShowCorrectImage(false);
                    } else {
                        setShowCorrectImage(true);
                        const correctSign = LETTER_DATA.find(item => item.letter === word[word.length - 1]);
                        setCorrectImageSrc(correctSign?.imageSrc || "/images/placeholder.png");
                    }
                    setWord(word + letterValue);
                }
            } catch (error) {
                console.error("Error processing image:", error);
                setWord("Error: Unable to process the image");
                setShowCorrectImage(false);
                setLetter("_NOTHING");
            }
        }
    }

    useEffect(() => {
        async function load() {
            const videoLoaded = await initCamera();
            await service.load();
            videoLoaded.play();
            setLoading(false);
            setWord("Sign the next word");
            return videoLoaded;
        }

        load();
    }, []);

    return (
        <div style={{ marginTop: "2em" }}>
            <h1 className="text-center text-heading" style={{ marginBottom: "0.5em" }}>
                <FontAwesomeIcon icon={faHandPaper} />
            </h1>
            {loading && (
                <div className="row justify-content-center">
                    <div className="col text-center">
                        <div
                            className="spinner-border"
                            style={{ width: "8em", height: "8em", marginBottom: "2em" }}
                            role="status"
                        ></div>
                    </div>
                </div>
            )}
            <div style={{ display: loading ? "none" : "block" }}>
                <div className="row justify-content-center">
                    <div className="col-12 text-center">
                        <video className="video" playsInline ref={videoElement} />
                    </div>
                    <div className="col-12 text-center">
                        <button
                            onClick={() => processImage()}
                            type="button"
                            className="btn btn-outline-light btn-lg mt-4"
                        >
                            Snapshot
                        </button>
                    </div>
                    <canvas
                        style={{ display: "none" }}
                        ref={canvasEl}
                        width={maxVideoSize}
                        height={maxVideoSize}
                    ></canvas>
                    <canvas
                        className="col-xs-12"
                        style={{ display: "none" }}
                        ref={outputCanvasEl}
                        width={maxVideoSize}
                        height={maxVideoSize}
                    ></canvas>
                </div>

                <div className="row justify-content-center text-center" style={{ marginTop: "2em" }}>
                    <div className="col-xs-12">
                        <h5 className="text-letter">Predicted Letter:</h5>
                        <h4
                            className="text-letter"
                            style={{
                                borderRadius: 10,
                                border: "2px solid #FFFFFF",
                                padding: "0.5em",
                            }}
                        >
                            {letter}
                        </h4>
                    </div>
                </div>
                <div className="row justify-content-center text-center" style={{ marginTop: "2em" }}>
                    <div className="col-xs-12">
                        <h3 className="text-words">Predicted Word:</h3>
                        <h2
                            className="text-words"
                            style={{
                                borderRadius: 10,
                                border: "2px solid #FFFFFF",
                                padding: "1em",
                            }}
                        >
                            {word}
                        </h2>
                        {showCorrectImage && (
                            <div>
                                <h5 className="text-words">Correct sign:</h5>
                                <img src={correctImageSrc} alt="Correct sign" />
                            </div>
                        )}
                        <p className="text-fps">FPS: {fps.toFixed(3)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
