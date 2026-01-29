// import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
// import {
//   Alert,
//   InteractionManager,
//   Linking,
//   Platform,
//   StyleSheet,
//   useWindowDimensions,
//   View,
// } from "react-native";
// import * as Location from "expo-location";
// import { DeepNonNullable, PromiseType } from "utility-types";
// import MapView, {
//   Marker,
//   Region as MapRegion,
//   PROVIDER_GOOGLE,
// } from "react-native-maps";
// import { RouteProp, useRoute } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { SettingsNavigatorRouteList } from "~/navigators/SettingsNavigator";

// import {
//   Screen_Settings_Away_LocationFragment as LocationType,
//   WithQueryDataProps,
//   GoBack,
//   useAwayLocationQuery,
//   withQueryData,
// } from "~/graph";

// import i18n from "~/i18n";
// import {
//   ensureOrRequestNotificationsPermissions,
//   getNotificationPermissionsAsyncWithoutPrompting,
// } from "~/utils/notifications";
// import {
//   addRegion,
//   currentGeofence,
//   removeRegion,
// } from "~/utils/background-tasks";

// import { useTheme } from "~/theme";
// import Box from "~/components/Box";
// import Screen from "~/components/Screen";
// import Text from "~/components/Text";
// import ToggleBlock from "~/components/ToggleBlock";

// import {
//   geofenceForLocation,
//   hasBackgroundLocation,
//   askBackgroundLocation,
//   latDeltaToMeters,
// } from "./helpers";

// const CIRCLE_PADDING = 60;

// const styles = StyleSheet.create({
//   map: { height: 300 },
//   circle: {
//     ...StyleSheet.absoluteFillObject,
//     left: CIRCLE_PADDING / 2,
//     top: CIRCLE_PADDING / 2,
//     borderWidth: 3,
//   },
// });

// const scope = "Screens.Authenticated.SettingsNavigator.Geofence";

// type Region = PromiseType<ReturnType<typeof geofenceForLocation>>;
// type LocationWithCoords =
//   LocationType & DeepNonNullable<Pick<LocationType, "lat" | "lng">>;

// function isLocationWithCoords(
//   location: LocationType
// ): location is LocationWithCoords {
//   return location.lat != null && location.lng != null;
// }

// export type GeofenceProps = {
//   navigation: NativeStackNavigationProp<
//     SettingsNavigatorRouteList,
//     "Geofence"
//   >;
//   route: RouteProp<SettingsNavigatorRouteList, "Geofence">;
// } & WithQueryDataProps<typeof useAwayLocationQuery>;

// function Geofence({ data }: GeofenceProps): JSX.Element {
//   const { colors } = useTheme();
//   const { width } = useWindowDimensions();

//   const location = data.location;

//   if (!location || !isLocationWithCoords(location)) {
//     throw new GoBack();
//   }

//   const [tabletWidth, setTabletWidth] = useState(width);
//   const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

//   // 🔑 Derived UI state (null = loading)
//   const [notificationEnabled, setNotificationEnabled] = useState<boolean | null>(null);

//   // map lifecycle
//   const [mapLaidOut, setMapLaidOut] = useState(false);
//   const [centeredOnce, setCenteredOnce] = useState(false);
//   const [canRenderMap, setCanRenderMap] = useState(false);

//   const mapViewRef = useRef<MapView | null>(null);

//   const regionRef = useRef<Region>({
//     identifier: location.id,
//     latitude: location.lat,
//     longitude: location.lng,
//     radius: 1000,
//   });

//   const initialRegion: MapRegion = {
//     latitude: location.lat,
//     longitude: location.lng,
//     latitudeDelta: 0.02,
//     longitudeDelta: 0.02,
//   };

//   // Foreground location permission (for user dot)
//   useEffect(() => {
//     void (async () => {
//       const { granted } = await Location.getForegroundPermissionsAsync();
//       setLocationPermissionGranted(granted);
//     })();
//   }, []);

//   // Delay MapView mount until after nav interactions
//   useEffect(() => {
//     const task = InteractionManager.runAfterInteractions(() => {
//       requestAnimationFrame(() => setCanRenderMap(true));
//     });
//     return () => task.cancel();
//   }, []);

