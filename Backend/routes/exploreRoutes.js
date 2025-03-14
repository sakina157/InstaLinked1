const express = require('express');
const { explorePage} = require('../controllers/exploreController');
const router = express.Router();

router.get('/explore-page',explorePage)

module.exports = router;