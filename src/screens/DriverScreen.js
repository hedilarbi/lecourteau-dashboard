import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  AnimatedRegion,
} from "react-native-maps";
import { GOOGLE_MAPS_API_KEY } from "@env";
import * as Location from "expo-location";

const DriverScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const mapRef = useRef();
  const markerRef = useRef();

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        maximumAge: 10000,
        timeout: 15000,
      });
      const userCoords = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      //  animate(userCoords.latitude, userCoords.longitude);
      setUserLocation(userCoords);
      setMapLoading(false);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getUserLocation();
  }, []);

  //   useEffect(() => {
  //     const interval = setInterval(() => {
  //       getUserLocation();
  //     }, 6000);
  //     return () => clearInterval(interval);
  //   }, []);
  //   const animate = (latitude, longitude) => {
  //     const newCoordinate = { latitude, longitude };
  //     if (Platform.OS == "android") {
  //       if (markerRef.current) {
  //         markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
  //       }
  //     } else {
  //       userLocation.timing(newCoordinate).start();
  //     }
  //   };

  //   const onCenter = () => {
  //     mapRef.current.animateToRegion({
  //       latitude: userLocation.latitude,
  //       longitude: userLocation.longitude,
  //       latitudeDelta: LATITUDE_DELTA,
  //       longitudeDelta: LONGITUDE_DELTA,
  //     });
  //   };
  if (mapLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.30303482,
          longitude: 9.86330931,
          latitudeDelta: 0.04,
          longitudeDelta: 0.0421,
        }}
        ref={mapRef}
      >
        <Marker.Animated
          coordinate={userLocation}
          title="You are here"
          description="You are here"
        ></Marker.Animated>
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default DriverScreen;
