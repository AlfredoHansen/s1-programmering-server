var express = require('express');
var router = express.Router();
const fs = require('fs');

//Route /products - hent alle products
router.get('/api/products', function(req, res, next) {
  //Denne linie kigger på om filen exsistere
  var file_exist = fs.existsSync('products.json');
  //Tjek her om filen faktisk eksitere
  if (file_exist) {
    //Hent data fra filen
    var data = fs.readFileSync('products.json');
    //Konverter vores data til json
    obj = JSON.parse(data);
    //Returner json til klienten
    res.send(obj);
  } else {
    //Hvis ikke så fortæl brugeren at den ikke findes
    res.send('File not found!');
  }
});

module.exports = router;
