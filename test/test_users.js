process.env.NODE_ENV = 'test';

var chai = require('chai');
var chai_http = require('chai-http');
var server = require('../server/app');
var should = chai.should();

var User = require('../model/users');

chai.use(chai_http);

var mongoose = require('mongoose');

//http://mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai/

function checkResponse(response, code) {
    response.should.have.status(code);
    response.should.be.json;
    response.body.should.be.a('object');

    if(code == 200 || code == 201) {
        response.body.should.not.have.property('error');
        response.body.should.have.property('code');
        response.body.code.should.be.equal("" + code);

        response.body.should.have.property('data');
        response.body.data.should.not.be.null;
    } else {
        response.body.should.have.property('error');
        response.body.should.not.have.property('data');
        response.body.should.have.property('code');
        response.body.code.should.be.equal("" + code);
    }



}

describe('User', function () {
    User.collection.drop();

    beforeEach(function (done) {
        var new_user = new User({
            username: 'batman',
            email: 'batman@statoil.com'
        });
        new_user.save(function (err) {
            done();
        });
    });

    afterEach(function (done) {
        User.collection.drop();
        done();
    });


    it('should list ALL users on /users GET', function (done) {
        chai.request(server)
            .get('/users')
            .end(function (err, res) {
                checkResponse(res, 200);

                res.body.data.should.be.a('array');
                var data = res.body.data;
                data[0].should.have.property('_id');
                data[0].should.have.property('username');
                data[0].should.have.property('email');
                data[0].username.should.equal('batman');
                data[0].email.should.equal('batman@statoil.com');
                done();
            });
    });
    it('should list a SINGLE user on /users/<id> GET', function (done) {
        var new_user = new User({
            username: 'catwoman',
            email: 'catwoman@statoil.com'
        });
        new_user.save(function (err, data) {
            chai.request(server)
                .get('/users/' + data.id)
                .end(function (err, res) {
                    checkResponse(res, 200);
                    res.body.data.should.be.a('object');
                    res.body.data.should.have.property('_id');
                    res.body.data.should.have.property('username');
                    res.body.data.should.have.property('email');
                    var res_data = res.body.data;

                    res_data.username.should.equal('catwoman');
                    res_data.email.should.equal('catwoman@statoil.com');
                    res_data._id.should.equal(data.id);
                    done();
                });
        });
    });
    it('should add a SINGLE user on /users POST', function (done) {
        var username = "catwoman";
        var email = "catwoman@statoil.com";
        chai.request(server)
            .post('/users')
            .send({username: username, email: email})
            .end(function (err, res) {
                checkResponse(res, 201);
                res.body.data.should.be.a('object');
                res.body.data.should.have.property('username');
                res.body.data.username.should.be.equal(username);
                res.body.data.should.have.property('email');
                res.body.data.email.should.be.equal(email);
                done()
            });
    });
    it('should update a SINGLE user on /users/<id> PUT', function (done) {
        chai.request(server)
            .get('/users')
            .end(function (err, res) {
                chai.request(server)
                    .put('/users/' + res.body.data[0]._id)
                    .send({'username': 'prattman'})
                    .end(function (error, response) {
                        checkResponse(response, 200);
                        response.body.data.should.be.a('object');
                        response.body.data.should.have.property('username');
                        response.body.data.should.have.property('email');
                        response.body.data.should.have.property('_id');
                        response.body.data.username.should.be.a('string');
                        response.body.data.username.should.equal('prattman');
                        done();
                    });
            });
    });
    it('should fail to update a SINGLE user with illegal id on /users/<id> PUT', function (done) {
        chai.request(server)
            .put('/users/666')
            .send({'username': 'illegalman'})
            .end(function (error, response) {
                checkResponse(response, 400);
                done();
            });
    });
    it('should fail to update a SINGLE unknown user on /users/<id> PUT', function (done) {
        chai.request(server)
            .put('/users/' + mongoose.Types.ObjectId(666))
            .send({'username': 'failman'})
            .end(function (error, response) {
                checkResponse(response, 404);
                done();
            });
    });
    it('should delete a SINGLE user on /users/<id> DELETE', function (done) {
        chai.request(server)
            .get('/users')
            .end(function (err, res) {
                chai.request(server)
                    .delete('/users/' + res.body.data[0]._id)
                    .end(function (error, response) {
                        checkResponse(response, 200);
                        response.body.data.should.be.a('object');
                        response.body.data.should.have.property('username');
                        response.body.data.should.have.property('_id');
                        response.body.data.username.should.equal('batman');
                        done();
                    });
            });
    });

    it('should fail to delete a SINGLE unknown user on /users/<id> DELETE', function (done) {
        chai.request(server)
            .delete('/users/' + mongoose.Types.ObjectId(666))
            .end(function (error, response) {
                checkResponse(response, 404);
                done();
            });
    });
});
