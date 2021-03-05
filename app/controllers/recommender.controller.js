const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;
const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.byuser = async (req, res) => {
    console.log('byuser');
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
            recommenders: 
                [
                    {
                      id: 1,
                      tags: ['A'],
                      name: 'Vicwic(이찬원)',
                      title: '매출 1000',
                      regdate: '등록날짜 2021-03-05',
                      memo: ''
                    },
                    {
                      id: 2,
                      tags: ['B'],
                      pid: 1,
                      name: 'Name2',
                      title: 'Tytle2',
                      regdate: '2021-03-01',
                      memo: 'abc'
                    },
                    {
                      id: 3,
                      tags: ['B'],
                      pid: 1,
                      name: 'Name3',
                      title: 'Tytle3',
                      regdate: '2021-03-01',
                      memo: 'abc'
                    }
                  ]

            
        })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error',
        });
    }
};
