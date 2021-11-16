const router = require('express').Router();
const movieRoutes = require('./movieRoutes');

router.use('/movies', movieRoutes);

module.exports = router;
