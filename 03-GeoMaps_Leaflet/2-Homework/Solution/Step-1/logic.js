
// Creating the tile layer that will be the background of our map.
var graymap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ.T6YbdDixkOBWH_k9GbS8JQ', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	});

// Creating the map object with options.
var map = L.map('mapid', {
	center: [40.7, -94.5],
	zoom: 3,
});

// Adding our 'graymap' tile layer to the map.
graymap.addTo(map);

// Our AJAX call that retrieves our earthquake geoJSON data.
$.getJSON("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",function(data){

	// This function returns the style data for each of the earthquakes we plot on the map.
	// We pass the magnitude of the earthquake into two seperate functions to calcualte the color and radius.
	function styleInfo(feature) {
		return {
			opacity: 1,
			fillOpacity: 1,
			fillColor: getColor(feature.properties.mag),
			color: '#000000',
			radius: getRadius(feature.properties.mag),
			stroke: true,
			weight: .5,
		}
	}

	// Determines the color of the marker based on the magnitude of the earthquake.
	function getColor(magnitude) {
		if (magnitude > 5) {
			return '#ea2c2c';
		} else if (magnitude > 4) {
			return '#ea822c';
		} else if (magnitude > 3) {
			return '#ee9c00';
		} else if (magnitude > 2) {
			return '#eecc00';
		} else if (magnitude > 1) {
			return '#d4ee00';
		} else if ( magnitude <= 1) {
			return '#98ee00';
		}
	}

	// Determines the radius of the earthquake marker based on it's magnitude.
	// Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
	function getRadius(magnitude) {
		if (magnitude == 0) {
			return 1
		} else {
			return magnitude*4
		}
	}

	// Adds GeoJSON layer to the map once the file is loaded.
	L.geoJson(data, {
		// Turns each feature into a circleMarker on the map.
		pointToLayer: function (feature, latlng) {
	        return L.circleMarker(latlng);
	    },
	    // Setting the style for each circleMarker using our styleInfo function.
	 	style: styleInfo,
	 	// Function that will be called once for each created Feature, after it has been created and styled. 
		onEachFeature: function(feature, layer) {
			// Creates a pop-up when you click on any of the earthquake markers.
			layer.bindPopup('Magnitude: ' + feature.properties.mag + '<br>' + 'Location: ' + feature.properties.place);
		}
	}).addTo(map);

	// Creating a legend control object. 
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function(map) {
		var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];
        colors = ['#98ee00', '#d4ee00', '#eecc00', '#ee9c00', '#ea822c', '#ea2c2c']

	    // Loop through our intervals and generate a label with a colored square for each interval.
	    for (var i = 0; i < grades.length; i++) {
	        div.innerHTML +=
	            '<i style="background:' + colors[i] + '"></i> ' +
	            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	    }

    	return div;
	}

	// Add our legend to the map.
	legend.addTo(map);

});