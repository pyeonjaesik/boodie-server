var Schema = {};

Schema.createSchema = function(mongoose){
    var TheaterSchema = mongoose.Schema({
        cinemaCode:{type: String, required:true,'default':''},
        day:{type:Number,'default':0},  
        type:{type: String,'default':''},
        name:{type: String, required:true,'default':''},
        schedule:[],
        movieList:[],
        movieScreen:[],
        screen:[],
        geometry:{
            'type':{type: String, 'default':'Point'},
            coordinates :[{type: "Number"}]
        },
    });
    TheaterSchema.index({geometry:'2dsphere'});
	TheaterSchema.static('findNear', function({long, lat, maxDistance,limit,day,callback}) {
		this.find({day}).where('geometry').near({center:{type:'Point', coordinates:[parseFloat(long), parseFloat(lat)]}, maxDistance}).limit(limit).exec(callback);
    });
    TheaterSchema.static('findSpecial', function({long, lat, maxDistance,limit,day,movieScreen,movieList,callback}) {
		this.find({ day, $or: [ { movieList:{ $in: movieList } }, { movieScreen:{ $in: movieScreen } } ] }).where('geometry').near({center:{type:'Point', coordinates:[parseFloat(long), parseFloat(lat)]}, maxDistance}).limit(limit).exec(callback);
	});
    return TheaterSchema;
};

module.exports = Schema;