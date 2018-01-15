var path = require('path');
var express = require('express');
var handlebars = require('handlebars');
var exphbs = require('express-handlebars');
var app = express();
var port = process.env.PORT || 5000;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

function sortAlignment(array){
	for(var i = 0; i < array.length; i++){
		for(var j = 0; j < array.length - i - 1; j++){
			if(array[j].alignment == 'DS' && array[j + 1].alignment == 'LS'){
				var temp = array[j];
				array[j] = array[j + 1];
				array[j + 1] = temp;
			}
		}
	}
	return array;
}

function parseCharNameURL(name){
	name = name.replace(' - ', ' ');
	name = name.replace('-', ' ');
	name = toTitleCase(name);
	return name;
}

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

handlebars.registerHelper('modThree', function(index, object){
	if(index % 3 === 0 && index != 0) return object.fn(this);
	else return object.inverse(this);
});

handlebars.registerHelper('ifEquals', function(a, b, options){
	if(a === b){
		return options.fn(this);
	}
	return options.inverse(this);
});

handlebars.registerHelper('parseToLink', function(name){
	if(name.indexOf(' - ' == -1)){	// all characters except Clone Sergeant - Phase I
		name = name.replace('\'', '');	// URORORURORUROROURUROR
		name = name.replace(/\"/g, '');	// Garazeb "Zeb" Orrelios -> Garazeb Zeb Orrelios
		name = name.replace('(', '');	
		name = name.replace(')', '');	// Rey (Jedi Training) -> Rey Jedi Training
	}

	if(name.indexOf(' - ' != -1)){	// for Clone Sergeant - Phase I
		name = name.replace(' - ', '-');	// Clone Sergeant - Phase I -> Clone Sergeant-Phase I
	}

	name = name.replace(/ /g, '-');	// Rey Jedi Training -> Rey-Jedi-Training
	name = name.toLowerCase();

	return name;
});


var characterData = require('./data/characters.json');
var characterDataUnmodified = [];
for(var i = 0; i < characterData.length; i++){
	var newChar = {
		name: characterData[i].name,
		rank: characterData[i].rank,
		faction: characterData[i].faction,
		alignment: characterData[i].alignment,
		pic: characterData[i].pic,
		video: characterData[i].video,
		description: characterData[i].description,
		CubsJuly17: characterData[i].CubsJuly17,
		CubsAugust17: characterData[i].CubsAugust17,
		CubsSeptember17: characterData[i].CubsSeptember17,
		CubsOctober17: characterData[i].CubsOctober17,
		CubsNovember17: characterData[i].CubsNovember17,
		CubsDecember17: characterData[i].CubsDecember17
	}
	newChar.faction = newChar.faction.split(',');
	characterDataUnmodified.push(newChar);
}

var gmList = [], masterList = [], knightList = [], padawanList = [], younglingList = [];
for(var i = 0; i < characterData.length; i++){
	if(characterData[i].rank == 'Grand Master') 
		characterData[i].rank = 'grand-master';
	else if(characterData[i].rank != 'Grand Master') 
		characterData[i].rank = characterData[i].rank.charAt(0).toLowerCase() + characterData[i].rank.slice(1);

	characterData[i].faction = characterData[i].faction.split(',');

	for(var j = 0; j < characterData[i].faction.length; j++){
	    switch(characterData[i].faction[j]){
	      case 'Bounty Hunter': characterData[i].faction[j] = 'bounty-hunter'; break;
	      case 'Clone Trooper': characterData[i].faction[j] = 'clone-trooper'; break;
	      case 'First Order': characterData[i].faction[j] = 'first-order'; break;
	      case 'Galactic Republic': characterData[i].faction[j] = 'galactic-republic'; break;
	      case 'Imperial Trooper': characterData[i].faction[j] = 'imperial-trooper'; break;
	      default: characterData[i].faction[j] = characterData[i].faction[j].charAt(0).toLowerCase() + characterData[i].faction[j].slice(1); break;
		}
		}

	switch(characterData[i].rank){
		case 'grand-master':
			gmList.push(characterData[i]);
			break;
		case 'master':
			masterList.push(characterData[i]);
			break;
		case 'knight':
			knightList.push(characterData[i]);
			break;
		case 'padawan':
			padawanList.push(characterData[i]);
			break;
		case 'youngling':
			younglingList.push(characterData[i]);
			break;
		default:
			break;
	}
}

app.get('/characters/:characterName', function(req, res, next){
	var characterName = req.params.characterName;
	var charIndex = characterData.findIndex(function(data){
		// console.log(data.name, characterName, data.name == characterName);
		return data.name == characterName;
	});

	if(charIndex != -1){
		res.status(200).render('characterPage', characterDataUnmodified[charIndex]);
	}
	else{
		next();
	}
});

app.get('/', function(req, res){
	res.status(200).render('charRankingTable', {
		gmList: sortAlignment(gmList), 
		masterList: sortAlignment(masterList), 
		knightList: sortAlignment(knightList), 
		padawanList: sortAlignment(padawanList), 
		younglingList: sortAlignment(younglingList)
	});
});

app.use(express.static('public'));

app.get('*', function(req, res){
	res.status(404).render('404');
});

app.listen(port, function(){
	console.log("== Server is listening on port", port);
});

/*
app.get('/:characters', function(req, res){
	res.status(200).render('characterList');
});*/