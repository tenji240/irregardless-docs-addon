/***********************  Irregardless API Interface  **************************/
// This handles cors and all that BS
var Irregardless = new function() {

  var HOST = "https://api.irregardless.ly/api/v1",
    API_KEY = "3tkaamd9zazzwa27z4x6xmns",
    MATCH_ENDPOINT = HOST + "/rules/match?api_key=" + API_KEY,
    GUIDES_ENDPOINT = HOST + "/style_guides?recommended=true&api_key=" + API_KEY,
    GUIDES_QUERY_ENDPOINT = HOST + "/style_guides?api_key=" + API_KEY;

  this.fetchGuides = function(query) {
    var url;
    if (query) {
      url = GUIDES_QUERY_ENDPOINT + "&q=" + query;
    } else {
      url = GUIDES_ENDPOINT;
    }

    var response = UrlFetchApp.fetch(url),
        json = response.getContentText();

        return JSON.parse(json);
  }
  
  this.fetchTips = function(styleGuideId) {
    var text = DocumentApp.getActiveDocument().getBody().getText(),
        collectionId = styleGuideId;

    var params = {
      contentType: 'application/json',
      payload: JSON.stringify({body: text, style_guide_id: Number(collectionId)}),
      method: "post",
    };
    var response = UrlFetchApp.fetch(MATCH_ENDPOINT, params),
        json = response.getContentText();
    return { fullText: text,
            tips: JSON.parse(json)};
  }
};


/***********************  Main - Initialize the sidebar  **************************/
function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Get Tips', 'showSidebar')
      .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('sidebar')
      .setTitle('Irregardless.ly');
  DocumentApp.getUi().showSidebar(ui);
}


/***********************  Helper Functions  **************************/

var regexForString = function(string) {
  return new RegExp('(\\s|\\b)' + string + '(\\s|\\b)','gi');
};

function leadingWhiteSpaceCount(string) {
  for (var result = 0, characterCode = string.charCodeAt(0); 32 == characterCode || characterCode > 8 && characterCode < 14 && characterCode != 11 && characterCode != 12;) {
    characterCode = string.charCodeAt(++result);
  }
  return result;
}

var searchDoc = function(string, fn) {
  var element = null;
  var i = 0;
  var regex = regexForString(string);
  var search
  while(element = DocumentApp.getActiveDocument().getBody().findElement(DocumentApp.ElementType.TEXT, element)) {
    var textElement = element.getElement().asText();
    var text = textElement.getText();
    if (search = regex.exec(text)) {
      var trimmedChars = leadingWhiteSpaceCount(search[0]);
      search.index += trimmedChars;
      search[0] = search[0].substring(trimmedChars).trim();
      fn(i, search, textElement);
      // Only return first match
      return;
    }
    i++;
  }
};

/***********************  Interface Functions  **************************/
// (Do these need to be global???)


function getDocMatches(tip) {
  var searchMatches = [];
  searchDoc(tip.matched_string, function(textElementIndex, search, textElement) {
    Logger.log('----');
    Logger.log(textElement);
    Logger.log(search);
    
    searchMatches.push({
      textElementIndex: textElementIndex,
      startOffset: search.index,
      endOffset: search.index + search[0].length-1,
      textEl: textElement,
      ogBgColor: textElement.getBackgroundColor(search.index) || '#FFFFFF', // Returns null if not set. Stupid.
      text: tip.matched_string
    });
  });
  return searchMatches;
};

function highlight(tip, color) {
  var matches = getDocMatches(tip),
      match;

  color = color || '#FF0000';
  
  for(var i = 0; i < matches.length; i++) {
    match = matches[i];
    match.textEl.setBackgroundColor(match.startOffset, match.endOffset, color);
  }
  return matches;
};

function unHighlight(matches) {
  var textElement = null;
  var elements = [];
  while(textElement = DocumentApp.getActiveDocument().getBody().findElement(DocumentApp.ElementType.TEXT, textElement)) {
    elements.push(textElement);
  }
  for (var i = 0; i < matches.length; i++) {
    elements[matches[i].textElementIndex].getElement().asText().setBackgroundColor(matches[i].startOffset, matches[i].endOffset, matches[i].ogBgColor);
  }
};

function applyTip(tip, replace, match) {
  searchDoc(tip.matched_string, function(textElementIndex, search, textElement) {
//    textElement.setBackgroundColor(search.index, search.index + search[0].length+1, match.ogBgColor);
    textElement.deleteText(search.index, search.index + search[0].length-1);
    textElement.insertText(search.index, replace);
//    textElement.replaceText(regexForString(tip.matched_string), replace);
  });
  return true;
};

function fetchGuides(query) {
  return Irregardless.fetchGuides(query);
};

function fetchTips(guideId) {
  return Irregardless.fetchTips(guideId);
};

//highlights the tip matches in red, and reverts the red higlight on lastScrollTip
function scrollToTip(tip, lastScrollTip) {
  var matches = getDocMatches(tip),
      match = matches[0];
  if (lastScrollTip){
    highlight(lastScrollTip);
  }
  if(match){
    var position = DocumentApp.getActiveDocument().newPosition(match.textEl, 0);
    DocumentApp.getActiveDocument().setCursor(position);
    highlight(tip, '#f49898');
  }
};

