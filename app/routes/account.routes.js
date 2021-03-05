const { verifySignUp } = require("../middleware");
const controller = require("../controllers/account.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/account/me", controller.me);

  app.post("/api/account/login", controller.login);

  app.post("/api/account/register", controller.register);

  app.post("/api/account/modify", controller.modify);

  
};
