module.exports = (sequelize, Sequelize) => {
    const Package = sequelize.define("packages", {
        name: {
            type: Sequelize.STRING
        },
        label: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.INTEGER
        },
        maxvalue: {
            type: Sequelize.INTEGER
        },
        daily: {
            type: Sequelize.STRING,
        },
    },
    {
      charset: 'euckr',
      collate: 'euckr_bin',
    });
  
    return Package;
  };  