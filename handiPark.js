Markers = new Mongo.Collection('markers');  

if (Meteor.isClient) {

  Meteor.startup(function() {  
    GoogleMaps.load({ v: '3', key: 'AIzaSyBZqYfroF3i_4LMjKONwTtA9wMbZWs8L1g', libraries: 'geometry,places' });
  });




   // To store the slideout instance.
    var slideout;

    Session.set("settingFlag", false);
    Session.set("settingAdd", false);

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
    'click' : function(){
      $(".details-more").hide("slide", {direction: "down"}, 500);
    },
    'click .report-spot' : function (e) {
      // delete this document
      var documentId = $(e.target).data("id")
      Markers.remove(documentId);
    }

  });

  Template.locationheader.events({
    'click' : function(){
      $(".details-more").hide("slide", {direction: "down"}, 500);
    },
    'click .glyphicon-flag' : function(e){
      var thing = $(e.target).closest(".option")
      thing.toggleClass("highlight", 1000, "easeOutSine");
      console.log("FLAG");
      if(thing.hasClass("highlight")){
        Session.set("settingFlag", true);
        Session.set("settingAdd", false);
        
      }
      // change cursor of mouse
    }
  })

  Template.detailsmore.helpers({
    name: function () {
      return Session.get("name");
    },
    name2: function () {
      return Session.get("name2");
    },
    name3: function () {
      return Session.get("name3");
    },
    dist: function () {
      return Session.get("dist");
    },
    dist2: function () {
      return Session.get("dist2");
    },
    dist3: function () {
      return Session.get("dist3");
    },
  })

  Template.moreheader.events({
    'click' : function(){
      $(".details-more").hide("slide", {direction: "down"}, 500);
    }
  })

  Template.moreheader.events({
    'click' : function(){
      $(".details-more").hide("slide", {direction: "down"}, 500);
    },

    'click .add' : function(e){
      var thing = $(e.target);
      thing.toggleClass("highlight", 1000, "easeOutSine");
      console.log("FLAG2");
      if(thing.hasClass("highlight")){
        console.log("ererek")
        Session.set("settingAdd", true);
        Session.set("settingFlag", false);
      }
      // change cursor of mouse
    },

    'click .details' : function(e){
      var thing = $(e.target);
      thing.toggleClass("highlight", 1000, "easeOutSine");
      console.log("FLAG2");
      if(thing.hasClass("highlight")){
        console.log("here")

        var getDistanceFromLatLonInKm = function(lat1,lon1,lat2,lon2) {
          var R = 6371; // Radius of the earth in km
          var dLat = deg2rad(lat2-lat1);  // deg2rad below
          var dLon = deg2rad(lon2-lon1); 
          var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
          var d = R * c; // Distance in km
          return d;
        }

        var deg2rad = function(deg) {
          return deg * (Math.PI/180)
        }

        var mindist = 100000000000;
        var mindist2 = 100000000001;
        var mindist3 = 100000000002;

        //Get the 3 nearest coords
        var allMarkers  = Markers.find().fetch();
        var minMark = allMarkers[0];
        var minMark2 = allMarkers[1];
        var minMark3 = allMarkers[2];
        allMarkers.forEach(function(m){
          // var x = Session.get("destinationLat") - m.lat;
          // var y = Session.get("destinationLng") - m.lng;

          // var dist = Math.sqrt(x*x + y*y);
          var dist = getDistanceFromLatLonInKm(Session.get("destinationLat"), Session.get("destinationLng"), m.lat, m.lng)
          console.log(dist);

          if(dist<mindist){
            mindist = dist;
            minMark = m;
          } else if(dist < mindist2){
            mindist3 = mindist2;
            minMark3 = minMark2;
            mindist2 = dist;
            minMark2 = m;
          } else if(dist < mindist3){
            mindist3 = dist;
            minMark3 = m;
          }

        })

        Session.set("name", "minMark.name");
        Session.set("name2", "minMark2.name");
        Session.set("name3", "minMark3.name");

        Session.set("dist", Math.round(mindist*100)/100);
        Session.set("dist2", Math.round(mindist2*100)/100);
        Session.set("dist3", Math.round(mindist3*100)/100);
        console.log(mindist)
        console.log(minMark)
        console.log("__")
        console.log(mindist2)
        console.log(minMark2)
        console.log("__")
        console.log(mindist3)
        console.log(minMark3)

        $(".details-more").show("slide", {direction: "down"}, 500);


      }
      // change cursor of mouse
    }
  })

  Template.map.onCreated(function() {  
    // GoogleMaps.load({ v: '3', key: 'AIzaSyBZqYfroF3i_4LMjKONwTtA9wMbZWs8L1g', libraries: 'geometry,places' });
    GoogleMaps.ready('map', function(map) {
      google.maps.event.addListener(map.instance, 'click', function(event) {
        console.log(Session.get("settingAdd"))
        if(!Session.get("settingFlag")){
          if(Session.get("settingAdd")){
            Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
            Session.set("settingAdd", false)
          }
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
              '<div class = "report-spot glyphicon glyphicon-alert" data-id="'+marker.id+'"> ' +
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
