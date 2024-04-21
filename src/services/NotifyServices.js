import * as Notifications from "expo-notifications";

import Constants from "expo-constants";
import { API_URL } from "@env";
import { Platform } from "react-native";
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Original Title",
    body: "And here is the body!",
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }
  token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig.extra.eas.projectId,
  });

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [250, 250, 250, 250],
      sound: "notification-sound.wav",
      lightColor: "#F25d58",
    });
  }

  return token;
}

const sendNotifications = async (title, body) => {
  try {
    let notifyResponse = await axios.post(
      `${API_URL}/notifiers/notifications`,
      { title, body }
    );

    if (notifyResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: notifyResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data.message,
    };
  }
};
const sendSMS = async (body) => {
  try {
    let deleteOfferResponse = await axios.post(`${API_URL}/notifiers/sms/`, {
      body,
    });

    if (deleteOfferResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: deleteOfferResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data.message,
    };
  }
};
const sendEmails = async (title, body) => {
  try {
    let deleteOfferResponse = await axios.post(`${API_URL}/notifiers/emails/`, {
      title,
      body,
    });

    if (deleteOfferResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: deleteOfferResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data.message,
    };
  }
};

export {
  registerForPushNotificationsAsync,
  sendPushNotification,
  sendNotifications,
  sendEmails,
  sendSMS,
};
