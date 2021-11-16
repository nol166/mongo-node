# MongoDB Aggregation Pipeline 


Work through the activity below by implementing the following user story:

* As a user, I want to filter a large collection of movies to only the best ones in the last 10 years so that I can make an easier decision about what to watch next.

## Requirements:

* It's done when I have completed the aggregation pipeline in [Unsolved](../Unsolved/routes/api/movieRoutes.js) according to the following stages:

  * Stage 1: Match movies that have a genre of Action or Comedy and were released in the last 10 years.

  * Stage 2: Exclude the `_id` field from the results. But include the `title`, `year`, `rated`, `poster`, `fullplot`, `imdb`, and `metacritic` fields

  * Stage 3: Sort the results by the `metacritic` score in descending order.

* It's done when I have run the application by navigating to `Unsolved` directory, installing the dependencies using `npm i`, and running the application with `npm start`

---

## ⚡ Hints

How can we use the [MongoDB documentation](https://docs.mongodb.com/manual/core/aggregation-pipeline/) to help us understand how to use aggregation operators available to us?


## 🥇 Bonus

If you have completed this activity, work through the following challenge with your partner to further your knowledge:

* How could we use the aggregation pipeline to create computed fields that don't exist in the original documents?