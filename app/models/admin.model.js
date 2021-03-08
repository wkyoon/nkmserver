module.exports = (sequelize, Sequelize) => {
    const Admin = sequelize.define("admins", {
      userid: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING
      },
      passwordtxt: {
        type: Sequelize.STRING
      },
      phoneno: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      }
    },
    {
      charset: 'euckr',
      collate: 'euckr_bin'
    });
  
    return Admin;
  };
  