module.exports = (sequelize, Sequelize) => {
    const Setting = sequelize.define("settings", {
        name: {
            type: Sequelize.STRING
        },
        value: {
            type: Sequelize.STRING
        }
    },
    {
      charset: 'euckr',
      collate: 'euckr_bin',
    });
  
    return Setting;
  };
  