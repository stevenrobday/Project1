var utellyAPI = 'JFBfbDiSaimshBIIJ0KGCWkf3AyAp1jzmhCjsncKy5RpMzzONS';
var tmdbAPI = 'a012a678bc4826e1cef39e62f3e9f471';
var omdbAPI = '7e561c3d';

M.AutoInit();

$(document).ready(function () {
  $('.collapsible').collapsible();
  $('.modal').modal();
});

var utellyUrl = "https://utelly-tv-shows-and-movies-availability-v1.p.mashape.com/lookup?";
var tmdbUrlBasic = "https://api.themoviedb.org/3/search/";
var tmdbUrlPoster = "http://image.tmdb.org/t/p/w185/";
var tmdbPersonByName = "https://api.themoviedb.org/3/search/person";
var tmdbPersonByID = "https://api.themoviedb.org/3/person/";
var tmdbDiscover = "https://api.themoviedb.org/3/discover/";
var omdbUrl = "https://www.omdbapi.com/";

var $basic = $("#basic");
var $basicSearch = $("#basicSearch");
var $advanced = $("#advanced");
var $advancedSearch = $("#advancedSearch");
var $options = $("#options");
var $modalContent = $(".modal-content");

var getData = function (url) {
  return $.ajax({
    url: url,
    method: "GET"
  });
};

var getUtellyData = function (url) {
  return $.ajax({
    url: url,
    headers: { "X-Mashape-Key": utellyAPI },
    method: "GET"
  });
}

$basic.on("submit", function (e) {
  e.preventDefault();

  $options.empty();

  var val = $basicSearch.val().trim();
  $basicSearch.val("");
  if (val === "") {
    return;
  }

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

  val = plusIt(val);

  var searchURL = utellyUrl + "country=us&term=" + val;

  getUtellyData(searchURL)
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
        let title = res.results[i].name;
        resultStr += title + "</div><div class='collapsible-body white'><div class='row'><div class='col s4' data-titlePoster='" + title + "'></div><div class='col s8' data-titleInfo='" + title + "'><p>";

        res.results[i].locations.forEach(function (el) {
          var resultUrl = el.url;
          var resultName = el.display_name;

          if (resultName === "Netflix") {
            resultUrl = resultUrl.replace(/nflx/, "https");
          }
          resultStr += "<span><a href='" + resultUrl + "' target='_blank'>" + resultName + "</a> </span>";
        });
        resultStr += "</p></div></div></div></li></ul></div></div>";
        $options.append(resultStr);

        var oUrl = omdbUrl + "?apikey=" + omdbAPI + "&t=" + title;
        var tUrl = tmdbUrlBasic + type + "?api_key=" + tmdbAPI + "&query=" + title;

        //console.log(omdbUrl);

        Promise.all([getData(oUrl), getData(tUrl), title]).then(function (data) {
          var $titleInfo = $("div[data-titleInfo='" + title + "']");

          var tmdbLength = data[1].results.length;

          if (tmdbLength === 0) {
            $titleInfo.append("<p>No info returned from TMDB</p>");
          }
          else {

            var genreArray = data[1].results[0].genre_ids;

            //console.log(genreArray.length);

            if (genreArray.length !== 0) {
              var genreStr = "<p>Genre: ";

              var genreArrayNames = [];

              genreArray.forEach(function (el) {
                getGenreName(genreArrayNames, el);
              });


              genreStr += genreArrayNames.join(', ') + "</p>";

              $titleInfo.append(genreStr);
            }
            var voteAverage = data[1].results[0].vote_average;

            $titleInfo.append("<p>Voter average: " + voteAverage + "/10</p>");

            var posterPath = data[1].results[0].poster_path;

            if (posterPath !== null) {
              var imgSrc = tmdbUrlPoster + posterPath;
              $("div[data-titlePoster='" + title + "']").append("<img src='" + imgSrc + "'>");
            }
          }

          getMembers(data[0], "Director", $titleInfo);
          getMembers(data[0], "Writer", $titleInfo);
          getMembers(data[0], "Actors", $titleInfo);

          if (tmdbLength !== 0) {
            $titleInfo.append("<p>Plot: " + data[1].results[0].overview + "</p>");
          }
        });
      }

      $('.collapsible').collapsible();
    });
});

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
        return;
      }
      getPersonByID(person, res.results[0].id);
    });
}

