const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.setting = require("../models/setting.model.js")(sequelize, Sequelize);
db.order = require("../models/order.model.js")(sequelize, Sequelize);
db.deposit = require("../models/deposit.model.js")(sequelize, Sequelize);
db.bonus = require("../models/bonus.model.js")(sequelize, Sequelize);
db.withdraw = require("../models/withdraw.model.js")(sequelize, Sequelize);


db.admin = require("../models/admin.model.js")(sequelize, Sequelize);
db.notice = require("../models/notice.model.js")(sequelize, Sequelize);
db.center = require("../models/center.model.js")(sequelize, Sequelize);

db.package = require("../models/package.model.js")(sequelize, Sequelize);


// Relations

db.user.belongsTo(db.center, { foreignKey: 'centerId',targetKey:'id'});


module.exports = db;
