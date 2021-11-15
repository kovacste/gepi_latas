function cannyEdge(src, { threshold1 = 50, threshold2 = 100, apertureSize = 3, L2gradient = false } = {}) {
    const dst = new cv.Mat();
    const srcCopy = src.clone();
    cv.cvtColor(srcCopy, srcCopy, cv.COLOR_RGB2GRAY, 0);
    cv.Canny(srcCopy, dst, threshold1, threshold2, apertureSize, L2gradient);
    return dst;
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
  
  function toGreyScale(src) {
    const srcCopy = src.clone();
    cv.cvtColor(srcCopy, srcCopy, cv.COLOR_RGB2GRAY, 0);
    return srcCopy;
  }
  
  function toTresholdedBinary(src, { thresh = 125, maxval = 255 } = {}) {
    const srcCopy = src.clone();
    cv.threshold(srcCopy, srcCopy, thresh, maxval, cv.THRESH_BINARY);
    return srcCopy;
  }
  
  function getContourImage(src) {
    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let poly = new cv.MatVector();
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_NONE);
    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        cv.approxPolyDP(cnt, tmp, 3, true);
        poly.push_back(tmp);
        cnt.delete();
        tmp.delete();
    }
    for (let i = 0; i < contours.size(); ++i) {
        let color = new cv.Scalar(
          Math.round(Math.random() * 255),
          Math.round(Math.random() * 255),
          Math.round(Math.random() * 255)
        );
        cv.drawContours(dst, poly, i, color, 1, 8, hierarchy, 0);
    }
    contours.delete();
    hierarchy.delete();
    return dst;
  }
  
  function blurImage(src) {
    let dst = new cv.Mat();
    cv.bilateralFilter(src, dst, 20, 200, 200, cv.BORDER_DEFAULT);
    return dst;
  }

  function medianBlur(src) {
      let dst = new cv.Mat();
      cv.medianBlur(src, dst, 11);
      return dst;
  }
  
  function drawContourOnImage(src, dst) {
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let poly = new cv.MatVector();
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        cv.approxPolyDP(cnt, tmp, 3, true);
        poly.push_back(tmp);
        cnt.delete();
        tmp.delete();
    }
    for (let i = 0; i < contours.size(); ++i) {
        let color = new cv.Scalar(255, 255, 0);
        cv.drawContours(dst, poly, i, color, 2, 8, hierarchy, 0);
    }
    contours.delete();
    hierarchy.delete();
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
