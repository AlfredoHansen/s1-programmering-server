let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");

//Assertion Style
chai.should();
chai.use(chaiHttp);

describe('Test alle APIer', function() {
  describe('Get /api/products', function() {
    it('It should get all the products', function(done) {
        chai.request('http://localhost:3000')
            .get('/api/products')
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.be.a('array');
                done();
            });
    });
  });
});