// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Platform,
//   PermissionsAndroid,
// } from "react-native";
// import React, { useState } from "react";
// import {
//   usePrintersDiscovery,
//   Printer,
//   PrinterConstants,
//   DiscoveryFilterOption,
// } from "react-native-esc-pos-printer";

// const TestPrinter = () => {
//   const { start, printers, isDiscovering } = usePrintersDiscovery();
//   const [hasSearched, setHasSearched] = useState(false);
//   const [isPrinting, setIsPrinting] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);
//   const [receiptTitle, setReceiptTitle] = useState("My Store");
//   const [receiptItems, setReceiptItems] = useState([
//     { name: "Product 1", price: "9.99", quantity: 1 },
//     { name: "Product 2", price: "15.50", quantity: 2 },
//   ]);

//   async function ensureBtPermissions() {
//     if (Platform.OS !== "android") return true;
//     const api = Number(Platform.Version);
//     try {
//       if (api >= 31) {
//         const res = await PermissionsAndroid.requestMultiple([
//           PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
//           PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
//         ]);
//         return Object.values(res).every(
//           (v) => v === PermissionsAndroid.RESULTS.GRANTED
//         );
//       } else {
//         // Needed for BT discovery on Android 10–11
//         const res = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
//         );
//         return res === PermissionsAndroid.RESULTS.GRANTED;
//       }
//     } catch {
//       return false;
//     }
//   }

//   const searchPrinters = async () => {
//     try {
//       const ok = await ensureBtPermissions();
//       if (!ok) {
//         Alert.alert(
//           "Permissions required",
//           "Bluetooth permissions are needed to scan."
//         );
//         return;
//       }
//       start({
//         timeout: 5000,
//         filterOption: {
//           deviceModel: DiscoveryFilterOption.MODEL_ALL,
//         },
//       });
//       console.log("Recherche d'imprimantes démarrée", printers);
//       setHasSearched(true);
//     } catch (error) {
//       console.error("Error starting printer discovery:", error);
//     }
//   };

//   const printReceipt = async (printer) => {
//     setIsPrinting(true);
//     printerInstance = new Printer({
//       target: printer.target,
//       deviceName: printer.deviceName,
//     });

//     try {
//       const res = await printerInstance.addQueueTask(async () => {
//         await Printer.tryToConnectUntil(
//           printerInstance,
//           (status) => status.online.statusCode === PrinterConstants.TRUE
//         );

//         // header
//         await printerInstance.addTextSmooth(PrinterConstants.TRUE);
//         await printerInstance.addTextAlign(PrinterConstants.ALIGN_LEFT);
//         await printerInstance.addTextStyle({ em: PrinterConstants.TRUE });
//         await printerInstance.addTextSize({ width: 2, height: 2 });
//         await printerInstance.addText(receiptTitle);
//         await printerInstance.addFeedLine(2);

//         await printerInstance.addTextStyle({ em: PrinterConstants.FALSE });
//         await printerInstance.addTextSize({ width: 1, height: 1 });
//         await printerInstance.addText("Address here");
//         await printerInstance.addFeedLine(2);

//         // Item Details
//         for (const item of receiptItems) {
//           await printerInstance.addTextStyle({ em: PrinterConstants.TRUE });
//           await Printer.addTextLine(printerInstance, {
//             left: `${item.name} x${item.quantity}`,
//             right: `$${item.price}`,
//           });
//         }

//         await printerInstance.addFeedLine(2);

//         await printerInstance.addTextAlign(PrinterConstants.ALIGN_CENTER);
//         await printerInstance.addTextSize({ width: 1, height: 1 });
//         await printerInstance.addText(`Total: $12`);
//         await printerInstance.addFeedLine(2);

//         await printerInstance.addTextAlign(PrinterConstants.ALIGN_CENTER);
//         await printerInstance.addTextSize({ width: 1, height: 1 });
//         await printerInstance.addText("Thank you!");
//         await printerInstance.addFeedLine(2);

//         await printerInstance.addTextAlign(PrinterConstants.ALIGN_CENTER);
//         await printerInstance.addTextSize({ width: 1, height: 1 });
//         await printerInstance.addText(
//           "Powered by React Native Esc Pos Printer"
//         );
//         await printerInstance.addFeedLine(2);

//         // Cut Paper
//         await printerInstance.addCut();

//         const result = await printerInstance.sendData();
//         await printerInstance.disconnect();
//         return result;
//       });

//       if (res) {
//         Alert.alert("Success", "Receipt printed successfully");
//       }
//     } catch (e) {
//       await printerInstance.disconnect();
//       Alert.alert("Error", "Printing failed", e.message || "Unknown error");
//     } finally {
//       setIsPrinting(false);
//     }
//   };
//   return (
//     <View style={{ padding: 24, flex: 1 }}>
//       <TouchableOpacity onPress={searchPrinters}>
//         <Text>
//           {isDiscovering ? "Recherche en cours..." : "Démarrer la recherche"}
//         </Text>
//       </TouchableOpacity>
//       {hasSearched && printers.length === 0 && !isDiscovering ? (
//         <Text>Aucun imprimante trouvée</Text>
//       ) : (
//         printers.map((printer, index) => (
//           <View key={index} style={{ marginVertical: 10 }}>
//             <TouchableOpacity onPress={() => printReceipt(printer)}>
//               <Text>Nom: {printer.name}</Text>
//               <Text>
//                 {isPrinting ? "Impression en cours..." : "Imprimer reçu"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         ))
//       )}
//     </View>
//   );
// };

// export default TestPrinter;

import { View, Text } from "react-native";
import React from "react";

const TestPrinter = () => {
  return (
    <View>
      <Text>TestPrinter</Text>
    </View>
  );
};

export default TestPrinter;
