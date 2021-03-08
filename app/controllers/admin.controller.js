const db = require('../models');
const config = require('../config/auth.config');
const Admin = db.admin;
const Op = db.Sequelize.Op;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;
    return { limit, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: items } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, items, totalPages, currentPage };
};

exports.signin = (req, res) => {
    console.log('admin signin',req.body);
    const { displayName:userid,password } = req.body.data;

    console.log('userid',userid,password)
    Admin.findOne({
        where: {
            userid: userid,
        },
    })
        .then((admin) => {
            if (!admin) {
                return res.status(404).send({ message: 'Admin Not found.' });
            }

            var passwordIsValid = bcrypt.compareSync(
                password,
                admin.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: 'Invalid Password!',
                });
            }

            var token = jwt.sign({ id: admin.id }, config.secret, {
                expiresIn: 86400, // 24 hours
            });

           console.log('success')
          
            res.status(200).send({
                user: {
                    data: {
                        id: admin.id,
                        displayName: admin.userid,
                        email: admin.email,
                        photoURL: 'assets/images/avatars/Abbott.jpg'
                    },
                    role: 'admin',
                },
                access_token: token,
            });
        })
        .catch((err) => {
            console.log('err',err)
            res.send({ message: err.message });
        });
};



// register and Save a new Admin
exports.register = (req, res) => {
    console.log('admin register',req.body);

    const {displayName:userid,password,email} = req.body;

    console.log('userid',userid)

    Admin.create({
        userid: userid,
        email: email,
        password: bcrypt.hashSync(password, 8),
        passwordtxt:password
    })
        .then((admin) => {
            if (req.body.roles) {

            } else {
                // admin role = 1
                const newUser = {
                    role: 'admin',
                    data: {
                        displayName: admin.userid,
                        photoURL: 'assets/images/avatars/Abbott.jpg',
                        email: admin.email,
                        settings: {},
                        shortcuts: [],
                    }
                };

                res.send({
                    user: newUser,
                    message: 'Admin registered successfully!',
                });

            }
        })
        .catch((err) => {
            const error = {
                email: null,
                displayName: 'Enter display name',
                password: null,
            };

            res.send({ error });
        });
};

exports.findAll = (req, res) => {
    const { page, size, username } = req.query;
    var condition = username
        ? { username: { [Op.like]: `%${username}%` } }
        : null;

    const { limit, offset } = getPagination(page, size);

    Admin.findAndCountAll({ where: condition, limit, offset })
        .then((data) => {
            const response = getPagingData(data, page, limit);
            res.send(response);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while retrieving admins.',
            });
        });
};

// Find a single Admin with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Admin.findByPk(id)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error retrieving Admin with id=' + id,
            });
        });
};

// Update a Admin by the id in the request
exports.update = (req, res) => {
    console.log(req.body);

    //const id = req.params.id;

    const { id, passwordtxt, phoneno, email, status } = req.body.item;

    Admin.update(
        {
            password: bcrypt.hashSync(passwordtxt, 8),
            passwordtxt: passwordtxt,
            phoneno: phoneno,
            email: email,
            status: status,
        },
        {
            where: { id: id },
        }
    )
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: 'Admin was updated successfully.',
                });
            } else {
                res.send({
                    message: `Cannot update Admin with id=${id}. Maybe Admin was not found or req.body is empty!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error updating Admin with id=' + id,
            });
        });
};

// Delete a Admin with the specified id in the request
exports.delete = (req, res) => {
    //const id = req.params.id;
    const { id } = req.body;

    Admin.destroy({
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: 'Admin was deleted successfully!',
                });
            } else {
                res.send({
                    message: `Cannot delete Admin with id=${id}. Maybe Admin was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Could not delete Admin with id=' + id,
            });
        });
};

// Delete all  from the database.
/* not use
exports.deleteAll = (req, res) => {
  Admin.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Tutorials were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all admins."
      });
    });
};
*/

exports.accesstoken = (req, res) => {
    console.log('admin access by token')
    const { access_token } = req.body.data;
    console.log(access_token)

    try {
        const { id } = jwt.verify(access_token, config.secret);

        console.log('id', id);

        Admin.findByPk(id)
            .then((admin) => {
                const updatedAccessToken = jwt.sign(
                    { id: admin.id },
                    config.secret,
                    { expiresIn: 86400 }
                );

                res.send({
                    user: {
                        data: {
                            id: admin.id,
                            displayName: admin.userid,
                            email: admin.email,
                        },
                        role: 'admin',
                    },
                    access_token: updatedAccessToken,
                });
            })
            .catch((err) => {
                res.send({ message: err.message });
            });
    } catch (e) {
        const error = 'Invalid access token detected';
        res.send({ message: error.message });
    }
};


//---------------------------------------------------------
//---------------------------------------------------------
exports.createTwo = (req, res) => {
    console.log('admin createTwo')
    console.log(req.body);

    const { displayName, passwordtxt, phoneno, email, status } = req.body.item;

    Admin.create({
        userid: displayName,
        password: bcrypt.hashSync(passwordtxt, 8),
        passwordtxt: passwordtxt,
        phoneno: phoneno,
        email: email,
        status: status,
    })
        .then((admin) => {
            // admin role = 1
            const newUser = {
                role: 'admin',
                data: {
                    displayName: admin.userid,
                    photoURL: 'assets/images/avatars/Abbott.jpg',
                    email: admin.email,
                    settings: {},
                    shortcuts: [],
                },
            };

            res.send({
                user: newUser,
                message: 'Admin registered successfully!',
            });
        })
        .catch((err) => {
            const error = {
                email: null,
                displayName: 'Enter display name',
                password: null,
            };
            res.send({ error });
        });
};

exports.findAndCountAll = (req, res) => {
    Admin.findAll()
        .then((items) => {
            res.send({ items });
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Some error occurred while retrieving ',
            });
        });
};
