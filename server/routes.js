'use strict';

let giphy = require('giphy-api')();
let express = require('express');
let router = express.Router();

router.get('/test', (req, res) => {
    return res.send('Test route');
});

module.exports = router;
