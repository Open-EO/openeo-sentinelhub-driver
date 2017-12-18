class JobData {
  constructor(other_job) {
    this.source = null;
    this.inBands = [];
    this.numOutBands = 0;
    this.filterScript = [];
    this.evalScript = [];
    this.geometry = null;

    if (other_job) {
      Object.assign(this, other_job);
    }
  }

  addRequiredBand(bandId) {
    if (!this.inBands.includes(bandId)) {
      this.inBands.push(bandId);
    }
  }

  generateScript() {
    return `
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
      const NDI = (a, b) => (a - b) / (a + b);
      const dateRangeFilter = (from, to) => {
        return (scene => from < scene.date.getTime() && scene.date.getTime() < to);
      };

      function setup(dss) {
        setInputComponents([${this.inBands.map(b => 'dss.' + b).join(',')}]);
        setOutputComponentCount(${this.numOutBands});
      }

      function filterScenes(scenes, inputMetadata) {
        ${this.filterScript.join('\n        ')}
        return scenes;
      }

      function evaluatePixel(samples, scenes) {
        ${this.evalScript.join('\n        ')}
        return samples;
      }
    `
  }
}

module.exports = JobData