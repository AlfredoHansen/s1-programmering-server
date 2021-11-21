var express = require('express');
var router = express.Router();
const fs = require('fs');

//Route /products - hent alle products
router.get('/api/products', function(req, res, next) {
  
  let category = req.query.category;
  
  //Denne linie kigger på om filen exsistere
  var file_exist = fs.existsSync('products.json');
  //Tjek her om filen faktisk eksitere
  if (file_exist) {
    //Hent data fra filen
    var data = fs.readFileSync('products.json');
    //Konverter vores data til json
    products = JSON.parse(data);
    //Returner json til klienten

    //Hvis category ikke er med i requestet til serveren, så skal vi bare returnere alle produkter
    if(!category) {

      res.send(products);

    } else {
      //Her ved vi at category er sat, så derfor filtere vi..


      var filteredProducts = [];

      products.forEach(product => {
        
        //Tag kun de produkter som passer på vores kategori
        if(product.category == category) {
          filteredProducts.push(product) 
        }

      });
      
      res.send(filteredProducts);

    }

  } else {
    //Hvis ikke så fortæl brugeren at den ikke findes
    res.send('File not found!');
  }
});

module.exports = router;
