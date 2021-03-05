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
            return res.status(400).send({ message: 'Invalid authorization token' });
        }

        const orders = await Order.findAll({
            where: { usertbid: uuid },
            order: [['createdAt', 'DESC']],
            logging:false
        })

        return res.send({orders});
    
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
        const {price,amount,txid} = req.body;

        if (!authorization) {
            return res.status(401).send({
                message: 'Authorization token missing',
            });
        }

        const accessToken = authorization.split(' ')[1];
        console.log(accessToken);
        const { uuid } = jwt.verify(accessToken, config.secret);
        console.log('uuid',uuid);
        
        const user = await User.findOne({
            where: { uuid: uuid },
            raw: true,
        });

        if (!user) {
            return res.status(400).send({ message: 'Invalid authorization token' });
        }

        const neworder = {
            usertbid:uuid,
            price,
            amount,
            txid,
            status:'request'
        };

        
        await Order.create(neworder)

        return res.send({
            message: 'Order request success'
        });
    
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error',
        });
    }
};
