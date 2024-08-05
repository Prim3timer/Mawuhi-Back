// const express = require('express');
// const router = express.Router();
// const usersController = require('../../controllers/usersController');    

// const getAllUsers = require(usersController.getAllUsers)
// const verifyRoles = require('../../middleware/verifyRoles');
// const ROLES_LIST = require('../../config/roles_list');


// router.route('/')
// .get(verifyRoles(ROLES_LIST.Admin), getAllUsers)

// module.exports = router

// module.exports = router;

const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUsers)
    .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);

// router.route('/:id')
//     .get(verifyRoles(ROLES_LIST.Admin), usersController.getUser);

module.exports = router;