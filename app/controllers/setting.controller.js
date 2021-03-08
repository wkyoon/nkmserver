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

    const nkm_price = await Setting.findOne({
        where: { name: 'nkm_price' },
        raw: true,
    });

    const nkm_address = await Setting.findOne({
        where: { name: 'nkm_address' },
        raw: true,
    });


    const withdraw_fee = await Setting.findOne({
        where: { name: 'withdraw_fee' },
        raw: true,
    });

    const spoint_price = await Setting.findOne({
        where: { name: 'spoint_price' },
        raw: true,
    });
    

    return res.send({
        nkminfo: {
            price: nkm_price.value,
            address: nkm_address.value,
            withdraw_fee: withdraw_fee.value,
            spointprice: spoint_price.value,
        },
    });
};

exports.getConfigs = (req, res) => {
    Setting.findAll({
        raw: true,
    })
        .then((items) => {
            //console.log(items)
            res.send({ items });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while retrieving tutorials.',
            });
        });
};

exports.create = (req, res) => {
    console.log('admin setting create');
    console.log('admin setting create');
    console.log('admin setting create');
    console.log(req.body);
    const {
        bank_name,
        bank_owner,
        bank_account,
        eth_address,
        ost_address,
        snp_address,
    } = req.body.form;
    const {
        order_enable,
        order_realtime,
        eth_value,
        ost_value,
        snp_value,
    } = req.body.form;

    const { order_fee, withdraw_fee, min_withdraw } = req.body.form;
    const { pv_addmember, pv_addmember_daily } = req.body.form;
    const { pv_1, pv_2, pv_3 } = req.body.form;
    const { pv_4, pv_5, pv_6, pv_7, pv_8 } = req.body.form;

    // console.log(bank_name)
    // console.log(bank_owner)
    // console.log(bank_account)

    // console.log(eth_address)
    // console.log(ost_address)
    // console.log(snp_address)

    // console.log(order_enable)
    // console.log(order_realtime)

    // console.log(eth_value)
    // console.log(ost_value)
    // console.log(snp_value)

    // console.log(order_fee)
    // console.log(withdraw_fee)
    // console.log(min_withdraw)

    // console.log(pv_addmember)
    // console.log(pv_addmember_daily)

    // console.log(pv_1)
    // console.log(pv_2)
    // console.log(pv_3)

    // console.log(pv_4)
    // console.log(pv_5)
    // console.log(pv_6)
    // console.log(pv_7)
    // console.log(pv_8)

    // find name and value

    // Settings.create({name:'bank_name',value:bank_name});
    // Settings.create({name:'bank_owner',value:bank_owner});
    // Settings.create({name:'bank_account',value:bank_account});

    // Settings.create({name:'eth_address',value:eth_address});
    // Settings.create({name:'ost_address',value:ost_address});
    // Settings.create({name:'snp_address',value:snp_address});

    // Settings.create({name:'order_enable',value:order_enable});
    // Settings.create({name:'order_realtime',value:order_realtime});

    // Settings.create({name:'eth_value',value:eth_value});
    // Settings.create({name:'ost_value',value:ost_value});
    // Settings.create({name:'snp_value',value:snp_value});

    Setting.create({ name: 'order_fee', value: order_fee });
    Setting.create({ name: 'withdraw_fee', value: withdraw_fee });
    Setting.create({ name: 'min_withdraw', value: min_withdraw });

    Setting.create({ name: 'pv_addmember', value: pv_addmember });
    Setting.create({ name: 'pv_addmember_daily', value: pv_addmember_daily });

    Setting.create({ name: 'pv_1', value: pv_1 });
    Setting.create({ name: 'pv_2', value: pv_2 });
    Setting.create({ name: 'pv_3', value: pv_3 });

    Setting.create({ name: 'pv_4', value: pv_4 });
    Setting.create({ name: 'pv_5', value: pv_5 });
    Setting.create({ name: 'pv_6', value: pv_6 });
    Setting.create({ name: 'pv_7', value: pv_7 });
    Setting.create({ name: 'pv_8', value: pv_8 });
};

