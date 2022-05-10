var express = require('express');
var router = express.Router();
const fs = require('fs');

//Importer database pakke
const { Connection, Request } = require("tedious");

//Lave database konfigurationer
const config = {
  authentication: {
    options: {
      userName: "Alfredo", // update me
      password: "Natoli91" // update me
    },
    type: "default"
  },
  server: "serverdbaa.database.windows.net", // update me
  options: {
    database: "DBA", //update me
    encrypt: true,
    useColumnNames : true,
  }
};

// PRODUKT SERVER
//Alle produkter
//Route /products - hent alle products på endpointet /api/products
router.get('/api/products', function(req, res, next) {

  //Hent category_id, location, price og color fra URL params
  let category_id = req.query.category_id;
  let location = req.query.location;
  let price = req.query.price;
  let color = req.query.color;
  
  //Tomt array
  var productsResponse = [];

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen, hvis ikke kastes der en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      //Her oprettes en SQL string, som skal hente product-info fra databasen
      // SELECT = Hvilke info vi gerne vil hente fra Eksamen.products
      // FROM = hvor vi gerne vil hente det fra ([Eksamen].[products])
      // INNER JOIN = Her sammenlignes [Eksamen].[users]'s id med [Eksamen].[products]'s user_id. Laves for at finde ud af hvilke brugere der er guld
      var sqlString = `
      SELECT 
        [Eksamen].[products].id,
        [Eksamen].[products].name,
        [Eksamen].[products].IMG,
        [Eksamen].[products].price,
        [Eksamen].[products].date,
        [Eksamen].[products].location,
        [Eksamen].[products].color,
        [Eksamen].[products].description,
        [Eksamen].[products].category_id,
        [Eksamen].[products].user_id
      FROM
        [Eksamen].[products]
      INNER JOIN
        [Eksamen].[users] ON [Eksamen].[products].user_id = [Eksamen].[users].id `;

        // if-statementet kigger på om der er blevet sendt værdier med fra URL params. (category_id, location, price, color)
        if(category_id) {
          sqlString += 'WHERE [Eksamen].[products].category_id = '+category_id+' ';
        }
        if(location) {
          sqlString += 'AND [Eksamen].[products].location = '+location+' ';
        }
        if(price) {
          sqlString += 'AND [Eksamen].[products].price <= '+price+' ';
        }
        // color er indkapslet med \'\', dette er den eneste af de fire værdier der er en varchar
        if(color) {
          sqlString += 'AND [Eksamen].[products].color = \''+color+'\' ';
        }
      
        //Her placeres de i en rækkefølge hvorpå guld kommer øverst og derefter løber den igennem nyeste produkter
        sqlString += `
        ORDER BY 
          [Eksamen].[users].is_gold DESC,
          [Eksamen].[products].id DESC;
        `;

      // Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );
      //Disse linjer mapper generisk felter fra vores sql-statement og laver dem til objeker, som så bliver tilføjet til et array.
      request.on('row', function(columns) {
        var _item = {};
        for (var name in columns) {
          _item[columns[name].metadata.colName] = columns[name].value;
        }
      
        productsResponse.push(_item);
      });
      
      //requesten hentes og bliver responderet
      request.on('requestCompleted', function () { 
        res.send(productsResponse);
      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //forbinder
  connection.connect();

});

// KATEGORI SERVER
//Alle kategorier
//Route /categories - hent alle categories
router.get('/api/categories', function(req, res, next) {

  //Tomt categoriesResponse array
  var categoriesResponse = [];

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      //Her oprettes en SQL string, som skal hente alt fra Eksamen.categories i databasen
      var sqlString = "SELECT * FROM Eksamen.categories";

      // Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );
      //Disse linjer mapper generisk felter fra vores sql-statement og laver dem til objeker, som så bliver tilføjet til et array.
      request.on('row', function(columns) {
        var _item = {};
        for (var name in columns) {
          _item[columns[name].metadata.colName] = columns[name].value;
        }
        
        categoriesResponse.push(_item);

      });
      
      //requesten hentes og bliver responderet
      request.on('requestCompleted', function () { 
        res.send(categoriesResponse);
      });

      //"Afyre" SQL request
      connection.execSql(request);
    }
    
  });
  //forbinder
  connection.connect();

});

