//CORS plugin is needed...
//=======================
//GLOBAL VARIABLES
//=====================

var map;
var infoWindow;
var database = firebase.database();
var radiusDistance = 2000;
var zoomLevel = 14;
// var googlePlacesKey = "AIzaSyAayhY8ruruLoqLHOu49qli99n4lw2FjBQ";
// var googlePlacesQuery = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?placeid=" + currentPlaceId + "&key=" + googlePlacesKey;

var currentPlaceId;
var currentPlaceImage;
var currentPlaceName;
var currentPlaceReview;
var currentPlaceAuthor;
var currentPlaceHours;
var currentPlaceRating;
var googlePlacesKey = "AIzaSyAayhY8ruruLoqLHOu49qli99n4lw2FjBQ";
var googlePlacesQuery = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + currentPlaceId + "&key=" + googlePlacesKey;
var that;
var currentPlaceReviewTime;
var latLong;
var markers = [];


//=======================
//FUNCTIONS
//=======================

//Initalize Function
function initMap() {
  //Denver coordinates
  var currentLocation = () => {
    // Try HTML5 geolocation.
    //Event Listen for when window loads, fire off autoComplete funtion
    google.maps.event.addDomListener(window, 'load', autoCompleteLocation);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        infoWindow.setPosition(pos);
        // infoWindow.setContent("<img src='./assets/images/starter-icon.png' alt='Smiley face' height='30' width='40px'>");
        infoWindow.open(map);
        map.setCenter(pos);
        console.log(pos);
        latLong = pos;
        search(latLong);
      }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }//end currentLocation()

  //If no geolocation service, run this function
  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }; //end handleLocationError()

  var denver = {lat:39.7392,lng:-104.9903};
  //Map that is loaded on page
  map = new google.maps.Map(document.getElementById("map"), {
    center: currentLocation(),
    zoom: zoomLevel
  });
  //
  infoWindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  //Search based on bar
  function search(){
    location: latLong,
    radius: radiusDistance,
    type: ["bar"]
  }, callback); // Calls ballback function;
  // var youAreHereImage = "<img src='./assets/images/starter-icon.png' alt='Smiley face' height='30' width='40px'>"
  //  infoWindow = new google.maps.InfoWindow({
  //   content: youAreHereImage
  //  });
  //   service = new google.maps.places.PlacesService(map);
}; // End initMap()



//Callback function
function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i], "./assets/images/beer-512.png"); //Puts each location in loop through the createMarker function
    };
  };
}; //End callback()

//Create Marker Function
function createMarker(place, imgUrl) {
  var placeLoc = place.geometry.location;
  var image = {
    url: imgUrl,
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25)
  };
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: image
  });

  markers.push(marker);
  //When a marker is clicked, run this function
  google.maps.event.addListener(marker, 'click', function() {
    currentPlaceId = place.place_id;
    googlePlacesQuery = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + currentPlaceId + "&key=" + googlePlacesKey;
    ajaxCall();
    infoWindow.setContent("<h4>" + currentPlaceName + ": " + currentPlaceRating + "</h4><button class='btn btn-primary' id='addToCrawl'>Add To Crawl</button>");

    infoWindow.open(map, this);
    //Click on the addToCrawl button
    $("#addToCrawl").on("click", function(){
      that = this;
      currentPlaceId = place.place_id;
      currentPlaceLat = latLong.lat;
      currentPlaceLng = latLong.lng;
      infoWindow.open(map, this);
    });

    ajaxCall(popUp, that);

    function popUp(that){
      infoWindow.setContent("<h4>" + currentPlaceName + "</h4><p>&quot;" + currentPlaceReview + "&quot;</p><p class='author'> -" +currentPlaceAuthor+ ', ' + currentPlaceReviewTime + '</p><h5>Hours of Operation</h5>'
        + '<p class="hours">' + currentPlaceHours[0] + '</p>'
        + '<p class="hours">' + currentPlaceHours[1] + '</p>'
        + '<p class="hours">' + currentPlaceHours[2] + '</p>'
        + '<p class="hours">' + currentPlaceHours[3] + '</p>'
        + '<p class="hours">' + currentPlaceHours[4] + '</p>'
        + '<p class="hours">' + currentPlaceHours[5] + '</p>'
        + '<p class="hours">' + currentPlaceHours[6]
        + "</p><button class='btn btn-primary' id='addToCrawl'>Add To Crawl</button>");
      infoWindow.open(map, that);
      //Click on the addToCrawl button
      $("#addToCrawl").on("click", function(){
        dataPush();
        loadCards();
        infoWindow.close(map, that);

      });
    }
  });
} //end createMarker()

