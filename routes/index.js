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

//http://localhost:3000/api/databaseinsert?email=test@gmail&name=Test&password=secretthing&is_gold=1&usertype_id=1
router.get('/api/databaseinsert', function(req, res, next) {

  //Brug af query parameter fra URL'en 
  //Eksempelvis = http://localhost:3000/api/databasetestnew?email=oll@gmail.com
  //let email = req.query.email;
  let name = req.query.name;
  let email = req.query.email;
  let password = req.query.password;
  let is_gold = req.query.is_gold;
  let usertype_id = req.query.usertype_id;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      

      var sqlString = "INSERT INTO Eksamen.users (name, email, password, is_gold, usertype_id) VALUES ('"+name+"', '"+email+"', '"+password+"', '"+is_gold+"', '"+usertype_id+"')";
      //var sqlString = "SELECT * FROM Eksamen.users WHERE email = 'sof@gmail.com'";

      // Read all rows from table
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

      //Nu har den fundet alle rækker i jeres database
      request.on('requestCompleted', function () { 

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

  connection.connect();

});

//http://localhost:3000/api/databasetestnew?id=12
router.get('/api/databasetestnew', function(req, res, next) {

  //Brug af query parameter fra URL'en 
  //Eksempelvis = http://localhost:3000/api/databasetestnew?email=oll@gmail.com
  //let email = req.query.email;
  let id = req.query.id;

  console.log(id);

  //Et array hvor vi gemmer alle vores bruger objekter fra databasen
  var userResponse = [];

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      var sqlString = "SELECT * FROM Eksamen.users WHERE id = '"+id+"'";
      //var sqlString = "SELECT * FROM Eksamen.users WHERE email = 'sof@gmail.com'";

      // Read all rows from table
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

      request.on('row', function(columns) {
        var _item = {};
        for (var name in columns) {
          _item[columns[name].metadata.colName] = columns[name].value;
        }

        //Tilføjer i til jeres response obj
        userResponse.push(_item);

      });
      
      //Nu har den fundet alle rækker i jeres database
      request.on('requestCompleted', function () { 

        //Send response tilbage
        res.send(userResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });

  connection.connect();

});

//http://localhost:3000/api/databasetest
router.get('/api/databasetest', function(req, res, next) {

  var userResponse = [];

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      // Read all rows from table
      const request = new Request(
        `SELECT * FROM Eksamen.users`,
        //`SELECT name, email, is_gold FROM Eksamen.users`,
          (err, rowCount) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`${rowCount} row(s) returned`);
          }
        }
      );

      request.on('row', function(columns) {

        var _item = {};

        for (var name in columns) {

          _item[columns[name].metadata.colName] = columns[name].value;
        }
        
        userResponse.push(_item);


      });
      
      request.on('requestCompleted', function () { 
        res.send(userResponse);
      });

      connection.execSql(request);

    }
    
  });

  connection.connect();

});

// PRODUKT SERVER
//Alle produkter
//Route /products - hent alle products
router.get('/api/products', function(req, res, next) {

  //Hent category fra URL params
  let category_id = req.query.category_id;
  let location = req.query.location;
  let price = req.query.price;
  let color = req.query.color;
  
  var productsResponse = [];

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      

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

        if(category_id) {
          sqlString += 'WHERE [Eksamen].[products].category_id = '+category_id+' ';
        }
        if(location) {
          sqlString += 'AND [Eksamen].[products].location = '+location+' ';
        }
        if(price) {
          sqlString += 'AND [Eksamen].[products].price <= '+price+' ';
        }
        if(color) {
          sqlString += 'AND [Eksamen].[products].color = \''+color+'\' ';
        }

      sqlString += `
      ORDER BY 
        [Eksamen].[users].is_gold DESC,
        [Eksamen].[products].id DESC
        ;
      `;

      // Read all rows from table
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

      request.on('row', function(columns) {

        var _item = {};

        for (var name in columns) {

          _item[columns[name].metadata.colName] = columns[name].value;
        }
        
        productsResponse.push(_item);


      });
      
      request.on('requestCompleted', function () { 
        res.send(productsResponse);
      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });

  connection.connect();

});

// KATEGORI SERVER
//Alle kategorier
//Route /categories - hent alle categories
router.get('/api/categories', function(req, res, next) {

  var categoriesResponse = [];

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      var sqlString = "SELECT * FROM Eksamen.categories";

      // Read all rows from table
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

      request.on('row', function(columns) {

        var _item = {};

        for (var name in columns) {

          _item[columns[name].metadata.colName] = columns[name].value;
        }
        
        categoriesResponse.push(_item);


      });
      
      request.on('requestCompleted', function () { 
        res.send(categoriesResponse);
      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });

  connection.connect();

});

