import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 32;

const bannerData = [
  {
    id: "1",
    title: "Professional\nCar Wash",
    sub: "At Your Doorstep",
    color: "#0B1033",
    image: require("@/assets/images/hero-car.png"),
  },
  {
    id: "2",
    title: "Premium\nCeramic Coating",
    sub: "Long-lasting Shine",
    color: "#1A1B41",
    image: require("@/assets/images/banner3.png"),
    imageStyle: { right: -50, top: 5, width: 350, height: 300 },
  },
  {
    id: "3",
    title: "Deep Interior\nSanitization",
    sub: "Kills 99% Germs",
    color: "#131039",
    image: require("@/assets/images/banner2.png"),
    imageStyle: { right: -50, top: -35, width: 300, height: 270 },
  },
];

export default function HeroBanner() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentIndex === bannerData.length - 1 ? 0 : currentIndex + 1;
      
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3500);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const renderItem = ({ item }: { item: (typeof bannerData)[0] }) => (
    <View style={[styles.card, { backgroundColor: item.color }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub}>{item.sub}</Text>
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      <Image
        source={item.image}
        style={[styles.bannerImage, item.imageStyle]}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={bannerData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        // 2. Agar layout render na hua ho toh crash se bachane ke liye
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
      <View style={styles.pagination}>
        {bannerData.map((_, index) => (
          <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  card: {
    width: BANNER_WIDTH,
    height: 180,
    borderRadius: Radius.xl,
    marginHorizontal: 16,
    padding: 24,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  content: { zIndex: 2, maxWidth: "60%" },
  title: { fontSize: 18, fontWeight: "800", color: "#FFF", lineHeight: 24, marginBottom: 8 },
  sub: { fontSize: 12, color: "#D1D5DB", marginBottom: 16 },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.md,
    alignSelf: "flex-start",
  },
  btnText: { color: "#FFF", fontSize: 12, fontWeight: "700" },

  bannerImage: {
    position: "absolute",
    right: -70,
    top: -20,
    width: 350,
    height: 250,
    zIndex: 1,
  },

  pagination: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D5DB", marginHorizontal: 4 },
  activeDot: { width: 16, backgroundColor: Colors.primary },
});