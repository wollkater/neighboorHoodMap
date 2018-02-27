function Place(name, latLng, rating, reviews) {
    const self = this;
    self.name = name;
    self.latLng = latLng;
    self.rating = ko.observable(rating);
    //Yelp has a five star rating with decimal numbers, but we use integers
    self.filledStars = ko.observableArray(Array(Math.round(rating)));
    self.emptyStars = Array(5 - Math.round(rating));
    self.reviews = ko.observableArray(reviews);
}



function MapViewModel() {
    const self = this;
    let placeArray = [];
    let map;
    let markers = []; //Array that holds markers so we can clear them later
    self.filterString = ko.observable("");
    self.currentLocation = ko.observable(null);
    self.locations = ko.observableArray(placeArray);
    self.showDetails = ko.observable(false);
    self.showList = ko.observable(true);

    //get initial data for Münster in Germany
    function initMap() {
        placeArray = [];
        const muenster = {lat: 51.963066, lng: 7.626245};
         map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: muenster
        });

         $.ajax({
             url: `/api/yelp/businesses/search?term=food&latitude=${muenster.lat}&longitude=${muenster.lng}`,
             success: onBusinessesReceived,
             error: () => onError("Couldn't fetch businesses")
                });
    }

    //Success handler for businesses
    function onBusinessesReceived(data) {
        if(data.businesses) {
            //load reviews for all businesses
            data.businesses.forEach(business => {
                $.ajax({
                           url: `/api/yelp/businesses/${business.id}/reviews`,
                           success: (reviews) => onReviewsReceived(business, reviews),
                           error: () => onError(`Couldn't fetch reviews for ${business.name}`)
                       });
            });
        }
    }

    //Success handler for reviews
    function onReviewsReceived(business, reviews) {
        //convert Yelp coordinates to Google coordinates
        const latLng = {lat:business.coordinates.latitude, lng:business.coordinates.longitude};
        placeArray.push(new Place(business.name, latLng, business.rating, reviews.reviews));

        initMarker(map, placeArray);
    }

    function onError(message) {
        alert(message);
    }

    function initMarker(map, places) {
        //Clear markers
        markers.forEach(marker => {
            marker.setMap(null);
        });

        self.locations(places);
        self.currentLocation(places[0]);
        //Place new marker
        places.forEach(place => {
            const marker = new google.maps.Marker({
                                                      position: place.latLng,
                                                      map: map,
                                                      title: place.name,
                                                      animation: google.maps.Animation.DROP,
                                                  });
            marker.addListener("click", event => {
                self.currentLocation(place);
                self.showDetails(true);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(() => marker.setAnimation(null), 1000);
            });
            markers.push(marker);
        });
    }

    initMap();

    //Simple name filter
    self.filterPlaces = (input) => {
        const places = placeArray.filter(value => {return value.name.toLowerCase().includes(input.toLowerCase());});
        self.locations(places);
        initMarker(map, places);
    };


}
const vm = new MapViewModel();
ko.applyBindings(vm);
vm.filterString.subscribe((val)=>vm.filterPlaces(val));

