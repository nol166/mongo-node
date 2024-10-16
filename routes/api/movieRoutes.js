const router = require('express').Router();
const { client } = require('../../db/connection');

const movies = client.db('sample_mflix').collection('movies');

// Find all movies from mongodb, optionally paginated
// Limits results to 10 per page
router.get('/:page?', (req, res) => {
  let pageNumber = req.params.page || 1;
  movies
    .find({})
    .limit(10)
    .skip(pageNumber * 20)
    .toArray((err, results) =>
      err ? res.status(500).send(err) : res.status(200).send(results)
    );
});

// Get all movies or a single movie if an id is provided
router.get('/:id?', (req, res) => {
  let id = new require('mongodb').ObjectID(req.params.id);
  if (id) {
    const movie = movies.findOne({ _id: id });
    movie
      .then((result) => {
        console.log(result);
        return res.status(200).send(result);
      })
      .catch((err) => res.status(500).send(err));
  } else {
    const movies = movies.find({});
    movies
      .then((result) => res.status(200).send(result))
      .catch((err) => res.status(500).send(err));
  }
});

// find movies by year
router.get('/year/:year', (req, res) => {
  let { year } = req.params;
  year = parseInt(year);
  movies
    ? movies
        .find({ year })
        .limit(10)
        .toArray((err, results) =>
          err ? res.status(500).send(err) : res.status(200).send(results)
        )
    : res.status(400).send('Invalid year');
});

// Create a new movie
router.post('/', (req, res) => {
  const newMovie = req.body;
  movies.insertOne(newMovie, (err, result) =>
    err ? res.status(500).send(err) : res.status(200).send(result)
  );
});

// Update a specific movie
router.put('/:id', (req, res) => {
  const id = new require('mongodb').ObjectID(req.params.id);
  let updatedMovie = req.body;
  movies.updateOne({ _id: id }, updatedMovie, (err, result) =>
    err ? res.status(500).send(err) : res.status(200).send(result)
  );
});

// Update several movies at once
router.put('/', (req, res) => {
  let updatedMovies = req.body;
  movies.updateMany(updatedMovies, (err, result) =>
    err ? res.status(500).send(err) : res.status(200).send(result)
  );
});

// Delete a specific movie with an id
router.delete('/:id', (req, res) => {
  const id = new require('mongodb').ObjectID(req.params.id);
  movies.deleteOne({ _id: id }, (err, result) =>
    err ? res.status(500).send(err) : res.status(200).send(result)
  );
});

// Route that will accept an aggregation query as the body and return the results sorted by box office
router.get('/best/:page', (req, res) => {
  const page = parseInt(req.params.page, 10) || 1;
  
  const skipAmount = (page - 1) * 20;

  const pipeline = [
    {
      $match: {
        'imdb.rating': { $gte: 7, $lte: 10 },
        'awards.wins': { $gte: 4 },
        rated: { $nin: ['G', 'PG'] },
        year: { $gte: new Date().getFullYear() - 10 },
        boxOffice: { $ne: parseFloat(100) },
      },
    },
    {
      $group: {
        _id: '$title', // Group by title
        title: { $first: '$title' },
        year: { $first: '$year' },
        rated: { $first: '$rated' },
        poster: { $first: '$poster' },
        fullplot: { $first: '$fullplot' },
        boxOffice: { $first: '$boxOffice' },
        imdb: { $first: '$imdb' },
        metacritic: { $first: '$metacritic' },
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
      $skip: page === 1 ? 0 : skipAmount,
    },
    {
      $limit: 20,
    },
  ];

  // run the aggregation pipeline
  let movie_results = movies.aggregate(pipeline).toArray();
  if (movie_results) {
    movie_results
      .then((result) => res.status(200).send(result))
      .catch((err) => res.status.send(err));
  }
});

module.exports = router;
