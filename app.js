'use strict';

const { sequelize, models } = require('./db');

// Get references to our models.
const { Person, Movie } = models;

// Define variables for the people and movies.
// NOTE: We'll use these variables to assist with the creation
// of our related data after we've defined the relationships
// (or associations) between our models.
let georgeLucas;
let markHamill;
let carrieFisher;
let harrisonFord;
let frankOz;
let starWars;
let returnOfTheJedi;

console.log('Testing the connection to the database...');

(async () => {
  try {
    // Test the connection to the database
    console.log('Connection to the database successful!');
    await sequelize.authenticate();

    // Sync the models
    console.log('Synchronizing the models with the database...');
    await sequelize.sync({ force: true });

    // Add People to the Database
    console.log('Adding people to the database...');
    const peopleInstances = await Promise.all([
      Person.create({
        firstName: 'George',
        lastName: 'Lucas',
      }),
      Person.create({
        firstName: 'Mark',
        lastName: 'Hamill',
      }),
      Person.create({
        firstName: 'Carrie',
        lastName: 'Fisher',
      }),
      Person.create({
        firstName: 'Harrison',
        lastName: 'Ford',
      }),
      Person.create({
        firstName: 'Frank',
        lastName: 'Oz',
      }),
    ]);
    console.log(JSON.stringify(peopleInstances, null, 2));

    // Update the global variables for the people instances
    [georgeLucas, markHamill, carrieFisher, harrisonFord, frankOz] = peopleInstances;

    // Add Movies to the Database
    console.log('Adding movies to the database...');
    const movieInstances = await Promise.all([ 
      Movie.create({
        title: 'Star Wars',
        releaseYear: 1977,
        directorPersonId: georgeLucas.id,
      }),
      Movie.create({
        title: 'Return of the Jedi',
        releaseYear: 1982,
        directorPersonId: georgeLucas.id,
      }),
    ]);
    console.log(JSON.stringify(movieInstances, null, 2));
    // Update the global variables for the movie instances
    [starWars, returnOfTheJedi] = movieInstances;

    // associate actors with movies
    await markHamill.setActor([starWars, returnOfTheJedi]);

    // associate movies with actors
    await starWars.addActors([carrieFisher, harrisonFord, frankOz]);

    // Retrieve movies
    const movies = await Movie.findAll({
      include: [
        {
          model: Person,
          as: 'director',
        },
        {
          model: Person,
          as: 'actors',
          through: 'ActorMovies',
        }
      ],
    });
    console.log(movies.map(movie => movie.get()));

    // Retrieve people
    const people = await Person.findAll({
      include: [
        {
          model: Movie,
          as: 'director',
        },
        {
          model: Movie,
          as: 'actor',
          through: 'ActorMovies',
        },
      ],
      raw: true,
      nest: true,
    });
    console.log(people.map(person => console.log(person)));

    process.exit();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      console.error('Validation errors: ', errors);
    } else {
      throw error;
    }
  }
})();
