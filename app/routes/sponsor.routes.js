const { authJwt } = require("../middleware");
const sponsor = require("../controllers/sponsor.controller");

const basepath = '/api/sponsor/'

module.exports = function(app){
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    app.post(basepath + 'update', sponsor.update);

    // List a new sponsor
    app.get(basepath + 'list', sponsor.findAll);

    app.post(basepath + 'view', sponsor.findSponsorsTwo);

  
  
};
