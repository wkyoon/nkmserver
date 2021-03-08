const db = require('../models');
const config = require('../config/auth.config');

const Setting = db.setting;
const Package = db.package;
const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.list = async (req, res) => {
    console.log('package list');

    Package.findAll()
        .then((items) => {
            res.send({ items });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while retrieving tutorials.',
            });
        });
};



exports.create = async (req, res) => {
    console.log('package create');
    const { name, label, price,maxvalue,daily } = req.body.item;
    // console.log(item)
    Package.create({ name: name, label: label, price: price, maxvalue: maxvalue, daily: daily })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while creating the Tutorial.',
            });
        });

};

exports.update = async (req, res) => {
    console.log('package update');
    const { id, name, label, price,maxvalue,daily  } = req.body.item;
    Package.update(
        {  name: name, label: label, price: price, maxvalue: maxvalue, daily: daily },
        {
            where: { id: id },
        }
    )
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: 'package was updated successfully.',
                });
            } else {
                res.send({
                    message: `Cannot update package with id=${id}. Maybe Tutorial was not found or req.body is empty!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error updating package with id=' + id,
            });
        });

};

exports.delete = async (req, res) => {
    console.log('package delete');
    const { id } = req.body; // post

    Package.destroy({
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: 'package was deleted successfully!',
                });
            } else {
                res.send({
                    message: `Cannot delete package with id=${id}. Maybe package was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Could not delete package with id=' + id,
            });
        });

};