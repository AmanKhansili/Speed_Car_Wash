const Shadow = {
  // Buttons aur chote elements ke liye
  light: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  // Service Cards ke liye
  card: {
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  // Floating bottom nav ke liye
  heavy: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
  },
};

export default Shadow;
