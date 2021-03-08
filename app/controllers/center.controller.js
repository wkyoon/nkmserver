const crypto = require('crypto');
const db = require('../models');
const Centers = db.center;
const Op = db.Sequelize.Op;
var dateFormat = require('dateformat');

/**--------------------------------- */
/**-----------            ---------- */
/**--------------------------------- */
const defaultSize = 10;
const getPagination = (page, size) => {
    const limit = size ? +size : defaultSize;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: items } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, items, totalPages, currentPage };
};

/**--------------------------------- */
/**-----------   CREATE   ---------- */
/**--------------------------------- */
exports.create = (req, res) => {
    console.log('center create : ', req.body);

    const { name, manager, phoneno } = req.body.item;
    // console.log(item)
    Centers.create({ name: name, manager: manager, phoneno: phoneno })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while creating the Tutorial.',
            });
        });
};

/**--------------------------------- */
/**-----------   UPDATE   ---------- */
/**--------------------------------- */
exports.update = (req, res) => {
    //console.log(req.body.item)
    const { id, manager, phoneno } = req.body.item;

    Centers.update(
        { manager: manager, phoneno: phoneno },
        {
            where: { id: id },
        }
    )
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: 'Tutorial was updated successfully.',
                });
            } else {
                res.send({
                    message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error updating Tutorial with id=' + id,
            });
        });
};

/**--------------------------------- */
/**-----------   DELELTE   ---------- */
/**--------------------------------- */
exports.delete = (req, res) => {
    //const id = req.params.id;  // get
    console.log(req.body);
    const { id } = req.body; // post

    Centers.destroy({
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: 'Tutorial was deleted successfully!',
                });
            } else {
                res.send({
                    message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Could not delete Tutorial with id=' + id,
            });
        });
};

/**--------------------------------- */
/**-----------   SELECT   ---------- */
/**--------------------------------- */
exports.findOne = (req, res) => {
    const id = req.params.id;

    Centers.findByPk(id)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error retrieving Tutorial with id=' + id,
            });
        });
};

exports.findAndCountAll = (req, res) => {
    console.log('center list');
    Centers.findAll()
        .then((items) => {
            res.send({ items });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while retrieving tutorials.',
            });
        });
};
/*
not use this function 
exports.findAll = (req, res) => {
  //const { page, size, username } = req.query;  
  const { page, size, username } = req.query;
  var condition = username ? { username: { [Op.like]: `%${username}%` } } : null;

  const { limit, offset } = getPagination(page, size);

  Accountsnp.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};
*/
