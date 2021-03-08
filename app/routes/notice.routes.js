const notices = require("../controllers/notice.controller");

const basepath = '/api/notice/'

module.exports = function(app){
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(basepath+"add",  notices.create);
  app.post(basepath+"update",  notices.update);
  app.post(basepath+"remove",  notices.delete);
  app.get(basepath+"list",  notices.findAll);
  
};
