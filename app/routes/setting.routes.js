const controller = require("../controllers/setting.controller");

const basepath = '/api/settings/'

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //client nkminfo
  app.get("/api/setting/order/nkminfo", controller.nkminfo);


  // configs
  app.post(basepath+'getConfigs',controller.getConfigs);


  // updateAdmin
  app.post(basepath+'updateAdmin',controller.updateAdmin);


  // updatePolicyfee
  app.post(basepath+'updatePolicyfee',controller.updatePolicyfee);



  // updatePvAddMember
  app.post(basepath+'updatePvAddMember',controller.updatePvAddMember);


  // updatePvValue123
  app.post(basepath+'updatePvValue123',controller.updatePvValue123);


  // updatePvValue4to15
  app.post(basepath+'updatePvValue4to15',controller.updatePvValue4to15);
};
