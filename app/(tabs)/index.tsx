import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/common/Header";
import SearchBar from "@/components/common/SearchBar";
import Colors from "@/constants/colors";
import HeroBanner from "@/components/home/HeroBanner";

import { ScrollView, StyleSheet } from "react-native";
import PopularServices from "@/components/home/PopularServices";
import MembershipPlans from "@/components/home/MembershipPlans";
import Reviews from "@/components/home/Reviews";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Header />
        <SearchBar />
        <HeroBanner />
        <PopularServices />
        <MembershipPlans />
        <Reviews />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
});
