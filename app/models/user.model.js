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
    recovery: {
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
    }
    
  },
  {
    charset: 'euckr',
    collate: 'euckr_bin',
  });
  

  return User;
};
