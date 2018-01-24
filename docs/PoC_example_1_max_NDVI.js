const findMinIndex = arr => {
  let min = Infinity;
  let minIdx = -1;
  for (var i = 0; i < arr.length; i++) {
    let cur = arr[i];
    if (cur < min) {
      min = cur;
      minIdx = i;
    }
  }
  return minIdx;
};

const findMaxIndex = arr => {
  let max = -Infinity;
  let maxIdx = -1;
  for (var i = 0; i < arr.length; i++) {
    let cur = arr[i];
    if (cur > max) {
      max = cur;
      maxIdx = i;
    }
  }
  return maxIdx;
};

const findMin = arr => arr[findMinIndex(arr)];
const findMax = arr => arr[findMaxIndex(arr)];
const NDI = (a, b) => (a - b) / (a + b);
const dateRangeFilter = (from, to) => {
  return scene => from < scene.date.getTime() && scene.date.getTime() < to;
};

function setup(dss) {
  setInputComponents([dss.B08, dss.B04]);
  setOutputComponentCount(1);
}

function filterScenes(scenes, inputMetadata) {
  scenes = scenes.filter(
    dateRangeFilter(Date.parse("2016-01-01"), Date.parse("2016-03-10"))
  );
  return scenes;
}

function evaluatePixel(samples, scenes) {
  samples = samples.map(s => NDI(s.B08, s.B04));
  samples = [findMax(samples)];
  return samples;
}
