const MUENSTER = {lat: 51.963066, lng: 7.626245};

function Place(id, name, latLng, rating, reviews, marker) {
    const self = this;
    self.id = id;
    self.name = name;
    self.latLng = latLng;
    self.rating = ko.observable(rating);
    //Yelp has a five star rating with decimal numbers, but we use integers
    self.filledStars = ko.observableArray(Array(Math.round(rating)));
    self.emptyStars = Array(5 - Math.round(rating));
    self.reviews = ko.observableArray(reviews);
    self.marker = marker;
}



function MapViewModel() {
    const self = this;
    let placeArray = [];
    self.loading = ko.observable(true);
    self.filterString = ko.observable("");
    self.currentLocation = ko.observable(null);
    self.locations = ko.observableArray(placeArray);
    self.showDetails = ko.observable(false);
    self.showList = ko.observable(true);
    self.map;

    //Success handler for businesses
    self.onBusinessesReceived = (data) => {
        if(data.businesses) {
            data.businesses.forEach((business) => {
				//convert Yelp coordinates to Google coordinates
				const latLng = {lat:business.coordinates.latitude, lng:business.coordinates.longitude};
				placeArray.push(new Place(business.id, business.name, latLng, business.rating));
            });
			initMarker(placeArray);
        }
		self.loading(false);
	};



    function initMarker(places) {
        self.locations(places);
        self.currentLocation(places[0]);
        //Place new marker
		places.forEach(place => createMarker(place, self.map));
    }

    function createMarker(place, map) {
		const marker = new google.maps.Marker({
												  position: place.latLng,
												  map: map,
												  title: place.name,
												  animation: google.maps.Animation.DROP,
											  });
		marker.addListener("click", (event) => self.openReviews(place));
		place.marker = marker;
	}

    self.openReviews = function(place) {
        self.loading(true);
		$.ajax({
				   url: `/api/yelp/businesses/${place.id}/reviews`,
				   success: (data) => {
				       place.reviews = data.reviews;
					   self.currentLocation(place);
					   const marker = place.marker;
					   marker.setAnimation(google.maps.Animation.BOUNCE);
					   setTimeout(() => marker.setAnimation(null), 1000);
					   self.showDetails(true);
					   self.loading(false);
				   },
				   error: () => onError(`Couldn't fetch reviews for ${place.name}`)
			   });
	};

    //Simple name filter
    self.filterPlaces = (input) => {
        const placesSearchedFor = placeArray
		.filter(value => {return value.name.toLowerCase().includes(input.toLowerCase());});

        //Remove markers from the map
        placeArray.forEach(place => place.marker.setMap(null));

        self.locations(placesSearchedFor);
        initMarker(placesSearchedFor);
    };


}
const vm = new MapViewModel();
ko.applyBindings(vm);
vm.filterString.subscribe((val)=>vm.filterPlaces(val));
//get initial data for Münster in Germany
function initMap() {
    vm.loading(true);
	vm.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: MUENSTER
	});

	$.ajax({
			   url: `/api/yelp/businesses/search?term=food&latitude=${MUENSTER.lat}&longitude=${MUENSTER.lng}`,
			   success: (data) => vm.onBusinessesReceived(data, map),
			   error: () => onError("Couldn't fetch businesses")
		   });
}
function onError(message) {
	vm.loading(false);
	alert(message);
}