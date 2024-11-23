import { useEffect, useState } from "react";
import { Image, StyleSheet, ScrollView, View, Text } from "react-native";
import { Button, CheckBox } from "@rneui/themed";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function AnimeScreen() {
  const [genres, setGenres] = useState<string[]>([]);
  const [checkedGenres, setCheckedGenres] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    console.log("Fetching genres...");
    console.log('Fetching recommendations...');
    const fetchGenres = async () => {
      try {
        const response = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                GenreCollection
              }
            `,
          }),
        });
        const data = await response.json();
        console.log(data);
        setGenres(data.data.GenreCollection);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query ($genres: [String]) {
              Page(perPage: 10) {
                media(genre_in: $genres, type: ANIME, sort: POPULARITY_DESC) {
                  id
                  title {
                    romaji
                    english
                  }
                  description
                }
              }
            }
          `,
          variables: { genres: checkedGenres },
        }),
      });
      const data = await response.json();
      setRecommendations(data.data.Page.media);
    } catch (error) {
      console.error("Error fetchng recommendations:", error);
    }
  };

  return (
    <ParallaxScrollView
      headerImage={
        <Image
          source={require("@/assets/images/anime-header.jpg")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>
            Discover Your Next Favorite Anime!
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.genreSelectionContainer}>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Select Your Favorite Genres
          </ThemedText>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.genreScroll}
          >
            {genres.map((genre, index) => (
              <View key={index} style={styles.genreItemContainer}>
                <CheckBox
                  title={genre}
                  checked={checkedGenres.includes(genre)}
                  containerStyle={styles.checkBoxContainer}
                  textStyle={styles.checkBoxText}
                  onPress={() => {
                    setCheckedGenres((prev) =>
                      prev.includes(genre)
                        ? prev.filter((g) => g !== genre)
                        : [...prev, genre]
                    );
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </ThemedView>
        <View style={styles.buttonContainer}>
          <Button
            title="Next"
            buttonStyle={styles.nextButton}
            onPress={fetchRecommendations}
          />
        </View>
        {recommendations.length > 0 && (
          <View style={styles.recommendationContainer}>
            <ThemedText type="subtitle" style={styles.subtitle}>
              Recommended Anime
            </ThemedText>
            {recommendations.map((anime) => (
              <View key={anime.id} style={styles.recommendationItem}>
                <Text style={styles.animeTitle}>
                  {anime.title.romaji || anime.title.english}
                </Text>
                <Text style={styles.animeDescription}>
                  {anime.description.substring(0, 100)}...
                </Text>
              </View>
            ))}
          </View>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#402A03",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  genreSelectionContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  genreScroll: {
    marginTop: 8,
  },
  genreItemContainer: {
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  checkBoxContainer: {
    borderWidth: 1,
    borderColor: "#402A03",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  checkBoxText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#402A03",
  },
  headerImage: {
    height: 200,
    width: "100%",
    resizeMode: "cover",
  },
  buttonContainer: {
    alignItems: "flex-end",
    padding: 16,
  },
  nextButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  recommendationContainer: {
    padding: 16,
    marginTop: 16,
  },
  recommendationItem: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  animeTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#402A03",
  },
  animeDescription: {
    fontSize: 14,
    color: "#555",
  },
});
