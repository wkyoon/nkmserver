module.exports = (sequelize, Sequelize) => {
    const Bonus = sequelize.define("bonuses", {
        usertbid: {
            type: Sequelize.STRING
        },
        tinfo: {
            type: Sequelize.STRING
        },
        bonus: {
            type: Sequelize.DOUBLE
        },
        type: {
            type: Sequelize.STRING
        },
        ref:{
            type: Sequelize.STRING
        },
    },
    {
      charset: 'euckr',
      collate: 'euckr_bin',
    });
  
    return Bonus;
  };  