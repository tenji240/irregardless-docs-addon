Shared = {
  HOST: "http://irregardless.ly",
  MATCH_ENDPOINT: this.HOST + "/rules/match",
  GUIDES_ENDPOINT: this.HOST + "/collections",
  //returns [tips]
  apiResponseToTips: function(resp){
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
  },
  prepareSnippet: function(fullText, tip){
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

      return snippet.replace(match, "<span class=\"igc-match-content\">" + match +"</span>");
    }
};