const controller = require("../controllers/bonus.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //client bonuslistbyuser
  app.get("/api/bonus/bonuslistbyuser", controller.bonuslistbyuser);
  
};
