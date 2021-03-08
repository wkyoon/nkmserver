const controller = require("../controllers/package.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //list
  app.get("/api/package/list", controller.list);

  app.post("/api/package/add", controller.create);
  app.post("/api/package/update", controller.update);
  app.post("/api/package/remove", controller.delete);
  
};