function getPersonByID(person, id) {
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

      $("span[data-person='" + person + "']").html("<a data-src='" + src + "' data-bio='" + bio + "' class='person modal-trigger' href='#modal1'>" + person + "</a>");
    });
}

function getGenreName(array, id) {
  var el;

  switch (id) {
    case 28:
      el = "Action";
      break;
    case 12:
      el = "Adventure";
      break;
    case 10759:
      el = "Action & Adventure";
      break;
    case 16:
      el = "Animtation";
      break;
    case 35:
      el = "Comedy";
      break;
    case 80:
      el = "Crime";
      break;
    case 99:
      el = "Documentary";
      break;
    case 18:
      el = "Drama";
      break;
    case 10751:
      el = "Family";
      break;
    case 14:
      el = "Fantasy";
      break;
    case 36:
      el = "History";
      break;
    case 27:
      el = "Horror";
      break;
    case 10762:
      el = "Kids";
      break;
    case 10402:
      el = "Music";
      break;
    case 9648:
      el = "Mystery";
      break;
    case 10763:
      el = "News";
      break;
    case 10764:
      el = "Reality";
      break;
    case 10749:
      el = "Romance";
      break;
    case 10765:
      el = "Sci-Fi & Fantasy";
      break;
    case 878:
      el = "Science Fiction";
      break;
    case 10766:
      el = "Soap";
      break;
    case 10767:
      el = "Talk";
      break;
    case 10770:
      el = "TV Movie";
      break;
    case 53:
      el = "Thriller";
      break;
    case 10752:
      el = "War";
      break;
    case 10768:
      el = "War & Politics";
      break;
    case 37:
      el = "Western";
      break;
  }

  array.push(el);
}

function getMembers(data, memberCat, $titleInfo) {
  var members = data[memberCat];

  if (members && members !== "N/A") {
    var membersArray = members.split(", ");

    var membersStr = "<p>" + memberCat + ": ";

    membersArray.forEach(function (el, index, array) {
      membersStr += "<span data-person='" + el + "'>" + el + "</span>";

      if (index !== array.length - 1) {
        membersStr += ", ";
      }

      getPersonByName(el);
    });

    membersStr += "</p>";
  }

  $titleInfo.append(membersStr);
}

