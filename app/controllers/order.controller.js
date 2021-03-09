const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;
const Setting = db.setting;
const Order = db.order;
const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.orderlistbyuser = async (req, res) => {
    console.log('orderlistbyuser');

    try {
        const { authorization } = req.headers;

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
            return res
                .status(400)
                .send({ message: 'Invalid authorization token' });
        }

        const orders = await Order.findAll({
            where: { userid: user.userid },
            order: [['createdAt', 'DESC']],
            logging: false,
        });

        console.log('orders', orders);
        return res.send({ orders });
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error',
        });
    }
};

exports.buypackage = async (req, res) => {
    console.log('buypackage', req.body);

    try {
        const { authorization } = req.headers;
        const { price, amount, txid } = req.body;

        if (!authorization) {
            return res.status(401).send({
                message: 'Authorization token missing',
            });
        }

        const accessToken = authorization.split(' ')[1];
        console.log(accessToken);
        const { uuid } = jwt.verify(accessToken, config.secret);
        console.log('uuid', uuid);

        const user = await User.findOne({
            where: { uuid: uuid },
            raw: true,
        });

        if (!user) {
            return res
                .status(400)
                .send({ message: 'Invalid authorization token' });
        }

        // find order 
        const preorder = await Order.findOne({
            where: { userid: member.userid },
            raw: true,
        });

        if(!preorder)
        {
            const neworder = {
                userid: user.userid,
                price,
                amount,
                txid,
                buytype: 'new',
                status: 'request',
            };
    
            await Order.create(neworder);
            return res.send({
                message: 'Order request success',
            });
    
        }
        else
        {
            return res.status(400).send({
                message: 'Order request fail',
            });
    
        }
        

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error',
        });
    }
};

exports.create = (req, res) => {
    console.log(req.body.order);

    // Create a 
    const order = {
        userid: req.body.order.userid,
        price: req.body.order.price,
        txid: req.body.order.txid,
        buytype: 'new',
        status: 'request',
    };

    Order.create(order)
        .then((newOrder) => {
            res.send({ newOrder });
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


// call from admin
exports.findAll = (req, res) => {
    console.log('---- Order FindAll ---- GET');
    const query = req.query.id;
    console.log('query', query);

    //  var condition = query ? { username: { [Op.like]: `%${query}%` } } : null;

    if (query === 'all') {
        Order.findAll({
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
        Order.findAll({
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
    } else if (query === 'active') {
        Order.findAll({
            where: { status: 'active' },
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
    const { id, userid, price, buytype, status } = req.body.order;
    console.log('----------update from admin --------------', req.body.order);

    // update user infom
    const user = await User.findOne({ where: { userid: userid }, raw: true });

    if (status === 'request') {
        await User.update(
            { buytype: 'idle', balance: 0 },
            { where: { id: user.id } }
        );
    } else if (status === 'active') {

        const maxbonus = price * 2;
        const remainderbonus = maxbonus


        if (buytype === 'new') {
            await User.update(
                { buytype: buytype, 
                    balance: price,
                    volume:price,
                    injung:'0',
                    maxbonus:maxbonus,
                    remainderbonus:remainderbonus,
                    bonus: 0,
                    bonus_daily: 0,
                    bonus_matching: 0,
                    recovery: 0,
                    withdrawable: 0,
                    spoint: 0, },
                { where: { id: user.id } }
            );
        } else if (buytype === 'injung') {
            await User.update(
                { buytype: buytype, 
                    balance: price,
                    volume:'0',
                    injung:price,
                    maxbonus:maxbonus,remainderbonus:remainderbonus ,
                    bonus: 0,
                    bonus_daily: 0,
                    bonus_matching: 0,
                    recovery: 0,
                    withdrawable: 0,
                    spoint: 0,},
                { where: { id: user.id } }
            );
        }
    }

    await Order.update(
        {
            price: price,
            buytype: buytype,
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

    Order.destroy({
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: 'Order was deleted successfully!',
                });
            } else {
                res.send({
                    message: `Cannot delete Order with id=${id}. Maybe Tutorial was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Could not delete Tutorial with id=' + id,
            });
        });
};