//   // Center map once layout + mount are ready
//   useEffect(() => {
//     if (!mapLaidOut || centeredOnce || !mapViewRef.current || tabletWidth === 0) return;

//     const timeout = setTimeout(() => {
//       mapViewRef.current?.animateToRegion(initialRegion, 0);
//       setCenteredOnce(true);
//     }, 200);

//     return () => clearTimeout(timeout);
//   }, [mapLaidOut, centeredOnce, tabletWidth, initialRegion]);

//   // 🔑 DERIVE toggle state from real system + background state
//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       const [notificationsEnabled, backgroundLocation] = await Promise.all([
//         getNotificationPermissionsAsyncWithoutPrompting(),
//         hasBackgroundLocation(),
//       ]);

//       if (!mounted) return;

//       if (notificationsEnabled && backgroundLocation) {
//         const current = await currentGeofence(location.id);
//         if (mounted) setNotificationEnabled(!!current);
//       } else {
//         if (mounted) setNotificationEnabled(false);
//         void removeRegion(location.id);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [location.id]);

//   // Toggle handler (restored from old version)
//   const handleNotificationValueChange = useCallback(
//     async (enabled: boolean): Promise<void> => {
//       if (!regionRef.current) {
//         setNotificationEnabled(false);
//         return;
//       }

//       if (!enabled) {
//         setNotificationEnabled(false);
//         void removeRegion(location.id);
//         return;
//       }

//       setNotificationEnabled(true);

//       const notificationsEnabled = await ensureOrRequestNotificationsPermissions();
//       if (!notificationsEnabled) {
//         setNotificationEnabled(false);
//         return;
//       }

//       const backgroundLocation = await askBackgroundLocation();
//       setLocationPermissionGranted(backgroundLocation);

//       if (!backgroundLocation) {
//         Alert.alert(
//           i18n.t("locationPermissionAlert.title", { scope }),
//           i18n.t("locationPermissionAlert.message", {
//             scope,
//             appName: "IntelliComfort",
//           }),
//           [
//             {
//               text: i18n.t("locationPermissionAlert.openSettings", { scope }),
//               onPress: () => Linking.openSettings(),
//             },
//           ],
//           { cancelable: false }
//         );
//         setNotificationEnabled(false);
//         return;
//       }

//       void addRegion(regionRef.current);
//     },
//     [location.id]
//   );

//   const onRegionChange = useCallback(
//     (mapRegion: MapRegion) => {
//       if (!centeredOnce) return;

//       regionRef.current = {
//         identifier: location.id,
//         latitude: mapRegion.latitude,
//         longitude: mapRegion.longitude,
//         radius: latDeltaToMeters(mapRegion.latitudeDelta) / 2,
//       };
//     },
//     [location.id, centeredOnce]
//   );

//   const onTouchEnd = useCallback(() => {
//     if (!regionRef.current || !notificationEnabled) return;
//     void addRegion(regionRef.current);
//   }, [notificationEnabled]);

//   return (
//     <Screen paddingHorizontal="z">
//       <Box paddingHorizontal="l">
//         {Platform.OS === "android" && (
//           <Box marginBottom="m">
//             <Text marginBottom="s" marginTop="s" variant="heading">
//               {i18n.t("disclosureTitle", { scope })}
//             </Text>
//             <Text marginBottom="s">
//               {i18n.t("disclosureDescription", {
//                 scope,
//                 appName: "IntelliComfort",
//               })}
//             </Text>
//           </Box>
//         )}

//         <ToggleBlock
//           title={i18n.t("reminder", { scope })}
//           value={!!notificationEnabled}
//           disabled={notificationEnabled === null}
//           onValueChange={handleNotificationValueChange}
//           body={i18n.t("getNotificationDescription", { scope })}
//         />
//       </Box>

