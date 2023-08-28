import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Colors, Fonts } from "../constants";
const Calender = ({ setDate, date }) => {
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDate(currentDate);
  };

  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: "date",
      is24Hour: true,
    });
  };
  return (
    <TouchableOpacity
      onPress={showDatepicker}
      style={{
        backgroundColor: Colors.primary,
        paddingHorizontal: 25,
        paddingVertical: 10,
        marginLeft: 40,
        borderWidth: 1,
        borderRadius: 5,
      }}
    >
      <Text style={{ fontFamily: Fonts.LATO_REGULAR, fontSize: 18 }}>
        Calendar
      </Text>
    </TouchableOpacity>
  );
};

export default Calender;

const styles = StyleSheet.create({});
