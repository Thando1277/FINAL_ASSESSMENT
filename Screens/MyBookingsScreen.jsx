import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { auth, db } from '../Firebase/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || 'User');
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userBookings = userDoc.data().bookings || [];
          // Sort by created date (newest first)
          const sortedBookings = userBookings.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setBookings(sortedBookings);
          console.log('Loaded bookings:', sortedBookings.length);
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
        Alert.alert('Error', 'Failed to load bookings. Please try again.');
      }
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const cancelBooking = async (bookingIndex) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              const updatedBookings = [...bookings];
              updatedBookings.splice(bookingIndex, 1);
              
              await updateDoc(doc(db, 'users', user.uid), {
                bookings: updatedBookings,
              });
              
              setBookings(updatedBookings);
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return '#34C759';
      case 'Pending':
        return '#FF9500';
      case 'Cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptyText}>
            Start exploring amazing hotels and make your first booking!
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('ExploreTab')}
          >
            <Text style={styles.exploreButtonText}>Explore Hotels</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bookingsContainer}>
          {bookings.map((booking, index) => (
            <View key={index} style={styles.bookingCard}>
              {/* Hotel Image */}
              {booking.hotelImage && (
                <Image 
                  source={{ uri: booking.hotelImage }} 
                  style={styles.hotelImage}
                />
              )}
              
              <View style={styles.bookingContent}>
                {/* Header with Hotel Name and Status */}
                <View style={styles.bookingHeader}>
                  <Text style={styles.hotelName} numberOfLines={1}>
                    {booking.hotelName}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) }
                  ]}>
                    <Text style={styles.statusText}>{booking.status}</Text>
                  </View>
                </View>

                {/* Booking ID */}
                <Text style={styles.bookingId}>
                  Booking #{booking.hotelId}-{index + 1}
                </Text>

                {/* Dates Section */}
                <View style={styles.datesContainer}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateLabel}>Check-in</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(booking.checkIn)}
                    </Text>
                  </View>
                  
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                  
                  <View style={styles.dateBox}>
                    <Text style={styles.dateLabel}>Check-out</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(booking.checkOut)}
                    </Text>
                  </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>🛏️</Text>
                    <Text style={styles.detailText}>{booking.rooms} room(s)</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>👥</Text>
                    <Text style={styles.detailText}>{booking.guests} guest(s)</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>🌙</Text>
                    <Text style={styles.detailText}>{booking.nights} night(s)</Text>
                  </View>
                </View>

                {/* Price Section */}
                <View style={styles.priceContainer}>
                  <View>
                    <Text style={styles.priceLabel}>Total Amount</Text>
                    <Text style={styles.priceValue}>R{booking.totalCost}</Text>
                  </View>
                  <Text style={styles.pricePerNight}>
                    R{booking.pricePerNight}/night
                  </Text>
                </View>

                {/* Booking Date */}
                <Text style={styles.bookingDate}>
                  Booked on {formatDate(booking.createdAt)}
                </Text>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => {
                      // Navigate to hotel details if available
                      Alert.alert(
                        'Booking Details',
                        `Hotel: ${booking.hotelName}\nCheck-in: ${formatDate(booking.checkIn)}\nCheck-out: ${formatDate(booking.checkOut)}\nGuests: ${booking.guests}\nRooms: ${booking.rooms}\nTotal: R${booking.totalCost}`
                      );
                    }}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                  
                  {booking.status === 'Confirmed' && (
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => cancelBooking(index)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingsContainer: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  bookingContent: {
    padding: 15,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingId: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  dateBox: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  arrowContainer: {
    paddingHorizontal: 10,
  },
  arrow: {
    fontSize: 20,
    color: '#007AFF',
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 15,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  pricePerNight: {
    fontSize: 14,
    color: '#666',
  },
  bookingDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default MyBookingsScreen;
