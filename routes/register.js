const express = require("express");
const bcrypt = require("bcrypt");
const registerRouter = express.Router();
const User = require("../db/models/Users.js");
const { checkNotAuthenticated } = require("./authentication-check.js");
const Profile = require("../db/models/Profiles.js");
const createHttpError = require("http-errors");

/*
Example:
   {
      "username": "avranas",
      "password": "p@ssw0rd",
      "starting_weight": 198.6,
      "goal_weight": 168.6
   }
*/
registerRouter.post("/", checkNotAuthenticated, async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const starting_weight = req.body.starting_weight;
    const goal_weight = req.body.goal_weight;
    if (!username) {
      throw createHttpError(400, "Missing data in body: 'username'");
    }
    if (!password) {
      throw createHttpError(400, "Missing in data body: 'password'");
    }
    if (!starting_weight) {
      throw createHttpError(400, "Missing in data body: 'starting_weight'");
    }
    if (!goal_weight) {
      throw createHttpError(400, "Missing in data body: 'goal_weight'");
    }
    //First check to see if a user with that name already exists
    const result = await User.findOne({
      where: { username: username },
    });
    if (result) {
      throw createHttpError(400, "A user with that name already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserResults = await User.create({
      username: username,
      password: hashedPassword,
    });
    //Create a profile for the new user
    await Profile.create({
      starting_weight: starting_weight,
      goal_weight: goal_weight,
      start_date: new Date(), //Does this actually work the way I want?
      max_chain: 0,
      user_id: newUserResults.id,
    });
    res.status(200).send(`Created new user: ${username}`);
  } catch (err) {
    next(err);
  }
});

module.exports = registerRouter;
