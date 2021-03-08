const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;
const Op = db.Sequelize.Op;
const SponsorTree = require('../util/SponsorTree');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var dateFormat = require('dateformat');

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

        const sponsortree = await SponsorTree.SponsorTree(user.id);
        //console.log('sponsortree',sponsortree)
        const { currentuser, sponsorinfo } = sponsortree;
        const childrentemp = [];
        childrentemp.push(currentuser);
    

        if (sponsorinfo != null) {
            for (let i = 0; i < sponsorinfo.children.length; i++) {
                childrentemp.push(sponsorinfo.children[i].data);
            }
        }
    
        console.log('childrentemp,',childrentemp)

        recommenders=[]
        for(let i = 0 ; i < childrentemp.length;i++)
        {
            //console.log(childrentemp[i].createdAt)
            let day=dateFormat(childrentemp[i].createdAt, "yyyy-mm-dd");
            //console.log(day)
            recommenders.push(
                {
                    id: childrentemp[i].id,
                    tags: ['A'],
                    name: childrentemp[i].userid + '/' + childrentemp[i].username,
                    title: '매출 ',
                    regdate: '등록날짜 '+day,
                    memo: '',
                    pid: childrentemp[i].parentId

                }
            )
        }

        return res.send({recommenders:recommenders})

        // return res.send({
        //     recommenders: 
        //         [
        //             {
        //               id: 1,
        //               tags: ['A'],
        //               name: 'Vicwic(이찬원)',
        //               title: '매출 1000',
        //               regdate: '등록날짜 2021-03-05',
        //               memo: ''
        //             },
        //             {
        //               id: 2,
        //               tags: ['B'],
        //               pid: 1,
        //               name: 'Name2',
        //               title: 'Tytle2',
        //               regdate: '2021-03-01',
        //               memo: 'abc'
        //             },
        //             {
        //               id: 3,
        //               tags: ['B'],
        //               pid: 2,
        //               name: 'Name3',
        //               title: 'Tytle3',
        //               regdate: '2021-03-01',
        //               memo: 'abc'
        //             },
        //             {
        //                 id: 4,
        //                 tags: ['B'],
        //                 pid: 2,
        //                 name: 'Name4',
        //                 title: 'Tytle4',
        //                 regdate: '2021-03-01',
        //                 memo: 'abc'
        //               }
  
        //           ]

            
        // })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Internal server error',
        });
    }
};
