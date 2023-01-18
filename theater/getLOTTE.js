const fetch = require('node-fetch');
const FormData = require('form-data');

var getLOTTE = async ({app,divisionCode,detailDivisionCode,cinemaID,date,geo,cinemaName})=>{
    console.log('getLOTTE');
    var database = app.get('database');
    var now = parseInt(Date.now())+(date*86400000);
    // var theaterDay= parseInt(now/86400000);
    var d = new Date(now);
    var dy=d.getFullYear();
    var dm=d.getMonth()+1;
    var dd=d.getDate();
    var output={};
    output.schedule=[];
    if(dm<10){
        dm='0'+dm;
    }
    if(dd<10){
        dd='0'+dd;
    }
    var final_cinemaID = `${divisionCode}|${detailDivisionCode}|${cinemaID}`;
    var playDate=`${dy}-${dm}-${dd}`;
    var theaterDay=`${dy}${dm}${dd}`;
    let formData = new FormData();
    var zzz={"MethodName":"GetPlaySequence","channelType":"HO","osType":"Chrome","osVersion":"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Mobile Safari/537.36","playDate":playDate,"cinemaID":final_cinemaID,"representationMovieCode":""}
    var fff=JSON.stringify(zzz);
    formData.append('paramList',fff);
    
    const options = {
      method: 'POST',
      body: formData
    };
    await fetch(`http://www.lottecinema.co.kr/LCWS/Ticketing/TicketingData.aspx`, options)
    .then((response) => response.json())
    .then(async (responseJson) => {
        let schedule_temp=responseJson.PlaySeqs.Items;
        await schedule_temp.map(em=>{
            output.schedule.push({
                name:em.MovieNameKR,
                place:em.ScreenNameKR,
                start:em.StartTime,
                end:em.EndTime,
                size:em.TotalSeatCount,
                remain:em.BookingSeatCount,
                vr:em.FilmNameKR,
                age:em.ViewGradeCode,
                movie:em.MovieCode,
                time:em.SequenceNoGroupNameKR,
                screen:em.ScreenDivisionNameKR
            })
        });
    })
    .catch((error) => {
      console.error(error);
      return;
    });
    var regex = /^[A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣+]*$/;
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
        if(em.screen!='일반'&&em.screen!=''&&em.screen!=undefined){
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
    output.type='LOTTE';
    var findNumber=0;
    try{
        let find=await database.TheaterModel.find({cinemaCode:final_cinemaID,type:'LOTTE',day:theaterDay});
        findNumber=find.length;
        console.log('findNumber'+findNumber);
    }catch(e){
        console.log(e);
        return;
    }
    if(findNumber>0){
        console.log(findNumber);
        try{
            await database.TheaterModel.update({cinemaCode:final_cinemaID,type:'LOTTE',day:theaterDay},{
                schedule:output.schedule,
                movieList:output.movieList,
                movieScreen:output.movieScreen,
                screen:output.screen,
            });
            console.log('LOTTE update success');
            return output;
        }catch(e){
            console.log(e);
            return;
        }
    }else{
        console.log(findNumber);
        try{
            var Theater = new database.TheaterModel({
                cinemaCode:final_cinemaID,
                type:'LOTTE',
                day:theaterDay,
                name:cinemaName,
                schedule:output.schedule,
                movieList:output.movieList,
                movieScreen:output.movieScreen,
                screen:output.screen,
                geometry:{type:'Point',coordinates:[geo[1],geo[0]]}
            });
            try{
                await Theater.save();
                console.log('LOTTE save success');
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
//ScreenDivisionNameKR
module.exports = getLOTTE;
