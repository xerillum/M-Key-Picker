/**
 * @OnlyCurrentDoc
 */

function calcScore(time, parTime, level){
 // var time = .5;
 // var parTime = 1.5;
 // var level = 10;
  if (level == 0){
    return 0;
  }
  var timeFactor = (parTime-time)/parTime/.4
  var scoreTable = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("ScoreTable").getValues();
  var baseScore = scoreTable[level-2][1];
  var score;
  if (timeFactor < -1){
    score = 0;
  } else if (-1 <= timeFactor < 0){
    score = baseScore + 15 * timeFactor;
  } else if (1 >= timeFactor >= 0){
    score = baseScore + 7.5 * timeFactor;
  } else if (timeFactor > 1){
    score = baseScore + 7.5;
  } 
  return score/1.5; //normalize
}

function sortScores(dungeon, affix, playerNum, date){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('RIO DATA');
  var calcSheet = ss.getSheetByName('Calc');

  //var playerNum = 5;
  //var dungeon = 'The Necrotic Wake';
  //var affix = 'Tyrannical';

  var dataImport = ss.getRangeByName("player" + playerNum + "ScoreImport").getValues();
  //Logger.log(dataImport);

  for(var i = 0; i < dataImport.length; i = i + 1){
    if(dataImport[i][0] == dungeon && dataImport[i][1] == affix){
      Logger.log(dataImport[i][2]);
      return dataImport[i][2];
    }   
  }
  return 0;
}


function pullScores() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('RIO DATA');
  sheet.clear();
  var realms = ss.getRangeByName("playerRealms").getValues();
  var names = ss.getRangeByName("playerNames").getValues();
  var region = ss.getRangeByName("toolRegion").getValues();
  var date = Utilities.formatDate(new Date(), "GMT+6", "dd/MM/yyyy")

  Logger.log(region);
  Logger.log(names);

  //var region = 'US';
  //var realm = 'lothar';
  //var name = 'illuminator';
  
 for(var j = 0; j < names.length; j=j+1){

 // make and parse API request for specified character 
  var apiURL = 'https://raider.io/api/v1/characters/profile?region=' + region + '&realm=' + realms[j] + '&name=' + names[j] + '&fields=mythic_plus_best_runs%2Cmythic_plus_alternate_runs';
  var response = UrlFetchApp.fetch(apiURL); //gets API endpoint
  var dataAll = JSON.parse(response.getContentText());
  var block = [];
  var header = [];

  //format import header labels
  header.push(names[j],realms[j], 'Score');
  block.push(header);

  // import up to 8 best runs from JSON
  for (var i = 0; i < dataAll.mythic_plus_best_runs.length; i = i+1){
    var row = [dataAll.mythic_plus_best_runs[i].dungeon, dataAll.mythic_plus_best_runs[i].affixes[0].name, dataAll.mythic_plus_best_runs[i].score]
    block.push(row);
  }

  // import up to 8 alternate runs from JSON
  for (var i = 0; i< dataAll.mythic_plus_alternate_runs.length; i=i+1){
    var row = [dataAll.mythic_plus_alternate_runs[i].dungeon, dataAll.mythic_plus_alternate_runs[i].affixes[0].name, dataAll.mythic_plus_alternate_runs[i].score]
    block.push(row);
  }
  
  // write data import to spreadsheet
  var lastCol = sheet.getLastColumn();
  sheet.getRange(1,lastCol + 1, block.length, 3).setValues(block);
  
 } 
 sheet.getRange(30,1).setValue(date);
 //this is only needed to kick the Sort function on, bypassing function caching
}
