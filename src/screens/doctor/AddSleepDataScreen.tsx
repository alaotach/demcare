import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { 
  Card, 
  Button, 
  TextInput, 
  Text, 
  useTheme,
  IconButton,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePatientStore } from '../../store/patientStore';
import { Patient, SleepData } from '../../types';

interface Props {
  navigation: any;
  route: {
    params: {
      patient: Patient;
    };
  };
}

export default function AddSleepDataScreen({ navigation, route }: Props) {
  const { patient } = route.params;
  const theme = useTheme();
  const { addSleepData } = usePatientStore();
  
  const [loading, setLoading] = useState(false);
  const [sleepData, setSleepData] = useState({
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    bedTime: '22:00',
    wakeTime: '07:00',
    sleepQuality: 3,
    notes: '',
    deepSleep: 0,
    lightSleep: 0,
    remSleep: 0,
    awakeTime: 0
  });

  const calculateTotalSleep = () => {
    const [bedHour, bedMinute] = sleepData.bedTime.split(':').map(Number);
    const [wakeHour, wakeMinute] = sleepData.wakeTime.split(':').map(Number);
    
    const bedTimeMinutes = bedHour * 60 + bedMinute;
    const wakeTimeMinutes = wakeHour * 60 + wakeMinute;
    
    let totalMinutes = wakeTimeMinutes - bedTimeMinutes;
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Add 24 hours if wake time is next day
    }
    
    return totalMinutes / 60; // Convert to hours
  };

  const handleSubmit = async () => {
    if (!sleepData.bedTime || !sleepData.wakeTime) {
      Alert.alert('Error', 'Please set both bedtime and wake time');
      return;
    }

    setLoading(true);
    try {
      const today = new Date(sleepData.date);
      const [bedHour, bedMinute] = sleepData.bedTime.split(':').map(Number);
      const [wakeHour, wakeMinute] = sleepData.wakeTime.split(':').map(Number);
      
      const bedTime = new Date(today);
      bedTime.setHours(bedHour, bedMinute, 0, 0);
      
      const wakeTime = new Date(today);
      wakeTime.setHours(wakeHour, wakeMinute, 0, 0);
      
      // If wake time is earlier than bed time, assume next day
      if (wakeTime < bedTime) {
        wakeTime.setDate(wakeTime.getDate() + 1);
      }

      const newSleepData: Omit<SleepData, 'id'> = {
        patientId: patient.id,
        date: today,
        bedTime: bedTime,
        wakeTime: wakeTime,
        totalSleepHours: calculateTotalSleep(),
        sleepQuality: sleepData.sleepQuality,
        sleepStages: {
          deep: sleepData.deepSleep,
          light: sleepData.lightSleep,
          rem: sleepData.remSleep,
          awake: sleepData.awakeTime
        },
        notes: sleepData.notes
      };

      await addSleepData(newSleepData);
      Alert.alert('Success', 'Sleep data added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add sleep data');
    } finally {
      setLoading(false);
    }
  };

  const renderQualityStars = () => (
    <View style={styles.starsContainer}>
      <Text variant="bodyMedium" style={styles.starsLabel}>Sleep Quality:</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <IconButton
            key={star}
            icon={star <= sleepData.sleepQuality ? "star" : "star-outline"}
            iconColor="#FFD700"
            size={28}
            onPress={() => setSleepData(prev => ({ ...prev, sleepQuality: star }))}
          />
        ))}
      </View>
      <Text variant="bodySmall" style={styles.qualityText}>
        {sleepData.sleepQuality === 1 && "Very Poor"}
        {sleepData.sleepQuality === 2 && "Poor"}
        {sleepData.sleepQuality === 3 && "Fair"}
        {sleepData.sleepQuality === 4 && "Good"}
        {sleepData.sleepQuality === 5 && "Excellent"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <Card style={styles.headerCard}>
            <Card.Content>
              <View style={styles.headerContent}>
                <IconButton
                  icon="arrow-left"
                  size={24}
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                />
                <View style={styles.headerText}>
                  <Text variant="headlineSmall" style={styles.title}>
                    📊 Add Sleep Data
                  </Text>
                  <Text variant="bodyMedium" style={styles.subtitle}>
                    Track {patient.fullName}'s sleep patterns
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Date Selection */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Sleep Date</Text>
              <TextInput
                label="Date (YYYY-MM-DD)"
                value={sleepData.date}
                onChangeText={(text) => setSleepData(prev => ({ ...prev, date: text }))}
                mode="outlined"
                placeholder="2024-01-15"
                left={<TextInput.Icon icon="calendar" />}
              />
            </Card.Content>
          </Card>

          {/* Sleep Times */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Sleep Schedule</Text>
              
              <View style={styles.timeContainer}>
                <View style={styles.timeItem}>
                  <Text variant="bodyMedium" style={styles.timeLabel}>Bedtime</Text>
                  <TextInput
                    label="Bedtime (HH:MM)"
                    value={sleepData.bedTime}
                    onChangeText={(text) => setSleepData(prev => ({ ...prev, bedTime: text }))}
                    mode="outlined"
                    placeholder="22:00"
                    left={<TextInput.Icon icon="bed" />}
                  />
                </View>

                <View style={styles.timeItem}>
                  <Text variant="bodyMedium" style={styles.timeLabel}>Wake Time</Text>
                  <TextInput
                    label="Wake Time (HH:MM)"
                    value={sleepData.wakeTime}
                    onChangeText={(text) => setSleepData(prev => ({ ...prev, wakeTime: text }))}
                    mode="outlined"
                    placeholder="07:00"
                    left={<TextInput.Icon icon="weather-sunny" />}
                  />
                </View>
              </View>

              <Surface style={styles.summaryContainer}>
                <MaterialCommunityIcons name="sleep" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.totalSleepText}>
                  Total Sleep: {calculateTotalSleep().toFixed(1)} hours
                </Text>
              </Surface>
            </Card.Content>
          </Card>

          {/* Sleep Quality */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Sleep Quality</Text>
              {renderQualityStars()}
            </Card.Content>
          </Card>

          {/* Sleep Stages (Optional) */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Sleep Stages (Optional)</Text>
              <Text variant="bodySmall" style={styles.stagesSubtitle}>
                Enter sleep stage durations in minutes
              </Text>
              
              <View style={styles.stagesGrid}>
                <View style={styles.stageItem}>
                  <TextInput
                    label="Deep Sleep"
                    value={sleepData.deepSleep.toString()}
                    onChangeText={(text) => setSleepData(prev => ({ 
                      ...prev, 
                      deepSleep: parseInt(text) || 0 
                    }))}
                    keyboardType="numeric"
                    mode="outlined"
                    dense
                    right={<TextInput.Affix text="min" />}
                  />
                </View>

                <View style={styles.stageItem}>
                  <TextInput
                    label="Light Sleep"
                    value={sleepData.lightSleep.toString()}
                    onChangeText={(text) => setSleepData(prev => ({ 
                      ...prev, 
                      lightSleep: parseInt(text) || 0 
                    }))}
                    keyboardType="numeric"
                    mode="outlined"
                    dense
                    right={<TextInput.Affix text="min" />}
                  />
                </View>

                <View style={styles.stageItem}>
                  <TextInput
                    label="REM Sleep"
                    value={sleepData.remSleep.toString()}
                    onChangeText={(text) => setSleepData(prev => ({ 
                      ...prev, 
                      remSleep: parseInt(text) || 0 
                    }))}
                    keyboardType="numeric"
                    mode="outlined"
                    dense
                    right={<TextInput.Affix text="min" />}
                  />
                </View>

                <View style={styles.stageItem}>
                  <TextInput
                    label="Awake Time"
                    value={sleepData.awakeTime.toString()}
                    onChangeText={(text) => setSleepData(prev => ({ 
                      ...prev, 
                      awakeTime: parseInt(text) || 0 
                    }))}
                    keyboardType="numeric"
                    mode="outlined"
                    dense
                    right={<TextInput.Affix text="min" />}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Notes */}
          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Notes (Optional)"
                value={sleepData.notes}
                onChangeText={(text) => setSleepData(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
                mode="outlined"
                placeholder="Any observations about sleep quality, disturbances, medications, etc."
              />
            </Card.Content>
          </Card>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              icon="check"
            >
              Save Sleep Data
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: -8,
  },
  backButton: {
    margin: 0,
    marginTop: -8,
  },
  headerText: {
    flex: 1,
    marginLeft: -8,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateButton: {
    alignSelf: 'flex-start',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  timeButton: {
    width: '100%',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  totalSleepText: {
    marginLeft: 12,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  starsContainer: {
    alignItems: 'center',
  },
  starsLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  qualityText: {
    marginTop: 8,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  stagesSubtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  stagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stageItem: {
    width: '48%',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
});
