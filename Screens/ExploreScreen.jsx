import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { hotelsData } from '../Data/HotelData';
import HotelCard from '../Components/HotelCard';

const ExploreScreen = ({ navigation }) => {
  const [hotels, setHotels] = useState([]);
  const [recommendedHotels, setRecommendedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('none');

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setLoading(true);
    
    try {
      setHotels(hotelsData);
      await fetchRecommendedHotels();
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedHotels = async () => {
    try {
      const response = await fetch('https://fakestoreapi.com/products?limit=3');
      const data = await response.json();
      
      const transformedData = data.map(item => ({
        id: `rec-${item.id}`,
        name: `${item.title.substring(0, 25)} Hotel`,
        location: 'Recommended Location',
        rating: item.rating.rate,
        price: Math.round(item.price * 50),
        image: item.image,
        description: item.description,
        amenities: ['WiFi', 'Pool', 'Restaurant'],
        isRecommended: true,
      }));
      
      setRecommendedHotels(transformedData);
    } catch (error) {
      console.error('Error fetching recommended hotels:', error);
      setRecommendedHotels([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHotels();
    setRefreshing(false);
  };

  const sortHotels = (type) => {
    let sorted = [...hotels];
    
    switch (type) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        sorted = hotelsData;
    }
    
    setHotels(sorted);
    setSortBy(type);
  };

  const renderHeader = () => (
    <View>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#007AFF', '#0051D5', '#003A9B']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.gradientTitle}>🏨 Explore Hotels</Text>
        <Text style={styles.gradientSubtitle}>
          Find your perfect stay from {hotels.length} amazing properties
        </Text>
      </LinearGradient>

      {/* Sort Container */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price-low' && styles.activeSortButton]}
            onPress={() => sortHotels('price-low')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'price-low' && styles.activeSortButtonText]}>
              Price ↑
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price-high' && styles.activeSortButton]}
            onPress={() => sortHotels('price-high')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'price-high' && styles.activeSortButtonText]}>
              Price ↓
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'rating' && styles.activeSortButton]}
            onPress={() => sortHotels('rating')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.activeSortButtonText]}>
              Rating
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'none' && styles.activeSortButton]}
            onPress={() => sortHotels('none')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'none' && styles.activeSortButtonText]}>
              Default
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recommended Hotels */}
      {recommendedHotels.length > 0 && (
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <View style={styles.apiBadge}>
              <Text style={styles.apiBadgeText}>API</Text>
            </View>
          </View>
          
          {recommendedHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onPress={() => navigation.navigate('HotelDetails', { hotel })}
            />
          ))}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Hotels</Text>
        <Text style={styles.hotelCount}>{hotels.length} properties</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading hotels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={hotels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HotelCard
            hotel={item}
            onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  gradientTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gradientSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.95,
  },
  sortContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 8,
  },
  activeSortButton: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#fff',
  },
  recommendedSection: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 15,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  apiBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  apiBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hotelCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default ExploreScreen;
