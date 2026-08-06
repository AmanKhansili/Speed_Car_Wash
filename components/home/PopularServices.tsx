import { FlatList } from "react-native";

import SectionTitle from "../common/SectionTitle";
import ServiceCard from "../cards/ServiceCard";

import { services } from "@/constants/data";

export default function PopularServices() {
  return (
    <>
      <SectionTitle title="Popular Services" />

      <FlatList
        data={services}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ServiceCard
            title={item.title}
            subtitle={item.subtitle}
            price={item.price}
            rating={item.rating}
            duration={item.duration}
            image={item.image}
          />
        )}
      />
    </>
  );
}
