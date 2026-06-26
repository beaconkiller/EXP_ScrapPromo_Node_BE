var express = require('express');
const router = express.Router();
const cont_data = require('../controllers/cont_data');



router.route('/get_data')
    .post(cont_data.get_data);


module.exports = router;