import L from 'leaflet';
import CodeMirror from 'codemirror';
import '../node_modules/codemirror/lib/codemirror.css';
import './styles/main.css';
import '../node_modules/leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import {initOpenEO} from './open-eo.js';

let GLOBALCNT = 3;
let evalScipt;

var openEO = initOpenEO();

function toClrVal(a) {
  return a < 0 ? 0 : a > 1 ? 255 : Math.round(255 * a);
}

function clrPixel(ndvi) {
  return [0.9 - 0.8 * ndvi, 0.2 + 0.8 * ndvi, GLOBALCNT / 3, 1].map(toClrVal);
}

function recolor(tile) {
  const srcData = tile.originalImage;
  const ctx = tile.getContext('2d');
  const tgtData = ctx.getImageData(0, 0, tile.width, tile.height);

  if (evalScipt) {
    const esFun = eval('(function(input) {' + evalScipt + '})');
    for (var i = 0; i < tgtData.data.length; i += 4) {
      const input = tile.originalImage.data[i] / 255 * 2 - 1;
      const es = esFun(input);
      tgtData.data[i] = es[0];
      tgtData.data[i + 1] = es[1];
      tgtData.data[i + 2] = es[2];
      tgtData.data[i + 3] = es[3];
      //console.log(tgtData);
    }
  } else {
    for (var i = 0; i < tgtData.data.length; i += 4) {
      const input = tile.originalImage.data[i] / 255 * 2 - 1;
      const pxClrs = clrPixel(input);
      tgtData.data[i] = pxClrs[0];
      tgtData.data[i + 1] = pxClrs[1];
      tgtData.data[i + 2] = pxClrs[2];
      tgtData.data[i + 3] = pxClrs[3];
    }
  }

  ctx.putImageData(tgtData, 0, 0);
}

var map = new L.Map('map', { center: [45, 15], zoom: 8 });

var tiles = L.tileLayer.wms(
  'http://localhost:8080/download/<placeholder>/wcs',
  {
    request: 'GetCoverage',
    service: 'WCS',
    coverage: 'CUSTOM',
    format: 'image/png',
    tileSize: 512,
    minZoom: 8
  }
);

function recolorTiles() {
  console.log('RECOLOR ' + GLOBALCNT);
  tiles.recolor();
}

tiles.recolor = function() {
  GLOBALCNT = (GLOBALCNT + 1) % 4;

  for (var key in this._tiles) {
    var tile = this._tiles[key];
    recolor(tile.el);
  }
};

tiles.createTile = function(coords) {
  const tile = L.DomUtil.create('canvas', 'leaflet-tile');
  tile.width = tile.height = this.options.tileSize;

  const imageObj = new Image();
  imageObj.crossOrigin = '';
  imageObj.onload = function() {
    const ctx = tile.getContext('2d');
    ctx.drawImage(imageObj, 0, 0);

    tile.originalImage = ctx.getImageData(0, 0, tile.width, tile.height);
    recolor(tile);
  };
  imageObj.src = this.getTileUrl(coords);
  return tile;
};

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://www.osm.org">OpenStreetMap</a>'
}).addTo(map);

tiles.addTo(map);

map.on('mousemove', e => {
  const containerPoint = e.containerPoint;
});

document
  .getElementById('recolorButton')
  .addEventListener('click', recolorTiles);

document
  .getElementById('runProsScript')
  .addEventListener('click', runProsScript);
document.getElementById('runVisScript').addEventListener('click', runVisScript);

const processingScript = CodeMirror(document.getElementById('proseditor'), {
  value: `return openEO.imagecollection('Sentinel2A-L1C')
      .filter_daterange("2016-01-01","2016-03-10")
      .NDI(8,4)
      .max_time();`,
      //.bbox_filter([16.1, 47.9, 16.6, 48.6], "EPSG:4326")
  mode: 'javascript',
  indentUnit: 4,
  lineNumbers: true
});
const visualisationScript = CodeMirror(document.getElementById('viseditor'), {
  value: `

    function toClrVal(a) {
      return a < 0 ? 0 : a > 1 ? 255 : Math.round(255 * a);
    }
    
    return [
    0.9 - 0.8 * input, 
    0.2 + 0.8 * input, 
    1, 
    1].map(toClrVal);
    
    `,
  mode: 'javascript',
  indentUnit: 4,
  lineNumbers: true
});

function runProsScript() {
  const scriptArea = document.getElementById('firstTextArea');
  const graph = openEO.parseScript(processingScript.getValue());
  openEO.createJob(graph).then(res => {
    tiles.setUrl(openEO.getWcsUrl(res), false);
    console.log(openEO.getWcsUrl(res));
  });
}

function runVisScript() {
  const scriptArea = document.getElementById('firstTextArea');
  evalScipt = visualisationScript.getValue();
  recolorTiles();
}




