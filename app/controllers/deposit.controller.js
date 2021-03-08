const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;
const Setting = db.setting;
const Order = db.order;
const Deposit = db.deposit;
const Bonus = db.bonus;

const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.listbyuser = async (req, res) => {
    console.log('listbyuser');

    try {
        const { authorization } = req.headers;
        const { type } = req.query

        if (!authorization) {
            return res.status(401).send({
                message: 'Authorization token missing',
            });
        }

        const accessToken = authorization.split(' ')[1];
        const { uuid } = jwt.verify(accessToken, config.secret);
        
        const user = await User.findOne({
            where: { uuid: uuid },
            raw: true,
        });

        if (!user) {
            return res.status(400).send({ message: 'Invalid authorization token' });
        }

        const deposites = await Deposit.findAll({
            where: { userid: user.userid },
            order: [['createdAt', 'DESC']],
            logging : false
        })

        return res.send({deposites});
    
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error',
        });
    }
};


exports.create = (req, res) => {
    console.log(req.body.deposit);

    // Create a 
    const deposit = {
        userid: req.body.deposit.userid,
        price: req.body.deposit.price,
        txid: req.body.deposit.txid,
        status:  req.body.deposit.status,
    };

    Deposit.create(deposit)
        .then((newDeposit) => {
            res.send({ newDeposit });
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while creating the Tutorial.',
            });
        });
};


exports.findAll = (req, res) => {
    console.log('---- Deposit FindAll ---- GET');
    const query = req.query.id;
    console.log('query', query);

    //  var condition = query ? { username: { [Op.like]: `%${query}%` } } : null;

    if (query === 'all') {
        Deposit.findAll({
            order: [['createdAt', 'DESC']],
            logging: false,
        })
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
    } else if (query === 'request') {
        Deposit.findAll({
            where: { status: 'request' },
            order: [['createdAt', 'DESC']],
            logging: false,
        })
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
    } else if (query === 'confirm') {
        Deposit.findAll({
            where: { status: 'confirm' },
            order: [['createdAt', 'DESC']],
            logging: false,
        })
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
    }
    else if (query === 'cancel') {
        Deposit.findAll({
            where: { status: 'cancel' },
            order: [['createdAt', 'DESC']],
            logging: false,
        })
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
    }
};


// call from admin
exports.update = async (req, res) => {
    const { id, status } = req.body.deposit;
    console.log('----------update from admin --------------', req.body.deposit);

    

    await Deposit.update(
        {
            status: status,
        },
        {
            where: { id: id },
            raw: true,
        }
    );

    res.send({ message: 'ok' });
};

exports.delete = (req, res) => {
    console.log(req.body);
    const id = req.body.Ids;

    Deposit.destroy({
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: 'Deposit was deleted successfully!',
                });
            } else {
                res.send({
                    message: `Cannot delete Deposit with id=${id}. Maybe Tutorial was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Could not delete Deposit with id=' + id,
            });
        });
};



