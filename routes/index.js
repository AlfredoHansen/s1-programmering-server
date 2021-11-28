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

//Hent produkt
router.get('/api/products/create', function(req, res, next) {

  //Hent titel, beskrivelse, pris og kategori fra url params
  let title = req.query.title;
  let description = req.query.description;
  let price = req.query.price;
  let category = req.query.category;
  let id = makeid(10);

  //Hent products fil
  var productsRaw = fs.readFileSync('products.json');

  //Lavet rå data om til et Javascript object
  var products = JSON.parse(productsRaw);

  //Disse er bare for test
  console.log(products);
  console.log(title + ' og ' + description + ' og ' + price + ' og ' + category);

  //Lavet et nyt product object ved at bruge vores titel, beskrivelse, pris og kategori
  let newProduct = {
    "title": title,
    "description": description,
    "price": price,
    "category": category,
    "id": id
  };
  //Pushet vores nye object til vores products object
  products.push(newProduct);

  
  //Lav vores products object om til JSON igen..
  var newDataToSave = JSON.stringify(products);

  //Overskriv den gamle products.json med vores nye products object
  fs.writeFile('products.json', newDataToSave, err => {
    // error checking
  if(err) throw err;  
    console.log("New data added");
  });

  //Returner besked til klienten.
  res.send('Nyt produkt tilføjet '+title+' - '+description+' - '+price+' - '+category);


});
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

//Giv hvert produkt et random id
function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

//slet produkt
// Vi tager id'et fra URL'en. Looper alle produkter igennem og sletter hvis vi finder det samme id.
router.get('/api/products/delete', function(req, res, next) {
  var deleteId = req.query.id;  

  //Denne linie kigger på om filen exsistere
  var file_exist = fs.existsSync('products.json');

  //Tjek her om filen faktisk eksitere
  if (file_exist) {
    
    //Hent data fra filen
    var productsRaw = fs.readFileSync('products.json');
    // laver det om til et js element
    var products = JSON.parse(productsRaw);

    console.log(products);
    products.forEach((product,index)  => {
      console.log(index);
      
      //Find produkt med korrekt id til at slette
     if(product.id == deleteId) {
       console.log('fundet id til at slette');
        products.splice(index, 1);
      }
      
    });
    console.log(products);
   
  //Lav vores products object om til JSON igen..
  var newDataToSave = JSON.stringify(products);

  //Overskriv den gamle products.json med vores nye products object efter der er et produkt der er blevet slettet
  fs.writeFile('products.json', newDataToSave, err => {
    // error checking
  if(err) throw err;  
    console.log("New data added");
  });
  res.send(deleteId);

  } else {

    //Hvis ikke så fortæl brugeren at den ikke findes
    res.send('File not found!');

  }

});

//rediger produkt
// Vi tager id'et fra URL'en. Looper alle produkter igennem og redigere hvis vi finder det samme id.
router.get('/api/products/edit', function(req, res, next) {
  let id = req.query.id;  
  let title = req.query.title;
  let description = req.query.description;
  let price = req.query.price;
  let category = req.query.category;

  //Hent products fil
  var productsRaw = fs.readFileSync('products.json');

  //Lavet rå data om til et Javascript object
  var products = JSON.parse(productsRaw);

  //tester
  console.log(products);

  // Hvis produktets id er det samme id som det jef skal redigere får jeg lov til at redigere følgende parametre
  products.forEach((product,index)  => {
    if(product.id == id){
      let editProduct = {
        "title": title,
        "description": description,
        "price": price,
        "category": category,
        "id": id
        };
        //Jeg tager produktet udfra dets plads i arrayet og redigere i lige præcis det
        products[index] = editProduct
    }
  });
  //test
  console.log(products);

     //Lav vores products object om til JSON igen..
    var newDataToSave = JSON.stringify(products);

    //Overskriv den gamle products.json med vores nye products object
    fs.writeFile('products.json', newDataToSave, err => {
    // error checking
    if(err) throw err;  
    console.log("New data added");
    });

  //Returner besked til klienten.
    res.send('Produkt redigeret '+title+' - '+description+' - '+price+' - '+category);
});
  


module.exports = router;