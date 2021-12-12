const video = document.getElementById('videoInput');
const videoOutput = document.getElementById('canvasOutput');
const videoOutput2 = document.getElementById('canvasOutput2');

window.onload = () => {
    startWebcamStream(video);
    const videoProcessor = new VideoProcessor(video, videoOutput, 30);
    videoProcessor.start();
}

function startWebcamStream(videoElement) {
    navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
        videoElement.srcObject = stream;
        videoElement.play();
    }).catch((err) => {
        console.log(err);
    })
}

function VideoProcessor(videoInput, canvasOutput, targetFps = 30) {

    const context = canvasOutput.getContext('2d');
    const fps = targetFps;

    let src = new cv.Mat(videoInput.height, videoInput.width, cv.CV_8UC4);
    let src2 = new cv.Mat(videoInput.height, videoInput.width, cv.CV_8UC4);
    let dst = new cv.Mat(videoInput.height, videoInput.width, cv.CV_8UC1);
    let dst2 = new cv.Mat(videoInput.height, videoInput.width, cv.CV_8UC1);
    let M = cv.Mat.ones(3, 3, cv.CV_8U);
    let M2 = cv.Mat.ones(3, 3, cv.CV_8U);
    let opening = new cv.Mat();
    let opening2 = new cv.Mat();

    let contourM = new cv.Mat();
    let inv_contourM = new cv.Mat();

    function processVideo() {
        let start = Date.now();
        context.drawImage(videoInput, 0, 0, videoInput.width, videoInput.height);
        src.data.set(context.getImageData(0, 0, videoInput.width, videoInput.height).data);
        src2.data.set(context.getImageData(0, 0, videoInput.width, videoInput.height).data);

        //dst = resizeImage(src, { width: videoInput.width / 2, height: videoInput.height / 2 })
        //dst = resizeImage(dst, { width: videoInput.width, height: videoInput.height })
        //cv.cvtColor(dst, dst, cv.COLOR_RGB2GRAY, 0);
        //cv.bilateralFilter(dst, dst, 5, 10, 100, cv.BORDER_DEFAULT);
        // cv.medianBlur(dst, dst, 5);
        /*let kernel = cv.matFromArray(3, 3, cv.CV_8UC1,[0, -1, 0, -1, 5, -1, 0, -1, 0]);
        cv.filter2D(dst, dst, 3, kernel)*/
        //let anchor = new cv.Point(-1, -1);
        //cv.erode(dst, dst, M);
        //dst = resizeImage(dst, { width: videoInput.width / 15, height: videoInput.height / 15 })
        //dst = resizeImage(dst, { width: videoInput.width, height: videoInput.height })
        //dst = toTresholdedBinary(dst, { thresh: 0, maxval: 255 });
        // cv.medianBlur(dst, dst, 3);
        //cv.dilate(dst, dst, M, anchor, 3, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
        //dst = toTresholdedBinary(dst, { thresh: 170, maxval: 255 });
        //dst = resizeImage(dst, { width: videoInput.width / 2, height: videoInput.height / 2 })
        //dst = resizeImage(dst, { width: videoInput.width, height: videoInput.height })

        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
        cv.cvtColor(src2, dst2, cv.COLOR_RGBA2GRAY, 0);
        cv.threshold(dst, dst, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
        cv.threshold(dst2, dst2, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
        cv.erode(dst, dst, M);
        cv.erode(dst2, dst2, M2);
        cv.dilate(dst, opening, M);
        cv.dilate(dst2, opening2, M2);
        cv.dilate(opening, dst, M, new cv.Point(-1, -1), 3);
        cv.dilate(opening2, dst2, M2, new cv.Point(-1, -1), 3);

        cv.Canny(dst, contourM, 100, 100, 3, true);
        cv.Canny(dst2, inv_contourM, 100, 100, 3, true);
        const contours = getContours(contourM);
        const inv_contours = getContours(inv_contourM);

        for (let i = 0; i < contours.squares.size(); ++i) {
            let color = new cv.Scalar(255, 0, 100);
            cv.drawContours(src, contours.squares, i, color, 2, 8, contours.hierarchy, 0);
        }
        for (let i = 0; i < inv_contours.squares.size(); ++i) {
            let color = new cv.Scalar(255, 0, 100);
            cv.drawContours(src, inv_contours.squares, i, color, 2, 8, inv_contours.hierarchy, 0);
        }


        contours.clear();
        inv_contours.clear();
        cv.imshow(canvasOutput, inv_contourM);
        cv.imshow(videoOutput2, src);
        let delay = 1000 / fps - (Date.now() - start);
        setTimeout(processVideo, delay);
    }
    function start() {
        setTimeout(processVideo, 0);
    }
    return {
        start,
    }
}