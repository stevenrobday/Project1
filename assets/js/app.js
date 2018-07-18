M.AutoInit();

$(document).ready(function () {
  $('.collapsible').collapsible();
  $('.modal').modal();
});

//console.log(utellyAPI);

var url = "https://utelly-tv-shows-and-movies-availability-v1.p.mashape.com/lookup?";
var tmdbUrlBasic = "https://api.themoviedb.org/3/search/";
var tmdbUrlPoster = "http://image.tmdb.org/t/p/w185/";
var tmdbPersonByName = "https://api.themoviedb.org/3/search/person";
var tmdbPersonByID = "https://api.themoviedb.org/3/person/";
var omdbUrl = "http://www.omdbapi.com/";
//country=us&term=breaking+bad

var $basic = $("#basic");
var $basicSearch = $("#basicSearch");
var $options = $("#options");
var $modalContent = $(".modal-content");

$basic.on("submit", function (e) {
  e.preventDefault();

  $options.empty();

  var val = $basicSearch.val().trim();
  $basicSearch.val("");
  if (val === "") {
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

  if (movie === "on") {
    type = "movie";
  }
  else if (tv === "on") {
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
      //console.log(res.results);

      var length = res.results.length;

      if (length === 0) {
        $options.text("NO RESULTS FOUND FOR " + originalVal);
        return;
      }

      if (length > 3) {
        length = 3;
      }

      for (var i = 0; i < length; i++) {
        var resultStr = "<div class='row'><div class='col s12'><ul class='collapsible'><li><div class='collapsible-header'>";
        var title = res.results[i].name;
        resultStr += title + "</div><div class='collapsible-body white'><div class='row'><div class='col s4' data-titlePoster='" + title + "'></div><div class='col s8' data-titleInfo='" + title + "'><p>";

        res.results[i].locations.forEach(function (el) {
          var resultUrl = el.url;
          var resultName = el.display_name;

          if (resultName === "Netflix") {
            resultUrl = resultUrl.replace(/nflx/, "https");
          }
          resultStr += "<span><a href='" + resultUrl + "' target='_blank'>" + resultName + "</a> </span>";
        });
        resultsStr = "</p></div></div></div></li></ul></div></div>";
        $options.append(resultStr);

        toOMDB(title);
        toTMDB(type, title);
      }

      $('.collapsible').collapsible();
    });
});

//https://api.themoviedb.org/3/search/movie?api_key=a012a678bc4826e1cef39e62f3e9f471&query=matrix
function toTMDB(type, title) {
  var searchURL = tmdbUrlBasic + type + "?api_key=" + tmdbAPI + "&query=" + title;

  $.ajax({
    url: searchURL,
    method: "GET"
  })
    //on response
    .then(function (res) {
      var $titleInfo = $("div[data-titleInfo='" + title + "']");

      if (res.results.length === 0) {
        $titleInfo.append("<p>No info returned from TMDB</p>");
        return;
      }


      var voteAverage = res.results[0].vote_average;
      var imgSrc = tmdbUrlPoster + res.results[0].poster_path;

      $titleInfo.append("<p>Voter average: " + voteAverage + "/10</p>");
      $titleInfo.append("<p>Plot: " + res.results[0].overview + "</p>");
      $("div[data-titlePoster='" + title + "']").append("<img src='" + imgSrc + "'>");
    });
}

function toOMDB(title) {
  var searchURL = omdbUrl + "?apikey=" + omdbAPI + "&t=" + title;
  $.ajax({
    url: searchURL,
    method: "GET"
  })
    //on response
    .then(function (res) {
      var $titleInfo = $("div[data-titleInfo='" + title + "']");
      var actors = res.Actors;
      if (actors !== "N/A") {
        actorsArray = actors.split(", ");

        var actorsStr = "<p>Actors: ";

        actorsArray.forEach(function (el, index, array) {
          actorsStr += "<span data-person='" + el + "'></span>";

          if (index !== array.length - 1) {
            actorsStr += ", ";
          }

          getPersonByName(el);
        });

        actorsStr += "</p>";

        $titleInfo.append(actorsStr);

      }
    });
}

function getPersonByName(person) {
  var personNameUrl = tmdbPersonByName + "?api_key=" + tmdbAPI + "&query=" + person;

  $.ajax({
    url: personNameUrl,
    method: "GET"
  })
    //on response
    .then(function (res) {
      var length = res.results.length;

      if (length === 0) {
        return
      }
      getPersonByID(person, res.results[0].id);
    });
}

function getPersonByID(person, id){
  var personIDUrl = tmdbPersonByID + id + "?api_key=" + tmdbAPI;

  $.ajax({
    url: personIDUrl,
    method: "GET"
  })
    //on response
    .then(function (res) {
      var src = tmdbUrlPoster + res.profile_path;
      var bio = res.biography;
      bio = bio.replace(/"/g, "&#34;");
      bio = bio.replace(/'/g, "&#39;");
      console.log(bio);

      $("span[data-person='" + person + "']").append("<a data-src='" + src + "' data-bio='" + bio + "' class='person modal-trigger' href='#modal1'>" + person + "</a>");
    });
}

$(document).on("click", ".person", function(){
  
  var personSrc = $(this).attr("data-src");
  var personBio = $(this).attr("data-bio");
  console.log(personSrc);
  $modalContent.html("<div class='row'><div class='col s4'><img src='" + personSrc + "'></div><div class='col s8'>" + personBio + "</div></div>");
});