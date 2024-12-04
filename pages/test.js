import { useEffect, useRef, useState } from "react";
import service from "../services/service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPaper } from "@fortawesome/free-solid-svg-icons";

// We'll limit the processing size to 200px.
const maxVideoSize = 224;
const LETTERS = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "_NOTHING",
    "_SPACE",
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
    let [sample, setSample] = useState("");


    const random = () => {
        const random = Math.floor(Math.random() * 26);
        return random;
    }
    /**
     * In the onClick event we'll capture a frame within
     * the video to pass it to our service.
     */
    async function processImage() {
        if (
            videoElement !== null &&
            canvasEl !== null &&
            typeof videoElement.current !== "undefined" &&
            videoElement.current !== null
        ) {
            const ctx = canvasEl.current.getContext("2d");
            console.log("ctx", ctx)
            ctx.drawImage(videoElement.current, 0, 0, maxVideoSize, maxVideoSize);
            console.log("go here")
            // Lấy dữ liệu ảnh từ canvas
            try {
                const image = ctx.getImageData(0, 0, maxVideoSize, maxVideoSize);
                console.log("image", image);
                const processedImage = await service.imageProcessing(image);
                
                const ctxOutput = outputCanvasEl.current.getContext("2d");
                console.log("processedImage: ", processedImage);
                ctxOutput.putImageData(processedImage.data.payload, 0, 0);
                const prediction = await service.predict(processedImage.data.payload);
                console.log("prediction: ", prediction);
                const predictedLetter = prediction.data.payload;
                const letterValue = LETTERS[predictedLetter];
                setLetter(letterValue);

                if (letterValue === "_SPACE") return
                if (letterValue === "_NOTHING") return
                if(letterValue === sample) {
                    alert("TRUE!");
                    setSample(LETTERS[random()])
                }else {
                    alert("FALSE!");
                }

            } catch (error) {
                console.error("Error processing image:", error);
                alert("Failed to process image. Please try again.");
            }
        }
    }

    /**
     * In the useEffect hook we'll load the video
     * element to show what's on camera.
     */
    useEffect(() => {
        async function initCamera() {
            videoElement.current.width = maxVideoSize;
            videoElement.current.height = maxVideoSize;

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        facingMode: "environment",
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
                "This browser does not support video capture, or this device does not have a camera";
            alert(errorMessage);
            return Promise.reject(errorMessage);
        }

        async function load() {
            const videoLoaded = await initCamera();
            await service.load();
            videoLoaded.play();
            //   setTimeout(processImage, 0);
            setLoading(false);

            setSample("Y")
            // setSample(LETTERS[random()])
            return videoLoaded;
        }

        load();
    }, []);

    return (
        <div style={{ marginTop: "2em" }}>
            <h1
                className="text-center text-heading"
                style={{ marginBottom: "0.5em" }}
            >
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

                <div
                    className="row justify-content-center text-center"
                    style={{ marginTop: "2em" }}
                >
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
                <div
                    className="row justify-content-center text-center"
                    style={{ marginTop: "2em" }}
                >
                    <div className="col-xs-12">
                        <h3 className="text-words">Predicted Words:</h3>
                        <h2
                            className="text-words"
                            style={{
                                borderRadius: 10,
                                border: "2px solid #FFFFFF",
                                padding: "1em",
                            }}
                        >
                            {sample}
                        </h2>
                        <p className="text-fps">FPS: {fps.toFixed(3)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
