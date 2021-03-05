const controller = require("../controllers/withdraw.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //client requestbyuser
  app.post("/api/withdraw/requestbyuser", controller.requestbyuser);

  //client listbyuser
  app.get("/api/withdraw/listbyuser", controller.listbyuser);
  
};
