// Creating the tile layer that will be the background of our map.
var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ.T6YbdDixkOBWH_k9GbS8JQ', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	});

// Creating the map object with options.
var map = L.map('mapid', {
	center: [40.73, -74.0059],
	zoom: 12,
});

// Adding our 'lightmap' tile layer to the map.
lightmap.addTo(map);

// Defining the layers that we will add our different data points to.
var normalStations = new L.LayerGroup();
var lowStations = new L.LayerGroup();
var emptyStations = new L.LayerGroup();
var newStations = new L.LayerGroup();
var oldStations = new L.LayerGroup();

// Naming our layers.
var overlays = {
	"Healthy Stations": normalStations,
	"Low Stations": lowStations,
	"Empty Stations": emptyStations,
	"Coming Soon": newStations,
	"Out of Order": oldStations
};

// Creating a control for our layers, and adding our layers to it.
L.control.layers(null, overlays).addTo(map);

// Creating a legend to display data about our map.
var info = L.control({position: "bottomright"});
info.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'legend');
	return div
};
info.addTo(map);

// Creating a blank array which we are going to fill with our data points.
var markerArray = [];

// Defining the icons that will be used to represent our data points.
var defaultIcon = {
	icon: 'ion-android-bicycle',
	iconColor: 'white',
	markerColor: 'green',
	shape: 'circle'
}

var lowIcon = {
	icon: 'ion-android-bicycle',
	iconColor: 'white',
	markerColor: 'orange',
	shape: 'circle'
}

var emptyIcon = {
	icon: 'ion-android-bicycle',
	iconColor: 'white',
	markerColor: 'red',
	shape: 'circle'
}

var outOfOrderIcon = {
	icon: 'ion-minus-circled',
	iconColor: 'white',
	markerColor: 'blue-dark',
	shape: 'penta',
}

var comingSoonIcon = {
	icon: 'ion-settings',
	iconColor: 'white',
	markerColor: 'yellow',
	shape: 'star'
}

// Calling the Citi Bike API.
$.getJSON("https://gbfs.citibikenyc.com/gbfs/en/station_information.json",function(response){

	$.getJSON("https://gbfs.citibikenyc.com/gbfs/en/station_status.json",function(statusinfo){

		var emptyStationCount = 0;
		var lowStationCount = 0;	  

		// Looping through our response data.
		for (var i = 0; i < response.data.stations.length; i++) {
			
			// Logic which will determine the appropriate icon and layer for the marker.
			if (statusinfo.data.stations[i].is_installed == 1 && statusinfo.data.stations[i].is_renting == 1) {					// Normal Station
				if (statusinfo.data.stations[i].num_bikes_available > 5) {						// Logic for a healthy station.
					icon = defaultIcon;
					layer = normalStations;
				} else if (statusinfo.data.stations[i].num_bikes_available == 0) {				// Logic for an empty station.
					icon = emptyIcon;
					layer = emptyStations;
					emptyStationCount += 1;
				} else {																		// Logic for a low station.
					icon = lowIcon;
					layer = lowStations;
					lowStationCount += 1;
				};
			} else if (statusinfo.data.stations[i].is_installed == 1 && statusinfo.data.stations[i].is_renting == 0) {			// Out of Service
				icon = outOfOrderIcon;
				layer = oldStations;
			} else {																											// Coming Soon
				icon = comingSoonIcon;
				layer = newStations;
			};

			// Creating the new marker.
		 	var options = L.ExtraMarkers.icon(icon);
		 	var newMarker = L.marker([response.data.stations[i].lat, response.data.stations[i].lon], {icon: options});

		 	// Adding data to our marker object so we can reference it later.
		 	newMarker.currentlayer = layer;
		 	newMarker.name = response.data.stations[i].name;
		 	newMarker.capacity = response.data.stations[i].capacity;

		 	// Adding our marker to the appropriate layer.
		 	newMarker.addTo(layer);

		 	// Binding a popup to the marker that will display on click. This is written in HTML.
		 	newMarker.bindPopup(newMarker.name + "<br> Capacity: " + newMarker.capacity + "<br>" + statusinfo.data.stations[i].num_bikes_available + " Bikes Available")

		 	// Adding our marker to an array so we can reference it later.
		 	markerArray.push(newMarker);

		}

		// Add all of our layers to the map so they are all showing when the map loads.
		normalStations.addTo(map);
		lowStations.addTo(map);
		emptyStations.addTo(map);
		newStations.addTo(map);
		oldStations.addTo(map);

		// Call our updateLegend function which will... update the legend!
		updateLegend(statusinfo.last_updated, lowStationCount, emptyStationCount)

	});

});

// Our updateMap function will run every 10 seconds grabbing new data and updating the map.
setInterval(updateMap, 10000)

// FUNCTIONS ================================

// The function to update our legend.
function updateLegend(time, lowcount, emptycount) {
	$('.legend').html("<p>Updated: " + moment.unix(time).format('h:mm:ss A') + "</p> <p>Low Stations: " + lowcount + "</p> <p>Empty Stations: " + emptycount + "</p>")
}

// The function which will update our map.
function updateMap(){

	$.getJSON("https://gbfs.citibikenyc.com/gbfs/en/station_status.json",function(statusinfo){

		var lowStationCount = 0;
		var emptyStationCount = 0;	  

		for (var i = 0; i < statusinfo.data.stations.length; i++) {
			
			if (statusinfo.data.stations[i].is_installed == 1 && statusinfo.data.stations[i].is_renting == 1) {					// Normal Station

				if (statusinfo.data.stations[i].num_bikes_available > 5) {						// Logic for a healthy station.
					icon = defaultIcon;
					layer = normalStations;
				} else if (statusinfo.data.stations[i].num_bikes_available == 0) {				// Logic for an empty station.
					icon = emptyIcon;
					layer = emptyStations;
					emptyStationCount += 1;
				} else {																		// Logic for a low station.
					icon = lowIcon;
					layer = lowStations;
					lowStationCount += 1;
				};

			 	var newIcon = L.ExtraMarkers.icon(icon);

		 		markerArray[i].setIcon(newIcon).setPopupContent(markerArray[i].name + "<br> Capacity: " + markerArray[i].capacity + "<br>" + statusinfo.data.stations[i].num_bikes_available + " Bikes Available").removeFrom(markerArray[i].currentlayer).addTo(layer)
	 			markerArray[i].currentlayer = layer

			} 

		}

		// Call our updateLegend function which will... update the legend!
		updateLegend(statusinfo.last_updated, lowStationCount, emptyStationCount);

	});
	
}