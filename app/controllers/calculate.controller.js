const crypto = require('crypto');
const db = require('../models');
const User = db.user;
const Bonus = db.bonus;
const Setting = db.setting;
const Pacakge = db.package;
var moment = require('moment'); // require

const Op = db.Sequelize.Op;
var dateFormat = require('dateformat');

const calculateUserDailyBonus = async (tinfo, user) => {
    //==========================================================
    // 전체 실행하면 db를 계속해서 접속해서 읽어온다.
    // 설정 부분은 나중에 한번만 읽어 오도록 위치 수정이 필요
    //==========================================================
    const level1_info = await Pacakge.findOne({
        where: { name: 'level1' },
        raw: true,
        logging: false,
    });
    const level2_info = await Pacakge.findOne({
        where: { name: 'level2' },
        raw: true,
        logging: false,
    });
    const level3_info = await Pacakge.findOne({
        where: { name: 'level3' },
        raw: true,
        logging: false,
    });

    const level1_dialy = level1_info.daily;
    const level2_dialy = level2_info.daily;
    const level3_dialy = level3_info.daily;

    // 지급 비율
    const setting_bonus_percent = await Setting.findOne({
        where: { name: 'bonus_percent' },
        raw: true,
    });
    const bonus_percent = setting_bonus_percent.value;

    const setting_spoint_percent = await Setting.findOne({
        where: { name: 'spoint_percent' },
        raw: true,
    });
    const spoint_percent = setting_spoint_percent.value;
    //==========================================================

    // 등록 날짜 확인 하는 부분이 빠져 있음

    if (user.balance < 0) return;

    if (tinfo != undefined) {
        let user_maxbonus = user.maxbonus;
        let user_bonus = user.bonus;
        let user_remainderbonus = user.remainderbonus;

        if (user_remainderbonus <= 0) return;

        let user_bonus_daily = user.bonus_daily;
        let user_bonus_matching = user.bonus_matching;

        let user_rc = user.rc;
        let user_spoint = user.spoint;
        let user_withdrawable = user.withdrawable;

        // if exist bonus same day

        const bonus = await Bonus.findOne({
            where: { userid: user.userid, tinfo: tinfo, type: 'daily' },
            raw: true,
            logging: false,
        });

        if (bonus) return;

        var date_check = moment(tinfo, 'YYYY-MM-DD').day();
        if (date_check == 0 || date_check == 6) return;

        // update daily bonus
        //console.log('bonus daily',user.userid,user.balance)
        let bonus_daily = 0;
        if (user.balance === 1000) {
            bonus_daily = user.balance * level1_dialy;
        } else if (user.balance === 3000) {
            bonus_daily = user.balance * level2_dialy;
        } else if (user.balance === 5000) {
            bonus_daily = user.balance * level3_dialy;
        }

        bonus_daily = bonus_daily / 100;
        console.log('bonus daily', user.userid, bonus_daily);

        // update user bonus

        // --------------------------
        let temp_bonus_rc = (bonus_daily * bonus_percent) / 100;
        let temp_bonus_spoint = (bonus_daily * spoint_percent) / 100;
        // --------------------------

        let temp_bonus = user_bonus + bonus_daily;
        let temp_bonus_percent = (temp_bonus / user.balance) * 100;

        if (temp_bonus_percent >= 205) return;

        let temp_remainderbonus = user_maxbonus - temp_bonus;

        let temp_rc = user_rc + temp_bonus_rc;
        let temp_withdrawable = user_withdrawable + temp_bonus_rc; // 출금해서 빠져 나갈수 있는 금액이다.

        let temp_spoint = user_spoint + temp_bonus_spoint;

        //console.log(temp_bonus_rc, temp_bonus_spoint);

        await Bonus.create(
            {
                userid: user.userid,
                tinfo: tinfo,
                bonus: bonus_daily,
                type: 'daily',
                ref: 'daily bonus(' + user.userid + ')',
            },
            { logging: false }
        );

        // update user
        await User.update(
            {
                bonus: temp_bonus,
                remainderbonus: temp_remainderbonus,
                rc: temp_rc,
                spoint: temp_spoint,
                withdrawable: temp_withdrawable,
            },
            { where: { id: user.id }, logging: false }
        );
    }
};

