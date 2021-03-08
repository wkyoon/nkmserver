const db = require('../models');

const User = db.user;

var SponsorInfo = require('../util/SponsorInfo');

var sponsporlist = [];
var maxdepth = 0;
var depthMap = {};

const Op = db.Sequelize.Op;

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



async function updateRecommenderCntAndSponsorCnt() {
    console.log('------------------> start updateRecommenderCntAndSponsorCnt ');
    // ---------------------------------------------

    var rootNodes = [];
    var childrenNodes = [];

    // update all user recommender and sponsor tree
    const alluser = await User.findAll({
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

        await User.update(
            {
              sponsorcount: Number(sponsorinfo.length),
            },
            { where: { id: alluser[i].id }, logging: false }
        );
    }
    // ---------------------------------------------
    console.log('------------------> end updateRecommenderCntAndSponsorCnt ');
}


var garray = [];
function visitNode(node, hashMap, array) {
    if (!hashMap[node.data]) {
        hashMap[node.data] = true;
        garray.push(node);
    }
}

function convertTreeToList(root) {
    var stack = [],
        hashMap = {};
    stack.push(root);
    //console.log(stack.length)
    while (stack.length !== 0) {
        var node = stack.pop();
        //console.log(node)
        garray.push({
            id: node.id,
            userid: node.name,
            parentId: node.parentId,
        });
        if (node.children === null) {
            visitNode(node, hashMap);
        } else {
            //console.log('111111')
            for (var i = node.children.length - 1; i >= 0; i--) {
                stack.push(node.children[i]);
            }
        }
    }
}

// call from admin
exports.update = async (req, res) => {
    console.log(
        '------------------------->> SponsorController UPDATE ( node Delete )  '
    );
    //console.log(req.body);
    const { ds, orgdata } = req.body;
    garray = [];
    //console.log('treenode',ds)

    convertTreeToList(ds);
    const temparr = garray;
    //console.log('temparr',temparr)
    var temparrMap = {};
    for (let i = 0; i < temparr.length; i++) {
        temparrMap[temparr[i].id] = temparr[i];
    }

    garray = [];
    convertTreeToList(orgdata);
    const orgArr = garray;
    //console.log('orgdata ',orgArr)

    //console.log(orgArr.length,temparr.length)
    var updateIndex = -1;

    // delete node
    if (orgArr.length > temparr.length) {
        //console.log('------------> delete node !!!')
        for (i = 0; i < orgArr.length; i++) {
            var isExist = false;
            for (j = 0; j < temparr.length; j++) {
                if (orgArr[i].id == temparr[j].id) {
                    isExist = true;
                    break;
                }
            }

            if (!isExist) {
                console.log('isExist', orgArr[i]);
                updateIndex = i;
                break;
            }
        }

        if (updateIndex > 0) {
            console.log(
                '222222222222222222222222',
                updateIndex,
                temparr.length,
                orgArr.length
            );
            //console.log('xxx',orgArr[updateIndex])

            await User.update(
                { parentId: 0, sponsorid: 'admin' },
                {
                    where: { id: orgArr[updateIndex].id },
                }
            );
        }
    } else if (orgArr.length < temparr.length) {
        console.log('------------> ADD node !!!');
        // add node
        // need not update first node
        for (i = 1; i < temparr.length; i++) {
            await User.update(
                {
                  sponsorid: temparrMap[temparr[i].parentId].userid,
                    parentId: temparr[i].parentId,
                },
                {
                    where: { id: temparr[i].id },
                }
            );
        }
    }

    await updateRecommenderCntAndSponsorCnt();

    res.send({ message: 'ok' });
};

// call from admin
// 모든 회원의 스폰서 정보를 만들어주는 부분
exports.findAll = async (req, res) => {
    console.log('----------------- sponsor controll ADMIN ');

    const alluser = await User.findAll({
        attributes: [
            'id',
            'userid',
            'name',
            'parentId',
            'sponsorid',
            'sponsorcount',
            'createdAt'
        ],
        raw: true,
    });

    res.send({ items: alluser });
};


/*-------------------------------*/
/*-------------------------------*/

function makeSponsorList(usernamelist, children, depth) {
    const templist = [];
    const tempNameList = [];
    for (j = 0; j < usernamelist.length; j++) {
        for (i = 0; i < children.length; i++) {
            if (children[i].parentId == usernamelist[j].id) {
                templist.push(children[i]);

                tempNameList.push(children[i].userid);
                sponsporlist.push({
                    id: children[i].id,
                    name: children[i].name,
                    title: children[i].title,
                    sponsorid: children[i].sponsorid,
                    parentId: children[i].parentId,
                    children: '',
                    depth: depth,
                });
            }
        }
    }

    if (templist.length > 0) {
        depthMap[depth] = {
            depth: depth,
            count: templist.length,
            data: tempNameList,
        };
        maxdepth = depth + 1;
        makeSponsorList(templist, children, maxdepth);
    }
}

/*----------------------*/

function list_to_tree(list) {
    console.log('list_to_tree');
    var map = {},
        node,
        roots = [],
        i;

    for (i = 0; i < list.length; i += 1) {
        map[list[i].id] = i; // initialize the map
        list[i].children = []; // initialize the children
    }

    for (i = 0; i < list.length; i += 1) {
        node = list[i];
        //console.log(node)
        if (node.parentId != 0) {
            // if you have dangling branches check that map[node.parentId] exists
            list[map[node.parentId]].children.push(node);
        } else {
            roots.push(node);
        }
    }
    return roots;
}



const SponsorTree = require('../util/SponsorTree');

// call from admin site
// call from client site
module.exports.findSponsorsTwo = async function (req, res) {
    console.log('--- findSponsors-- find children  FROM ADMIN AND CLIENT');
    //  console.log(req.body)
    const { id } = req.body;
    //console.log('id',id)

    const sponsortree = await SponsorTree.SponsorTree(id);

    //console.log(sponsortree)

    const { currentuser, sponsorinfo } = sponsortree;
    //  console.log('sponsorinfo',sponsorinfo)

    const childrentemp = [];

    

    if (sponsorinfo != null) {
        for (let i = 0; i < sponsorinfo.children.length; i++) {
            childrentemp.push(sponsorinfo.children[i].data);
        }
    }

    //console.log('childrentemp,',childrentemp)

    sponsporlist = [];
    depthMap = {};
    maxdepth = 0;
    const usernamelist = [];
    usernamelist.push({
        id: Number(id),
        name: currentuser.userid,
        sponsorid: currentuser.sponsorid,
        parentId: 0,
        children: '',
        depth: 0,
    });
    sponsporlist.push({
        id: Number(id),
        name: currentuser.userid,
        sponsorid: currentuser.sponsorid,
        parentId: 0,
        children: '',
        depth: 0,
    });
    //console.log(usernamelist)
    makeSponsorList(usernamelist, childrentemp, 1);
    // console.log('list info',sponsporlist)
    // console.log('total nodes : ',sponsporlist.length)
    // console.log('maxdepth : ',maxdepth)
    // console.log('depthMap : ',depthMap)

    // check chidren depth 1  left rigth total node count

    const treeinfo = list_to_tree(sponsporlist);
    //  console.log('treeinfo',treeinfo)
    res.send(treeinfo);
};

async function getSponsorInfo(id) {
    console.log('getSponsorInfo ', id);
    var sponsporlist = [];
    var depthMap = {};
    var maxdepth = 0;

    const alluser = await User.findAll({
        attributes: ['id', 'userid', 'sponsorid', 'parentId'],
        raw: true,
    });

    // make map
    var alluserMap = {};
    for (i = 0; i < alluser.length; i++) {
        alluserMap[alluser[i].id] = alluser[i];
    }

    console.log(alluserMap[id]);

    findChildren(alluser, alluserMap, id, sponsporlist);
}

function findChildren(alluser, alluserMap, id, sponsporlist) {
    var templist = [];
    const rootnode = alluserMap[id];

    for (i = 0; i < alluser.length; i++) {
        if (alluser[i].parentId == id) {
            console.log('parentId', alluser[i].parentId);
            console.log('xxxx', alluserMap[alluser[i].id]);
            templist.push(alluserMap[alluser[i].id]);
        }
    }

    if (templist.length > 0) {
        sponsporlist.push(templist);
    } else {
        return sponsporlist;
    }
}
