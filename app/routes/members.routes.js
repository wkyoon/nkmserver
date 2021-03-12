const { authJwt } = require('../middleware');
const members = require('../controllers/member.controller');

const basepath = '/api/members/';

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    // Create
    app.post(basepath + 'add', members.create);

    // Update
    app.post(basepath + 'update', members.update);

    app.post(basepath + 'updatepackage', members.updatepackage);

    // Delete
    app.post(basepath + 'delete', members.delete);


    app.get(basepath + 'list', members.findAll);

    /* ---------------------------- */

    app.post(basepath + 'toggle-starred-member', members.togglestar);

    app.post(basepath + 'toggle-status-member', members.togglestatus);


    
    // recommenders
    app.get(basepath + 'recommenders', members.findRecommends);

    app.post(basepath + 'update-recom', members.updateRecommender);



    // for test 
    app.post(basepath + 'addMember100', members.addMember100);
    
    app.post(basepath + 'defaultOrderSet', members.defaultOrderSet);

    app.post(basepath + 'makeBTree', members.makeBTree);

    app.post(basepath + 'defaultOrders', members.defaultOrders);
    app.post(basepath + 'defaultWithdraws', members.defaultWithdraws);
    app.post(basepath + 'defaultDeposits', members.defaultDeposits);
    app.post(basepath + 'defaultCalculates', members.defaultCalculates);
    app.post(basepath + 'defaultUsers', members.defaultUsers);
    
    

};