const calculateAllUserDailyBonus = async (tinfo) => {
    if (tinfo != undefined) {
        //console.log('not undefined', tinfo);

        var date_check = moment(tinfo, 'YYYY-MM-DD').day();

        if (date_check == 0 || date_check == 6) return;

        const attr = [
            'id',
            'userid',
            'sponsorid',
            'sponsorcount',
            'balance',
            'maxbonus',
            'remainderbonus',
            'bonus',
            'bonus_daily',
            'bonus_matching',
            'rc',
            'withdrawable',
            'spoint',
            'parentId',
            'centerId',
            'createdAt',
            'updatedAt',
        ];

        // get all user if exist volume or

        const alluser = await User.findAll({
            attributes: attr,
        });

        for (let i = 0; i < alluser.length; i++) {
            let user = alluser[i];

            await calculateUserDailyBonus(tinfo, user);
        }
    }
};

const calculateAllUserMatchingBonus = async (tinfo) => {
    //==========================================================
    // 전체 실행하면 db를 계속해서 접속해서 읽어온다.
    // 설정 부분은 나중에 한번만 읽어 오도록 위치 수정이 필요
    //==========================================================
    const level1_info = await Pacakge.findOne({
        where: { name: 'level1' },
        raw: true,
        logging: false,
    });
    const level2_info = await Pacakge.findOne({
        where: { name: 'level2' },
        raw: true,
        logging: false,
    });
    const level3_info = await Pacakge.findOne({
        where: { name: 'level3' },
        raw: true,
        logging: false,
    });

    const level1_dialy = level1_info.daily;
    const level2_dialy = level2_info.daily;
    const level3_dialy = level3_info.daily;

    // 지급 비율
    const setting_bonus_percent = await Setting.findOne({
        where: { name: 'bonus_percent' },
        raw: true,
    });
    const bonus_percent = setting_bonus_percent.value;

    const setting_spoint_percent = await Setting.findOne({
        where: { name: 'spoint_percent' },
        raw: true,
    });
    const spoint_percent = setting_spoint_percent.value;
    //==========================================================

    if (tinfo != undefined) {
        //console.log('not undefined', tinfo);

        var date_check = moment(tinfo, 'YYYY-MM-DD').day();

        if (date_check == 0 || date_check == 6) return;

        const attr = [
            'id',
            'userid',
            'sponsorid',
            'sponsorcount',
            'balance',
            'maxbonus',
            'remainderbonus',
            'bonus',
            'bonus_daily',
            'bonus_matching',
            'rc',
            'withdrawable',
            'spoint',
            'parentId',
            'centerId',
            'createdAt',
            'updatedAt',
        ];

        // get all user if exist volume or

        const alluser = await User.findAll({
            attributes: attr,
            raw: true,
        });

        var temp_alluser_bonus = {};

        for (let i = 0; i < alluser.length; i++) {
            let user = alluser[i];

            if (user.balance > 0) {
                // update daily bonus
                //console.log('bonus daily',user.userid,user.balance)
                let bonus_daily = 0;
                if (user.balance === 1000) {
                    bonus_daily = 1000 * level1_dialy;
                } else if (user.balance === 3000) {
                    bonus_daily = 3000 * level2_dialy;
                } else if (user.balance === 5000) {
                    bonus_daily = 5000 * level3_dialy;
                }

                bonus_daily = bonus_daily / 100;

                //console.log('bonus daily', user.id,user.userid, bonus_daily);
                temp_alluser_bonus[user.id] = bonus_daily;
            }
        }

        for (let i = 0; i < alluser.length; i++) {
            let user = alluser[i];

            await calculateUserMatchingBonus(tinfo, user, temp_alluser_bonus);
        }
    }
};

