M.AutoInit();

$(document).ready(function () {
  $('.collapsible').collapsible();
});

//console.log(utellyAPI);

var url = "https://utelly-tv-shows-and-movies-availability-v1.p.mashape.com/lookup?";
var tmdbUrl = "https://api.themoviedb.org/3/search/";
//country=us&term=breaking+bad

var $basic = $("#basic");
var $basicSearch = $("#basicSearch");
var $options = $("#options");

$basic.on("submit", function (e) {
  e.preventDefault();

  $options.empty();

  var val = $basicSearch.val().trim();
  $basicSearch.val("");
  if (val === ""){
    return;
  }

  /*var selectedVal = "";
var selected = $("#radioDiv input[type='radio']:checked");
if (selected.length > 0) {
    selectedVal = selected.val();
}*/

//var selected = $(".tvMovieBasic input[type='radio']:checked");

var movie = $("[id='movieRadioBasic']:checked").val();
var tv = $("[id='tvRadioBasic']:checked").val();

var type;

if(movie === "on"){
  type = "movie";
}
else if(tv === "on"){
  type = "tv";
}

  var originalVal = val;

  val = val.replace(/ /g, "+");

  var searchURL = url + "country=us&term=" + val;

  $.ajax({
    url: searchURL,
    headers: { "X-Mashape-Key": utellyAPI },
    method: "GET"
  })
    //on response
    .then(function (res) {
      console.log(res.results);

      var length = res.results.length;

      if(length === 0){
        $options.text("NO RESULTS FOUND FOR " + originalVal);
        return;
      }

      if(length > 3){
        length = 3;
      }

      for(var i = 0; i < length; i++){
        var resultStr = "<div class='row'><div class='col s6'><ul class='collapsible'><li><div class='collapsible-header'>";
        var title = res.results[i].name;
        resultStr += title + "</div><div data-title='" + title + "' class='collapsible-body white'>";
           
        res.results[i].locations.forEach(function(el){
          var resultUrl = el.url;
          var resultName = el.display_name;

          if(resultName === "Netflix"){
            resultUrl = resultUrl.replace(/nflx/, "https");
          }
          resultStr += "<p><a href='" + resultUrl + "' target='_blank'>" + resultName + "</a></p>";
        });
        resultsStr = "</li></ul></div></div>";
        $options.append(resultStr);

        toTMDB(type, title);
      }

      $('.collapsible').collapsible();
    });
});

  //https://api.themoviedb.org/3/search/movie?api_key=a012a678bc4826e1cef39e62f3e9f471&query=matrix
  function toTMDB(type, title) {
    var searchURL = tmdbUrl + type + "?api_key=" + tmdbAPI + "&query=" + title;

    console.log(searchURL);

    $.ajax({
      url: searchURL,
      method: "GET"
    })
      //on response
      .then(function (res) {
        if(res.results.length === 0){
          return;
        }

        var voteAverage = res.results[0].vote_average;

        $( "div[data-title='" + title + "']" ).append("Voter average: " + voteAverage + "/10");

        console.log(title, res.results[0].vote_average);
      });
  }
