const db = require('../models');
const User = db.user;
var SponsorInfo = require('./SponsorInfo');

exports.SponsorTree = async (id) => {
    console.log('SponsorTree',id)

    var rootNodes = [];
    var childrenNodes = [];

    var firstChildren = [];
    var currentuser = {};

    const alluser = await User.findAll({
        attributes: [
            'id',
            'parentId',
            'userid',
            'name',
            'sponsorid',
            'sponsorcount',
            'balance',
            'createdAt',
        ],
        raw: true,
    });

    for (let i = 0; i < alluser.length; i++) {
        if (alluser[i].id == id) {
            currentuser = {
                id: alluser[i].id,
                userid:alluser[i].userid,
                username: alluser[i].name,
                name: alluser[i].userid,
                title: alluser[i].userid,
                parentId: alluser[i].parentId,
                sponsorid: alluser[i].sponsorid,
                sponsorcount: alluser[i].sponsorcount,
                balance:alluser[i].balance,
                createdAt: alluser[i].createdAt,
            }
        }

        if (alluser[i].parentId == id) {
            firstChildren.push({
                id: alluser[i].id,
                userid:alluser[i].userid,
                username: alluser[i].name,
                name: alluser[i].userid,
                title: alluser[i].userid,
                parentId: alluser[i].parentId,
                sponsorid: alluser[i].sponsorid,
                sponsorcount: alluser[i].sponsorcount,
                balance:alluser[i].balance,
                createdAt: alluser[i].createdAt,
            });
        }

        if (alluser[i].parentId > 0) {
            childrenNodes.push({
                id: alluser[i].id,
                userid:alluser[i].userid,
                username: alluser[i].name,
                name: alluser[i].userid,
                title: alluser[i].userid,
                parentId: alluser[i].parentId,
                sponsorid: alluser[i].sponsorid,
                sponsorcount: alluser[i].sponsorcount,
                balance:alluser[i].balance,
                createdAt: alluser[i].createdAt,
            });
        } else {
            // root node
            rootNodes.push({
                id: alluser[i].id,
                userid:alluser[i].userid,
                username: alluser[i].name,
                name: alluser[i].userid,
                title: alluser[i].userid,
                parentId: alluser[i].parentId,
                sponsorid: alluser[i].sponsorid,
                sponsorcount: alluser[i].sponsorcount,
                balance:alluser[i].balance,
                createdAt: alluser[i].createdAt,
            });
        }
    }

    //console.log('first children ',firstChildren)

    if (firstChildren.length > 0) {

        let a = new SponsorInfo(childrenNodes, id);

        let sponsorinfo = await a.getSponsorInfo();
        //console.log(currentuser)
        //console.log('-----------------------------------------------------------')
        return { currentuser, sponsorinfo };
        //console.log('-----------------------------------------------------------')
    } else {
        return { currentuser, sponsorinfo: null };
    }
};
