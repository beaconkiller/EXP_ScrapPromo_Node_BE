const express = require("express");
const router = express.Router();
const r_data = require('./r_data')


router.use('/r_data', r_data);



module.exports = router;