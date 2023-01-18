var Schema = {};

Schema.createSchema = function(mongoose){
    var DetailSchema = mongoose.Schema({
        day:{type:Number,'default':0},
        screen:[],
        movieScreen:{},
        movieList:[]
    });
    return DetailSchema;
};

module.exports = Schema;