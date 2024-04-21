import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { FontAwesome } from "@expo/vector-icons";
import { GOOGLE_MAPS_API_KEY } from "@env";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { useSelector } from "react-redux";
import { selectStaffData } from "../redux/slices/StaffSlice";
import { getStaffOrder } from "../services/StaffServices";
import { Colors, Fonts } from "../constants";
import OrderDetailsModal from "../components/models/OrderDetailsModal";
import { orderDelivered } from "../services/OrdersServices";
import Spinner from "../components/Spinner";
const DriverScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const mapRef = useRef();
  const [refresh, setRefresh] = useState(0);
  const markerRef = useRef();
  const { _id } = useSelector(selectStaffData);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denie");
        return;
      }
      const response = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        maximumAge: 10000,
        timeout: 15000,
      });
      const { coords } = response;
      if (order) {
        animate(coords.latitude, coords.longitude);
      }

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
        console.log("order coords", response.data.coords);
        setOrder(response.data);
      } else {
        setOrder(null);
      }
    } catch (err) {
      setOrder(null);
    }
  };
  useEffect(() => {
    getOrder().then(() => getUserLocation());
  }, [refresh]);

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
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  const terminateOrder = async () => {
    setIsLoading(true);
    try {
      const response = await orderDelivered(order._id, _id);
      if (response.status) {
        setOrder(null);

        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
    }
  };
  if (mapLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 18 }}>
          Pas de commandes en cours
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 24,
            marginTop: 12,
          }}
          onPress={() => setRefresh(refresh + 1)}
        >
          <Text>Rafraichir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Spinner visibility={isLoading} />
      {showDetailsModal && (
        <OrderDetailsModal
          visibility={showDetailsModal}
          setVisibility={setShowDetailsModal}
          order={order}
        />
      )}
      <TouchableOpacity
        style={{
          position: "absolute",
          zIndex: 10,
          right: 12,
          top: 12,
          padding: 12,
          backgroundColor: "white",
          borderRadius: 12,
        }}
        onPress={onCenter}
      >
        <FontAwesome name="location-arrow" size={32} color={Colors.primary} />
      </TouchableOpacity>
      <View
        style={{
          position: "absolute",
          zIndex: 10,
          left: 0,
          width: "100%",
          bottom: 12,
          paddingHorizontal: 12,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 16,
          }}
          onPress={terminateOrder}
        >
          <Text style={{ fontFamily: Fonts.LATO_BOLD, fontSize: 18 }}>
            Terminer la commande
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.tgry,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 16,
            marginTop: 8,
          }}
          onPress={() => setShowDetailsModal(true)}
        >
          <Text
            style={{
              fontFamily: Fonts.LATO_BOLD,
              fontSize: 18,
              color: "white",
            }}
          >
            Details de la commande
          </Text>
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
