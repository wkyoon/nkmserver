const controller = require('../controllers/admin.controller');

const basepath = '/api/auth/admin/';

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    app.post(basepath + 'signin', controller.signin);


    //app.post(basepath + 'signup', controller.create);

    
    app.post(basepath + 'access-token', controller.accesstoken);
    app.post(basepath + 'register', controller.register);

    // admin create
    // update
    // delete
    // list
    app.post(basepath + 'add', controller.createTwo);
    app.post(basepath + 'update', controller.update);
    app.post(basepath + 'remove', controller.delete);
    app.post(basepath + 'list', controller.findAndCountAll);
};
