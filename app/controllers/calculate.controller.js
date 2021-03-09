const crypto = require('crypto');
const db = require('../models');
const User = db.user;
const Bonus = db.bonus;
const Setting = db.setting;
const Pacakge = db.package;
const SponsorTree = require('../util/SponsorTree');

const Op = db.Sequelize.Op;
var dateFormat = require('dateformat');

exports.latest = async (req, res) => {
    console.log('calcute latest list ');

    const bonuses = await Bonus.findAll({
        order: [['createdAt', 'DESC']],
        limit: 100,
        raw: true,
    });

    res.send({ items: bonuses });
};

exports.updatebonusdaily = async (req, res) => {
    console.log('calcute updatebonusdaily ');
    console.log(req.body);

    const { tinfo } = req.body;

    if (tinfo != undefined) {
        console.log('not undefined', tinfo);
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

        const level1_dialy = 1.5;
        const level2_dialy = 1.7;
        const level3_dialy = 2.0;

        for (let i = 0; i < alluser.length; i++) {
            let user = alluser[i];

            if (user.balance > 0) {
                // update daily bonus
                //console.log('bonus daily',user.userid,user.balance)
                let bonus_daily = 0;
                if (user.balance === 1000) {
                    bonus_daily = (1000 * level1_dialy) / 100;
                } else if (user.balance === 3000) {
                    bonus_daily = (1000 * level2_dialy) / 100;
                } else if (user.balance === 5000) {
                    bonus_daily = (1000 * level3_dialy) / 100;
                }

                console.log('bonus daily', user.userid, bonus_daily);

                // if exist bonus same day

                const bonus = await Bonus.findOne({
                    where: { userid: user.userid, tinfo: tinfo, type: 'daily' },
                    raw: true,
                    logging: false,
                });

                // update user bonus

                let user_maxbonus = user.maxbonus;

                let user_bonus = user.bonus;
                let user_remainderbonus = user.remainderbonus;

                let user_bonus_daily = user.bonus_daily;
                let user_bonus_matching = user.bonus_matching;

                let user_rc = user.rc;
                let user_spoint = user.spoint;
                let user_withdrawable = user.withdrawable;

                let temp_bonus_rc = bonus_daily / 2;
                let temp_bonus_spoint = bonus_daily / 2;

                let temp_bonus = user_bonus + bonus_daily;
                let temp_remainderbonus = user_maxbonus - temp_bonus;
                let temp_rc = user_rc + temp_bonus_rc;
                let temp_spoint = user_spoint + temp_bonus_spoint;
                let temp_withdrawable = user_withdrawable + temp_bonus;

                console.log(temp_bonus_rc, temp_bonus_spoint);

                if (bonus) {
                    // await Bonus.update(
                    //     { bonus: bonus_daily },
                    //     { where: { id: bonus.id }, raw: true }
                    // );
                } else {
                    await Bonus.create({
                        userid: user.userid,
                        tinfo: tinfo,
                        bonus: bonus_daily,
                        type: 'daily',
                        ref: 'daily bonus(' + user.userid + ')',
                    });

                    console.log('-- update user --', user.id);
                    // update user
                    await User.update(
                        {
                            bonus: temp_bonus,
                            remainderbonus: temp_remainderbonus,
                            rc: temp_rc,
                            spoint: temp_spoint,
                            withdrawable: temp_withdrawable,
                        },
                        { where: { id: user.id }, raw: true }
                    );
                }
            }
        }
    }

    res.send({ message: 'success' });
};

