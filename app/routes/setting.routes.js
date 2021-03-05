const controller = require("../controllers/setting.controller");

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


  
};
