import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../Firebase/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const BookingScreen = ({ route, navigation }) => {
  const { hotel } = route.params;
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000));
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [guests, setGuests] = useState('1');
  const [rooms, setRooms] = useState('1');
  const [loading, setLoading] = useState(false);

  const calculateNights = () => {
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * hotel.price * parseInt(rooms || 1);
  };

  const handleBooking = async () => {
    if (!guests || parseInt(guests) < 1) {
      Alert.alert('Error', 'Please enter number of guests');
      return;
    }

    if (!rooms || parseInt(rooms) < 1) {
      Alert.alert('Error', 'Please enter number of rooms');
      return;
    }

    if (checkOutDate <= checkInDate) {
      Alert.alert('Error', 'Check-out date must be after check-in date');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Please sign in to make a booking');
      navigation.navigate('SignIn');
      return;
    }

    setLoading(true);

    try {
      const booking = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelImage: hotel.image,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guests: parseInt(guests),
        rooms: parseInt(rooms),
        nights: calculateNights(),
        pricePerNight: hotel.price,
        totalCost: calculateTotal(),
        createdAt: new Date().toISOString(),
        status: 'Confirmed',
      };

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const existingBookings = userDoc.data().bookings || [];
        
        await updateDoc(userRef, {
          bookings: [...existingBookings, booking],
        });

        setLoading(false);

        Alert.alert(
          'Booking Confirmed! 🎉',
          `Your booking at ${hotel.name} has been confirmed.\n\nDetails:\n• Check-in: ${checkInDate.toDateString()}\n• Check-out: ${checkOutDate.toDateString()}\n• ${calculateNights()} night(s)\n• ${rooms} room(s), ${guests} guest(s)\n\nTotal: R${calculateTotal()}`,
          [
            {
              text: 'View My Bookings',
              onPress: () => {
                navigation.navigate('Main', {
                  screen: 'ProfileTab',
                });
              },
            },
            {
              text: 'Done',
              onPress: () => {
                navigation.navigate('Main', {
                  screen: 'ExploreTab',
                });
              },
            },
          ]
        );
      } else {
        setLoading(false);
        Alert.alert('Error', 'User profile not found');
      }
    } catch (error) {
      setLoading(false);
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to save booking. Please try again.');
    }
  };

  const onChangeCheckIn = (event, selectedDate) => {
    setShowCheckInPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCheckInDate(selectedDate);
      if (checkOutDate <= selectedDate) {
        setCheckOutDate(new Date(selectedDate.getTime() + 86400000));
      }
    }
  };

  const onChangeCheckOut = (event, selectedDate) => {
    setShowCheckOutPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCheckOutDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Book {hotel.name}</Text>
        <Text style={styles.subtitle}>📍 {hotel.location}</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Check-in Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCheckInPicker(true)}
          >
            <Text style={styles.dateText}>📅 {checkInDate.toDateString()}</Text>
          </TouchableOpacity>

          {showCheckInPicker && (
            <DateTimePicker
              value={checkInDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={onChangeCheckIn}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Check-out Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCheckOutPicker(true)}
          >
            <Text style={styles.dateText}>📅 {checkOutDate.toDateString()}</Text>
          </TouchableOpacity>

          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOutDate}
              mode="date"
              display="default"
              minimumDate={new Date(checkInDate.getTime() + 86400000)}
              onChange={onChangeCheckOut}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Number of Guests</Text>
          <TextInput
            style={styles.input}
            value={guests}
            onChangeText={setGuests}
            keyboardType="number-pad"
            placeholder="Enter number of guests"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Number of Rooms</Text>
          <TextInput
            style={styles.input}
            value={rooms}
            onChangeText={setRooms}
            keyboardType="number-pad"
            placeholder="Enter number of rooms"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nights:</Text>
            <Text style={styles.summaryValue}>{calculateNights()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rate per night:</Text>
            <Text style={styles.summaryValue}>R{hotel.price}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rooms:</Text>
            <Text style={styles.summaryValue}>{rooms || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests:</Text>
            <Text style={styles.summaryValue}>{guests || 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>R{calculateTotal()}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          * You will receive a confirmation email once the booking is processed.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  summary: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a1a1a',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

export default BookingScreen;
