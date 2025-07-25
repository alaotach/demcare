import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { 
  Card, 
  Button, 
  TextInput, 
  Text, 
  useTheme,
  IconButton,
  Chip,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePatientStore } from '../../store/patientStore';
import { Patient, MoodEntry } from '../../types';

interface Props {
  navigation: any;
  route: {
    params: {
      patient: Patient;
    };
  };
}

const moodOptions = [
  { key: 'very_sad', label: 'Very Sad', icon: 'emoticon-cry', color: '#F44336', score: 1 },
  { key: 'sad', label: 'Sad', icon: 'emoticon-sad', color: '#FF9800', score: 2 },
  { key: 'neutral', label: 'Neutral', icon: 'emoticon-neutral', color: '#FFC107', score: 3 },
  { key: 'happy', label: 'Happy', icon: 'emoticon-happy', color: '#8BC34A', score: 4 },
  { key: 'very_happy', label: 'Very Happy', icon: 'emoticon-excited', color: '#4CAF50', score: 5 }
];

const triggerOptions = [
  'Pain', 'Medication', 'Sleep issues', 'Family visit', 'Food/meal', 
  'Weather', 'Activity', 'Social interaction', 'Medical procedure', 'Other'
];

export default function AddMoodEntryScreen({ navigation, route }: Props) {
  const { patient } = route.params;
  const theme = useTheme();
  const { addMoodEntry } = usePatientStore();
  
  const [loading, setLoading] = useState(false);
  const [moodData, setMoodData] = useState({
    mood: 'neutral' as any,
    moodScore: 3,
    anxiety: 3,
    energy: 3,
    notes: '',
    selectedTriggers: [] as string[]
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const newMoodEntry: Omit<MoodEntry, 'id'> = {
        patientId: patient.id,
        timestamp: new Date(),
        mood: moodData.mood,
        moodScore: moodData.moodScore,
        anxiety: moodData.anxiety,
        energy: moodData.energy,
        notes: moodData.notes,
        triggers: moodData.selectedTriggers
      };

      await addMoodEntry(newMoodEntry);
      Alert.alert('Success', 'Mood entry added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add mood entry');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrigger = (trigger: string) => {
    setMoodData(prev => ({
      ...prev,
      selectedTriggers: prev.selectedTriggers.includes(trigger)
        ? prev.selectedTriggers.filter(t => t !== trigger)
        : [...prev.selectedTriggers, trigger]
    }));
  };

  const renderRatingScale = (
    title: string, 
    value: number, 
    onChange: (value: number) => void,
    icon: string,
    lowLabel: string,
    highLabel: string
  ) => (
    <View style={styles.ratingContainer}>
      <View style={styles.ratingHeader}>
        <MaterialCommunityIcons name={icon as any} size={20} color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.ratingTitle}>{title}</Text>
      </View>
      <View style={styles.scaleContainer}>
        <Text variant="bodySmall" style={styles.scaleLabel}>{lowLabel}</Text>
        <View style={styles.scaleButtons}>
          {[1, 2, 3, 4, 5].map(rating => (
            <IconButton
              key={rating}
              icon={rating <= value ? "circle" : "circle-outline"}
              iconColor={rating <= value ? theme.colors.primary : theme.colors.outline}
              size={28}
              onPress={() => onChange(rating)}
            />
          ))}
        </View>
        <Text variant="bodySmall" style={styles.scaleLabel}>{highLabel}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <Card style={styles.headerCard}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.title}>
                😊 Mood Check-in
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                How is {patient.fullName} feeling today?
              </Text>
            </Card.Content>
          </Card>

          {/* Mood Selection */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Overall Mood</Text>
              <View style={styles.moodGrid}>
                {moodOptions.map((mood) => (
                  <Surface 
                    key={mood.key}
                    style={[
                      styles.moodOption,
                      moodData.mood === mood.key && styles.selectedMoodOption,
                      { backgroundColor: moodData.mood === mood.key ? mood.color + '20' : theme.colors.surface }
                    ]}
                    onTouchEnd={() => setMoodData(prev => ({ 
                      ...prev, 
                      mood: mood.key,
                      moodScore: mood.score 
                    }))}
                  >
                    <MaterialCommunityIcons 
                      name={mood.icon as any} 
                      size={32} 
                      color={moodData.mood === mood.key ? mood.color : theme.colors.onSurface} 
                    />
                    <Text 
                      variant="bodySmall" 
                      style={[
                        styles.moodLabel,
                        { color: moodData.mood === mood.key ? mood.color : theme.colors.onSurface }
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </Surface>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Rating Scales */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Detailed Assessment</Text>
              
              {renderRatingScale(
                'Anxiety Level',
                moodData.anxiety,
                (value) => setMoodData(prev => ({ ...prev, anxiety: value })),
                'heart-pulse',
                'Calm',
                'Very Anxious'
              )}

              {renderRatingScale(
                'Energy Level',
                moodData.energy,
                (value) => setMoodData(prev => ({ ...prev, energy: value })),
                'battery',
                'Low Energy',
                'High Energy'
              )}
            </Card.Content>
          </Card>

          {/* Mood Triggers */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Mood Triggers</Text>
              <Text variant="bodySmall" style={styles.sectionSubtitle}>
                What might have influenced this mood? (Select all that apply)
              </Text>
              <View style={styles.triggersContainer}>
                {triggerOptions.map((trigger) => (
                  <Chip
                    key={trigger}
                    selected={moodData.selectedTriggers.includes(trigger)}
                    onPress={() => toggleTrigger(trigger)}
                    style={[
                      styles.triggerChip,
                      moodData.selectedTriggers.includes(trigger) && styles.selectedTriggerChip
                    ]}
                    textStyle={moodData.selectedTriggers.includes(trigger) && styles.selectedTriggerText}
                  >
                    {trigger}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Notes */}
          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Additional Notes (Optional)"
                value={moodData.notes}
                onChangeText={(text) => setMoodData(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
                mode="outlined"
                placeholder="Any specific observations, events, or details about the mood..."
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
              Save Mood Entry
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: '18%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
  },
  selectedMoodOption: {
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodLabel: {
    marginTop: 4,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  scaleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scaleLabel: {
    opacity: 0.7,
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  scaleButtons: {
    flexDirection: 'row',
    flex: 3,
    justifyContent: 'center',
  },
  triggersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerChip: {
    marginBottom: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  selectedTriggerChip: {
    backgroundColor: '#6200ee',
  },
  selectedTriggerText: {
    color: 'white',
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