exports.updateOrder = async (req, res) => {
    console.log('-------------updateOrders--------------');
    const {
        order_enable,
        order_realtime,
        order_default,
        eth_value,
        ost_value,
        snp_value,
    } = req.body.form;

    const setting_order_enable = await Setting.findOne({
        where: { name: 'order_enable' },
        raw: true,
    });
    if (setting_order_enable === null) {
        // create
        await Setting.create({ name: 'order_enable', value: order_enable });
    } else {
        // update
        await Setting.update(
            { value: order_enable },
            { where: { name: 'order_enable' } }
        );
    }

    const setting_order_realtime = await Setting.findOne({
        where: { name: 'order_realtime' },
        raw: true,
    });

    if (setting_order_realtime != null) {
        await Setting.update(
            { value: order_realtime },
            { where: { name: 'order_realtime' } }
        );
    } else {
        await Setting.create({ name: 'order_realtime', value: order_realtime });
    }

    const setting_order_default = await Setting.findOne({
        where: { name: 'order_default' },
        raw: true,
    });
    if (setting_order_default != null) {
        await Setting.update(
            { value: order_default },
            { where: { name: 'order_default' } }
        );
    } else {
        await Setting.create({ name: 'order_default', value: order_default });
    }

    const setting_eth_value = await Setting.findOne({
        where: { name: 'eth_value' },
        raw: true,
    });
    if (setting_eth_value != null) {
        await Setting.update(
            { value: eth_value },
            { where: { name: 'eth_value' } }
        );
    } else {
        await Setting.create({ name: 'eth_value', value: eth_value });
    }

    const setting_ost_value = await Setting.findOne({
        where: { name: 'ost_value' },
        raw: true,
    });
    if (setting_ost_value != null) {
        await Setting.update(
            { value: ost_value },
            { where: { name: 'ost_value' } }
        );
    } else {
        await Setting.create({ name: 'ost_value', value: ost_value });
    }

    const setting_snp_value = await Setting.findOne({
        where: { name: 'snp_value' },
        raw: true,
    });

    if (setting_snp_value != null) {
        await Setting.update(
            { value: snp_value },
            { where: { name: 'snp_value' } }
        );
    } else {
        await Setting.create({ name: 'snp_value', value: snp_value });
    }

    res.send({ message: 'ok' });
};

exports.updatePolicyfee = async (req, res) => {
    console.log('admin setting withdraw_fee min_withdraw ')
    const { withdraw_fee, min_withdraw,dollar_won } = req.body.form;

    

    const setting_withdraw_fee = await Setting.findOne({
        where: { name: 'withdraw_fee' },
        raw: true,
    });

    if (setting_withdraw_fee != null) {
        await Setting.update(
            { value: withdraw_fee },
            { where: { name: 'withdraw_fee' } }
        );
    } else {
        await Setting.create({ name: 'withdraw_fee', value: withdraw_fee });
    }

    const setting_min_withdraw = await Setting.findOne({
        where: { name: 'min_withdraw' },
        raw: true,
    });

    if (setting_min_withdraw != null) {
        await Setting.update(
            { value: min_withdraw },
            { where: { name: 'min_withdraw' } }
        );
    } else {
        await Setting.create({ name: 'min_withdraw', value: min_withdraw });
    }


    const setting_dollar_won = await Setting.findOne({
        where: { name: 'dollar_won' },
        raw: true,
    });
    if (setting_dollar_won != null) {
        await Setting.update(
            { value: dollar_won },
            { where: { name: 'dollar_won' } }
        );
    } else {
        await Setting.create({ name: 'dollar_won', value: dollar_won });
    }

    res.send({ message: 'ok' });
};

exports.updatePvAddMember = async (req, res) => {
    const { pv_addmember } = req.body.form;

    const setting_pv_addmember = await Setting.findOne({
        where: { name: 'pv_addmember' },
        raw: true,
    });

    if (setting_pv_addmember != null) {
        await Setting.update(
            { value: pv_addmember },
            { where: { name: 'pv_addmember' } }
        );
    } else {
        await Setting.create({ name: 'pv_addmember', value: pv_addmember });
    }

    res.send({ message: 'ok' });
};

