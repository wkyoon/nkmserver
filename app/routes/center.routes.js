const centers = require("../controllers/center.controller");

const basepath = '/api/centers/'

module.exports = function(app){

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(basepath+'add',centers.create);
  app.post(basepath+"update", centers.update);
  app.post(basepath+"remove", centers.delete);

  app.post(basepath+"findone", centers.findOne);
  app.post(basepath+"list", centers.findAndCountAll);

};