const calculateUserMatchingBonus = async (tinfo, user, temp_alluser_bonus) => {
    if (tinfo != undefined) {
        //console.log('not undefined', tinfo);

        var date_check = moment(tinfo, 'YYYY-MM-DD').day();

        if (date_check == 0 || date_check == 6) return;

        const level1_info = await Pacakge.findOne({
            where: { name: 'level1' },
            raw: true,
            logging: false,
        });
        const level2_info = await Pacakge.findOne({
            where: { name: 'level2' },
            raw: true,
            logging: false,
        });
        const level3_info = await Pacakge.findOne({
            where: { name: 'level3' },
            raw: true,
            logging: false,
        });

        const level1_dialy = level1_info.daily;
        const level2_dialy = level2_info.daily;
        const level3_dialy = level3_info.daily;

        //===================================================
        // 지급 비율
        const setting_bonus_percent = await Setting.findOne({
            where: { name: 'bonus_percent' },
            raw: true,
            logging: false,
        });
        const bonus_percent = setting_bonus_percent.value;

        const setting_spoint_percent = await Setting.findOne({
            where: { name: 'spoint_percent' },
            raw: true,
            logging: false,
        });
        const spoint_percent = setting_spoint_percent.value;

        const setting_first_depth = await Setting.findOne({
            where: { name: 'first_depth' },
            raw: true,
            logging: false,
        });
        const first_depth = setting_first_depth.value;

        const setting_second_depth = await Setting.findOne({
            where: { name: 'second_depth' },
            raw: true,
            logging: false,
        });
        const second_depth = setting_second_depth.value;
        //===================================================

        // 1대 정산하기
        // 2대가 있는 리스트 구하기
        var temp_second_depth_users = [];

        console.log('1대 정산 하기 ');

        let tempSponsors = await User.findAll({
            where: {
                sponsorid: user.userid,
            },
            raw: true,
            logging: false,
        });

        

        // 1대만 지급한다.
        if (tempSponsors.length > 0) {
            for (let j = 0; j < tempSponsors.length; j++) {
                const bonus = await Bonus.findOne({
                    where: {
                        userid: user.userid,
                        tinfo: tinfo,
                        type: 'matching',
                        ref:
                            'matching bonus( 1 대 지급 ' +
                            first_depth +
                            '% ' +
                            tempSponsors[j].userid +
                            ' )',
                    },
                    raw: true,
                    logging: false,
                });

                if (bonus) {
                    console.log('이미 정산이 되어 있습니다.');
                    continue;
                }

                let newuser = await User.findOne({
                    where: {
                        id: user.id,
                    },
                    raw: true,
                    logging: false,
                });

                let user_maxbonus = newuser.maxbonus;

                let user_bonus = newuser.bonus;
                let user_remainderbonus = newuser.remainderbonus;
                if (user_remainderbonus <= 0) {
                    return;
                }

                let user_bonus_daily = newuser.bonus_daily;
                let user_bonus_matching = newuser.bonus_matching;

                let user_rc = newuser.rc;
                let user_spoint = newuser.spoint;
                let user_withdrawable = newuser.withdrawable;


                // 1대 추천인의 데일리 보너스와 지급율 적용값
                let bonus_daily =
                    (temp_alluser_bonus[tempSponsors[j].id] * first_depth) /
                    100;

                // --------------------------
                let temp_bonus_rc = (bonus_daily * bonus_percent) / 100;
                let temp_bonus_spoint = (bonus_daily * spoint_percent) / 100;
                // --------------------------

                let temp_bonus = user_bonus + bonus_daily;
                let temp_bonus_percent = (temp_bonus / user.balance) * 100;

                let temp_remainderbonus = user_maxbonus - temp_bonus;
                if (temp_bonus_percent >= 205) {
                    continue;
                }
                let temp_rc = user_rc + temp_bonus_rc;
                let temp_spoint = user_spoint + temp_bonus_spoint;
                let temp_withdrawable = user_withdrawable + temp_bonus_rc;

                //console.log(temp_bonus_rc, temp_bonus_spoint);

                await Bonus.create({
                    userid: user.userid,
                    tinfo: tinfo,
                    bonus: bonus_daily,
                    type: 'matching',
                    ref:
                        'matching bonus( 1 대 지급 ' +
                        first_depth +
                        '% ' +
                        tempSponsors[j].userid +
                        ' )',
                });

                // update user
                await User.update(
                    {
                        bonus: temp_bonus,
                        remainderbonus: temp_remainderbonus,
                        rc: temp_rc,
                        spoint: temp_spoint,
                        withdrawable: temp_withdrawable,
                    },
                    { where: { id: user.id }, raw: true, logging: false }
                );
            }

            // 2대 지급은 1대의 후원을 확인하는 작업이 필요하다.
        } else {
            console.log('후원인 없음');
        }

        if (tempSponsors.length == 1) {
            console.log('추천인이 1명이여서 2대 정산이 없습니다.');
            return;
        }

        // 2대는 추천인이 2명인 경우만 지급
        console.log('2대 정산 하기', tempSponsors.length);
        for (let i = 0; i < tempSponsors.length; i++) {
            let secondDepthUsers = await User.findAll({
                where: {
                    sponsorid: tempSponsors[i].userid,
                },
                raw: true,
                logging: false,
            });

            //
            if (secondDepthUsers.length > 0) {
                for (let j = 0; j < secondDepthUsers.length; j++) {
                    const bonus = await Bonus.findOne({
                        where: {
                            userid: user.userid,
                            tinfo: tinfo,
                            type: 'matching',
                            ref:
                                'matching bonus( 2 대 지급 ' +
                                second_depth +
                                '% ' +
                                secondDepthUsers[j].userid +
                                ' )',
                        },
                        raw: true,
                        logging: false,
                    });

                    if (bonus) {
                        console.log('이미 2대를 지급했어요.');
                        continue;
                    }

                    let bonus_daily =
                        (temp_alluser_bonus[secondDepthUsers[j].id] *
                            second_depth) /
                        100;

                    console.log('2대 추천보너스', bonus_daily);

                    let newuser = await User.findOne({
                        where: {
                            id: user.id,
                        },
                        raw: true,
                        logging: false,
                    });

                    let user_maxbonus = newuser.maxbonus;

                    let user_bonus = newuser.bonus;
                    let user_remainderbonus = newuser.remainderbonus;
                    if (user_remainderbonus <= 0) {
                        continue;
                    }

                    let user_bonus_daily = newuser.bonus_daily;
                    let user_bonus_matching = newuser.bonus_matching;

                    let user_rc = newuser.rc;
                    let user_spoint = newuser.spoint;
                    let user_withdrawable = newuser.withdrawable;

                    // --------------------------
                    let temp_bonus_rc = (bonus_daily * bonus_percent) / 100;
                    let temp_bonus_spoint =
                        (bonus_daily * spoint_percent) / 100;
                    // --------------------------

                    let temp_bonus = user_bonus + bonus_daily;
                    let temp_bonus_percent =
                        (temp_bonus / newuser.balance) * 100;
                    console.log(
                        'temp_bonus',
                        temp_bonus,
                        temp_bonus_percent + ' %'
                    );

                    let temp_remainderbonus = user_maxbonus - temp_bonus;
                    if (temp_bonus_percent >= 205) {
                        continue;
                    }
                    let temp_rc = user_rc + temp_bonus_rc;
                    let temp_spoint = user_spoint + temp_bonus_spoint;
                    let temp_withdrawable = user_withdrawable + temp_bonus_rc;

                    await Bonus.create({
                        userid: newuser.userid,
                        tinfo: tinfo,
                        bonus: bonus_daily,
                        type: 'matching',
                        ref:
                            'matching bonus( 2 대 지급 ' +
                            second_depth +
                            '% ' +
                            secondDepthUsers[j].userid +
                            ' )',
                    });

                    //console.log('-- update user --', user.id);
                    // update user
                    await User.update(
                        {
                            bonus: temp_bonus,
                            remainderbonus: temp_remainderbonus,
                            rc: temp_rc,
                            spoint: temp_spoint,
                            withdrawable: temp_withdrawable,
                        },
                        { where: { id: newuser.id }, raw: true }
                    );
                }
            }
        }
    }

    //console.log('temp_second_depth_users',temp_second_depth_users.length)
};
//===============================

