// creates a connection to mongoose
const mongoose = require("mongoose");
//creates a connection to mongo
const mongoURI = process.env.mongoURI;
// checks to make sure that the database is connected to
async function connectToDatabase() {
    try{
        await mongoose.connect(mongoURI, {});
        console.log("connected to database");
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
}

//This is the schema to submit for results
const resultGame = new mongoose.Schema({
    playerName: String,
    result: String, //win or lose
    cardLeft: Number,

})

//This creates a model for the results
const ResultGame = mongoose.model("ResultGame", resultGame);

//This function saves the game result to the database
async function saveGameResult(playerName, result, cardLeft) {
    const gameResult = new ResultGame({
        playerName,
        result, //win or lose
        cardLeft,
    });
    await gameResult.save();
}

//This functions get the game results for the player's name
async function getGameResultsName(playerName){
    return await ResultGame.find({playerName: playerName});
}

module.exports = {connectToDatabase, saveGameResult, getGameResultsName};