//       <View
//         onLayout={({ nativeEvent: { layout } }) => {
//           setTabletWidth(layout.width);
//           setMapLaidOut(true);
//         }}
//       >
//         {canRenderMap && (
//           <MapView
//             ref={mapViewRef}
//             provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
//             style={[styles.map, { width: tabletWidth, height: tabletWidth }]}
//             initialRegion={initialRegion}
//             onRegionChange={onRegionChange}
//             onTouchEnd={onTouchEnd}
//             mapType={Platform.select({
//               ios: "mutedStandard",
//               default: "standard",
//             })}
//             moveOnMarkerPress={false}
//             minZoomLevel={7}
//             maxZoomLevel={15}
//             pitchEnabled={false}
//             rotateEnabled={false}
//             scrollEnabled
//             toolbarEnabled={false}
//             zoomControlEnabled
//             zoomEnabled
//             showsBuildings={false}
//             showsMyLocationButton={locationPermissionGranted}
//             showsScale
//             showsUserLocation={locationPermissionGranted}
//           >
//             <Marker
//               coordinate={{
//                 latitude: location.lat,
//                 longitude: location.lng,
//               }}
//               title={location.name}
//             />
//           </MapView>
//         )}

//         <View
//           pointerEvents="none"
//           style={[
//             styles.circle,
//             {
//               backgroundColor: colors.mapBackground,
//               borderColor: colors.mapBorder,
//               width: tabletWidth - CIRCLE_PADDING,
//               height: tabletWidth - CIRCLE_PADDING,
//               borderRadius: width / 2,
//             },
//           ]}
//         />
//       </View>
//     </Screen>
//   );
// }

// export default withQueryData(useAwayLocationQuery, {
//   useVariables() {
//     const route = useRoute<GeofenceProps["route"]>();
//     return useMemo(
//       () => ({ locationId: route.params.locationId }),
//       [route.params.locationId]
//     );
//   },
// })(Geofence);

import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  InteractionManager,
  Linking,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from "expo-location";
import { DeepNonNullable, PromiseType } from "utility-types";
import MapView, {
  Marker,
  Region as MapRegion,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { RouteProp, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingsNavigatorRouteList } from "~/navigators/SettingsNavigator";

import {
  Screen_Settings_Away_LocationFragment as LocationType,
  WithQueryDataProps,
  GoBack,
  useAwayLocationQuery,
  withQueryData,
} from "~/graph";

import i18n from "~/i18n";
import {
  ensureOrRequestNotificationsPermissions,
  getNotificationPermissionsAsyncWithoutPrompting,
} from "~/utils/notifications";
import {
  addRegion,
  currentGeofence,
  removeRegion,
} from "~/utils/background-tasks";

import { useTheme } from "~/theme";
import Box from "~/components/Box";
import Screen from "~/components/Screen";
import Text from "~/components/Text";
import ToggleBlock from "~/components/ToggleBlock";

import {
  geofenceForLocation,
  hasBackgroundLocation,
  askBackgroundLocation,
  latDeltaToMeters,
} from "./helpers";

const CIRCLE_PADDING = 60;

const styles = StyleSheet.create({
  map: { height: 300 },
  circle: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    left: CIRCLE_PADDING / 2,
    top: CIRCLE_PADDING / 2,
    borderWidth: 3,
  },
});

const scope = "Screens.Authenticated.SettingsNavigator.Geofence";

type Region = PromiseType<ReturnType<typeof geofenceForLocation>>;
type LocationWithCoords =
  LocationType & DeepNonNullable<Pick<LocationType, "lat" | "lng">>;

function isLocationWithCoords(
  location: LocationType
): location is LocationWithCoords {
  return location.lat != null && location.lng != null;
}

export type GeofenceProps = {
  navigation: NativeStackNavigationProp<
    SettingsNavigatorRouteList,
    "Geofence"
  >;
  route: RouteProp<SettingsNavigatorRouteList, "Geofence">;
} & WithQueryDataProps<typeof useAwayLocationQuery>;

interface SavedMapState {
  latitude: number;
  longitude: number;
  radius: number;
}

