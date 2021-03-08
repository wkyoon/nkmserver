const controller = require("../controllers/deposit.controller");

const basepath = '/api/deposits/'

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //client listbyuser
  app.get("/api/deposit/listbyuser", controller.listbyuser);


  app.get(basepath, controller.findAll);

  app.post(basepath+'add',controller.create);

  app.put(basepath+"update", controller.update);

  app.post(basepath+"remove", controller.delete);

            
};
