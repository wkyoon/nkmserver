
var faker = require('faker');

const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const config = require('../config/auth.config');
const Member = db.user;
const Settings = db.setting;
const Center = db.center;
const Order = db.order;
const Deposit = db.deposit;
const Withdraw = db.withdraw;
const Bonus = db.bonus;
const Op = db.Sequelize.Op;

var SponsorInfo = require('../util/SponsorInfo');
var dateFormat = require('dateformat');

async function updateSponsorCnt() {
    console.log('------------------> start updateSponsorCnt ');
    // ---------------------------------------------

    var rootNodes = [];
    var childrenNodes = [];

    // update all user recommender and sponsor tree
    const alluser = await Member.findAll({
        attributes: [
            'id',
            'userid',
            'name',
            'sponsorid',
            'parentId',
            'sponsorcount',
            'createdAt',
        ],
        raw: true,
        logging: false,
    });

    for (i = 0; i < alluser.length; i++) {
        if (alluser[i].parentId > 0) {
            childrenNodes.push(alluser[i]);
        } else {
            rootNodes.push(alluser[i]);
        }
    }

    for (let i = 0; i < alluser.length; i++) {
        let a = new SponsorInfo(childrenNodes, alluser[i].id);

        let sponsorinfo = await a.getSponsorInfo();

        await Member.update(
            {
                sponsorcount: Number(sponsorinfo.length),
            },
            { where: { id: alluser[i].id }, logging: false }
        );
    }
    // ---------------------------------------------
    console.log('------------------> end updateSponsorCnt ');
}

const updateReommenderCount = async (sponsorid) => {
    console.log('updateReommenderCount');

    let recommendercount = await Member.count({
        where: {
            sponsorid: sponsorid,
        },
    });

    console.log('recommendercount',recommendercount)

    if(recommendercount<1)
    {
       
        recommendercount = 0
    }

    await Member.update(
        {
            sponsorcount: recommendercount,
        },
        { where: { userid: sponsorid }, raw: true }
    );
};

const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
    return { limit, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: items } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, items, totalPages, currentPage };
};

// call from admin
exports.create = async (req, res) => {
    console.log('--------------------- Member Create from ADMIN');
    console.log(req.body);
    const { member } = req.body;

    const user = await Member.findOne({
        where: { userid: member.userid },
        raw: true,
    });

    if (user) {
        res.send({ message: 'user exist' });
        return;
    }

    if (member.sponsorid === 'admin') {
        const newmember = {
            userid: member.userid,
            uuid: uuidv4(),
            name: member.name,
            role:'user',
            sponsorid: member.sponsorid,
            phone: member.phone,
            email: member.email,
            password: member.password,
            centerid: member.centerid,
            centername: member.centername,
        };
        await Member.create(newmember);
    } else {
        const spuser = await Member.findOne({
            where: { userid: member.sponsorid },
            raw: true,
        });

        if (spuser) {
            const newmember = {
                userid: member.userid,
                uuid: uuidv4(),
                name: member.name,
                role:'user',
                sponsorid: member.sponsorid,
                phone: member.phone,
                email: member.email,
                password: member.password,
                centerid: member.centerid,
                centername: member.centername,
                parentId: spuser.id,
            };
            await Member.create(newmember);
        }
    }

    // ysw check need
    //await updateSponsorCnt();

    res.send({ message: 'ok' });
};

