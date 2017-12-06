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
  const findMin = arr=> arr[findMinIndex(arr)];
  const index = (a, b) => (a - b) / (a + b);
  const dateRangeFilter = (from, to) => {
      return (scene => from < scene.date.getTime() && scene.date.getTime() < to);
  };
  function setup(dss) {
    setInputComponents([dss.B04,dss.B08]);
    setOutputComponentCount(1);
  }
  
  function filterScenes(scenes, inputMetadata) {
    scenes = scenes.filter(dateRangeFilter(Date.parse('2017-01-01'),Date.parse('2017-01-31')));
    return scenes;
  }
  
  function eval(samples, scenes) {
    samples = samples.map(s => index(s.B08, s.B04));
    samples = [findMin(samples)];
    return samples;
  }