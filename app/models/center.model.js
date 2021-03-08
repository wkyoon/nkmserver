module.exports = (sequelize, Sequelize) => {
  const Center = sequelize.define("centers", {
      name: {
          type: Sequelize.STRING(40)
      },
      manager: {
          type: Sequelize.STRING(40)
      },
      phoneno: {
        type: Sequelize.STRING(40)
      }
  },
  {
    charset: 'euckr',
    collate: 'euckr_bin',
  });

  return Center;
};  