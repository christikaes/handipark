Markers = new Mongo.Collection('markers');  

if (Meteor.isClient) {

  Meteor.startup(function() {  
    GoogleMaps.load();
  });

  // // counter starts at 0
  // Session.setDefault('counter', 0);

  // Template.hello.helpers({
  //   counter: function () {
  //     return Session.get('counter');
  //   }
  // });

  // Template.hello.events({
  //   'click button': function () {
  //     // increment the counter when button is clicked
  //     Session.set('counter', Session.get('counter') + 1);
  //   }
  // });

  Template.map.helpers({  
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(-37.8136, 144.9631),
          zoom: 8
        };
      }
    }
  });

  Template.map.onCreated(function() {  
    GoogleMaps.ready('map', function(map) {
      google.maps.event.addListener(map.instance, 'click', function(event) {
        Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });

      // The code shown below goes here

      var markers = {};

      Markers.find().observe({  
        added: function(document) {
          // Create a marker for this document
          var marker = new google.maps.Marker({
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(document.lat, document.lng),
            map: map.instance,
            // We store the document _id on the marker in order 
            // to update the document within the 'dragend' event below.
            id: document._id,
            data: "Hello World!"
          });

          // This listener lets us drag markers on the map and update their corresponding document.
          google.maps.event.addListener(marker, 'dragend', function(event) {
            Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
          });

          var data = "Hello World!";
          var infowindow = new google.maps.InfoWindow({
            content: data
          });

          // This listener lets us drag markers on the map and update their corresponding document.
          google.maps.event.addListener(marker, 'click', function(event) {
            console.log("click")
            infowindow.open(map.instance,marker);
          });

          // Store this marker instance within the markers object.
          markers[document._id] = marker;
        },
        changed: function(newDocument, oldDocument) {
          markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
        },
        removed: function(oldDocument) {
          // Remove the marker from the map
          markers[oldDocument._id].setMap(null);

          // Clear the event listener
          google.maps.event.clearInstanceListeners(
            markers[oldDocument._id]);

          // Remove the reference to this marker instance
          delete markers[oldDocument._id];
        }
      });

    });
  });


  
}

if (Meteor.isServer) {
  // code here?
}
