Markers = new Mongo.Collection('markers');  

if (Meteor.isClient) {

  Meteor.startup(function() {  
    GoogleMaps.load({ v: '3', key: 'AIzaSyBZqYfroF3i_4LMjKONwTtA9wMbZWs8L1g', libraries: 'geometry,places' });
  });




   // To store the slideout instance.
    var slideout;

    Session.set("settingFlag", false);

    // Router configuration
    Router.configure({
      layoutTemplate: 'MasterLayout'
    });

    // Auto-close the menu on route stop (when navigating to a new route)
    Router.onStop(function () {
      if (slideout) {
        slideout.close();
      }
    });

   //  // Define some routes
    Router.route('/', { name: 'main' });
    Router.route('/test', { name: 'test' });

    // Setup code for Slideout menu in MasterLayout
    Template.MasterLayout.onRendered(function () {
      var template = this;
      slideout = new Slideout({
        'panel': template.$('#content').get(0),
        'menu': template.$('#slideout-menu').get(0),
        'padding': 256,
        'tolerance': 70
      });
    });

    Template.header.events({
      'click .slideout-toggle' : function (){
        console.log("click")
        slideout.toggle();
      }
    })

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

  Template.map.events({
    'click .report-spot' : function (e) {
      // delete this document
      var documentId = $(e.target).data("id")
      Markers.remove(documentId);
    }

  });

  Template.locationheader.events({
    'click .glyphicon-flag' : function(e){

      $(e.target).closest(".option").toggleClass("highlight", 1000, "easeOutSine");
      console.log("FLAG");
      Session.set("settingFlag", true);
      // change cursor of mouse
    }
  })

  Template.map.onCreated(function() {  
    // GoogleMaps.load({ v: '3', key: 'AIzaSyBZqYfroF3i_4LMjKONwTtA9wMbZWs8L1g', libraries: 'geometry,places' });
    GoogleMaps.ready('map', function(map) {
      google.maps.event.addListener(map.instance, 'click', function(event) {
        console.log(Session.get("settingFlag"))
        if(!Session.get("settingFlag")){
          Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        } else {
          var infowindow = new google.maps.InfoWindow();
          var marker = new google.maps.Marker({
            map: map.instance,
            // icon: 'https://cdn4.iconfinder.com/data/icons/maps-and-navigation-solid-icons-vol-3/72/123-128.png'
            icon: 'http://www.megaicons.net/static/img/icons_sizes/8/178/32/maps-and-geolocation-filled-flag-icon.png',
            // icon: 'images/flag3.png'
            position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
          });
          marker.addListener('click', function() {
            infowindow.open(map.instance, marker);
          });

          // Set the position of the marker using the place ID and location.
          // marker.setPlace({
          // });
          marker.setVisible(true);

          Session.set("destinationLat", event.latLng.lat());
          Session.set("destinationLng", event.latLng.lng());

          infowindow.setContent('<div><strong>' + + '</strong><br>' +
              'Place ID: ' + '<br>' 
              );
          infowindow.open(map.instance, marker);
          Session.set("settingFlag", false)
            }
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
            data: {
              title: document.lng,
              info : JSON.stringify(document.lat)
            }
          });

          // This listener lets us drag markers on the map and update their corresponding document.
          google.maps.event.addListener(marker, 'dragend', function(event) {
            Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
          });

          // This listener lets us drag markers on the map and update their corresponding document.
          google.maps.event.addListener(marker, 'click', function(event) {
            console.log("click")

            var html = '<div>' +
              '<div class = "title">' +
                + marker.data.title +
              '</div>' +
              '<div class = "info">' + 
                + marker.data.info +
              '</div>' +
              '<div class = "report-spot" data-id="'+marker.id+'"> ' +
                'Report Spot' +
              '</div>' +
            '</div>'

            var infowindow = new google.maps.InfoWindow({
              content: html
            });
            infowindow.open(map.instance, marker);
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
    
    // console.log("heresdfsdf")
    var input = document.getElementById('pac-input');

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map.instance);

    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map.instance,
      // icon: 'https://cdn4.iconfinder.com/data/icons/maps-and-navigation-solid-icons-vol-3/72/123-128.png'
      icon: 'http://www.megaicons.net/static/img/icons_sizes/8/178/32/maps-and-geolocation-filled-flag-icon.png'
      // icon: 'images/flag3.png'
    });
    marker.addListener('click', function() {
      infowindow.open(map.instance, marker);
    });

    autocomplete.addListener('place_changed', function() {
      infowindow.close();
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        return;
      }

      if (place.geometry.viewport) {
        map.instance.fitBounds(place.geometry.viewport);
      } else {
        map.instance.setCenter(place.geometry.location);
        map.instance.setZoom(17);
      }

      // Set the position of the marker using the place ID and location.
      marker.setPlace({
        placeId: place.place_id,
        location: place.geometry.location
      });
      marker.setVisible(true);

      Session.set("destinationLat", place.geometry.location.G);
      Session.set("destinationLng", place.geometry.location.K);

      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
          'Place ID: ' + place.geometry.location + '<br>' +
          place.formatted_address);
      infowindow.open(map.instance, marker);
    });


    });
  });

  

}

if (Meteor.isServer) {
  // code here?
}
