// DATA
const tasks = [
    {
        tid: 0,
        A: {
            lat: 48.21706247681177,
            lng: 16.31258462385731
        },
        B: {
            lat: 48.219682792023086, 
            lng: 16.31870270732261
        }
    },
    {
        tid: 1,
        A: {
            lat: 48.21664578918375, 
            lng: 16.315250211952616
        },
        B: {
            lat: 48.216353905744676,
            lng: 16.308467067607054
        }
    },
    {
        tid: 2,
        A: {
            lat: 48.22207492371322, 
            lng: 16.316776932898865
        },
        B: {
            lat: 48.21744146926257, 
            lng: 16.319776594026354
        }
    },
    {
        tid: 3,
        A: {
            lat: 48.21608789580128, 
            lng: 16.31026781288454
        },
        B: {
            lat: 48.21679547730894, 
            lng: 16.315752693212936
        }
    }
]

const maps = [
    {
        mid: 0,
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        type: 'normal',
        format: 'png'
    },
    {
        mid: 1,
        url: 'https://lukalaval.github.io/split/tiles/m1/{z}/{x}/{y}',
        attribution: '',
        type: 'normal',
        format: 'png'
    }
]








var participant = {
    id: 0,
    positions: []
};










// INIT PROCEDURE
var task;
var map;
var stepElements;
var step = 0;
var maxStep = tasks.length;
function init(tIndex, mIndex) {

    if(tIndex < 0) {
        // randomize
        tIndex = Math.floor(Math.random() * (tasks.length-1));
    } 

    task = tasks[tIndex];
    map = maps[mIndex];

    // remove selected task
    tasks.splice(tIndex,1);
    console.log(tasks);

    initMapView(task, map);
    // prevents unnecessary panorama loading for tests
    if(document.getElementsByClassName("free").length == 0) {
        initPanoView(task, map);
    }

    step = step + 1;
    stepElements = document.getElementsByClassName("step");
    stepElements[0].textContent = step + '/' + maxStep;
    stepElements[1].textContent = step + '/' + maxStep;
}








// MAP VIEW
var icon_A = L.icon({
    iconUrl: 'icons/A.png',
    iconSize:     [22, 22], 
    iconAnchor:   [11, 11],
    popupAnchor:  [0, 0]
})

var icon_B = L.icon({
    iconUrl: 'icons/B.png',
    iconSize:     [22, 22], 
    iconAnchor:   [11, 11],
    popupAnchor:  [0, 0]
})

var mapView;
var basemap;
var baselayer;
var customlayer;
var markerA;
var markerB;
var bounds;
function initMapView(task, map) {

    // create map object
    if(mapView) { mapView.remove(); }
    mapView = L.map('mapView').setView([task.A.lat, task.A.lng], 10);


    // initialize elements
    basemap = maps[0];
    baselayer = L.tileLayer(basemap.url, {
        attribution: basemap.attribution,
        type: basemap.type,
        format: basemap.format
    });

    customlayer = L.tileLayer(map.url, {
        attribution: map.attribution,
        type: map.type,
        format: map.format
    });

    markerA = L.marker([task.A.lat, task.A.lng], {icon: icon_A});
    markerB = L.marker([task.B.lat, task.B.lng], {icon: icon_B});


    // add elements to the map
    baselayer.addTo(mapView);
    markerA.addTo(mapView);
    markerB.addTo(mapView);


    // fit map on added elements
    bounds = new L.LatLngBounds([markerA.getLatLng(), markerB.getLatLng()]);
    mapView.fitBounds(bounds);
}










// PANORAMA VIEW
var panoView;
var panorama;
var svLocation;
function initPanoView(task, map) {

    // Position initiale
    svLocation = task.A;

    // Créer la carte
    panoView = new google.maps.Map(document.getElementById('panoView'), {
        center: svLocation,
        zoom: 14
    });

    // Ajouter Street View
    panorama = new google.maps.StreetViewPanorama(
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
            tid: task.tid,
            mid: map.mid,
            lat: currentPosition.lat(),
            lng: currentPosition.lng(),
            timestamp: timestamp
        });
        console.log(participant);
    }

    // Enregistrer la position à chaque changement de panorama
    panorama.addListener('position_changed', recordPosition);

    panorama.addListener('click', function(event) {
        event.stop();
    });

    panorama.setOptions({
        clickToGo: true,  // Désactiver le déplacement par clic
        linksControl: false // Assurer que les flèches sont visibles
    });

}







// UNIQUE IDENTIFIER (IP)
async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        participant.id = data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}






// INTERATION AND RESULT SUBMISSION
function submit() {

    if(step == maxStep) {
        // this is the end
        // submit results
        var params = {
            pid : participant.id,
            content : JSON.stringify(participant)
        }
        emailjs.send("service_wpfrct4", "template_rkfycqo", params).then(
            (response) => {
              alert('THANK YOU!\nYour results have been submitted successfully.\n\nPlease share this page :)');
            },
            (error) => {
              alert('FAILED... ' + error);
            },
        );

        // terminate
        document.getElementById('mapView').remove();
        document.getElementById('panoView').remove();
        document.getElementById('panel').remove();



    } else {
        // assign a new task on the same map
        init(-1, 0);
    }
}





// UI
function toggleInstructions() {
    document.getElementById("panel").classList.toggle("hide");
}






// FIRST LOAD
window.onload = function(){
    getIPAddress();
    emailjs.init("jCMkS3ws9kLsBzvGU");

    // assign a new task and a map
    init(-1, 1);
}