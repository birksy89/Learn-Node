import axios from "axios";
import { $ } from "./bling";

const mapOptions = {
  center: {
    lat: 43.2,
    lng: -79.8
  },
  zoom: 11
};
function loadPlaces(map, lat = 43.2, lng = -79.8) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`).then(res => {
    const places = res.data;
    if (!places.length) {
      alert("No places found!");
      return;
    }

    //Create a bounds
    const bounds = new google.maps.LatLngBounds();

    //Create an infoWindow
    const infoWindow = new google.maps.InfoWindow();

    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates;
      //console.log(placeLng,placeLat);
      const position = { lat: placeLat, lng: placeLng };
      //Add marker into bounds - Extend bounds
      bounds.extend(position);

      const marker = new google.maps.Marker({
        map: map,
        position: position
      });

      marker.place = place;

      //Add InfoWindow to the marker
      marker.addListener('click', function(){
          const html = `
          <div class="popup">
          <a href="/store/${this.place.slug}">
          <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}"/>
          <p>${this.place.name} - ${this.place.location.address}</p>
          </a>
          </div>
          `
          infoWindow.setContent(html)
          infoWindow.open(map, this)

      })
      return marker;
    });


    //markers.forEach;

    //Then zoom the map to fit all the markers
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);

    console.log(markers);
  });
}

function makeMap(mapDiv) {
  if (!mapDiv) {
    return;
  }

  //make out map
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);
  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  //console.log(input);
}

export default makeMap;
