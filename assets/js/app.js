M.AutoInit();

$(document).ready(function () {
  $('.collapsible').collapsible();
});

console.log(utellyAPI);

var url = "https://utelly-tv-shows-and-movies-availability-v1.p.mashape.com/lookup?";
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
        var resultStr = "<div class='row'><div class='col s12'><ul class='collapsible'><li><div class='collapsible-header'>";
        resultStr += res.results[i].name + "</div><div class='collapsible-body white'>";
           
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
      }

      $('.collapsible').collapsible();
    });
});
