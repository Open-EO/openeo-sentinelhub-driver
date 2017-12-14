function getCapabilities() {
  return {}
}

function getData(product_id) {
  return {
    'product_id': product_id,
    'description': 'Sentinel 2 Level-1C: Top-of-atmosphere reflectances in cartographic geometry',
    'source': 'European Space Agency (ESA)',
    'extent': [ -34, 35, 39, 71 ],
    'time': [ '2016-01-01', '2017-10-01' ],
    'bands': [
      { 'band_id': '1',                   'wavelength_nm': 443.9,  'res_m': 60 },
      { 'band_id': '2',  'name': 'blue',  'wavelength_nm': 496.6,  'res_m': 10 },
      { 'band_id': '3',  'name': 'green', 'wavelength_nm': 560,    'res_m': 10 },
      { 'band_id': '4',  'name': 'red',   'wavelength_nm': 664.5,  'res_m': 10 },
      { 'band_id': '5',                   'wavelength_nm': 703.9,  'res_m': 20 },
      { 'band_id': '6',                   'wavelength_nm': 740.2,  'res_m': 20 },
      { 'band_id': '7',                   'wavelength_nm': 782.5,  'res_m': 20 },
      { 'band_id': '8',  'name': 'nir',   'wavelength_nm': 835.1,  'res_m': 10 },
      { 'band_id': '8a',                  'wavelength_nm': 864.8,  'res_m': 20 },
      { 'band_id': '9',                   'wavelength_nm': 945,    'res_m': 60 },
      { 'band_id': '10',                  'wavelength_nm': 1373.5, 'res_m': 60 },
      { 'band_id': '11',                  'wavelength_nm': 1613.7, 'res_m': 20 },
      { 'band_id': '12',                  'wavelength_nm': 2202.4, 'res_m': 20 }
    ]
  }
}


function capabilities_get(req, res, next) {
  const capabilities = getCapabilities();

  res.json(capabilities);
  return next();
}

function data_byId_get(req, res, next) {
  const data = getData(req.params.product_id);

  res.json(data);
  return next();
}


module.exports = {
  capabilities_get,
  data_byId_get
}
