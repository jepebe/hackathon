var express = require('express');
var router = express.Router();
var UserModel = require("../model/users");

router.route("/")
    .get(function (req, res) {
        // Mongo command to fetch all data from collection.
        UserModel.find(function (err, data) {
            var response = {};
            if (err) {
                response = {"error": "Error fetching data"};
            } else {
                response = {"data": data};
            }
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
                response = {"error": "Error adding data: " + err};
            } else {
                response = {"data": user};
            }
            res.json(response);
        });
    });

router.route("/:id")
    .get(function (req, res) {
        var response = {};
        UserModel.findById(req.params.id, function (err, data) {
            if (err) {
                response = {"error": "Error fetching data"};
            } else {
                response = {"data": data};
            }
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
                response = {"error": "Error fetching data: " + err};
            } else if(doc == null) {
                response = {"error": "Unable to find user with id: " +  req.params.id};
            } else {
                response = {"data": doc};
            }
            res.json(response);
        });
    })
    .delete(function (req, res) {
        UserModel.findOneAndRemove({_id: req.params.id}, function(err, doc, result) {
            var response = {};

            if (err) {
                response = {"error": "Error deleting user: " + err};
            } else if(doc == null) {
                response = {"error":  "Unable to find user with id: " +  req.params.id};
            } else {
                response = {"data": doc};
            }
            res.json(response);

        });
    });


module.exports = router;
