const router = require('express').Router();
const { client } = require('../../db/connection');

const movies = client.db('sample_mflix').collection('movies');

// Find all movies from mongodb
router.get('/:page?', (req, res) => {
  let pageNumber = req.params.page || 1;
  movies
    .find({})
    .limit(20)
    .skip(pageNumber * 20)
    .toArray((err, results) =>
      err ? res.status(500).send(err) : res.status(200).send(results)
    );
});

// Find all movies using the query parameter
router.get('/year/:year'),
  (req, res) => {
    const { year } = req.params;
    movies
      .find({ year: parseInt(year, 10) })
      .limit(20)
      .toArray((err, results) =>
        err ? res.status(500).send(err) : res.status(200).send(results)
      );
  };

// Route that will accept an aggregation query as the body and return the results sorted by box office
router.get('/best/:page', (req, res) => {
  const { page } = req.params;
  console.info('🚀 - file: movieRoutes.js - pageNumber', page);

  const pipeline = [
    {
      $match: {
        'imdb.rating': { $gte: 7, $lte: 10 },
        'awards.wins': { $gte: 10 },
        rated: { $nin: ['G', 'PG'] },
        genres: { $in: ['Action', 'Comedy'] },
        year: { $gte: new Date().getFullYear() - 10 },
        boxOffice: { $ne: parseFloat(100) },
      },
    },
    {
      $project: {
        _id: 0,
        title: 1,
        year: 1,
        rated: 1,
        poster: 1,
        fullplot: 1,
        boxOffice: 1,
        imdb: 1,
        metacritic: 1,
      },
    },
    {
      $sort: { metacritic: -1 },
    },
    {
      $skip: page * 20,
    },
    {
      $limit: 20,
    },
  ];

  movies
    .aggregate(pipeline)
    .toArray((err, results) =>
      err ? res.status(500).send(err) : res.status(200).send(results)
    );
});

module.exports = router;
