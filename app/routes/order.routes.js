const controller = require("../controllers/order.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //client orderlistbyuser
  app.get("/api/order/orderlistbyuser", controller.orderlistbyuser);

  //client buypackage
  app.post("/api/order/buypackage", controller.buypackage);

  
};