exports.latest = async (req, res) => {
    console.log('calcute latest list ');

    const bonuses = await Bonus.findAll({
        order: [['createdAt', 'DESC']],
        limit: 1000,
        raw: true,
    });

    res.send({ items: bonuses });
};

exports.updatebonusdaily = async (req, res) => {
    console.log('calcute updatebonusdaily ');
    console.log(req.body);

    const { tinfo } = req.body;

    await calculateAllUserDailyBonus(tinfo);

    res.send({ message: 'success' });
};

exports.updatebonusmatching = async (req, res) => {
    console.log('calcute updatebonusmatching ');
    console.log(req.body);

    const { tinfo } = req.body;
    await calculateAllUserMatchingBonus(tinfo);

    res.send({ message: 'success' });
};

exports.listdailybyday = async (req, res) => {
    console.log('-----------> CalculateControll listdailybyday ');

    let { tinfo, tinfo2 } = req.body.tinfo;
    //console.log('tinfo',tinfo)

    if (tinfo === undefined) {
        var day = dateFormat(new Date(), 'yyyy-mm-dd');
        tinfo = day;
    }

    if (tinfo2 === undefined) {
        var day2 = dateFormat(new Date(), 'yyyy-mm-dd');
        tinfo2 = day2;
    }

    const bonuses = await Bonus.findAll({
        where: { tinfo: { [Op.between]: [tinfo, tinfo2] }, type: 'daily' },
        order: [['createdAt', 'ASC']],
        raw: true,
    });

    //console.log(bonuses);

    res.send({ items: bonuses });
};

