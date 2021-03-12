const controller = require("../controllers/calculate.controller");

const basepath = '/api/calculate/'

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  
  app.post(basepath+'latest',controller.latest);

  app.post(basepath+'updatebonusdaily',controller.updatebonusdaily);

  app.post(basepath+'updatebonusmatching',controller.updatebonusmatching);


  app.post(basepath+'listbyday',controller.listbyday);

  app.post(basepath+'listdailybyday',controller.listdailybyday);

  app.post(basepath+'listmatchingybyday',controller.listmatchingybyday);

  app.post(basepath+'periodauto',controller.periodauto);


  
};
