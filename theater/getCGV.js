var qs = require('qs')
var axios = require('axios');
var DomParser = require('dom-parser');
var getCGV = async ({app,theaterCd,RegionCode,date,geo,cinemaName})=>{
    console.log('getCGV');
    var database = app.get('database');
    var now = parseInt(Date.now())+(date*86400000);
    var d = new Date(now);
    var dy=d.getFullYear();
    var dm=d.getMonth()+1;
    var dd=d.getDate();
    if(dm<10){
        dm='0'+dm;
    }
    if(dd<10){
        dd='0'+dd;
    }
    var playYMD=`${dy}${dm}${dd}`;
    try{
        var schedule_Data= await axios.post(`http://m.cgv.co.kr/Schedule/cont/ajaxMovieSchedule.aspx`, qs.stringify({'theaterCd': theaterCd,'playYMD':playYMD }));
    }catch(e){
        console.log(e);
        return;
    }
    var parser = new DomParser();
    var dom = parser.parseFromString(schedule_Data.data);
    var Btn_lightGrey=dom.getElementsByClassName("Btn_lightGrey");
    var Btn_lightGrey_leng=Btn_lightGrey.length;
    var output ={};
    output.schedule=[];
    var regex = /^[A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣+]*$/;
    for(var i=0;i<Btn_lightGrey_leng;i++){
        var schedule_temp=Btn_lightGrey[i].getAttribute("href").split("'");
        output.schedule.push({
            name:schedule_temp[1],
            place:schedule_temp[3],
            start:schedule_temp[5],
            end:schedule_temp[33],
            size:schedule_temp[9],
            remain:schedule_temp[7],
            vr:schedule_temp[35],
            age:parseInt(schedule_temp[37]),
            time:schedule_temp[39],
            movie:schedule_temp[11],
            screen:schedule_temp[27]
        });
    }
    var movieList=[];
    var movieScreen=[];
    var Screen=[];
    await output.schedule.map(em=>{
        var str_result=''
        for(var i=0;i<em.name.length;i++){
            if( regex.test(em.name[i]) ) {
                str_result+=em.name[i];
            }
        }
        var movieIndex=movieList.indexOf(str_result);
        if(movieIndex==-1){
            movieList.push(str_result);
        }
        if(em.screen!='일반'&&em.screen!=undefined){
            var screenIndex=movieScreen.indexOf(str_result+'*'+em.screen);
            if(screenIndex==-1){
                movieScreen.push(str_result+'*'+em.screen);
            }
            var screenIndex2=Screen.indexOf(em.screen);
            if(screenIndex2==-1){
                Screen.push(em.screen);
            }
        }
        
    });
    output.movieList=movieList;
    output.movieScreen=movieScreen;
    output.screen=Screen;
    output.name=cinemaName;
    output.type='CGV';
    var findNumber=0;
    try{
        let find=await database.TheaterModel.find({cinemaCode:theaterCd,type:'CGV',day:playYMD});
        findNumber=find.length;
        console.log('findNumber'+findNumber);
    }catch(e){
        console.log(e);
        return;
    }
    if(findNumber>0){
        console.log(findNumber);
        try{
            await database.TheaterModel.update({cinemaCode:theaterCd,type:'CGV',day:playYMD},{
                schedule:output.schedule,
                movieList:output.movieList,
                movieScreen:output.movieScreen,
                screen:output.screen,
            });
            console.log('CGV update success');
            return output;
        }catch(e){
            console.log(e);
            return;
        }
    }else{
        console.log(findNumber);
        try{
            var Theater = new database.TheaterModel({
                cinemaCode:theaterCd,
                type:'CGV',
                day:playYMD,
                name:cinemaName,
                schedule:output.schedule,
                movieList:output.movieList,
                movieScreen:output.movieScreen,
                screen:output.screen,
                geometry:{type:'Point',coordinates:[geo[1],geo[0]]}
            });
            try{
                await Theater.save();
                console.log('CGV save success');
                return output;
            }catch(e){
                console.log(e);
                return;
            }   
        }catch(e){
            console.log(e);
            return;
        }
    }
}
module.exports = getCGV;
