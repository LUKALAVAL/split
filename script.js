var participant = {
    id: 0,
    positions: []
};



let map = L.map('mapView').setView([48.21706247681177,16.31258462385731], 20);

// free tile provider http://alexurquhart.github.io/free-tiles/
// http://leaflet-extras.github.io/leaflet-providers/preview/index.html this one is better

var layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
	type: 'normal',
	format: 'png'
});

layer.addTo(map);

let markerStart = L.marker([48.21706247681177,16.31258462385731]);
markerStart.addTo(map);







function initPanoView() {
    // Emplacement initial pour Street View (latitude, longitude)
    var svLocation = {lat: 48.21706247681177, lng: 16.31258462385731};

    // Créer la carte
    var panoView = new google.maps.Map(document.getElementById('panoView'), {
        center: svLocation,
        zoom: 14
    });

    // Ajouter Street View
    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('panoView'), {
        position: svLocation,
        pov: {
            heading: 165,
            pitch: 0
        },
        zoom: 1
        });

    // Associer Street View à la carte
    panoView.setStreetView(panorama);

    // Hide street names on image tiles
    panorama.setOptions({
        showRoadLabels: false
    });
  
    function recordPosition() {
        var currentPosition = panorama.getPosition();
        var timestamp = new Date().toISOString();
        participant.positions.push({
            lat: currentPosition.lat(),
            lng: currentPosition.lng(),
            timestamp: timestamp
        });
        console.log(participant);
    }

    // Enregistrer la position à chaque changement de panorama
    panorama.addListener('position_changed', recordPosition);

}







async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        participant.id = data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}







function submit() {
    var params = {
        pid : participant.id,
        content : JSON.stringify(participant)
    }
    emailjs.send("service_wpfrct4", "template_rkfycqo", params).then(
        (response) => {
          alert('SUCCESS!' + response.status + response.text);
        },
        (error) => {
          alert('FAILED...' + error);
        },
    );
}





window.onload = function(){
    getIPAddress();
    emailjs.init("jCMkS3ws9kLsBzvGU");
    
    // initPanoView();

	window.scrollTo(0, document.body.scrollHeight);
}