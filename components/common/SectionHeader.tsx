import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onSearchTextChange?: (text: string) => void;
  showSearchBar?: boolean;
}

export default function SectionHeader({
  title,
  onBackPress,
  onSearchPress,
  onSearchTextChange,
  showSearchBar = true,
}: HeaderProps): React.ReactNode {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const inputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (onSearchTextChange) {
      onSearchTextChange(text);
    }
  };

  const toggleSearch = () => {
    const nextState = !isSearchOpen;
    setIsSearchOpen(nextState);

    if (!nextState) {
      handleSearchChange("");
    }

    if (onSearchPress) onSearchPress();
  };

  // FIX: agar parent se onBackPress nahi mila, to khud navigation.goBack() call karo
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    // @ts-ignore - canGoBack check for safety
    if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.warn(
        "SectionHeader: No onBackPress prop diya gaya aur navigation.goBack() bhi possible nahi hai (pehli screen hai ya navigation ready nahi)."
      );
    }
  };

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  return (
      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>

          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>

          {showSearchBar ? (
            <TouchableOpacity
              style={[
                styles.iconButton,
                isSearchOpen && styles.activeIconButton,
              ]}
              onPress={toggleSearch}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSearchOpen ? "close-outline" : "search-outline"}
                size={22}
                color={isSearchOpen ? "#2563EB" : "#0F172A"}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>

        {showSearchBar && isSearchOpen && (
          <View style={styles.searchBarWrapper}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#94A3B8"
              style={styles.searchIcon}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search services..."
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={handleSearchChange}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange("")}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop:35,
    paddingBottom: 12,
  },
  topRow: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconButton: {
    backgroundColor: "#EFF6FF",
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    flex: 1,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
  },
});