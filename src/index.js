const imgElement = document.getElementById('imageSrc');
const inputElement = document.getElementById('fileInput');
const imageProps = document.getElementById('img-props');

inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

imgElement.onload = function() {

  const src = cv.imread(imgElement);
  const edge = cannyEdge(src);
  const resizedEdge = resizeImage(edge, { width: 500 });
  const boundedEdge = drawBoundingRect(src);

  imageProps.innerText =  getImageProps(src);

  drawOnCanvas('canvas2', boundedEdge);
  src.delete();
  edge.delete();
  resizedEdge.delete();
};

function drawOnCanvas(canvas, src) {
  cv.imshow(canvas, src);
}

function cannyEdge(src, { threshold1 = 50, threshold2 = 100, apertureSize = 3, L2gradient = false } = {}) {
  const dst = new cv.Mat();
  const srcCopy = src.clone();
  cv.cvtColor(srcCopy, srcCopy, cv.COLOR_RGB2GRAY, 0);
  cv.Canny(srcCopy, dst, threshold1, threshold2, apertureSize, L2gradient);
  return dst;
}

function getImageProps(src) {
  return  'image width: ' + src.cols + '\n' +
          'image height: ' + src.rows + '\n' +
          'image size: ' + src.size().width + '*' + src.size().height + '\n' +
          'image depth: ' + src.depth() + '\n' +
          'image channels ' + src.channels() + '\n' +
          'image type: ' + src.type() + '\n';
}

function resizeImage(src, { width, height }) {

  let newWidth = width;
  let newHeight = height;

  if (!newWidth) {
    const widthHeightRatio = src.cols / src.rows;
    newWidth = height * widthHeightRatio;
  }

  if (!newHeight) {
    const heightWidthRatio = src.rows / src.cols;
    newHeight = width * heightWidthRatio;
  }

  const dst = new cv.Mat();
  const dsize = new cv.Size(newWidth, newHeight);
  cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
  return dst;
}

function drawBoundingRect(src) {

  let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  const srcCopy = src.clone();
  cv.cvtColor(srcCopy, srcCopy, cv.COLOR_RGBA2GRAY, 0);
  cv.threshold(srcCopy, srcCopy, 177, 200, cv.THRESH_BINARY);
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(srcCopy, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  let cnt = contours.get(0);
 
  let rect = cv.boundingRect(cnt);
  let contoursColor = new cv.Scalar(255, 255, 0);
  let rectangleColor = new cv.Scalar(255, 0, 0);
  cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);
  let point1 = new cv.Point(rect.x, rect.y);
  let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
  cv.rectangle(dst, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
  contours.delete();
  hierarchy.delete();
  cnt.delete();

  return dst;
}