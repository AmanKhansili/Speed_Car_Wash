import { FlatList } from "react-native";

import SectionTitle from "../common/SectionTitle";
import ReviewCard from "../cards/ReviewCard";

import { reviews } from "@/constants/data";

export default function Reviews() {
  return (
    <>
      <SectionTitle title="Customer Reviews" />

      <FlatList
        horizontal
        data={reviews}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ReviewCard name={item.name} review={item.review} rating={item.rating} />
        )}
      />
    </>
  );
}
