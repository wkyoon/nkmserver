const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;
const Setting = db.setting;
const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.nkminfo = async (req, res) => {
    console.log('modify', req.body);
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).send({
            message: 'Authorization token missing',
        });
    }

   
    

    return res.send({
        nkminfo: {
            price: '0.0471667',
            address:'0x4Affd11931A27123876d64e05da6B7c043Bbb118'
        },
    });
};
