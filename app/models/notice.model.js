module.exports = (sequelize, Sequelize) => {
  const Notice = sequelize.define("notice", {
    title: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.INTEGER
    }
  },
  {
    charset: 'euckr',
    collate: 'euckr_bin',
  });

  return Notice;
};
