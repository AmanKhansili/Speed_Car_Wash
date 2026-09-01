import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

interface RazorpayModalProps {
  visible: boolean;
  options: {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
  } | null;
  onSuccess: (data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (error: any) => void;
  onClose: () => void;
}

export default function RazorpayModal({
  visible,
  options,
  onSuccess,
  onFailure,
  onClose,
}: RazorpayModalProps) {
  if (!options || !visible) return null;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body style="margin:0;padding:0;background-color:#F8FAFC;">
        <script>
          var options = ${JSON.stringify(options)};
          options.handler = function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_SUCCESS',
              data: response
            }));
          };
          options.modal = {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_CLOSED'
              }));
            }
          };

          var rzp1 = new Razorpay(options);
          rzp1.on('payment.failed', function (response){
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_FAILED',
              error: response.error
            }));
          });

          window.onload = function() {
            rzp1.open();
          };
        </script>
      </body>
    </html>
  `;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Payment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <WebView
          source={{ html: htmlContent }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(event) => {
            try {
              const res = JSON.parse(event.nativeEvent.data);
              if (res.type === "PAYMENT_SUCCESS") {
                onSuccess(res.data);
              } else if (res.type === "PAYMENT_FAILED") {
                onFailure(res.error);
              } else if (res.type === "PAYMENT_CLOSED") {
                onClose();
              }
            } catch (err) {
              console.error("WebView message parse error:", err);
            }
          }}
          style={styles.webview}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  closeBtn: { padding: 4 },
  webview: { flex: 1 },
});
