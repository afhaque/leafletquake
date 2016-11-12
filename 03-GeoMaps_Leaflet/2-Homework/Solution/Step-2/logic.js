
// Creating one of the tile layers that will be the background of our map.
var graymap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ.T6YbdDixkOBWH_k9GbS8JQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
});

// Creating one of the tile layers that will be the background of our map.
var satellitemap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ.T6YbdDixkOBWH_k9GbS8JQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
});

// Creating one of the tile layers that will be the background of our map.
var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ.T6YbdDixkOBWH_k9GbS8JQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
});

// Creating the map object with options.
// We have added the tile layers we created earlier to an array of layers.
var map = L.map('mapid', {
	center: [40.7, -94.5],
	zoom: 3,
	layers: [graymap, satellitemap, outdoors]
});

// Adding our 'graymap' tile layer to the map.
graymap.addTo(map);

// Creating layers for our two different sets of data, earthquakes and tectonicplates.
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Defining an object that contains all of our different map choices.
// Only one of these maps will be visible at a time!
var baseMaps = {
	"Satellite": satellitemap,
    "Grayscale": graymap,
    "Outdoors": outdoors
};

// Defining an object that contains all of our overlays.
// Any combination of these overlays may be visible at the same time!
var overlays = {
	"Tectonic Plates": tectonicplates,
	"Earthquakes": earthquakes
};

// Adding a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);

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

	// Adds GeoJSON data to the earthquake layer.
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
	}).addTo(earthquakes);	// Data is added to the earthquake layer instead of directly to the map.

	// The earthquake layer is added to the map.
	earthquakes.addTo(map);

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

	// Makes an AJAX call to get our Tectonic Plate geoJSON data.
	$.getJSON("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(platedata) {
		// Adds our geoJSON data, along with style information, to the tectonicplates layer.
		L.geoJson( platedata, {color: 'orange', weight: 2 } ).addTo(tectonicplates);
		// Adds the tectonicplates layer to the map.
		faultlines.addTo(map);
	})

});