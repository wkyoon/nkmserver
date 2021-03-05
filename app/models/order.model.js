module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("orders", {
        usertbid: {
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
            unique: true
        },
        status:{
            type: Sequelize.STRING
        },
    },
    {
      charset: 'euckr',
      collate: 'euckr_bin',
    });
  
    return Order;
  };  