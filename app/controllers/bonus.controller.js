const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;
const Setting = db.setting;
const Order = db.order;
const Bonus = db.bonus;
const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.bonuslistbyuser = async (req, res) => {
    console.log('bonuslistbyuser');

    try {
        const { authorization } = req.headers;
        const { type } = req.query
        console.log(req.query)
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

        const bonuses = await Bonus.findAll({
            where: { usertbid: uuid, type: type },
            order: [['createdAt', 'DESC']],
            logging:false
        })

        return res.send({bonuses});
    
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error',
        });
    }
};