exports.updatebonusmatching = async (req, res) => {
    console.log('calcute updatebonusmatching ');
    console.log(req.body);

    const { tinfo } = req.body;

    if (tinfo != undefined) {
        console.log('not undefined', tinfo);
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

        const level1_dialy = 1.5;
        const level2_dialy = 1.7;
        const level3_dialy = 2.0;

        for (let i = 0; i < alluser.length; i++) {
            let user = alluser[i];

            // cheich exist user matching bonus 
            const bonus = await Bonus.findOne({
                where: { userid: user.userid, tinfo: tinfo, type: 'matching' },
                raw: true,
                logging: false,
            });



            if (user.sponsorcount > 0 && !bonus) {
                let sponsortree = await SponsorTree.SponsorTree(user.id);
                const { currentuser, sponsorinfo } = sponsortree;
                //console.log('sponsorinfo',sponsorinfo)
                const childrentemp = [];
                //childrentemp.push(currentuser);

                if (sponsorinfo != null) {
                    let firstchildren = sponsorinfo.data['1'].data;
                    let secondechildren = sponsorinfo.data['2'].data;

                    console.log('firstchildren');

                    let total_matching_bonus = 0;
                    let sum_first_depth_bonus = 0;
                    let sum_second_depth_bonus = 0;  

                    const depth1_percent = 100;
                    const depth2_percent = 5;

                    for (let j = 0; j < firstchildren.length; j++) {
                        let first_depth_child = firstchildren[j];

                        console.log(first_depth_child);
                        let first_depth_child_daily_bonus = 0;
                        if (first_depth_child.balance === 1000) {
                            first_depth_child_daily_bonus =
                                first_depth_child.balance * level1_dialy* 0.01;
                        } else if (first_depth_child.balance === 3000) {
                            first_depth_child_daily_bonus =
                                first_depth_child.balance * level2_dialy* 0.01;
                        } else if (first_depth_child.balance === 5000) {
                            first_depth_child_daily_bonus =
                                first_depth_child.balance * level3_dialy* 0.01;
                        }

                        //
                        await Bonus.create({
                            userid: user.userid,
                            tinfo: tinfo,
                            bonus: first_depth_child_daily_bonus,
                            type: 'matching',
                            ref:
                                'matching bonus(' +
                                first_depth_child.userid +
                                ')',
                        });
                        sum_first_depth_bonus =
                            sum_first_depth_bonus +
                            first_depth_child_daily_bonus;
                    }

                    for (let j = 0; j < secondechildren.length; j++) {
                        let second_depth_child = secondechildren[j];

                        console.log(second_depth_child);
                        let second_depth_child_daily_bonus = 0;
                        if (second_depth_child.balance === 1000) {
                            second_depth_child_daily_bonus =
                                second_depth_child.balance *
                                level1_dialy * 0.01 *
                                0.05;
                        } else if (second_depth_child.balance === 3000) {
                            second_depth_child_daily_bonus =
                                second_depth_child.balance *
                                level2_dialy *0.01 *
                                0.05;
                        } else if (second_depth_child.balance === 5000) {
                            second_depth_child_daily_bonus =
                                second_depth_child.balance *
                                level3_dialy *0.01 *
                                0.05;
                        }

                        //
                        await Bonus.create({
                            userid: user.userid,
                            tinfo: tinfo,
                            bonus: second_depth_child_daily_bonus,
                            type: 'matching',
                            ref:
                                'matching bonus(' +
                                second_depth_child.userid +
                                ')',
                        });
                        sum_second_depth_bonus =
                            sum_second_depth_bonus +
                            second_depth_child_daily_bonus;
                    }
                    total_matching_bonus = sum_first_depth_bonus + sum_second_depth_bonus
                    console.log('secondechildren');

                    // update user info
                    

                    let user_maxbonus = user.maxbonus;

                    let user_bonus = user.bonus;
                    let user_remainderbonus = user.remainderbonus;

                    let user_bonus_daily = user.bonus_daily;
                    let user_bonus_matching = user.bonus_matching;

                    let user_rc = user.rc;
                    let user_spoint = user.spoint;
                    let user_withdrawable = user.withdrawable;

                    let temp_bonus_rc = total_matching_bonus / 2;
                    let temp_bonus_spoint = total_matching_bonus / 2;

                    let temp_bonus = user_bonus + total_matching_bonus;
                    let temp_remainderbonus = user_maxbonus - temp_bonus;
                    let temp_rc = user_rc + temp_bonus_rc;
                    let temp_spoint = user_spoint + temp_bonus_spoint;
                    let temp_withdrawable = user_withdrawable + temp_bonus;

                    await User.update(
                        {
                            bonus: temp_bonus,
                            remainderbonus: temp_remainderbonus,
                            rc: temp_rc,
                            spoint: temp_spoint,
                            withdrawable: temp_withdrawable,
                        },
                        { where: { id: user.id }, raw: true }
                    );
                }
            }
        }
    }

    res.send({ message: 'success' });
};


exports.listdailybyday = async ( req, res ) => {
    console.log('-----------> CalculateControll listdailybyday ')

    let {tinfo} = req.body
    //console.log('tinfo',tinfo)

    if(tinfo === undefined)
    {
        var day=dateFormat(new Date(), "yyyy-mm-dd");
        console.log(day)
        tinfo = day
    }


    const bonuses = await Bonus.findAll({
        where: { tinfo: tinfo,type:'daily' },
        order: [['createdAt', 'DESC']],
        raw: true,
    });

    res.send({ items: bonuses });
    
}

exports.listmatchingybyday = async ( req, res ) => {
    console.log('-----------> CalculateControll listmatchingybyday ')

    let {tinfo} = req.body
    //console.log('tinfo',tinfo)

    if(tinfo === undefined)
    {
        var day=dateFormat(new Date(), "yyyy-mm-dd");
        console.log(day)
        tinfo = day
    }


    const bonuses = await Bonus.findAll({
        where: { tinfo: tinfo,type:'matching' },
        order: [['createdAt', 'DESC']],
        raw: true,
    });

    res.send({ items: bonuses });
    
}