//Lad en bruger følge et produkt
router.get('/api/products/follow', function(req, res, next) {

  //Hent titel, beskrivelse, pris, kategori, et tilfældigt id og userId fra url params
  let userId = req.query.userId;
  let productId = req.query.productId;
  
  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      var sqlString = "INSERT INTO [Eksamen].[users_products] (user1_id, product_id) VALUES ('"+userId+"', '"+productId+"');";

      // Read all rows from table
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

      //Nu har den fundet alle rækker i jeres database
      request.on('requestCompleted', function () { 

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

  connection.connect();
});

//Lav Produkt
//Hent produkt
router.post('/api/products/create', function(req, res, next) {

  //Hent titel, beskrivelse, pris, kategori, et tilfældigt id og userId fra url params
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

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      // Vi skriver i SQL sprog, som betyder at INSER INTO (de "ting" der skal indsættes i) og derefter VALUES som er værdierne der bliver tilføjet
      var sqlString = "INSERT INTO Eksamen.products (name, description, price, category_id, user_id, date, location, color, IMG) VALUES ('"+name+"', '"+description+"', '"+price+"', '"+category_id+"', '"+user_id+"', '"+date+"', '"+location+"', '"+color+"', '"+imagePath+"')";
      //var sqlString = "SELECT * FROM Eksamen.users WHERE email = 'sof@gmail.com'";

      // Read all rows from table
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

      //Nu har den fundet alle rækker i jeres database
      request.on('requestCompleted', function () { 

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

  connection.connect();
});

//Update Produkt
router.get('/api/products/edit', function(req, res, next) {

  //Hent titel, beskrivelse, pris, kategori, et tilfældigt id og userId fra url params
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

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
       
      var sqlString = "UPDATE Eksamen.products SET name='"+name+"', description='"+description+"', price='"+price+"', category_id='"+category_id+"', user_id='"+user_id+"', location='"+location+"', color='"+color+"' WHERE id='"+product_id+"'";

      // Read all rows from table
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

      //Nu har den fundet alle rækker i jeres database
      request.on('requestCompleted', function () { 

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

        //Send response tilbage
        res.send(productResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });

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

// USERS SERVER
// Create user
//Hent user
router.get('/api/users/create', function(req, res, next) {

  //Hent navn, email, password og tilfældigt id fra url params
  let name = req.query.name;
  let email = req.query.email;
  let password = req.query.password;
  let is_gold = req.query.is_gold;
  let usertype_id = req.query.usertype_id;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      // Vi skriver i SQL sprog, som betyder at INSER INTO (de "ting" der skal indsættes i) og derefter VALUES som er værdierne der bliver tilføjet
      var sqlString = "INSERT INTO Eksamen.users (name, email, password, is_gold, usertype_id) VALUES ('"+name+"', '"+email+"', '"+password+"', '"+is_gold+"', '"+usertype_id+"')";
    

      // Read all rows from table
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

      //Nu har den fundet alle rækker i jeres database
      request.on('requestCompleted', function () { 

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

  connection.connect();
});

// Log ind
//Hent user
router.get('/api/users/login', function(req, res, next) {
  
  //Hent navn, email, password og tilfældigt id fra url params
  let email = req.query.email;
  let password = req.query.password;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  var userResponse = [];

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      // Vi skriver i SQL sprog, som betyder at INSER INTO (de "ting" der skal indsættes i) og derefter VALUES som er værdierne der bliver tilføjet
      var sqlString = "SELECT * FROM Eksamen.users WHERE email ='"+email+"' AND password ='"+password+"'";
      //var sqlString = "SELECT * FROM Eksamen.users WHERE email = 'sof@gmail.com'";

      // Read all rows from table
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

      request.on('row', function(columns) {
        var _item = {};
        for (var name in columns) {
          _item[columns[name].metadata.colName] = columns[name].value;
        }

        //Tilføjer i til jeres response obj
        userResponse.push(_item);

      });

      //Nu har den fundet alle rækker i jeres database
      request.on('requestCompleted', function () { 

        //Send response tilbage
        res.send(userResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });

  connection.connect();
});

// Dette endpoint bliver brugt af admins til at hente alle brugere ud
//Hent alle users
router.get('/api/admin/users', function(req, res, next) {
  
  //Forbind med database konfigurationer
  const connection = new Connection(config);

  var userResponse = [];

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      


      // Vi skriver i SQL sprog, som betyder at INSER INTO (de "ting" der skal indsættes i) og derefter VALUES som er værdierne der bliver tilføjet
      //var sqlString = "SELECT * FROM Eksamen.users";

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

      // Read all rows from table
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

      request.on('row', function(columns) {
        var _item = {};
        for (var name in columns) {
          _item[columns[name].metadata.colName] = columns[name].value;
        }

        //Tilføjer i til jeres response obj
        userResponse.push(_item);

      });

      //Nu har den fundet alle rækker i jeres database
      request.on('requestCompleted', function () { 

        //Send response tilbage
        res.send(userResponse);

      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });

  connection.connect();
});

// Delete user
//Slet et enkelt produkt
router.get('/api/admin/users/delete', function(req, res, next) {

  let userId = req.query.id;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      var sqlString = "DELETE FROM Eksamen.users WHERE id=+'"+userId+"'";

      // Read all rows from table
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
  
      request.on('requestCompleted', function () { 
        res.send('deleted');
      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });

  connection.connect();

});

// Delete produkt
//Slet et enkelt produkt
router.get('/api/products/delete', function(req, res, next) {

  let productId = req.query.id;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      var sqlString = "DELETE FROM Eksamen.products WHERE id=+'"+productId+"'";

      // Read all rows from table
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
  
      request.on('requestCompleted', function () { 
        res.send('deleted');
      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });

  connection.connect();

});

// User profile
//Alle users produkter
router.get('/api/users/profile', function(req, res, next) {

  let userId = req.query.userId;

  var productsResponse = [];

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      var sqlString = "SELECT * FROM Eksamen.products WHERE user_id=+'"+userId+"'";

      // Read all rows from table
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

      request.on('row', function(columns) {

        var _item = {};

        for (var name in columns) {

          _item[columns[name].metadata.colName] = columns[name].value;
        }
        
        productsResponse.push(_item);


      });
      
      request.on('requestCompleted', function () { 
        res.send(productsResponse);
      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });

  connection.connect();

});

// User profile
//Alle users produkter
router.get('/api/users/products-follows', function(req, res, next) {

  let userId = req.query.userId;

  var productsResponse = [];

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      
      var sqlString = "SELECT * FROM [Eksamen].[users_products] LEFT JOIN [Eksamen].[products] ON [Eksamen].[products].id = [Eksamen].[users_products].product_id WHERE user1_id = '"+userId+"' ORDER BY [Eksamen].[users_products].id DESC;";

      // Read all rows from table
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

      request.on('row', function(columns) {

        var _item = {};

        for (var name in columns) {

          _item[columns[name].metadata.colName] = columns[name].value;
        }
        
        productsResponse.push(_item);


      });
      
      request.on('requestCompleted', function () { 
        res.send(productsResponse);
      });

      //"Afyre" SQL request
      connection.execSql(request);

    }
    
  });

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

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
       
      var sqlString = "UPDATE Eksamen.users SET name='"+name+"', email='"+email+"', password='"+password+"' WHERE id='"+user_id+"'";

      // Read all rows from table
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

      //Nu har den fundet alle rækker i jeres database
      request.on('requestCompleted', function () { 

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

  connection.connect();
});

//Update user
router.get('/api/admin/users/edit', function(req, res, next) {

  //Hent titel, beskrivelse, pris, kategori, et tilfældigt id og userId fra url params
  let name = req.query.name;
  let password = req.query.password;
  let email = req.query.email;
  let user_id = req.query.user_id;
  let usertype_id = req.query.usertype_id;
  let is_gold = req.query.is_gold;

  //Forbind med database konfigurationer
  const connection = new Connection(config);

  // Check on der er hul til databasen
  connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
       
      var sqlString = "UPDATE Eksamen.users SET name='"+name+"', email='"+email+"', password='"+password+"', usertype_id='"+usertype_id+"', is_gold='"+is_gold+"' WHERE id='"+user_id+"'";

      // Read all rows from table
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

      //Nu har den fundet alle rækker i jeres database
      request.on('requestCompleted', function () { 

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

  connection.connect();
});

//slet bruger
router.get('/api/users/delete', function(req, res, next) {
    
    let id = req.query.id;
  
    //Forbind med database konfigurationer
    const connection = new Connection(config);
  
    // Check on der er hul til databasen
    connection.on("connect", err => {
      if (err) {
        console.error(err.message);
      } else {
        
        // Vi skriver i SQL sprog, som betyder at INSER INTO (de "ting" der skal indsættes i) og derefter VALUES som er værdierne der bliver tilføjet
        var sqlString = "DELETE FROM Eksamen.users WHERE id='"+id+"'";
  
        // Read all rows from table
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
  
        //Nu har den fundet alle rækker i jeres database
        request.on('requestCompleted', function () { 
  
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
  
    connection.connect();
  });
module.exports = router;