//========= Mapeo de lagunas de Origen Glaciar - Coordillera Blanca =========

//Coleccion de imagenes Sentinel-2 Surface Reflectance(SR)
var img_sent2 = ee.ImageCollection("COPERNICUS/S2_SR")
                .filterBounds(geometry)
                .filterDate('2021-01-01', '2021-12-01')
                .filterMetadata('CLOUD_COVERAGE_ASSESSMENT', 'less_than', 5)
                .median()
                .clip(geometry);
               
//Parametros de visualizacion 
var params = {
  min: 100, 
  max: 4000, 
  bands: ['B11', 'B8A', 'B3']
};

Map.addLayer(img_sent2, params, 'img_sent-2');


// -----Funcion para el calculo de la mascara del NDWI sin nieve 
function ndwinsmask(imgg){
  var ndwins = imgg.expression('(GREEN-2*NIR)/(GREEN + NIR)', {
    'GREEN':imgg.select('B3'),
    'NIR':imgg.select('B8')
  });
  //Extraer mascara
  var ndwins_ext = ndwins.gt(0);
  var ndwins_mask = ndwins_ext.updateMask(ndwins_ext);
  return ndwins_mask;
}
//Calculo de la mascara NDWI comun 
var NDWIns_mask =ndwinsmask(img_sent2).rename('NDWIns');
print(NDWIns_mask)
//Visualizacion de la mascara NDWI comun 
Map.addLayer(NDWIns_mask, {palette: ['blue']}, 'NDWIns_mask');

//======== Convertir Raster a Vector =============

var NDWI_table = NDWIns_mask.reduceToVectors({
  reducer:ee.Reducer.countEvery(), 
  geometry: geometry, 
  geometryType: 'polygon',
  scale:12.5,
  maxPixels:1e12,
  eightConnected: false
})

Map.addLayer(NDWI_table,{color:'red'}, 'vectors')
