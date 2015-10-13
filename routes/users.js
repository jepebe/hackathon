var express = require('express');
var router = express.Router();
var UserModel = require("../model/users");

function createResponse(code, value) {
    var response = {code: "" + code};
    if(code == 200 || code == 201) {
        response.data = value;
    } else if(code == 400 || code == 404) {
        response.error = value;
    }
    return response;
}

router.route("/")
    .get(function (req, res) {
        // Mongo command to fetch all data from collection.
        UserModel.find(function (err, data) {
            var response = {};
            if (err) {
                response = createResponse(400, "Error fetching data: " + err);
            } else {
                response = createResponse(200, data);
            }
            res.status(response.code);
            res.json(response);
        });
    })
    .post(function (req, res) {
        var user = new UserModel({
            username: req.body.username,
            email: req.body.email
        });

        user.save(function (err) {
            var response = {};
            if (err) {
                response = createResponse(400, "Error fetching data: " + err);
            } else {
                response = createResponse(201, user);
            }
            res.status(response.code);
            res.json(response);
        });
    });

router.route("/:id")
    .get(function (req, res) {
        var response = {};
        UserModel.findById(req.params.id, function (err, data) {
            if (err) {
                response = createResponse(400, "Error fetching data: " + err);
            } else if(data == null) {
                response = createResponse(404, "Unable to find user with id: " +  req.params.id);
            } else {
                response = createResponse(200, data);
            }
            res.status(response.code);
            res.json(response);
        });
    })
    .put(function (req, res) {
        var changes = {};
        if (req.body.email !== undefined) {
            changes.email = req.body.email;
        }

        if (req.body.username !== undefined) {
            changes.username = req.body.username;
        }

        UserModel.findOneAndUpdate({_id: req.params.id}, {$set: changes}, {new: true}, function (err, doc) {
            var response = {};

            if (err) {
                response = createResponse(400, "Error fetching data: " + err);
            } else if(doc == null) {
                response = createResponse(404, "Unable to find user with id: " +  req.params.id);
            } else {
                response = createResponse(200, doc);
            }
            res.status(response.code);
            res.json(response);
        });
    })
    .delete(function (req, res) {
        UserModel.findOneAndRemove({_id: req.params.id}, function(err, doc, result) {
            var response = {};
            if (err) {
                response = createResponse(400, "Error deleting user: " + err);
            } else if(doc == null) {
                response = createResponse(404, "Unable to find user with id: " +  req.params.id);
            } else {
                response = createResponse(200, doc);
            }
            res.status(response.code);
            res.json(response);

        });
    });


module.exports = router;
