const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;
const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.me = async (req, res) => {
    console.log('me');
    try {
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).send({
                message: 'Authorization token missing',
            });
        }

        const accessToken = authorization.split(' ')[1];
        //console.log(accessToken);
        const { uuid } = jwt.verify(accessToken, config.secret);
        //console.log('uuid',uuid);
        
        const user = await User.findOne({
            where: { uuid: uuid },
            raw: true,
            logging:false
        });

        if (!user) {
            return res.status(400).send({ message: 'Invalid authorization token' });
        }

        return res.send({
            user: {
                id: user.id,
                uuid: user.uuid,
                userid: user.userid,
                sponsorid: user.sponsorid,
                sponsorcount: user.sponsorcount,
                name:user.name,
                email:user.email,
                phone:user.phone,

                balance:user.balance,
                maxbonus:user.maxbonus,
                remainderbonus:user.remainderbonus,
                bonus:user.bonus,
                bonus_daily:user.bonus,
                bonus_matching:user.bonus,
                recovery:user.recovery,
                withdrawable:user.withdrawable,
                spoint:user.spoint

              }
        })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error',
        });
    }
};

exports.login = async (req, res) => {
    console.log('login', req.body);
    try {
        const { userid, password } = req.body;

        const user = await User.findOne({
            where: { userid: userid },
            raw: true,
        });
    
        if (!user) {
            return res.status(400).send({ message: 'Please check your userid and password' });
        }

        if (user.password !== password) {
            return res.status(400).send({message: 'Invalid password' });
        }

        const accessToken = jwt.sign({ uuid: user.uuid }, config.secret, {
            expiresIn: 86400,
        });

        return res.send({
            accessToken,
            user: {
                id: user.id,
                uuid: user.uuid,
                userid: user.userid,
                sponsorid: user.sponsorid,
                sponsorcount: user.sponsorcount,
                name:user.name,
                email:user.email,
                phone:user.phone,
                balance:user.balance,
                maxbonus:user.maxbonus,
                remainderbonus:user.remainderbonus,
                bonus:user.bonus,
                bonus_daily:user.bonus,
                bonus_matching:user.bonus,
                recovery:user.recovery,
                withdrawable:user.withdrawable,
                spoint:user.spoint

              }
        })

        
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: 'Internal server error' });
    }
};

exports.register = async (req, res) => {
    console.log('register', req.body);

    const { userid, sponsorid, password } = req.body;

    const user = await User.findOne({
        where: { userid: userid },
        raw: true,
    });

    if (user) {
        return res.status(400).send({ message: 'User already exists' });
    }

    let parentId = 0;

    if (sponsorid !== 'admin') {
        const sponsor = await User.findOne({
            where: { userid: sponsorid },
            raw: true,
        });

        

        if (!sponsor) {
            return res.status(400).send({ message: 'Sponsor is not exists' });
        }

        parentId = sponsor.id;
    }

    console.log('register step 2');

    const newuser = {
        uuid: uuidv4(),
        userid,
        sponsorid,
        password,
        parentId:parentId,
        role: 'user',
    };

    await User.create(newuser);

    const accessToken = jwt.sign({ uuid: newuser.uuid }, config.secret, {
        expiresIn: 86400,
    });

    return res.send({
        accessToken,
        user: {
            id: newuser.id,
            uuid: newuser.uuid,
            userid: newuser.userid,
            sponsorid: newuser.sponsorid,

          }
    })
    

};


exports.modify = async (req, res) => {
    console.log('modify', req.body);


    const { authorization } = req.headers;

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
    else
    {
        const { name, email, phone } = req.body;
        // update user 
        await User.update({name:name,email:email,phone:phone},{where:{uuid:uuid}});

        
        return res.send({
            user: {
                id: user.id,
                userid: user.userid,
                sponsorid: user.sponsorid,
                name:name,
                email:email,
                phone:phone
              }
        })
    }


   

  

    

};