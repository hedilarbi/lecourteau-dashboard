import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  Image,
  Touchable,
  TouchableOpacity,
  Text,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  AnimatedRegion,
} from "react-native-maps";
import { GOOGLE_MAPS_API_KEY } from "@env";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import { getStaffOrder } from "../services/StaffServices";
import { Colors, Fonts } from "../constants";
const DriverScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const mapRef = useRef();
  const markerRef = useRef();
  const { _id } = useSelector(selectStaffData);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }
      const response = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        maximumAge: 10000,
        timeout: 15000,
      });
      const { coords } = response;
      animate(coords.latitude, coords.longitude);

      setUserLocation(coords);
      setMapLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getOrder = async () => {
    try {
      const response = await getStaffOrder(_id);
      if (response.status) {
        setOrder(response.data);
      } else {
        console.log(response.message);
      }
    } catch (err) {
      console.log(err.message);
    }
  };
  useEffect(() => {
    getOrder().then(() => getUserLocation());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getUserLocation();
    }, 6000);
    return () => clearInterval(interval);
  }, []);
  const animate = (latitude, longitude) => {
    const newCoordinate = { latitude, longitude };
    if (Platform.OS == "android") {
      if (markerRef.current) {
        markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
      }
    } else {
      userLocation.timing(newCoordinate).start();
    }
  };

  const onCenter = () => {
    mapRef.current.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };
  if (mapLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ position: "absolute", zIndex: 10 }}>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 12,
          }}
        >
          <Text style={{ fontFamily: Fonts.LATO_BOLD }}>Livraison terminé</Text>
        </TouchableOpacity>
      </View>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        ref={mapRef}
      >
        <Marker.Animated
          coordinate={userLocation}
          title="You are here"
          description="You are here"
        >
          <Image
            source={require("../../assets/deliveryMan.png")}
            style={{ width: 50, height: 50, resizeMode: "cover" }}
          />
        </Marker.Animated>
        <Marker
          coordinate={order.coords}
          image={require("../../assets/greenMarker.png")}
        >
          <Image
            source={require("../../assets/marker.png")}
            style={{ width: 50, height: 50, resizeMode: "cover" }}
          />
        </Marker>
        <MapViewDirections
          origin={userLocation}
          destination={order.coords}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeColor="hotpink"
          strokeWidth={3}
          optimizeWaypoints={true}
          onReady={(result) => {
            mapRef.current.fitToCoordinates(result.coordinates, {
              edgePadding: {
                right: 50,
                bottom: 50,
                left: 50,
                top: 50,
              },
            });
          }}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default DriverScreen;
