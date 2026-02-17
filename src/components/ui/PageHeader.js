import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Fonts } from "../../constants";

const PageHeader = ({
  title,
  subtitle,
  pills = [],
  rightContent,
  children,
  layout = "stack",
}) => {
  const actions = rightContent || children;
  const isSplit = layout === "split";
  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, isSplit && styles.containerSplit]}
    >
      <View style={[styles.textBlock, isSplit && styles.textBlockSplit]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={styles.title}>{title}</Text>
          {pills.length > 0 && (
            <View style={styles.pillsRow}>
              {pills.map((pill) => (
                <View key={pill.label} style={styles.pill}>
                  <Text style={styles.pillLabel}>{pill.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actions ? (
        <View style={[styles.actions, isSplit && styles.actionsSplit]}>
          {actions}
        </View>
      ) : null}
    </LinearGradient>
  );
};

export default PageHeader;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 0, // prevent the gradient from stretching to fill remaining space
    alignSelf: "stretch",
    borderRadius: 20,
    padding: 18,
    paddingVertical: 20,
    marginTop: 10,

    gap: 14,
    flexGrow: 0,
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },

    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  textBlock: {
    gap: 6,
  },
  textBlockSplit: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: Fonts.BEBAS_NEUE,
    fontSize: 38,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: Fonts.LATO_REGULAR,
    fontSize: 15,
    color: "rgba(255,255,255,0.86)",
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  pillLabel: {
    fontFamily: Fonts.LATO_BOLD,
    fontSize: 13,
    color: "#FFFFFF",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    width: "100%",
  },
  containerSplit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionsSplit: {
    width: "auto",
    flexGrow: 0,
    flexShrink: 0,
    marginLeft: "auto",
    justifyContent: "flex-end",
  },
});
