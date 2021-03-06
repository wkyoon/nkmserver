module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {

    uuid: {
      type: Sequelize.STRING,
      unique: "uuid_UNIQUE"
    },
    userid: {
      type: Sequelize.STRING,
      unique: "userid_UNIQUE"
    },
    avatar: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    pin: {
      type: Sequelize.STRING
    },
    role:{
      type: Sequelize.STRING
    },
    sponsorid: {
      type: Sequelize.STRING
    },
    sponsorcount: {
      type: Sequelize.INTEGER
    },
    buytype: {
      type: Sequelize.STRING
    },
    volume: {
      type: Sequelize.STRING
    },
    injung: {
      type: Sequelize.STRING
    },
    packageId: {
      type: Sequelize.INTEGER
    },
    balance: {
      type: Sequelize.INTEGER
    },
    maxbonus: {
      type: Sequelize.DOUBLE
    },
    remainderbonus: {
      type: Sequelize.DOUBLE
    },
    bonus: {
      type: Sequelize.DOUBLE
    },
    bonus_daily: {
      type: Sequelize.DOUBLE
    },
    bonus_matching: {
      type: Sequelize.DOUBLE
    },
    rc: {
      type: Sequelize.DOUBLE
    },
    withdrawable: {
      type: Sequelize.DOUBLE
    },
    spoint: {
      type: Sequelize.DOUBLE
    },
    parentId: {
      type: Sequelize.INTEGER
    },
    centerId: {
      type: Sequelize.INTEGER
    },
    centername: {
      type: Sequelize.STRING
    }
    
  },
  {
    charset: 'euckr',
    collate: 'euckr_bin',
  });
  

  return User;
};
