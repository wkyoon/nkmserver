module.exports = (sequelize, Sequelize) => {
    const Withdraw = sequelize.define("withdraws", {
        userid: {
            type: Sequelize.STRING
        },
        usd: {
            type: Sequelize.DOUBLE
        },
        nkmprice: {
            type: Sequelize.DOUBLE
        },
        nkmamount: {
            type: Sequelize.DOUBLE
        },
        nkmfee: {
            type: Sequelize.DOUBLE
        },
        nkmvalue: {
            type: Sequelize.DOUBLE
        },
        coinaddress: {
            type: Sequelize.STRING
        },
        type: {
            type: Sequelize.STRING
        },
        status:{
            type: Sequelize.STRING
        },
    },
    {
      charset: 'euckr',
      collate: 'euckr_bin',
    });
  
    return Withdraw;
  };  