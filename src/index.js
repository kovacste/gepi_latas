let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let imageProps = document.getElementById('img-props');

inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

imgElement.onload = function() {
  let src = cv.imread(imgElement);
  imageProps.innerText =  getImageProps(src);
  cv.imshow('canvasOutput', src);
  src.delete();
};

function onOpenCvReady() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}

function getImageProps(src) {
    return  'image width: ' + src.cols + '\n' +
            'image height: ' + src.rows + '\n' +
            'image size: ' + src.size().width + '*' + src.size().height + '\n' +
            'image depth: ' + src.depth() + '\n' +
            'image channels ' + src.channels() + '\n' +
            'image type: ' + src.type() + '\n';
}