import React, { JSX } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ActivityIndicator from "~/components/ActivityIndicator";
import Background from "~/components/Background";
import Box from "~/components/Box";

export default function Splash(): JSX.Element {
  console.log("inside splash screen")
  return (
    <Background>
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </Box>
    </Background>
  );
}
