module.exports = (sequelize, Sequelize) => {
    const Deposit = sequelize.define("deposites", {
        userid: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.DOUBLE
        },
        txid: {
            type: Sequelize.STRING,
        },
        status:{
            type: Sequelize.STRING
        },
    },
    {
      charset: 'euckr',
      collate: 'euckr_bin',
    });
  
    return Deposit;
  };  