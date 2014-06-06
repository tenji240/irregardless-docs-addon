var HOST = "http://irregardless.ly",
    MATCH_ENDPOINT = HOST + "/rules/match",
    GUIDES_ENDPOINT =  HOST + "/collections";

function apiResponseToTips(resp){
  //nest creator attributes inside the tips array
  var tips = resp.data,
      users = resp.refs.User,
      user,
      tip;
  for(var i=0; i < tips.length; i++){
    tip = tips[i];
    user = users[tip.creator_id];
    tip.creator_name = user.name;
    tip.creator_mugshot_url = user.mugshot_url;
  }
  return tips;
}

function prepareSnippet(fullText, tip){
  //match will either be in the tip's `match_string`,
  //or the tips `matched_string`
  var match, snippet, indexOfM;
  if(fullText.indexOf(tip.match_string) !== -1){
    match = tip.match_string;
  } else {
    match = tip.matched_string;
  }
  //if text is short, snippet is the text
  if(fullText.length < 100) {
    snippet = fullText;
  } else {
    indexOfM = fullText.indexOf(match);
    //match is in the first 50 characters
    if(indexOfM < 50){
      snippet = fullText.slice(0, 100) + "...";
    //match is in the last 50 characters
    } else if(fullText.length - indexOfM < 50) {
      snippet = "..." + fullText.slice(fullText.length - 100, fullText.length);
    //match is somewhere in the middle
    } else {
      snippet = "..." + fullText.slice(indexOfM - 40, indexOfM + 40) + "...";
    }
  }

  var ret = snippet.replace(match, "<span class=\"igc-match-content\">" + match +"</span>");
  Logger.log(ret);
  return ret
}

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar')
      .addToUi();
}

function onInstall(e) {
  onOpen(e);
}


function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('sidebar')
      .setTitle('Irregardless');
  DocumentApp.getUi().showSidebar(ui);
}

function getTips() {
  var text = DocumentApp.getActiveDocument().getBody().getText();
  if (text.length == 0) {

  } else {
    var params = {
      contentType: 'application/json',
      payload: JSON.stringify({body: text}),
      method: "post",
    };
    var response = UrlFetchApp.fetch(MATCH_ENDPOINT, params),
        json = response.getContentText(),
        tips = apiResponseToTips(JSON.parse(json));
    return {fullText: text, tips: tips};
  }
}

function getPreferences() {
  var userProperties = PropertiesService.getUserProperties();
  var languagePrefs = {
    originLang: userProperties.getProperty('originLang'),
    destLang: userProperties.getProperty('destLang')
  };
  return languagePrefs;
}

function runTranslation(origin, dest, savePrefs) {
  var text = getSelectedText();

}

