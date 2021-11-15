const imgElement = document.getElementById('imageSrc');
const inputElement = document.getElementById('fileInput');
const inputImageProps = document.getElementById('input-img-props');
const outputImageProps = document.getElementById('output-img-props');
const debugSpace = document.getElementById('debug');
const images = [];
const video = document.getElementById('videoInput');
const videoOutput = document.getElementById('canvasOutput');

function drawDebugImages(images) {
  images.forEach((image) => {
      let canvas = document.createElement('canvas');
      debugSpace.appendChild(canvas);
      cv.imshow(canvas, image);  
  });
}

inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

imgElement.onload = () => {

  const src = cv.imread(imgElement);
  const edge = cannyEdge(src);  
  const resizedEdge = resizeImage(edge, { width: 500 });
  const greyScale = toGreyScale(src);
  const bluredGreyScale = blurImage(greyScale);
  const binary = toTresholdedBinary(bluredGreyScale, { thresh: 140, maxval: 250 });
  const contour = getContourImage(binary);

  images.push(src, edge, resizedEdge, greyScale, bluredGreyScale, binary, contour);

  //const boundedEdge = drawBoundingRect(contour);
  
  drawContourOnImage(binary, src);

  inputImageProps.innerText =  getImageProps(greyScale);
  outputImageProps.innerText =  getImageProps(contour);

  drawOnCanvas('canvas2', src);
  drawDebugImages(images);

  free();
};

window.onload = () =>  {
  
  startWebcamStream(video);
  const videoProcessor = new VideoProcessor(video, videoOutput, 30);
}


function free() {
  images.forEach((image) => {
    image.delete();
  });
}

function drawOnCanvas(canvas, src) {
  cv.imshow(canvas, src);
}

function getImageProps(src) {
  return  'image width: ' + src.cols + '\n' +
          'image height: ' + src.rows + '\n' +
          'image size: ' + src.size().width + '*' + src.size().height + '\n' +
          'image depth: ' + src.depth() + '\n' +
          'image channels ' + src.channels() + '\n' +
          'image type: ' + src.type() + '\n';
}

function startWebcamStream(videoElement) {
  console.log('cucc');
  navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
    videoElement.srcObject = stream;
    videoElement.play();
  }).catch((err) => {
    console.log(err);
  })
}

const cfg = {
  fps: 30,
};
function processVideo(video, canvas) {
  let start = Date.now();
  
}


function VideoProcessor(videoInput, canvasOutput, targetFps = 30) {

  const context = canvasOutput.getContext('2d');
  const fps = targetFps;
  let src = new cv.Mat(height, width, cv.CV_8UC4);
  let dst = new cv.Mat(height, width, cv.CV_8UC1);

  function processVideo(){
    let start = Date.now();
    context.drawImage(videoInput, 0, 0, widht, height)
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    cv.imshow(canvasOutput, dst);
    let delay = 1000 / fps - (Date.now() - begin);
    setTimeout(processVideo, delay);

  }

  function start() {
    setTimeout(processVideo, 0);
  }

  return {
    start
  }

}