exports.findAll = async (req, res) => {
    console.log(' admin member lists');
    const query = req.query.id;
    console.log(query);

    //  var condition = query ? { username: { [Op.like]: `%${query}%` } } : null;

    const attr = [
        'id',
        'userid',
        'avatar',
        'name',
        'email',
        'phone',
        'password',
        'pin',
        'role',
        'sponsorid',
        'sponsorcount',
        'balance',
        'maxbonus',
        'remainderbonus',
        'bonus',
        'rc',
        'withdrawable',
        'spoint',
        'parentId',
        'centerId',
        'createdAt',
        'updatedAt',
    ];

    if (query === 'starred') {
        Member.findAll({
            attributes: attr,
            where: { starred: true },
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
    } else if (query === 'lately') {
        Member.findAll({
            attributes: attr,
            order: [['createdAt', 'DESC']],
            limit: 100,
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
    } else if (query === 'order') {
        Member.findAll({
            attributes: attr,
            order: [['createdAt', 'DESC']],
            where: { total_order: { [Op.gt]: 0 } },
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
    } else if (query === 'injung') {
        Member.findAll({
            attributes: attr,
            order: [['createdAt', 'DESC']],
            where: { total_injung: { [Op.gt]: 0 } },
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
    } else {
        console.log('admin member list all');
        Member.findAll({
            include: {
                model: Center,
            },
            order: [['createdAt', 'DESC']],
        })
            .then((items) => {
                res.send({ items });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({
                    message:
                        err.message ||
                        'Some error occurred while retrieving tutorials.',
                });
            });
    }
};

exports.findAndCountAll = async (req, res) => {
    console.log(req.query);
    const { page, size, username } = req.query;
    var condition = username
        ? { username: { [Op.like]: `%${username}%` } }
        : null;

    const { limit, offset } = getPagination(page, size);

    Member.findAndCountAll({ where: condition, limit, offset })
        .then((data) => {
            const response = getPagingData(data, page, limit);
            res.send(response);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while retrieving tutorials.',
            });
        });
};

// Find a single  with an id
exports.findOne = async (req, res) => {
    const id = req.params.id;

    Member.findByPk(id)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error retrieving Tutorial with id=' + id,
            });
        });
};

// Update a  by the id in the request
exports.update = async (req, res) => {
    const id = req.body.member.id;

    const { member } = req.body;

    console.log('update xxxxxxxxx', member);

    const spuser = await Member.findOne({
        where: { sponsorid: member.sponsorid },
        raw: true,
    });

    if (spuser) {
        const newmember = {
            name: member.name,
            sponsorid: member.sponsorid,
            parentId: spuser.id,
            phone: member.phone,
            email: member.email,
            password: member.password,
            centerid: member.centerid,
        };

        await Member.update(newmember, {
            where: { id: member.id },
        });
    } else {
        const newmember = {
            name: member.name,
            phone: member.phone,
            email: member.email,
            password: member.password,
            centerid: member.centerid,
        };

        await Member.update(newmember, {
            where: { id: member.id },
        });
    }

    //await updateSponsorCnt();

    return res.send({ message: 'success' });
};

exports.updatepackage = async (req, res) => {
    const { member } = req.body;

    console.log('updatepackage ', member);

    let balance, maxbonus, buytype, volume, injung;
    if (member.volume > 0) {
        balance = member.volume;
        volume = member.volume;
        injung = 0;
        buytype = 'new';
    } else {
        balance = member.injung;
        volume = 0;
        injung = member.injung;
        buytype = 'injung';
    }

    maxbonus = balance * 2;

    const newmember = {
        buytype: buytype,
        volume: member.volume,
        injung: member.injung,
        balance: balance,
        maxbonus: maxbonus,
        remainderbonus: maxbonus,
        bonus: 0,
        bonus_daily: 0,
        bonus_matching: 0,
        rc: 0,
        withdrawable: 0,
        spoint: 0,
    };

    await Member.update(newmember, {
        where: { id: member.id },
        raw: true,
    });

    // find order list
    const order = await Order.findOne({
        where: { userid: member.userid },
        raw: true,
    });

    if (!order) {
        const neworder = {
            userid: member.userid,
            price: balance,
            buytype: buytype,
            status: 'active',
        };
        await Order.create(neworder);
    } else {
        const neworder = {
            price: balance,
            buytype: buytype,
            status: 'active',
        };
        await Order.update(neworder, { where: { id: order.id }, raw: true });
    }

    return res.send({ message: 'Member was updated successfully.' });
};

exports.togglestar = async (req, res) => {
    console.log('--------togglestar------------ ');
    const id = req.body.memberId;
    console.log(id);

    const settingRegPoint = await Settings.findOne({
        where: { name: 'pv_addmember' },
    });

    console.log('settingRegPoint', settingRegPoint.value);
    const pv_addmember = settingRegPoint.value;

    var day = dateFormat(new Date(), 'yyyy-mm-dd');
    console.log(day);
    const tinfo = day;

    const member = await Member.findByPk(id);

    if (member.starred === null) {
        member.starred = 1;
    } else if (member.starred === 1) {
        member.starred = 0;
    } else if (member.starred === 0) {
        member.starred = 1;
    }

    if (member.total_point === null) member.total_point = 0;
    // starred 를 승인 여부로 판단한다.
    // 승인이 되었을 경우
    // 가입 포인트를 지급한다.

    console.log('Member total_point 11', member.total_point);

    if (member.starred === 1) {
        // point 지급
        await Point.create({
            userid: member.id,
            username: member.username,
            tinfo: tinfo,
            point: pv_addmember,
            ref: 'member_add_pv',
        });
        member.total_point = Number(member.total_point) + Number(pv_addmember);
    } else if (member.starred === 0) {
        //지급 포인트 회수
        await Point.create({
            userid: member.id,
            username: member.username,
            tinfo: tinfo,
            point: -pv_addmember,
            ref: 'member_add_pv_minus',
        });
        member.total_point = Number(member.total_point) - Number(pv_addmember);
    }
    console.log('Member total_point 22', member.total_point);

    //console.log("starred",member);

    await Member.update(
        { starred: member.starred, total_point: member.total_point },
        {
            where: { id: id },
        }
    );
    res.send([
        {
            message: 'Member was updated successfully.',
        },
    ]);
};

exports.togglestatus = async (req, res) => {
    console.log('--------togglestatus------------ ');
    const id = req.body.memberId;

    const member = await Member.findByPk(id);

    if (member.status === null) {
        member.status = 1;
    } else if (member.status === 1) {
        member.status = 0;
    } else if (member.status === 0) {
        member.status = 1;
    }

    await Member.update(
        { status: member.status },
        {
            where: { id: id },
        }
    );
    res.send([
        {
            message: 'Member was updated successfully.',
        },
    ]);
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
    const id = req.body.memberId;
    console.log(req.body);

    Member.destroy({
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: 'Tutorial was deleted successfully!',
                });
            } else {
                res.send({
                    message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Could not delete Tutorial with id=' + id,
            });
        });
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
    Member.destroy({
        where: {},
        truncate: false,
    })
        .then((nums) => {
            res.send({
                message: `${nums} Tutorials were deleted successfully!`,
            });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while removing all tutorials.',
            });
        });
};

