module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("orders", {
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
        buytype:{
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
  
    return Order;
  };  