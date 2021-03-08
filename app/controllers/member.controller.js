const db = require('../models');
const Member = db.user;
const Settings = db.setting;
const Center = db.center;
const Op = db.Sequelize.Op;

var dateFormat = require('dateformat');

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
        where: { username: member.username },
        raw: true,
    });

    if (user) {
        res.send({ message: 'user exist' });
        return;
    }

    const spuser = await Member.findOne({
        where: { username: member.sponsor },
        raw: true,
    });

    const rcuser = await Member.findOne({
        where: { username: member.recommender },
        raw: true,
    });

    const center = await Centers.findByPk(member.centerid, { raw: true });

    if (spuser && rcuser) {
        const newmember = {
            username: member.username,
            nickname: member.nickname,
            recommender: member.recommender,
            sponsor: member.sponsor,
            parentId: spuser.id,
            phoneno: member.phoneno,
            email: member.email,
            password: member.password,
        };
        await Member.create(newmember);
    } else if (spuser) {
        const newmember = {
            username: member.username,
            nickname: member.nickname,
            sponsor: member.sponsor,
            parentId: spuser.id,
            phoneno: member.phoneno,
            email: member.email,
            password: member.password,
        };
        await Member.create(newmember);
    } else if (rcuser) {
        const newmember = {
            username: member.username,
            nickname: member.nickname,
            recommender: member.recommender,
            phoneno: member.phoneno,
            email: member.email,
            password: member.password,
        };
        await Member.create(newmember);
    } else {
        const newmember = {
            username: member.username,
            nickname: member.nickname,
            phoneno: member.phoneno,
            email: member.email,
            password: member.password,
        };
        await Member.create(newmember);
    }

    await updateRecommenderCntAndSponsorCnt();
    console.log('------------------------------> before res send');

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
        'recovery',
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

exports.findAndCountAll = (req, res) => {
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
exports.findOne = (req, res) => {
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
exports.update = (req, res) => {
    const id = req.body.member.id;

    const { member } = req.body;

    console.log('update xxxxxxxxx', member);

    const newmember = {
        name: member.name,
        sponsorid: member.sponsorid,
        phone: member.phone,
        email: member.email,
        password: member.password,
        centerid: member.centerid
    };

    Member.update(newmember, {
        where: { id: member.id },
    })
        .then((upmember) => {
            if (upmember == 1) {
                res.send([
                    upmember,
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
            console.log(err);
            res.status(500).send({
                message: 'Error updating Member with id=' + id,
            });
        });
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