exports.updatePvValue123 = async (req, res) => {
    const { pv_1, pv_2, pv_3 } = req.body.form;

    const setting_pv_1 = await Setting.findOne({
        where: { name: 'pv_1' },
        raw: true,
    });

    if (setting_pv_1 != null) {
        await Setting.update({ value: pv_1 }, { where: { name: 'pv_1' } });
    } else {
        await Setting.create({ name: 'pv_1', value: pv_1 });
    }

    const setting_pv_2 = await Setting.findOne({
        where: { name: 'pv_2' },
        raw: true,
    });

    if (setting_pv_2 != null) {
        await Setting.update({ value: pv_2 }, { where: { name: 'pv_2' } });
    } else {
        await Setting.create({ name: 'pv_2', value: pv_2 });
    }

    const setting_pv_3 = await Setting.findOne({
        where: { name: 'pv_3' },
        raw: true,
    });

    if (setting_pv_3 != null) {
        await Setting.update({ value: pv_3 }, { where: { name: 'pv_3' } });
    } else {
        await Setting.create({ name: 'pv_3', value: pv_3 });
    }
    res.send({ message: 'ok' });
};

exports.updatePvValue4to15 = async (req, res) => {
    const { pv_4, pv_5, pv_6, pv_7, pv_8 } = req.body.form;

    const setting_pv_4 = await Setting.findOne({
        where: { name: 'pv_4' },
        raw: true,
    });

    if (setting_pv_4 != null) {
        await Setting.update({ value: pv_4 }, { where: { name: 'pv_4' } });
    } else {
        await Setting.create({ name: 'pv_4', value: pv_4 });
    }

    const setting_pv_5 = await Setting.findOne({
        where: { name: 'pv_5' },
        raw: true,
    });

    if (setting_pv_5 != null) {
        await Setting.update({ value: pv_5 }, { where: { name: 'pv_5' } });
    } else {
        await Setting.create({ name: 'pv_5', value: pv_5 });
    }

    const setting_pv_6 = await Setting.findOne({
        where: { name: 'pv_6' },
        raw: true,
    });

    if (setting_pv_6 != null) {
        await Setting.update({ value: pv_6 }, { where: { name: 'pv_6' } });
    } else {
        await Setting.create({ name: 'pv_6', value: pv_6 });
    }

    const setting_pv_7 = await Setting.findOne({
        where: { name: 'pv_7' },
        raw: true,
    });

    if (setting_pv_7 != null) {
        await Setting.update({ value: pv_7 }, { where: { name: 'pv_7' } });
    } else {
        await Setting.create({ name: 'pv_7', value: pv_7 });
    }

    const setting_pv_8 = await Setting.findOne({
        where: { name: 'pv_8' },
        raw: true,
    });

    if (setting_pv_8 != null) {
        await Setting.update({ value: pv_8 }, { where: { name: 'pv_8' } });
    } else {
        await Setting.create({ name: 'pv_8', value: pv_8 });
    }
    res.send({ message: 'ok' });
};

exports.updateAdmin = async (req, res) => {
    console.log('admin setting nkm_address, nkm_price, spoint_price');
    //console.log(req.body)
    const { nkm_address, nkm_price, spoint_price } = req.body.form;

    const setting_nkm_address = await Setting.findOne({
        where: { name: 'nkm_address' },
    });

    if (setting_nkm_address != null) {
        await Setting.update(
            { value: nkm_address },
            { where: { name: 'nkm_address' } }
        );
    } else {
        await Setting.create({ name: 'nkm_address', value: nkm_address });
    }

    const setting_nkm_price = await Setting.findOne({
        where: { name: 'nkm_price' },
    });

    if (setting_nkm_price != null) {
        await Setting.update(
            { value: nkm_price },
            { where: { name: 'nkm_price' } }
        );
    } else {
        await Setting.create({ name: 'nkm_price', value: nkm_price });
    }

    const setting_spoint_price = await Setting.findOne({
        where: { name: 'spoint_price' },
    });

    if (setting_spoint_price != null) {
        await Setting.update(
            { value: spoint_price },
            { where: { name: 'spoint_price' } }
        );
    } else {
        await Setting.create({ name: 'spoint_price', value: spoint_price });
    }

    res.send({ message: 'ok' });
};
