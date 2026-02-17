import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Colors, Fonts } from "../constants";
const Calender = ({ setDate, date, style, textStyle }) => {
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
      style={[styles.button, style]}
    >
      <Text style={[styles.buttonText, textStyle]}>
        {date.toLocaleDateString("fr-FR")}
      </Text>
    </TouchableOpacity>
  );
};

export default Calender;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 18,
  },
});