function Geofence({ data }: GeofenceProps): JSX.Element {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const location = data.location;

  if (!location || !isLocationWithCoords(location)) {
    throw new GoBack();
  }

  const [tabletWidth, setTabletWidth] = useState(width);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  // 🔑 Derived UI state (null = loading)
  const [notificationEnabled, setNotificationEnabled] = useState<boolean | null>(null);

  // map lifecycle
  const [mapLaidOut, setMapLaidOut] = useState(false);
  const [centeredOnce, setCenteredOnce] = useState(false);
  const [canRenderMap, setCanRenderMap] = useState(false);
  const [savedMapState, setSavedMapState] = useState<SavedMapState | null>(null);
  const [mapStateLoaded, setMapStateLoaded] = useState(false);

  const mapViewRef = useRef<MapView | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedStateRef = useRef<SavedMapState | null>(null);
  const skipNextRegionChange = useRef(true); // Skip the initial region change from centering

  const regionRef = useRef<Region>({
    identifier: location.id,
    latitude: location.lat,
    longitude: location.lng,
    radius: 1000,
  });

  const initialRegion: MapRegion = useMemo(() => {
    const state = savedMapState || {
      latitude: location.lat,
      longitude: location.lng,
      radius: 1000
    };
    
    const latitudeDelta = (state.radius * 2) / 111000; // Convert meters to degrees
    
    return {
      latitude: state.latitude,
      longitude: state.longitude,
      latitudeDelta: latitudeDelta || 0.02, // Fallback to 0.02 if calculation fails
      longitudeDelta: latitudeDelta || 0.02,
    };
  }, [location.lat, location.lng, savedMapState]);

  // Load saved map state on mount
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(`geofence_state_${location.id}`);
        console.log('Loaded map state from AsyncStorage:', saved);
        if (saved && mounted) {
          const state: SavedMapState = JSON.parse(saved);
          setSavedMapState(state);
          regionRef.current = {
            identifier: location.id,
            latitude: state.latitude,
            longitude: state.longitude,
            radius: state.radius,
          };
          lastSavedStateRef.current = state;
          console.log('Applied saved map state:', state);
        }
      } catch (e) {
        console.error('Failed to load saved map state:', e);
      } finally {
        if (mounted) setMapStateLoaded(true);
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, [location.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Foreground location permission (for user dot)
  useEffect(() => {
    void (async () => {
      const { granted } = await Location.getForegroundPermissionsAsync();
      setLocationPermissionGranted(granted);
    })();
  }, []);

  // Delay MapView mount until after nav interactions
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => setCanRenderMap(true));
    });
    return () => task.cancel();
  }, []);

  // Center map once layout + mount are ready
  useEffect(() => {
    if (!mapLaidOut || centeredOnce || tabletWidth === 0) return;

    console.log('Setting centeredOnce to true after map layout');
    
    const timeout = setTimeout(() => {
      // Android needs manual centering, iOS uses initialRegion
      if (Platform.OS === 'android' && mapViewRef.current) {
        console.log('Android: Animating to region', initialRegion);
        mapViewRef.current.animateToRegion(initialRegion, 0);
      }
      setCenteredOnce(true);
      console.log('Map ready for user interaction');
    }, 500);

    return () => clearTimeout(timeout);
  }, [mapLaidOut, centeredOnce, tabletWidth, initialRegion]);

  // DERIVE toggle state from real system + background state
  useEffect(() => {
    let mounted = true;

    (async () => {
      const [notificationsEnabled, backgroundLocation] = await Promise.all([
        getNotificationPermissionsAsyncWithoutPrompting(),
        hasBackgroundLocation(),
      ]);

      if (!mounted) return;

      if (notificationsEnabled && backgroundLocation) {
        const current = await currentGeofence(location.id);
        if (mounted) setNotificationEnabled(!!current);
      } else {
        if (mounted) setNotificationEnabled(false);
        void removeRegion(location.id);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [location.id]);

  // Toggle handler
  const handleNotificationValueChange = useCallback(
    async (enabled: boolean): Promise<void> => {
      if (!regionRef.current) {
        setNotificationEnabled(false);
        return;
      }

      if (!enabled) {
        setNotificationEnabled(false);
        void removeRegion(location.id);
        return;
      }

      setNotificationEnabled(true);

      const notificationsEnabled = await ensureOrRequestNotificationsPermissions();
      if (!notificationsEnabled) {
        setNotificationEnabled(false);
        return;
      }

      const backgroundLocation = await askBackgroundLocation();
      setLocationPermissionGranted(backgroundLocation);

      if (!backgroundLocation) {
        Alert.alert(
          i18n.t("locationPermissionAlert.title", { scope }),
          i18n.t("locationPermissionAlert.message", {
            scope,
            appName: "IntelliComfort",
          }),
          [
            {
              text: i18n.t("locationPermissionAlert.openSettings", { scope }),
              onPress: () => Linking.openSettings(),
            },
          ],
          { cancelable: false }
        );
        setNotificationEnabled(false);
        return;
      }

      void addRegion(regionRef.current);
    },
    [location.id]
  );

  // iOS-specific: handle region change complete
  const handleRegionChangeComplete = useCallback(async (region: MapRegion) => {
    if (Platform.OS === 'android') return;
    
    console.log('iOS region change complete', { 
      centeredOnce, 
      skipNext: skipNextRegionChange.current,
      regionData: region 
    });
    
    // Skip the first region change event (from initial centering)
    if (skipNextRegionChange.current) {
      console.log('Skipping - initial region change from initialRegion prop');
      skipNextRegionChange.current = false;
      return;
    }
    
    if (!centeredOnce) {
      console.log('Skipping - waiting for map to be ready for interaction');
      return;
    }
    
    // Debounce - clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Calculate radius from latitudeDelta (works on both platforms)
        const newRadius = latDeltaToMeters(region.latitudeDelta);
        
        const newState: SavedMapState = {
          latitude: region.latitude,
          longitude: region.longitude,
          radius: newRadius,
        };
        
        console.log('📐 Calculated new map state:', newState);
        
        // Only save if state has changed significantly
        if (lastSavedStateRef.current) {
          const radiusChanged = Math.abs(newRadius - lastSavedStateRef.current.radius) >= 10;
          const latChanged = Math.abs(region.latitude - lastSavedStateRef.current.latitude) >= 0.0001;
          const lngChanged = Math.abs(region.longitude - lastSavedStateRef.current.longitude) >= 0.0001;
          
          console.log('Checking changes:', { radiusChanged, latChanged, lngChanged });
          
          if (!radiusChanged && !latChanged && !lngChanged) {
            console.log('Skipping save - map state unchanged');
            return;
          }
        }
        
        regionRef.current = {
          identifier: location.id,
          latitude: newState.latitude,
          longitude: newState.longitude,
          radius: newState.radius,
        };
        
        await AsyncStorage.setItem(
          `geofence_state_${location.id}`,
          JSON.stringify(newState)
        );
        lastSavedStateRef.current = newState;
        console.log('Saved map state to AsyncStorage:', newState);
        
        if (notificationEnabled) {
          void addRegion(regionRef.current);
        }
      } catch (error) {
        console.error('Error in handleRegionChangeComplete:', error);
      }
    }, 500);
  }, [location.id, notificationEnabled, centeredOnce]);

  // Android-specific: handle touch end to capture region after pan/zoom
  const handleTouchEnd = useCallback(async () => {
    if (Platform.OS === 'ios' || !mapViewRef.current || !centeredOnce) return;
    
    console.log('Android touch end - getting current region');
    
    // Debounce - clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Get the current camera/region from the map
        const camera = await mapViewRef.current?.getCamera();
        
        if (!camera) {
          console.log('Could not get camera');
          return;
        }
        
        console.log('Got camera:', camera);
        
        // For Android Google Maps, we need to calculate the region from camera
        // The camera.zoom property gives us the zoom level
        const latitude = camera.center.latitude;
        const longitude = camera.center.longitude;
        
        // Calculate latitudeDelta from zoom level and screen height
        // Google Maps zoom: level 0 = whole world, each level doubles detail
        const metersPerPixel = 156543.03392 * Math.cos(latitude * Math.PI / 180) / Math.pow(2, camera.zoom || 10);
        const newRadius = (tabletWidth / 2) * metersPerPixel;
        
        const newState: SavedMapState = {
          latitude,
          longitude,
          radius: newRadius,
        };
        
        console.log('📐 Calculated new map state from camera:', newState);
        
        // Only save if state has changed significantly
        if (lastSavedStateRef.current) {
          const radiusChanged = Math.abs(newRadius - lastSavedStateRef.current.radius) >= 10;
          const latChanged = Math.abs(latitude - lastSavedStateRef.current.latitude) >= 0.0001;
          const lngChanged = Math.abs(longitude - lastSavedStateRef.current.longitude) >= 0.0001;
          
          console.log('🔍 Checking changes:', { radiusChanged, latChanged, lngChanged });
          
          if (!radiusChanged && !latChanged && !lngChanged) {
            console.log('⏭️ Skipping save - map state unchanged');
            return;
          }
        }
        
        regionRef.current = {
          identifier: location.id,
          latitude: newState.latitude,
          longitude: newState.longitude,
          radius: newState.radius,
        };
        
        await AsyncStorage.setItem(
          `geofence_state_${location.id}`,
          JSON.stringify(newState)
        );
        lastSavedStateRef.current = newState;
        console.log('✅ Saved map state to AsyncStorage:', newState);
        
        if (notificationEnabled) {
          void addRegion(regionRef.current);
        }
      } catch (error) {
        console.error('❌ Error in handleTouchEnd:', error);
      }
    }, 300);
  }, [location.id, notificationEnabled, centeredOnce, tabletWidth]);

  return (
    <Screen paddingHorizontal="z">
      <Box paddingHorizontal="l">
        {Platform.OS === "android" && (
          <Box marginBottom="m">
            <Text marginBottom="s" marginTop="s" variant="heading">
              {i18n.t("disclosureTitle", { scope })}
            </Text>
            <Text marginBottom="s">
              {i18n.t("disclosureDescription", {
                scope,
                appName: "IntelliComfort",
              })}
            </Text>
          </Box>
        )}

        <ToggleBlock
          title={i18n.t("reminder", { scope })}
          value={!!notificationEnabled}
          disabled={notificationEnabled === null}
          onValueChange={handleNotificationValueChange}
          body={i18n.t("getNotificationDescription", { scope })}
        />
      </Box>

      <View
        onLayout={({ nativeEvent: { layout } }) => {
          setTabletWidth(layout.width);
          setMapLaidOut(true);
        }}
      >
        {canRenderMap && (
          <MapView
            ref={mapViewRef}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            style={[styles.map, { width: tabletWidth, height: tabletWidth }]}
            initialRegion={initialRegion}
            onRegionChangeComplete={handleRegionChangeComplete}
            onTouchEnd={handleTouchEnd}
            mapType={Platform.select({
              ios: "mutedStandard",
              default: "standard",
            })}
            moveOnMarkerPress={false}
            minZoomLevel={7}
            maxZoomLevel={15}
            pitchEnabled={false}
            rotateEnabled={false}
            scrollEnabled
            toolbarEnabled={false}
            zoomControlEnabled
            zoomEnabled
            showsBuildings={false}
            showsMyLocationButton={locationPermissionGranted}
            showsScale
            showsUserLocation={locationPermissionGranted}
          >
            <Marker
              coordinate={{
                latitude: location.lat,
                longitude: location.lng,
              }}
              title={location.name}
              pinColor="red"
              zIndex={2}
            />
          </MapView>
        )}

        <View
          pointerEvents="none"
          style={[
            styles.circle,
            {
              backgroundColor: colors.mapBackground,
              borderColor: colors.mapBorder,
              width: tabletWidth - CIRCLE_PADDING,
              height: tabletWidth - CIRCLE_PADDING,
              borderRadius: width / 2,
            },
          ]}
        />
      </View>
    </Screen>
  );
}

export default withQueryData(useAwayLocationQuery, {
  useVariables() {
    const route = useRoute<GeofenceProps["route"]>();
    return useMemo(
      () => ({ locationId: route.params.locationId }),
      [route.params.locationId]
    );
  },
})(Geofence);