exports.listmatchingybyday = async (req, res) => {
    console.log('-----------> CalculateControll listmatchingybyday ');

    let { tinfo, tinfo2 } = req.body.tinfo;

    if (tinfo === undefined) {
        var day = dateFormat(new Date(), 'yyyy-mm-dd');
        tinfo = day;
    }

    if (tinfo2 === undefined) {
        var day2 = dateFormat(new Date(), 'yyyy-mm-dd');
        tinfo2 = day2;
    }

    const bonuses = await Bonus.findAll({
        where: { tinfo: { [Op.between]: [tinfo, tinfo2] }, type: 'matching' },
        order: [['createdAt', 'ASC']],
        raw: true,
    });

    res.send({ items: bonuses });
};

exports.listbyday = async (req, res) => {
    console.log('-----------> CalculateControll listbyday ');

    let { tinfo, tinfo2 } = req.body.tinfo;

    if (tinfo === undefined) {
        var day = dateFormat(new Date(), 'yyyy-mm-dd');
        tinfo = day;
    }

    if (tinfo2 === undefined) {
        var day2 = dateFormat(new Date(), 'yyyy-mm-dd');
        tinfo2 = day2;
    }

    const bonuses = await Bonus.findAll({
        where: { tinfo: { [Op.between]: [tinfo, tinfo2] } },
        order: [
            ['userid', 'ASC'],
            ['createdAt', 'ASC'],
        ],
        raw: true,
    });

    res.send({ items: bonuses });
};

exports.periodauto = async (req, res) => {
    console.log('calcute periodauto ');
    console.log(req.body);

    const { tinfo, tinfo2 } = req.body.tinfo;

    var start_date = moment(tinfo, 'YYYY-MM-DD');
    var end_date = moment(tinfo2, 'YYYY-MM-DD');
    const daydiff = moment.duration(end_date.diff(start_date)).asDays();

    console.log(
        start_date.format('YYYY-MM-DD'),
        end_date.format('YYYY-MM-DD'),
        daydiff
    );

    for (let i = 0; i < daydiff + 1; i++) {
        var new_date = moment(start_date, 'YYYY-MM-DD').add(i, 'days');

        console.log(new_date.format('YYYY-MM-DD'));

        var date_check = moment(
            new_date.format('YYYY-MM-DD'),
            'YYYY-MM-DD'
        ).day();

        console.log('date_check', date_check);

        //
        await calculateAllUserDailyBonus(new_date.format('YYYY-MM-DD'));

        await calculateAllUserMatchingBonus(new_date.format('YYYY-MM-DD'));
    }

    res.send({ message: 'ok' });
};

//

