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
            where: { userid: user.userid, type: type },
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
            userid: user.userid,
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
        console.log('pin', user.pin);

        if (user.pin !== null) {
            console.log('step 1');
            if (user.pin === pin) {
                console.log('step 2');
                await Withdraw.create(newwithdraw);
            }
        } else {
            console.log('step 3');

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

exports.findAll = (req, res) => {
    console.log('---------------------- withdraw findall GET ADMIN');
    //console.log(req.query.id);
    const query = req.query.id;
    console.log(query);
    //var condition = query ? { username: { [Op.like]: `%${query}%` } } : null;

    if (query === 'all') {
        Withdraw.findAll({ order: [['createdAt', 'DESC']] })
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
        Withdraw.findAll({
            where: { status: 'request' },
            order: [['createdAt', 'DESC']],
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
        Withdraw.findAll({
            where: { status: 'confirm' },
            order: [['createdAt', 'DESC']],
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
    } else if (query === 'cancel') {
        Withdraw.findAll({
            where: { status: 'cancel' },
            order: [['createdAt', 'DESC']],
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

exports.update = async (req, res) => {
    console.log('withdraw update---------------------- admin POST');
    console.log(req.body);

    const { id, status } = req.body.withdraw;

    const orgwithdraw = await Withdraw.findByPk(id,{raw:true,logging:false});

    if (orgwithdraw.status === status) {
        res.send({
            message: 'nothing change',
        });

    } else if (orgwithdraw.status === 'request') {

        if (status === 'confirm') {
            
            // await Withdraw.update({status: status},
            // { where: { id: id },raw: true,logging:false}
            // );

            // 사용자의 withdrawable 을 차감
            const user = await User.findOne({
                where: { userid: orgwithdraw.userid },
                raw: true,logging:false
            });

            //console.log('org info',orgwithdraw)
            console.log('user info',user)
            let user_withdrawable = user.withdrawable - orgwithdraw.usd;
            console.log('user_withdrawable info',user_withdrawable)
            if(user_withdrawable>0)
            {
                await User.update(
                    {
                        withdrawable: user_withdrawable,
                    },
                    { where: { id: user.id }, raw: true, logging: false }
                );

                await Withdraw.update({status: status},
                    { where: { id: id },raw: true,logging:false}
                    );

            }
            else
            {
                return res.send({ message: 'fail' });
                
            }

          


        }
        else{
            await Withdraw.update({status: status},
                { where: { id: id },raw: true,logging:false}
                );
        }

        res.send({ message: 'ok' });

    } else if (orgwithdraw.status === 'confirm') {

        res.send({
            message: 'nothing change',
        });
        return;
       
    }

    res.send({ message: 'ok' });
};
