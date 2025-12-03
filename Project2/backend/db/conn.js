const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;

let _db;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

module.exports = {
    connectToServer: async function(callback){
        console.log("Attempting To Connect");
        
        try {

            await client.connect();
            
            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
            
            _db = client.db("myDatabase");
            console.log("Successfully connected to myDatabase");

            return callback(); 

        } catch (err) {
            console.error("MongoDB Connection Error:", err);
            return callback(err); 

        }
    },

    getDB: function(){
        return _db;
    }
}