//Lad en bruger følge et produkt
router.get('/api/products/follow', function(req, res, next) {

  //Hent userId og productId ud fra url params
  let userId = req.query.userId;
  let productId = req.query.productId;
  
  //Forbind med database konfigurationer
  const connection = new Connection(config);

 // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {

      //Her oprettes en SQL string, som skal har til formål at indsætte nogle oplysninger i users_products tabellen
      //INSERT INTO = Her indsættes user_id og product_id til [Eksamen].[users_products]
      //VALUES = her indsættes værdierne der skal på user_id og product_id's plads
      var sqlString = "INSERT INTO [Eksamen].[users_products] (user1_id, product_id) VALUES ('"+userId+"', '"+productId+"');";

      // Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );

      //Nu har den fundet alle rækker i databasen
      request.on('requestCompleted', function () { 

        //indsættes
        var productResponse = {
          'userId': userId,
          'productId': productId
        }

        //Send response tilbage
        res.send(productResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //forbinder
  connection.connect();
});

//Lav Produkt
//Hent produkt
router.post('/api/products/create', function(req, res, next) {

  //Hent name, desciption, price, category_id, user_id, date, location, color, imagepath fra url params
  let name = req.query.name;
  let description = req.query.description;
  let price = req.query.price;
  let category_id = req.query.category_id;
  let user_id = req.query.user_id;
  let date = req.query.date.replace('T', ' ');
  let location = req.query.location;
  let color = req.query.color;
  let imagePath = uploadImage(req, makeid(10));

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      //Her oprettes en SQL string, som skal har til formål at indsætte nogle oplysninger i Eksamen.products tabellen
      //INSERT INTO = Her indsættes name, description, price, category_id, user_id, date, location, color og IMG til [Eksamen].[products]
      //VALUES = her indsættes værdierne der skal på name, description, price, category_id, user_id, date, location, color og IMG's plads
      var sqlString = "INSERT INTO Eksamen.products (name, description, price, category_id, user_id, date, location, color, IMG) VALUES ('"+name+"', '"+description+"', '"+price+"', '"+category_id+"', '"+user_id+"', '"+date+"', '"+location+"', '"+color+"', '"+imagePath+"')";

      // Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );

      //Nu har den fundet alle rækker databasen
      request.on('requestCompleted', function () { 

        //Her indsættes værdierne
        var productResponse = {
          'name': name,
          'description': description,
          'price': price,
          'category_id': category_id,
          'user_id': user_id,
          'date': date,
          'location': location,
          'color': color,
          'IMG': imagePath,
        }

        //Send response tilbage
        res.send(productResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //Forbinder
  connection.connect();
});

//Rediger et Produkt
router.get('/api/products/edit', function(req, res, next) {

  //Hent name, description, price, category_id, user_id, location, color og product_id ud fra url params
  let name = req.query.name;
  let description = req.query.description;
  let price = req.query.price;
  let category_id = req.query.category_id;
  let user_id = req.query.user_id;
  let location = req.query.location;
  let color = req.query.color;
  let product_id = req.query.id;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      //Her oprettes en SQL string, som skal har til formål at redigere i nogle oplysninger i Eksamen.products tabellen
      //UPDATE = opdaterer nogle værdier i objekterne i tabellen
      //SET = Specificere hvilke værdier der skal opdateres
      var sqlString = "UPDATE Eksamen.products SET name='"+name+"', description='"+description+"', price='"+price+"', category_id='"+category_id+"', user_id='"+user_id+"', location='"+location+"', color='"+color+"' WHERE id='"+product_id+"'";

      // Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );

      //Nu har den fundet alle rækker i databasen
      request.on('requestCompleted', function () { 

        //Her indsættes værdierne
        var productResponse = {
          'id': product_id,
          'name': name,
          'description': description,
          'price': price,
          'category_id': category_id,
          'user_id': user_id,
          'location': location,
          'color': color,
        }

        //Sender response tilbage
        res.send(productResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //Forbinder
  connection.connect();
});

//Tilføj billede
function uploadImage(req, imageId) {
  try {
    if(!req.files) {
        res.send({
          status: false,
          message: 'No file uploaded'
        });
    } else {
        
      let productImage = req.files.product;
        
      //laver filens sti på serveren 
      var filePath = '/uploads/' + imageId + '_' + productImage.name;

      //Flyt billedet til filens sti
      productImage.mv('./public' + filePath);

      //Retuner filens sti
      return filePath;

    }  
  } catch (err) {
      res.status(500).send(err);
    } 
}


//Giv hvert billede et random id
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

//USERS SERVER
//Create user
//Hent user
router.get('/api/users/create', function(req, res, next) {

  //Hent name, email, password, is_gold og usertype_id ud fra url params
  let name = req.query.name;
  let email = req.query.email;
  let password = req.query.password;
  let is_gold = req.query.is_gold;
  let usertype_id = req.query.usertype_id;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      //Her oprettes en SQL string, som skal har til formål at indsætte nogle oplysninger i Eksamen.users tabellen
      //INSERT INTO = Her indsættes name, email, password, is_gold og usertype_id til [Eksamen].[products]
      //VALUES = her indsættes værdierne der skal på name, email, password, is_gold og usertype_id's plads
      var sqlString = "INSERT INTO Eksamen.users (name, email, password, is_gold, usertype_id) VALUES ('"+name+"', '"+email+"', '"+password+"', '"+is_gold+"', '"+usertype_id+"')";
    

      // Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );

      //Nu har den fundet alle rækker i databasen
      request.on('requestCompleted', function () { 

        //Her indsættes værdierne
        var userResponse = {
          'name': name,
          'email': email,
          'password': password,
          'is_gold': is_gold,
          'usertype_id': usertype_id
        }

        //Send response tilbage
        res.send(userResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //Forbinder
  connection.connect();
});

//Log ind
//Hent user
router.get('/api/users/login', function(req, res, next) {
  
  //Hent navn og password ud fra url params
  let email = req.query.email;
  let password = req.query.password;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  //Tomt array
  var userResponse = [];

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      //Her oprettes en SQL string, som skal har til formål at hente alle oplysninger i Eksamen.users tabellen hvor det stemmer overens med de indtastede oplysninger.
      //SELECT * FROM = henter alt fra Eksamen.users
      //WHERE = Her betyder det altså at den skal hente alle men at der er nogle krav altså her at email og password stemmer ens med nogle i databasen
      var sqlString = "SELECT * FROM Eksamen.users WHERE email ='"+email+"' AND password ='"+password+"'";

      //Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }

      );
      //Disse linjer mapper generisk felter fra vores sql-statement og laver dem til objeker, som så bliver tilføjet til et array.
      request.on('row', function(columns) {
        var _item = {};
        for (var name in columns) {
          _item[columns[name].metadata.colName] = columns[name].value;
        }

        //Tilføjes til response-objektet
        userResponse.push(_item);

      });

      //Nu har den fundet alle rækker i databasen
      request.on('requestCompleted', function () { 

        //Sender response tilbage
        res.send(userResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //Forbinder
  connection.connect();
});

//Dette endpoint bliver brugt af admins til at hente alle brugere ud
//Hent alle users
router.get('/api/admin/users', function(req, res, next) {
  
  //Forbind med database konfigurationer
  const connection = new Connection(config);

  //Tomt array
  var userResponse = [];

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      //Her oprettes en SQL string, som skal hente bruger-info fra databasen
      // SELECT = Hvilke info vi gerne vil hente fra Eksamen.users
      // COUNT = tæller hvor mange produkter der er tilknyttet til hvert user_id
      // FROM = hvor vi gerne vil hente dataen fra ([Eksamen].[users])
      // INNER JOIN = Her sammenlignes [Eksamen].[users]'s id med [Eksamen].[products]'s user_id. Laves for at finde ud af hvilke brugere, der har hvilke produkter
      // GROUP BY = Dette gøres for at gruppere værdierne til det sammenlagte antal produkter pr bruger
      var sqlString = `
      SELECT 
      [Eksamen].[users].id,
      [Eksamen].[users].name,
      [Eksamen].[users].email,
      [Eksamen].[users].password,
      [Eksamen].[users].is_gold,
      [Eksamen].[users].usertype_id,
      COUNT([Eksamen].[products].id) AS total_product_count
    FROM
      [Eksamen].[users]
    LEFT JOIN
      [Eksamen].[products] ON [Eksamen].[users].id = [Eksamen].[products].user_id
    GROUP BY 
      [Eksamen].[users].id,
      [Eksamen].[users].name,
      [Eksamen].[users].email,
      [Eksamen].[users].password,
      [Eksamen].[users].is_gold,
      [Eksamen].[users].usertype_id;
      `;

      //Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }

      );
      //Disse linjer mapper generisk felter fra vores sql-statement og laver dem til objeker, som så bliver tilføjet til et array.
      request.on('row', function(columns) {
        var _item = {};
        for (var name in columns) {
          _item[columns[name].metadata.colName] = columns[name].value;
        }

        //Tilføjes til response-objektet
        userResponse.push(_item);

      });

      //Nu har den fundet alle rækker i databasen
      request.on('requestCompleted', function () { 

        //Send response tilbage
        res.send(userResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //Forbinder
  connection.connect();
});

//Admin skal kunne slette bruger
router.get('/api/admin/users/delete', function(req, res, next) {

  //Hent userId ud fra url params
  let userId = req.query.id;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      //Her oprettes en SQL string, som har til formpl at slette bruger-info fra databasen
      // DELETE FROM = her bestemmes at der skal slettes fra tabellen Eksamen.users
      // WHERE = Med det kriterie at id er det samme som et userId i databasen 
      var sqlString = "DELETE FROM Eksamen.products WHERE user_id = '"+userId+"' DELETE FROM Eksamen.users_products WHERE user1_id = '"+userId+"' DELETE FROM Eksamen.users WHERE id=+'"+userId+"'";

      //Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );
        
      //requesten hentes og bliver responderet
      request.on('requestCompleted', function () { 
        res.send('deleted');
      });

      //"Afyre" SQL request
      connection.execSql(request);
    }
  });
  //Forbinder
  connection.connect();
});

//Delete produkt
//Slet et enkelt produkt
router.get('/api/products/delete', function(req, res, next) {

  //Hent productId ud fra url params
  let productId = req.query.id;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      // Her oprettes en SQL string, som har til formål at slette produkt-info fra databasen
      // DELETE FROM = her bestemmes at der skal slettes fra tabellen Eksamen.products
      // WHERE = Med det kriterie at id'et er det samme som et productId'et i databasen 
      var sqlString = "DELETE FROM Eksamen.users_products WHERE product_id= '"+productId+"' DELETE FROM Eksamen.products WHERE id=+'"+productId+"'";

      //Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );
      //requesten hentes og bliver responderet
      request.on('requestCompleted', function () { 
        res.send('deleted');
      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //Forbinder
  connection.connect();
});

//User profile
//Alle users produkter
router.get('/api/users/profile', function(req, res, next) {

  //Hent userId ud fra url params
  let userId = req.query.userId;

  //Tomt array
  var productsResponse = [];

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      // Her oprettes en SQL string, som har til formål at hente alle brugere med det userId fra databasen
      // SELECT * FROM = her bestemmes det at alt fra tabellen Eksamen.products skal hentes ud
      // WHERE = Med det kriterie at user_id'et er det samme som userId'et i databasen 
      var sqlString = "SELECT * FROM Eksamen.products WHERE user_id=+'"+userId+"'";

      //Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );
      //Disse linjer mapper generisk felter fra vores sql-statement og laver dem til objeker, som så bliver tilføjet til et array.
      request.on('row', function(columns) {
        var _item = {};
        for (var name in columns) {
          _item[columns[name].metadata.colName] = columns[name].value;
        }
        
        //Tilføjes til response-objektet
        productsResponse.push(_item);
      });
      
      //requesten hentes og bliver responderet
      request.on('requestCompleted', function () { 
        res.send(productsResponse);
      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //Forbinder
  connection.connect();

});

//Follow et produkt
router.get('/api/users/products-follows', function(req, res, next) {

  //Hent userId ud fra url params
  let userId = req.query.userId;

  //Tomt array
  var productsResponse = [];

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      // Her oprettes en SQL string, som har til formål at gør det muligt at følge et produkt
      // SELECT * FROM = her bestemmes det at alt fra tabellen Eksamen.users_products skal hentes ud
      // LEFT JOIN = dette gøres ved at sammenligne product_id med det product_id der er i users_product tabellen
      // WHERE = dog med det kriterie at userId'et er det samme 
      // ORDER BY/DESC = Dette gøres for at sortere efter id'et så det nyeste produkt man har fulgt altid er øverst
      var sqlString = "SELECT * FROM [Eksamen].[users_products] LEFT JOIN [Eksamen].[products] ON [Eksamen].[products].id = [Eksamen].[users_products].product_id WHERE user1_id = '"+userId+"' ORDER BY [Eksamen].[users_products].id DESC;";

      //Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );
      //Disse linjer mapper generisk felter fra vores sql-statement og laver dem til objeker, som så bliver tilføjet til et array.
      request.on('row', function(columns) {
        var _item = {};
        for (var name in columns) {
          _item[columns[name].metadata.colName] = columns[name].value;
        }

        //Tilføjes til response-objektet
        productsResponse.push(_item);
      });

      //requesten hentes og bliver responderet
      request.on('requestCompleted', function () { 
        res.send(productsResponse);
      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //Forbinder
  connection.connect();

});

//Update user
router.get('/api/users/edit', function(req, res, next) {

  //Hent titel, beskrivelse, pris, kategori, et tilfældigt id og userId fra url params
  let name = req.query.name;
  let password = req.query.password;
  let email = req.query.email;
  let user_id = req.query.user_id;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {

      //Her oprettes en SQL string, som skal har til formål at redigere i nogle oplysninger i Eksamen.users tabellen
      //UPDATE = opdaterer nogle værdier i objekterne i tabellen
      //SET = Specificere hvilke værdier der skal opdateres
      var sqlString = "UPDATE Eksamen.users SET name='"+name+"', email='"+email+"', password='"+password+"' WHERE id='"+user_id+"'";

      //Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );

      //Nu har den fundet alle rækker i databasen
      request.on('requestCompleted', function () { 

        //Her indsættes værdierne
        var userResponse = {
          'id': user_id
        }

        //Send response tilbage
        res.send(userResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);
    }
  });
  //Forbinder
  connection.connect();
});

//Admin skal kun redigere bruger
router.get('/api/admin/users/edit', function(req, res, next) {

  //Hent name, password, emaik, user_id, usertype_id og is_gold ud fra url params
  let name = req.query.name;
  let password = req.query.password;
  let email = req.query.email;
  let user_id = req.query.user_id;
  let usertype_id = req.query.usertype_id;
  let is_gold = req.query.is_gold;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen eller kast en fejl
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      //Her oprettes en SQL string, som skal har til formål at redigere i nogle oplysninger i Eksamen.users tabellen
      //UPDATE = opdaterer nogle værdier i objekterne i tabellen
      //SET = Specificere hvilke værdier der skal opdateres
      var sqlString = "UPDATE Eksamen.users SET name='"+name+"', email='"+email+"', password='"+password+"', usertype_id='"+usertype_id+"', is_gold='"+is_gold+"' WHERE id='"+user_id+"'";

      //Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
      const request = new Request(
        sqlString,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );

      //Nu har den fundet alle rækker i databasen
      request.on('requestCompleted', function () { 

        //Her indsættes værdierne
        var userResponse = {
          'id': user_id
        }

        //Send response tilbage
        res.send(userResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });
  //Forbinder
  connection.connect();
});

//slet bruger
router.get('/api/users/delete', function(req, res, next) {

    //Hent id ud fra url params
    let id = req.query.id;
  
    //Forbind med database konfigurationer
    const connection = new Connection(config);
  
    // Check on der er hul til databasen eller kast en fejl
    connection.on("connect", err => {
      if (err) {
        console.error(err.message);
      } else {
         
        // Her oprettes en SQL string, som har til formål at slette user-info fra databasen
        // DELETE FROM = her bestemmes at der skal slettes fra tabellen Eksamen.users
        // WHERE = Med det kriterie at id'et er det samme som id'et i databasen 
        var sqlString = "DELETE FROM Eksamen.products WHERE user_id = '"+id+"' DELETE FROM Eksamen.users_products WHERE user1_id = '"+id+"' DELETE FROM Eksamen.users WHERE id='"+id+"'";
  
        //Læser alle rækkerne fra tabellerne eller hvis ikke muligt, kastes en fejl, ellers returneres rækkerne
        const request = new Request(
          sqlString,
            (err, rowCount) => {
            if (err) {
              console.error(err.message);
            } else {
              console.log(`${rowCount} row(s) returned`);
            }
          }
        );
  
        //Nu har den fundet alle rækker i databasen
        request.on('requestCompleted', function () { 
  
          //Her indsættes værdierne
          var userResponse = {
            'id': id,
          }
  
          //Send response tilbage
          res.send(userResponse);
  
        });
  
        //"Afyre" SQL request
        connection.execSql(request);
  
      }
      
    });
    //Forbind
    connection.connect();
  });
module.exports = router;