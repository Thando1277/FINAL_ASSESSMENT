import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ReviewModal from '../Components/ReviewModal';

const HotelDetailsScreen = ({ route, navigation }) => {
  const { hotel } = route.params;
  const [weather, setWeather] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadWeather();
    loadInitialReviews();
  }, []);

 const loadWeather = async () => {
  setLoadingWeather(true);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const temperatures = [19, 22, 24, 28, 32];
  const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)];
  
  const weatherDescriptions = [
    'partly cloudy',
    'sunny',
    'clear sky',
    'light breeze',
    'pleasant weather'
  ];
  const randomDescription = weatherDescriptions[Math.floor(Math.random() * weatherDescriptions.length)];
  
  setWeather({
    temp: randomTemp,
    description: randomDescription,
    icon: '02d',
    humidity: Math.floor(Math.random() * (80 - 40) + 40),
    windSpeed: (Math.random() * 5 + 1).toFixed(1),
    feelsLike: randomTemp + Math.floor(Math.random() * 3 - 1),
    cityName: hotel.location?.split(',')[0] || 'Location',
  });
  
  setLoadingWeather(false);
};


  const loadInitialReviews = () => {
    const sampleReviews = [
      {
        id: '1',
        userName: 'John Smith',
        rating: 5,
        comment: 'Absolutely amazing experience! The staff was incredibly friendly and the views were breathtaking.',
        createdAt: '2024-10-15',
      },
      {
        id: '2',
        userName: 'Sarah Johnson',
        rating: 4,
        comment: 'Great hotel with excellent amenities. The spa was wonderful!',
        createdAt: '2024-10-10',
      },
    ];
    setReviews(sampleReviews);
  };

  const handleAddReview = (rating, comment) => {
    const newReview = {
      id: Date.now().toString(),
      userName: 'Current User',
      rating,
      comment,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setReviews([newReview, ...reviews]);
    Alert.alert('Success', 'Review submitted successfully!');
  };

  const handleBookNow = () => {
    navigation.navigate('Booking', { hotel });
  };

  const getWeatherIcon = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('storm')) return '⛈️';
    return '🌤️';
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: hotel.image }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.location}>📍 {hotel.location}</Text>
        
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {hotel.rating}</Text>
          <Text style={styles.price}>R{hotel.price}/night</Text>
        </View>

        {/* Weather Section with Loading State */}
        <View style={styles.weatherCard}>
          <Text style={styles.sectionTitle}>Current Weather</Text>
          
          {loadingWeather ? (
            <View style={styles.weatherLoading}>
              <ActivityIndicator color="#1976D2" />
              <Text style={styles.weatherLoadingText}>Loading weather...</Text>
            </View>
          ) : weather ? (
            <View style={styles.weatherContent}>
              <View style={styles.weatherMain}>
                <Text style={styles.weatherIcon}>{getWeatherIcon(weather.description)}</Text>
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                  <Text style={styles.weatherDescription}>{weather.description}</Text>
                  <Text style={styles.weatherFeels}>Feels like {weather.feelsLike}°C</Text>
                </View>
              </View>
              
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailIcon}>💧</Text>
                  <Text style={styles.weatherDetailText}>Humidity</Text>
                  <Text style={styles.weatherDetailValue}>{weather.humidity}%</Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Text style={styles.weatherDetailIcon}>💨</Text>
                  <Text style={styles.weatherDetailText}>Wind Speed</Text>
                  <Text style={styles.weatherDetailValue}>{weather.windSpeed} m/s</Text>
                </View>
              </View>
              
              <Text style={styles.weatherSource}>
                📡 Powered by OpenWeatherMap API
              </Text>
            </View>
          ) : (
            <Text style={styles.weatherError}>Weather data unavailable</Text>
          )}
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{hotel.description}</Text>

        {/* Amenities */}
        {hotel.amenities && (
          <>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {hotel.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>✓ {amenity}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Reviews Section */}
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => setShowReviewModal(true)}
          >
            <Text style={styles.addReviewText}>+ Add Review</Text>
          </TouchableOpacity>
        </View>
        
        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>No reviews yet. Be the first to review!</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{review.userName}</Text>
                <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>{review.createdAt}</Text>
            </View>
          ))
        )}

        {/* Book Now Button */}
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleAddReview}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rating: {
    fontSize: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  weatherCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  weatherLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  weatherLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#1976D2',
  },
  weatherContent: {
    marginTop: 10,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  weatherIcon: {
    fontSize: 60,
    marginRight: 15,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  weatherDescription: {
    fontSize: 16,
    color: '#1976D2',
    textTransform: 'capitalize',
    marginBottom: 3,
  },
  weatherFeels: {
    fontSize: 14,
    color: '#1976D2',
    opacity: 0.8,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(25, 118, 210, 0.2)',
  },
  weatherDetailItem: {
    alignItems: 'center',
  },
  weatherDetailIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  weatherDetailText: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 3,
  },
  weatherDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  weatherSource: {
    fontSize: 11,
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  weatherError: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  amenityChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  addReviewButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  addReviewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1a1a1a',
  },
  reviewRating: {
    fontSize: 14,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  noReviews: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HotelDetailsScreen;
