var request = require("request");
var cheerio = require("cheerio");

var fs = require("fs");

var mainUrl = "http://walkarounds.scalemodels.ru";
var folder;


var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

grabpic = function(urlString) {
	request({
	url: urlString,
	method: "GET"
	}, function(error, response, body) {
		if (error || !body) {
			return;
		}
		
		var $ = cheerio.load(body);
		var selector =$('div[id="fotocontext"]').find('img'); //Get a place in the matched elements by selector filtering offspring
		var picUrl =selector.attr('src');
		    //console.log(picUrl);
		if (typeof(picUrl)!= "undefined"){
			//var fileName =$('h2').text();
			var fileName = selector.attr('alt');
			if(typeof(fileName)!= "undefined"){
			   if(!fileName.endsWith(".jpg")){
				   fileName = fileName+".jpg";}
			}
			else{
				console.log(picUrl+" no file name");
				return;
			}
			download(mainUrl+picUrl,folder+"/"+fileName,function(){console.log(fileName+' is done');});
			
		}
		else{
			console.log(urlString+" picUrl undefined");
			grabpic(urlString);
		}
		
						
	});
}

var graballpicPage = function(urlString) {
	request({
	url: urlString,
	method: "GET"
	}, function(error, response, body) {
		if (error || !body) {
			return;
		}
		var $ = cheerio.load(body);
		selector = $('td[class="giItemCell"]').children('div').children('a:not([class])');
		var picPageArray = new Array();
		for (var i =0; i<selector.length;i++){
		 picPageArray.push(mainUrl+selector.eq(i).attr('href'));}
		
		for (var i =0; i<picPageArray.length; i++){
			//console.log(picPageArray[i]);
			grabpic(picPageArray[i]);
			
		}
	});
};

var ruGrab = function(urlString) {
	request({
	url: urlString,
	method: "GET"
	}, function(error, response, body) {
		if (error || !body) {
			return;
		}

		//console.log(body);
		var $ = cheerio.load(body);
		
		folder = $('title').text().replace(/[;<>:"/\?*|]/g,""); 
		fs.mkdir(folder,function(err){
			});
		
		var mainpages =$('div[class="block-core-Pager"]').children('span').children('a');
		if (mainpages == 0){
			
			graballpicPage(urlString);		
		}
		else{
		var lastpageNumber = mainpages.eq(mainpages.length-1).text();
		//console.log(lastpageNumber);
		var mainpageAddr = mainpages.eq(0).attr('href');
		var mainpageAddr = mainUrl+mainpageAddr.substring(0,mainpageAddr.length-1);
					
		for (var i =1; i<=lastpageNumber; i++){
			graballpicPage(mainpageAddr+i);} 
		
		}
				
	});
};

ruGrab("http://walkarounds.scalemodels.ru/v/walkarounds/afv/after_1950/t-90sm/?g2_page=1");

//for old version use below

/* var addr = "http://scalemodels.ru/modules/photo/galerie/w_mig17_hodynka_"
var folder ="mig-17"
var fileName = "mig-17_"
for (var i=2; i<80; i++){
download(addr+i+".jpg",folder+"/"+fileName+i+".jpg",function(){console.log(fileName+' is done');});
} */


//http://walkarounds.scalemodels.ru/v/walkarounds/afv/after_1950/Object_292/ //no orderd pic name

//http://walkarounds.scalemodels.ru/v/walkarounds/avia/after_1950/saab_viggen_lelystad/ // fotocontext does not have <a> as children

//http://walkarounds.scalemodels.ru/v/walkarounds/avia/after_1950/Viggen_ang/  /*todone handle "undefined"

//http://walkarounds.scalemodels.ru/v/walkarounds/avia/after_1950/lim-2/  /special case, one 1 page