$advanced.on("submit", function (e) {
  e.preventDefault();

  $options.empty();

  var searchVal = $advancedSearch.val().trim();
  $advanced.val("");

  var cast = $("[id='advancedCast']:checked").val();
  var crew = $("[id='advancedCrew']:checked").val();

  var memberType;

  if (cast === "on") {
    memberType = "cast";
  }
  else if (crew === "on") {
    memberType = "crew";
  }

  var movie = $("[id='advancedMovie']:checked").val();
  var tv = $("[id='advancedTV']:checked").val();

  var mediaType;

  if (movie === "on") {
    mediaType = "movie";
  }
  else if (tv === "on") {
    mediaType = "tv";
  }

  var selected = $("#genreSelect option:selected").val();

  if (searchVal === "") {
    var tUrl = tmdbDiscover + mediaType + "?api_key=" + tmdbAPI + "&sort_by=vote_average.desc";



    if (selected !== "0") {
      if (mediaType === "movie" && selected === "10759") {
        selected = 28;
      }
      tUrl += "&with_genres=" + selected;
    }

    getData(tUrl).then(function (res) {
      var length = res.results.length;

      if (length > 3) {
        length = 3;
      }

      for (var i = 0; i < length; i++) {
        var resultStr = "<div class='row'><div class='col s12'><ul class='collapsible'><li><div class='collapsible-header'>";
        let title;
        if (mediaType === "tv") {
          title = res.results[i].name;
        }
        else {
          title = res.results[i].title;
        }

        resultStr += title + "</div><div class='collapsible-body white'><div class='row'><div class='col s4'>";

        var posterPath = res.results[i].poster_path;

        if (posterPath !== null) {
          var imgSrc = tmdbUrlPoster + posterPath;
          resultStr += "<img src='" + imgSrc + "'>"
        }
        resultStr += "</div><div class='col s8' data-titleInfo='" + title + "'><div data-utellyInfo='" + title + "'></div>";

        var genreArray = res.results[i].genre_ids;

        if (genreArray.length !== 0) {
          resultStr += "<p>Genre: ";

          var genreArrayNames = [];

          genreArray.forEach(function (el) {
            getGenreName(genreArrayNames, el);
          });

          resultStr += genreArrayNames.join(', ') + "</p>";
        }

        var voteAverage = res.results[i].vote_average;

        resultStr += "<p>Voter average: " + voteAverage + "/10</p>";

        resultStr += "<div data-Director='" + title + "'></div><div data-Writer='" + title + "'></div><div data-Actors='" + title + "'></div>";

        resultStr += "<p>Plot: " + res.results[i].overview + "</p>";

        resultStr += "</div></div></div></li></ul></div></div>";

        $options.append(resultStr);

        var utellyTitle = plusIt(title);

        var searchURL = utellyUrl + "country=us&term=" + utellyTitle;

        getUtellyData(searchURL)
          //on response
          .then(function (data) {
            var utellyResults = "";

            if (data.results.length > 0) {
              data.results[0].locations.forEach(function (el) {
                var resultUrl = el.url;
                var resultName = el.display_name;

                if (resultName === "Netflix") {
                  resultUrl = resultUrl.replace(/nflx/, "https");
                }
                utellyResults += "<span><a href='" + resultUrl + "' target='_blank'>" + resultName + "</a> </span>";
              });

              $("div[data-utellyInfo='" + title + "']").append(utellyResults);
            }
          });

        var oUrl = omdbUrl + "?apikey=" + omdbAPI + "&t=" + title;

        getData(oUrl)
          //on response
          .then(function (data) {
            var $director = $("div[data-Director='" + title + "']");
            var $writer = $("div[data-Writer='" + title + "']");
            var $actors = $("div[data-Actors='" + title + "']");

            getMembers(data, "Director", $director);
            getMembers(data, "Writer", $writer);
            getMembers(data, "Actors", $actors);
          });
      }
      //Promise.all([getData(oUrl), getData], )
      $('.collapsible').collapsible();
    });
  }
  else {
    var personNameURL = tmdbPersonByName + "?api_key=" + tmdbAPI + "&query=" + searchVal;

    $.ajax({
      url: personNameURL,
      method: "GET"
    })
      //on response
      .then(function (res) {
        var length = res.results.length;

        if (length === 0) {
          $options.append("No results found for " + searchVal);
          return;
        }

        var creditURL = tmdbPersonByID + res.results[0].id;

        if (mediaType === "tv") {
          creditURL += "/tv_credits";
        }
        else {
          creditURL += "/movie_credits";
        }

        creditURL += "?api_key=" + tmdbAPI;
        //console.log(creditURL);
        $.ajax({
          url: creditURL,
          method: "GET"
        })
          //on response
          .then(function (response) {
            //console.log(response);

            var creditArray;

            if (memberType === "cast") {
              creditArray = response.cast;
            }
            else {
              creditArray = response.crew;
            }

            if (creditArray.length > 0) {
              creditArray.sort(function (a, b) {
                return parseFloat(b.vote_average) - parseFloat(a.vote_average);
              });
            }

            //console.log(creditArray);

            var creditLength;

            if (selected !== "0") {
              var tmpArray = [];
              creditLength = creditArray.length;
              for (var i = 0; i < creditLength; i++) {
                for (var j = 0; j < creditArray[i].genre_ids.length; j++) {
                  if (parseInt(selected) === creditArray[i].genre_ids[j]) {
                    tmpArray.push(creditArray[i]);
                    break;
                  }
                }

                if (tmpArray.length === 3) {
                  creditArray = tmpArray.slice();
                  break;
                }

                if (i === creditLength - 1) {
                  creditArray = tmpArray.slice();
                }
              }
            }

            creditLength = creditArray.length;

            if (creditLength > 3) {
              creditLength = 3;
            }

            for (var i = 0; i < creditLength; i++) {
              var resultStr = "<div class='row'><div class='col s12'><ul class='collapsible'><li><div class='collapsible-header'>";
              let title;
              if (mediaType === "tv") {
                title = creditArray[i].name;
              }
              else {
                title = creditArray[i].title;
              }

              resultStr += title + "</div><div class='collapsible-body white'><div class='row'><div class='col s4'>";

              var posterPath = creditArray[i].poster_path;

              if (posterPath !== null) {
                var imgSrc = tmdbUrlPoster + posterPath;
                resultStr += "<img src='" + imgSrc + "'>"
              }
              resultStr += "</div><div class='col s8' data-titleInfo='" + title + "'><div data-utellyInfo='" + title + "'></div>";

              var genreArray = creditArray[i].genre_ids;

              if (genreArray.length !== 0) {
                resultStr += "<p>Genre: ";

                var genreArrayNames = [];

                genreArray.forEach(function (el) {
                  getGenreName(genreArrayNames, el);
                });

                resultStr += genreArrayNames.join(', ') + "</p>";
              }

              var voteAverage = creditArray[i].vote_average;

              resultStr += "<p>Voter average: " + voteAverage + "/10</p>";

              resultStr += "<div data-Director='" + title + "'></div><div data-Writer='" + title + "'></div><div data-Actors='" + title + "'></div>";

              resultStr += "<p>Plot: " + creditArray[i].overview + "</p>";

              resultStr += "</div></div></div></li></ul></div></div>";

              $options.append(resultStr);

              var utellyTitle = plusIt(title);

              var searchURL = utellyUrl + "country=us&term=" + utellyTitle;

              getUtellyData(searchURL)
                //on response
                .then(function (data) {
                  var utellyResults = "";

                  if (data.results.length > 0) {
                    data.results[0].locations.forEach(function (el) {
                      var resultUrl = el.url;
                      var resultName = el.display_name;

                      if (resultName === "Netflix") {
                        resultUrl = resultUrl.replace(/nflx/, "https");
                      }
                      utellyResults += "<span><a href='" + resultUrl + "' target='_blank'>" + resultName + "</a> </span>";
                    });

                    $("div[data-utellyInfo='" + title + "']").append(utellyResults);
                  }
                });

              var oUrl = omdbUrl + "?apikey=" + omdbAPI + "&t=" + title;

              getData(oUrl)
                //on response
                .then(function (data) {
                  var $director = $("div[data-Director='" + title + "']");
                  var $writer = $("div[data-Writer='" + title + "']");
                  var $actors = $("div[data-Actors='" + title + "']");

                  getMembers(data, "Director", $director);
                  getMembers(data, "Writer", $writer);
                  getMembers(data, "Actors", $actors);
                });
            }
            $('.collapsible').collapsible();
          });
      });
  }
});

function plusIt(val) {
  return val.replace(/ /g, "+");
}

$(document).on("click", ".person", function () {
  var personSrc = $(this).attr("data-src");
  var personBio = $(this).attr("data-bio");
  $modalContent.html("<div class='row'><div class='col s4'><img src='" + personSrc + "'></div><div class='col s8'>" + personBio + "</div></div>");
});