//Function to load the cards from the database
function loadCards() {
  $("#results").empty();
  $("#results").append("<h4>Here's Your Crawl</h4>");

  //Create a new card div
  database.ref().on("child_added", function(snapshot) {
  $("#results").append('<div><button class="accordion btn btn-primary btn-block">'+ snapshot.val().name +'  <span class="caret"></span></button><div style="display: none" class="panel" id="card'
    + snapshot.key +'"</div>');
  // $("#card"+[snapshot.key]).append(snapshot.val().photo);
  // $("#results").append('<img src="' + currentPlaceImage + '" class="place-image" id="placeImage" style="width:100%">');
  $("#card"+[snapshot.key]).append('<h5>Rating: ' + snapshot.val().rating + ' out of 5</h5></div>');

  // $("#card"+[snapshot.key]).append('<p>&quot;' + snapshot.val().review + '&quot;</p><p class="author"> -' +snapshot.val().author+ "</p>");

  $("#card"+[snapshot.key]).append('<h5>Hours of Operation</h5>');
  $("#card"+[snapshot.key]).append('<p class="hours">' + snapshot.val().hoursOfOperation[0] + '</p>');
  $("#card"+[snapshot.key]).append('<p class="hours">' + snapshot.val().hoursOfOperation[1] + '</p>');
  $("#card"+[snapshot.key]).append('<p class="hours">' + snapshot.val().hoursOfOperation[2] + '</p>');
  $("#card"+[snapshot.key]).append('<p class="hours">' + snapshot.val().hoursOfOperation[3] + '</p>');
  $("#card"+[snapshot.key]).append('<p class="hours">' + snapshot.val().hoursOfOperation[4] + '</p>');
  $("#card"+[snapshot.key]).append('<p class="hours">' + snapshot.val().hoursOfOperation[5] + '</p>');
  $("#card"+[snapshot.key]).append('<p class="hours">' + snapshot.val().hoursOfOperation[6] + '</p>');
  $("#card"+[snapshot.key]).append('<button class="btn btn-danger btn-sm remove" >Remove from Crawl</button>');
  $(".remove").on("click", function(){
    removeItem($(this));
    loadCards();
    });
  var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
      acc[i].onclick = function(){
          this.classList.toggle("active");
          var panel = this.nextElementSibling;
          if (panel.style.display === "block") {
              panel.style.display = "none";
          } else {
              panel.style.display = "block";
          }
      };
  }
});

  } //End loadsCards()

  var placeSearch, autocomplete;

//function to prepopulate text from startlocation input
function autoCompleteLocation () {
console.log("autocomplete testing");
var input = document.getElementById('startLocation');
autocomplete = new google.maps.places.SearchBox(input);
autocomplete.bindTo("bounds", map);
// google.maps.event.addDomListener(window, 'load', autoCompleteLocation);
// getAddressPlace();
autocomplete.addListener("places_changed", function() {
  var place = autocomplete.getPlaces();
  var bounds =  new google.maps.LatLngBounds();
  console.log("Helloooo World", place)

  markers.forEach(function(mark) {
    mark.setMap(null);
  });


  // marker = [];

  var image = {
        url: "./assets/images/starter-icon.png",
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
  // places.forEach(function(place){
    console.log("Are we getting places ???", place[0].geometry)
    map.setCenter(place[0].geometry.location)
    map.setZoom(15)
    search(place[0].geometry.location);
     marker = new google.maps.Marker({
            map: map,
            position: place[0].geometry.location,
            icon: image,
          })
    if(!place[0].geometry) {
      console.log("no results found!");
      return
    }

    if (place[0].geometry.viewport) {

      bounds.union(place[0].geometry.viewport);

    }
    // })
  })
}//End autoCompleteLocation();

//function to get the address of the startLocation input

function getAddressPlace() {
    // $('#map').fadeIn();
         console.log(autocomplete.getPlace(),"autocomplete test");
     lat = autocomplete.getPlace().geometry.location.lat();
     lng = autocomplete.getPlace().geometry.location.lng();
    var myLatlng = new google.maps.LatLng(lat, lng);
    var mapOptions = {
        zoom: 16,
        center: myLatlng
    }
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: 'Entered location'
    });
    console.log("winner winner chicken dinner");

}



//Function to call ajax
function ajaxCall(genericName, that){

console.log(googlePlacesQuery);

  var googlePlacesKey = "AIzaSyAayhY8ruruLoqLHOu49qli99n4lw2FjBQ";
  var googlePlacesQuery = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?placeid=" + currentPlaceId + "&key=" + googlePlacesKey;
  console.log(googlePlacesQuery);

  $.ajax ({
    url: googlePlacesQuery,
    headers: {
      "Access-Control-Allow-Origin": true
    },
    method: 'get'
  }).done(function (response){
      currentPlaceName = response.result.name;
      currentPlaceReview = response.result.reviews[0].text;
      currentPlaceAuthor = response.result.reviews[0].author_name;
      currentPlaceReviewTime = response.result.reviews[0].relative_time_description;
      currentPlaceRating = response.result.rating;
      currentPlaceHours = response.result.opening_hours.weekday_text;

      console.log(response);
      genericName(that);
  });
} //end ajax()

//Add card to database
function dataPush() {

  database.ref().push({
    name: currentPlaceName,
    placeId: currentPlaceId,
    review: currentPlaceReview,
    author: currentPlaceAuthor,
    rating: currentPlaceRating,
    hoursOfOperation: currentPlaceHours,
    nextDistance: 0,
    dateAdded: firebase.database.ServerValue.TIMESTAMP,
    reviewTime: currentPlaceReviewTime
  });
}
// Function to remove a card from the database
function removeItem(button) {
  // Now we can get back to that item we just pushed via .child().
 var id = button.parent().attr("id").slice(4);
 console.log(id);
  database.ref().child(id).remove(function(error) {
    console.log(error ? "Uh oh!" : "Success!");
  });
}


//=======================
//MAIN PROCESS
//=======================
loadCards();
