let server = require("../app.js")
let chai = require("chai");
let chaiHttp = require("chai-http");
var expect = chai.expect;

// Testing endpoints
chai.use(chaiHttp);


  it('should return all products', function(done) { 
    chai.request(server)
    .get('/api/products')
    .end(function(err, res) {
      expect(res).to.have.status(200);  
      done()
    });
  });


  it('should return all products in tøj', function(done) { 
    chai.request(server)
    .get('/api/products?search=true&category_id=1')
    .end(function(err, res) {
      expect(res).to.have.status(200);  
      done()
    });
  });

  it('should return all products in møbler', function(done) { 
    chai.request(server)
    .get('/api/products?search=true&category_id=2')
    .end(function(err, res) {
      expect(res).to.have.status(200);  
      done()
    });
  });

  it('should return all products in bildele', function(done) { 
    chai.request(server)
    .get('/api/products?search=true&category_id=3')
    .end(function(err, res) {
      expect(res).to.have.status(200);  
      done()
    });
  });

  it('should return all products in køkkenudstyr', function(done) { 
    chai.request(server)
    .get('/api/products?search=true&category_id=4')
    .end(function(err, res) {
      expect(res).to.have.status(200);  
      done()
    });
  });

  it('should return all products in haveudstyr', function(done) { 
    chai.request(server)
    .get('/api/products?search=true&category_id=5')
    .end(function(err, res) {
      expect(res).to.have.status(200);  
      done()
    });
  });

  it('should return all products in legetøj', function(done) { 
    chai.request(server)
    .get('/api/products?search=true&category_id=6')
    .end(function(err, res) {
      expect(res).to.have.status(200);  
      done()
    });
  });

  it('should return all products in belysning', function(done) { 
    chai.request(server)
    .get('/api/products?search=true&category_id=7')
    .end(function(err, res) {
      expect(res).to.have.status(200);  
      done()
    });
  });

  it('should return all products in accessories', function(done) { 
    chai.request(server)
    .get('/api/products?search=true&category_id=8')
    .end(function(err, res) {
      expect(res).to.have.status(200);  
      done()
    });
  });

  it('should return all products in teknologi', function(done) { 
    chai.request(server)
    .get('/api/products?search=true&category_id=9')
    .end(function(err, res) {
      expect(res).to.have.status(200);  
      done()
    });
  });