const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;
const Setting = db.setting;
const Withdraw = db.withdraw;
const Bonus = db.bonus;
const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.listbyuser = async (req, res) => {
    console.log('withdraw listbyuser');

    try {
        const { authorization } = req.headers;
        const { type } = req.query;
        console.log(req.query);
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

        const withdraws = await Withdraw.findAll({
            where: { userid: user.id, type: type },
            order: [['createdAt', 'DESC']],
            logging: false,
        });

        return res.send({ withdraws });
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error',
        });
    }
};

exports.requestbyuser = async (req, res) => {
    console.log('withdraw requestbyuser', req.body);
    // console.log(req.body);
    try {
        const { authorization } = req.headers;
        const {
            usd,
            nkmprice,
            nkmamount,
            nkmfee,
            nkmvalue,
            coinaddress,
            pin,
            type,
        } = req.body;

        

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

        const newwithdraw = {
            userid: user.id,
            usd: usd,
            nkmprice: nkmprice,
            nkmamount: nkmamount,
            nkmfee: nkmfee,
            nkmvalue: nkmvalue,
            coinaddress: coinaddress,
            type: type,
            status: 'request',
        };


        // pin code request  if exist 
        console.log('pin',user.pin)

        if(user.pin !==null)
        {
            console.log('step 1')
            if(user.pin === pin )
            {
                console.log('step 2')
                await Withdraw.create(newwithdraw);
            }
        }
        else
        {
            console.log('step 3')
    
            await Withdraw.create(newwithdraw);

        }

        

        return res.send({
            message: 'Withdraw request success',
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error',
        });
    }
};