exports.userinfo = (req, res) => {
    const { id } = req.body;
    console.log(id);

    Member.findByPk(id)
        .then((member) => {
            res.send({ member });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while removing all tutorials.',
            });
        });
};

// call from admin recommender
exports.findRecommends = async (req, res) => {
    console.log(
        '------------------------------->> MemberControl findRecommends ADMIN'
    );
    //console.log(req.query);
    const { username } = req.query;
    //console.log(username)

    const { count, rows } = await Member.findAndCountAll({
        where: { recommender: username },
        raw: true,
        logging: false,
    });

    var items = [];

    for (let i = 0; i < count; i++) {
        if (rows[i].username != username) {
            //console.log('xxx',rows[i].username)
            items.push(rows[i]);
        } else {
            //console.log('xxx111',username , rows[i].username )
            //items.push({id:rows[i].id,recommender:})
        }
    }

    console.log(
        '------------------------------->> MemberControl findRecommends ADMIN end'
    );
    //console.log('rows',rows)

    res.send({ count, rows: items });
};

exports.updateRecommender = (req, res) => {
    console.log('updateRecommender  updateRecommender');

    var username = req.body.item.username;
    var recommender = req.body.item.name;
    var action = req.body.action;

    console.log(req.body);

    console.log('username', username);
    console.log('recommender', recommender);
    console.log('action', action);
    var member = { recommender: recommender };

    if (action === 'remove') {
        if (username === recommender) {
            member = { recommender: '' };
        } else {
            member = { recommender: '' };
        }
    } else if (action === 'add') {
        member = { recommender: username };
    }

    console.log(member);

    Member.update(member, {
        where: { username: recommender },
    })
        .then((member) => {
            if (member == 1) {
                res.send([
                    req.body,
                    {
                        message: 'Member was updated successfully.',
                    },
                ]);
            } else {
                res.send({
                    message: `Cannot update Member with id=${id}. Maybe Tutorial was not found or req.body is empty!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error updating Tutorial with id=' + id,
            });
        });
};

/** */

var countDown = function countDown(num) {
    console.log(num);
    num--;
    if (num <= 0) {
        return false;
    }
    countDown(num);
};

var getSponsors = function getSponsors(rows) {
    for (var i = 0; i < rows.size; i++) {
        if (username === rows[i].sponsor) {
            console.log(rows[i].sponsor);
        }
    }
    return false;
};

exports.smscheck01 = (req, res) => {
    console.log(req.body);
    const { uuid, phoneno } = req.body;
    var checkno = Math.floor(Math.random() * 1000000) + 100000;
    if (checkno > 1000000) {
        checkno = checkno - 100000;
    }

    //console.log(checkno)

    SmsCheck.findAndCountAll({
        where: { phoneno: phoneno, ischecked: 0 },
        order: [['createdAt', 'DESC']],
        raw: true,
        logging: false,
    })
        .then((data) => {
            const { count, rows } = data;

            console.log('new sms', count);

            if (count < 10) {
                const smscheck = {
                    uuid: uuid,
                    phoneno: phoneno,
                    checkno: checkno,
                    ischecked: 0,
                };

                // add sms check
                SmsCheck.create(smscheck)
                    .then((newSms) => {
                        res.send({ result: 'ok', newSms });

                        // send sms [[
                        // sms.send({
                        //   msg: '[e-bit]인증번호 ['+checkno+']입력해 주세요.',
                        //   mobile: phoneno
                        // }).then(function (result) {
                        //   console.log(result);
                        // });
                        // ]]
                    })
                    .catch((err) => {
                        res.status(500).send({
                            message: err.message,
                        });
                    });
            } else {
                // phoneno exist

                res.status(500).send({
                    message: '관리자에게 문의해 주세요.',
                });
                console.log(rows[0]);
            }
        })
        .catch((err) => {
            console.log(err);
        });
    //

    // const id = 1;
    // SmsCheck.findByPk(id)
    // .then(data => {
    //   console.log(data);
    //   res.send(data);
    // })
    // .catch(err => {
    //   res.status(500).send({
    //     message: "Error retrieving Tutorial with id=" + id
    //   });
    // });
    // // create sms db
};

exports.smscheck02 = (req, res) => {
    console.log(req.body);
    const { uuid, phoneno, checkno } = req.body;

    SmsCheck.findAndCountAll({
        where: { phoneno: phoneno, uuid: uuid, checkno: checkno },
        order: [['createdAt', 'DESC']],
        raw: true,
        logging: false,
    })
        .then((data) => {
            const { count, rows } = data;

            console.log('new sms', count);

            if (count === 1) {
                const smscheck = {
                    ischecked: 1,
                };

                SmsCheck.update(smscheck, {
                    where: { uuid: uuid },
                })
                    .then((num) => {
                        if (num == 1) {
                            res.send({ result: 'ok' });

                            //update sms validate
                            // find by phoneno update smschecked : 1
                            Member.findAndCountAll({
                                where: { phoneno: phoneno },
                            })
                                .then((data) => {
                                    const { count, rows } = data;
                                    console.log('member', count);
                                    if (count == 1) {
                                        // update
                                        Member.update(
                                            { smschecked: 1 },
                                            { where: { phoneno: phoneno } }
                                        );
                                    }
                                })
                                .catch((err) => {});
                        }
                    })
                    .catch((err) => {
                        res.status(500).send({
                            message: err.message,
                        });
                    });
            } else {
            }
        })
        .catch((err) => {
            console.log(err);
        });
    //

    // const id = 1;
    // SmsCheck.findByPk(id)
    // .then(data => {
    //   console.log(data);
    //   res.send(data);
    // })
    // .catch(err => {
    //   res.status(500).send({
    //     message: "Error retrieving Tutorial with id=" + id
    //   });
    // });
    // // create sms db
};

// ==============

exports.addMember100 = async (req,res) => {

    console.log('addMember100');

    for(let i = 0 ; i < 100; i++)
    {
        const userid ='test'+faker.random.number();
        //const userid = faker.internet.userName();
        const name = faker.name.findName();
        const phone = faker.phone.phoneNumber('010########');
        //faker.phone.phoneNumber('0165#######')
        const email = faker.internet.email();
        const newmember = {
            userid: userid,
            uuid: uuidv4(),
            name: name,
            role:'user',
            sponsorid: 'admin',
            sponsorcount:'0',
            parentId:'0',
            phone:phone,
            email: email,
            password: '1234',
            centerid: '1',
            centername: '본사',
        };
        console.log(newmember);
        try {
            await Member.create(newmember);
        }
        catch(err)
        {
            console.log(err)
        }
        
    
    }

  res.send({message: 'success'});


};

exports.defaultOrderSet = async (req, res) => {
    console.log('defaultOrderSet');

    Order.destroy({ truncate: true, cascade: false });

    // truncate orders
    // const neworder = {
    //     userid: member.userid,
    //     price:balance,
    //     buytype: buytype,
    //     status: 'active',
    // };
    // await Order.create(neworder);

    const newmember = {
        buytype: 'new',
        volume: '1000',
        injung: '0',
        balance: '1000',
        maxbonus: '2000',
        remainderbonus: '2000',
        bonus: 0,
        bonus_daily: 0,
        bonus_matching: 0,
        rc: 0,
        withdrawable: 0,
        spoint: 0,
    };

    const alluserids = await Member.findAll({
        attributes: ['id', 'userid'],
        raw: true,
        logging: false,
    });

    var ids = [];

    for (let i = 0; i < alluserids.length; i++) {
        ids.push(alluserids[i].id);

        const neworder = {
            userid: alluserids[i].userid,
            price: '1000',
            buytype: 'new',
            status: 'active',
        };
        await Order.create(neworder);
    }

    console.log(ids);

    await Member.update(newmember, { where: { id: ids }, raw: true });
    res.send([
        {
            message: 'Members was updated successfully.',
        },
    ]);
};

exports.makeBTree = async (req, res) => {
    console.log('makeBTree');

    const alluser = await Member.findAll({
        attributes: ['id', 'userid'],
        order: [['id', 'ASC']],
        raw: true,
        logging: false,
    });

    const maxlength = alluser.length;

    // let max_depth = 0;

    // let temp_sum = 0;
    // for (let i = 0; i < 15; i++) {
    //     let temp_depth = Math.pow(2, i);
    //     temp_sum = temp_sum + temp_depth;
    //     console.log(i, temp_depth, temp_sum);

    //     if (maxlength < temp_sum) {
    //         max_depth = i;
    //         break;
    //     }
    // }

    // console.log('allusers', maxlength);
    // console.log('max_depth', max_depth);

    for (let i = 0; i < maxlength; i++) {
        let parentId = Math.floor(alluser[i].id / 2);

        if (i == 0) {
            await Member.update(
                { sponsorid: 'admin', parentId: 0,sponsorcount:0 },
                { where: { id: alluser[i].id }, raw: true }
            );
        } else {
            //console.log(alluser[i].id, parentId, alluser[parentId - 1].id);
            await Member.update(
                {
                    sponsorid: alluser[parentId - 1].userid,
                    parentId: alluser[parentId - 1].id,
                    sponsorcount:0
                },
                { where: { id: alluser[i].id }, raw: true }
            );

            await updateReommenderCount(alluser[parentId - 1].userid);
        }

        //console.log(alluser[i].id,parentId);
        //        console.log('user info',alluser[i].id,alluser[i].userid);
    }

    res.send([
        {
            message: 'Members was updated successfully.',
        },
    ]);
};

exports.defaultOrders = async (req, res) => {
    await Order.destroy({ truncate: true, cascade: false });

    res.send([
        {
            message: 'Order was updated successfully.',
        },
    ]);
};

exports.defaultWithdraws = async (req, res) => {
    await Withdraw.destroy({ truncate: true, cascade: false });
    res.send([
        {
            message: 'Withdraw was updated successfully.',
        },
    ]);
};

exports.defaultDeposits = async (req, res) => {
    await Deposit.destroy({ truncate: true, cascade: false });
    res.send([
        {
            message: 'Deposit was updated successfully.',
        },
    ]);
};

exports.defaultCalculates = async (req, res) => {
    await Bonus.destroy({ truncate: true, cascade: false });

    res.send([
        {
            message: 'Bonus was updated successfully.',
        },
    ]);
};

exports.defaultUsers = async (req, res) => {
    await Member.destroy({ truncate: true, cascade: false });

    res.send([
        {
            message: 'User was updated successfully.',
        },
    ]);
};
