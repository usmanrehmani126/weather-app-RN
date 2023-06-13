import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { theme } from "../theme";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { MagnifyingGlassIcon, XMarkIcon } from "react-native-heroicons/outline";
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../api/apiKey";
import * as Progress from "react-native-progress";
const HomeScreen = () => {
  const [show, setShow] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    setLocations([]);
    setShow(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setLoading(false);
      setWeather(data);
    });
  };
  const handleSearch = (value) => {
    if (value.length > 3) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };
  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
  const { location, current } = weather;
  useEffect(() => {
    fetchMyWeatherData();
  }, []);
  const fetchMyWeatherData = async () => {
    fetchWeatherForecast({
      cityName: "Lahore",
      days: "7",
    }).then((data) => {
      setLoading(false);
      setWeather(data);
    });
  };
  return (
    <View className="flex-1 relative ">
      <StatusBar style="light" />
      <Image
        blurRadius={40}
        source={require("../assets/images/bg.png")}
        className="absolute w-full h-full"
      />

      {loading ? (
        <View className="flex flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={"#0bb3b2"} />
        </View>
      ) : (
        <SafeAreaView className="flex flex-1 mt-12">
          {/* search bar code start */}
          <View style={{ height: "7%" }} className="mx-4 relative z-50">
            <View
              style={{
                backgroundColor: show ? theme.bgWhite(0.2) : "transparent",
              }}
              className="flex-row justify-end items-center rounded-full"
            >
              {show ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city by name..."
                  placeholderTextColor={"lightgray"}
                  className="pl-6 h-10 text-base text-white flex-1"
                />
              ) : null}

              <TouchableOpacity
                onPress={() => setShow(!show)}
                className="p-3 m-1 rounded-full"
                style={{ backgroundColor: theme.bgWhite(0.3) }}
              >
                <MagnifyingGlassIcon size={25} color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && show ? (
              <View className="absolute w-full bg-gray-300 rounded-3xl mt-14">
                {locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder
                    ? " border-b-2 border-b-gray-400"
                    : "";
                  return (
                    <TouchableOpacity
                      key={index}
                      className={
                        "flex-row items-center border-0 p-3 px-4 mb-1 " +
                        borderClass
                      }
                      onPress={() => handleLocation(loc)}
                    >
                      <MapPinIcon size={20} color="gray" />
                      <Text className="text-black ml-2 text-md">
                        {loc?.name} , {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* search bar code end */}

          {/* City Data code start */}

          <ScrollView className="pt-20">
            <View className="flex justify-around flex-1 mb-2 mx-4">
              <Text className="text-white text-center text-2xl font-bold mb-2">
                {location?.name},{" "}
                <Text className="text-lg font-semibold text-gray-300">
                  {location?.country}
                </Text>
              </Text>
            </View>
            <View className="flex-row justify-center my-4">
              <Image
                className="w-48 h-48"
                source={weatherImages[current?.condition?.text]}
              />
            </View>
            <View className="my-3">
              <Text className="text-center font-bold text-white text-5xl ml-5">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center tracking-widest text-white text-xl">
                {current?.condition?.text}
              </Text>
            </View>
            {/* City Data code end */}

            {/* Climate Cndition code start */}
            <View className="flex-row items-center justify-between mx-6 my-4">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/wind.png")}
                  className="h-4 w-4"
                />
                <Text className="text-white text-base font-semibold">
                  {current?.wind_kph}km
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/drop.png")}
                  className="h-4 w-4"
                />
                <Text className="text-white text-base font-semibold">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/sun.png")}
                  className="h-4 w-4"
                />
                <Text className="text-white text-base font-semibold">
                { weather?.forecast?.forecastday[0]?.astro?.sunrise }
                </Text>
              </View>
            </View>
            {/* Climate Cndition code end */}

            {/* Next Days Updates  code start */}
            <View className="mb-2 space-y-3 my-6">
              <View className="flex-row items-center mx-5 space-x-2 mb-5">
                <CalendarDaysIcon size={22} color={"white"} />
                <Text className="text-white text-base ">Daily Forecast</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 12,
                }}
              >
                {weather?.forecast?.forecastday?.map((item, index) => {
                  const date = new Date(item.date);
                  const options = { weekday: "long" };
                  let dayName = date.toLocaleDateString("en-US", options);
                  dayName = dayName.split(",")[0];

                  return (
                    <View
                      key={index}
                      className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                      style={{ backgroundColor: theme.bgWhite(0.15) }}
                    >
                      <Image
                        // source={{ uri: "https:" + item?.day?.condition?.icon }}
                        source={
                          weatherImages[item?.day?.condition?.text || "other"]
                        }
                        className="w-11 h-11"
                      />
                      <Text className="text-white">{dayName}</Text>
                      <Text className="text-white text-xl font-semibold">
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
            {/* Next Days Updates  code end */}
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
