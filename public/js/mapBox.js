/*eslint-disable*/
const locations = JSON.parse(document.getElementById('map').dataset.locations);

console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoidGlhZ28tanZvIiwiYSI6ImNrYzU4anM5cTBmYWgzMHFzMGNudDNzZ3UifQ.LsnMVH2zeOf_l_9dK6VPeg';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/tiago-jvo/ckc58pllt02t91inzp8l0w62k',
  scrollZoom : false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((location) => {
  //Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  //Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(location.coordinates)
    .addTo(map);

  //Add popup
  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day} : ${location.description}</p>`)
    .addTo(map);

  //Extends map bound to include current location
  bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
