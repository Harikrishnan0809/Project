const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
let db = null;

const filepath = path.join(__dirname, "moviesData.db");
app.use(express.json());
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: filepath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The DB running at http//localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error :${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//Get all the movies
app.get("/movies/", async (request, response) => {
  const moviesQuery = `
    SELECT movie_name AS movieName
    FROM movie
    ORDER BY movie_id;`;

  const allMovies = await db.all(moviesQuery);
  response.send(allMovies);
});

//Post all movie names
app.post("/movies/", async (request, response) => {
  const requestDetails = request.body;
  const { directorId, movieName, leadActor } = requestDetails;
  const postQuery = `
    INSERT INTO 
      movie (director_id, movie_name, lead_actor)
    VALUES('${directorId}','${movieName}','${leadActor}');
    `;
  const insertDetails = await db.run(postQuery);
  response.send("Movie Successfully Added");
});

//Get a movie details
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
    SELECT
      DISTINCT movie_id AS movieId, director_id AS directorId, movie_name AS movieName, lead_actor AS leadActor
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;

  const getMovie = await db.get(getMovieQuery);
  response.send(getMovie);
});

//Update the movie table based on the movie id
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateQuery = `
    UPDATE movie
    SET 
      director_id='${directorId}',
      movie_name='${movieName}',
      lead_actor='${leadActor}' 
    WHERE 
      movie_id = ${movieId};`;

  await db.run(updateQuery);
  response.send("Movie Details Updated");
  console.log("hello hari");
});

//Delete movie details
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM 
      movie
    WHERE movie_id = ${movieId};`;

  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//Get directors details
app.get("/directors/", async (request, response) => {
  const directorsQuery = `
    SELECT director_id AS directorId, director_name AS directorName
    FROM director
    ORDER BY director_id;`;

  const directors = await db.all(directorsQuery);
  response.send(directors);
});

//Get directors using moviesId
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  console.log(directorId);
  const directorAndMovieQuery = `
    SELECT movie.movie_name AS movieName 
    FROM movie INNER JOIN director ON movie.director_id = director.director_id
    WHERE movie.director_id = ${directorId};`;

  const result = await db.all(directorAndMovieQuery);
  response.send(result);
});

module.exports = app;
