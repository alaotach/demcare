import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Dimensions } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  RadioButton,
  TextInput,
  ProgressBar,
  Surface,
  IconButton,
  Chip,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from '../components/MaterialIcon';

const { width } = Dimensions.get('window');

interface MemoryTestProps {
  navigation: any;
  route: {
    params: {
      patientId: string;
      patientName: string;
      onTestComplete?: (score: string) => void;
    };
  };
}

interface Question {
  id: number;
  type: 'multiple-choice' | 'text-input' | 'yes-no' | 'word-recall';
  question: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  points: number;
}

export default function MemoryTestScreen({ navigation, route }: MemoryTestProps) {
  const theme = useTheme();
  const { patientId, patientName, onTestComplete } = route.params;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [randomDigits, setRandomDigits] = useState('');
  const [showWordPhase, setShowWordPhase] = useState(false);
  const [wordToRemember, setWordToRemember] = useState('');

  // Generate questions similar to Flutter implementation
  const [questions] = useState<Question[]>([
    {
      id: 1,
      type: 'multiple-choice',
      question: 'What year is it?',
      options: ['2022', '2023', '2024', '2025'],
      correctAnswer: '2025',
      points: 10,
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: 'What season is it?',
      options: ['Spring', 'Summer', 'Fall', 'Winter'],
      correctAnswer: 'Winter', // Adjust based on current season
      points: 10,
    },
    {
      id: 3,
      type: 'text-input',
      question: `Please remember these digits: ${randomDigits}`,
      correctAnswer: '',
      points: 15,
    },
    {
      id: 4,
      type: 'text-input',
      question: 'Please enter the digits you just saw:',
      correctAnswer: randomDigits,
      points: 15,
    },
    {
      id: 5,
      type: 'yes-no',
      question: 'Do you know where you are right now?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      points: 10,
    },
    {
      id: 6,
      type: 'yes-no',
      question: 'Can you remember what you had for breakfast today?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      points: 10,
    },
    {
      id: 7,
      type: 'word-recall',
      question: `Please remember this word: "${wordToRemember}"`,
      correctAnswer: '',
      points: 15,
    },
    {
      id: 8,
      type: 'word-recall',
      question: 'What was the word you were asked to remember?',
      correctAnswer: wordToRemember,
      points: 15,
    },
  ]);

  useEffect(() => {
    // Generate random digits for memory test
    const digits = Math.floor(Math.random() * 900 + 100).toString();
    setRandomDigits(digits);
    
    // Set a random word to remember
    const words = ['apple', 'chair', 'music', 'garden', 'ocean', 'bridge', 'sunset'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWordToRemember(randomWord);

    // Update questions with generated values
    questions[2].question = `Please remember these digits: ${digits}`;
    questions[3].correctAnswer = digits;
    questions[6].question = `Please remember this word: "${randomWord}"`;
    questions[7].correctAnswer = randomWord;
  }, []);

  const getCurrentQuestion = (): Question => questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const calculateScore = (): number => {
    let score = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
        score += question.points;
      }
    });
    return score;
  };

  const handleNext = () => {
    const currentQuestion = getCurrentQuestion();
    
    // Skip display questions (id 3 and 7)
    if (currentQuestion.id === 3 || currentQuestion.id === 7) {
      // Auto-advance after showing the content
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          completeTest();
        }
      }, 3000); // Show for 3 seconds
      return;
    }
    
    if (!answers[currentQuestionIndex]) {
      Alert.alert('Please select an answer', 'You must provide an answer before continuing.');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    const finalScore = calculateScore();
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const scoreText = `${finalScore} / ${totalPoints}`;
    
    setTotalScore(finalScore);
    setTestCompleted(true);
    
    // Call the completion callback if provided
    if (onTestComplete) {
      onTestComplete(`Latest Score: ${scoreText}`);
    }
  };

  const resetTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestCompleted(false);
    setTotalScore(0);
  };

  const renderQuestion = () => {
    const question = getCurrentQuestion();
    const progress = (currentQuestionIndex + 1) / questions.length;

    if (testCompleted) {
      return renderResults();
    }

    return (
      <View style={styles.questionContainer}>
        {/* Progress */}
        <Surface style={styles.progressContainer} elevation={2}>
          <Text variant="bodyMedium" style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />
        </Surface>

        {/* Question Card */}
        <Card style={styles.questionCard} mode="outlined">
          <Card.Content>
            <View style={styles.questionHeader}>
              <MaterialIcon 
                source={
                  question.type === 'multiple-choice' ? 'format-list-bulleted' :
                  question.type === 'text-input' ? 'keyboard' :
                  question.type === 'yes-no' ? 'help-circle' : 'brain'
                } 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text variant="titleMedium" style={styles.questionText}>
                {question.question}
              </Text>
            </View>

            <Divider style={styles.questionDivider} />

            {/* Render based on question type */}
            {question.type === 'multiple-choice' && (
              <View style={styles.optionsContainer}>
                {question.options?.map((option, index) => (
                  <Surface key={index} style={styles.optionItem} elevation={1}>
                    <RadioButton.Item
                      label={option}
                      value={option}
                      status={answers[currentQuestionIndex] === option ? 'checked' : 'unchecked'}
                      onPress={() => handleAnswer(option)}
                      style={styles.radioOption}
                    />
                  </Surface>
                ))}
              </View>
            )}

            {question.type === 'yes-no' && (
              <View style={styles.yesNoContainer}>
                <Button
                  mode={answers[currentQuestionIndex] === 'Yes' ? 'contained' : 'outlined'}
                  onPress={() => handleAnswer('Yes')}
                  style={styles.yesNoButton}
                  icon="check"
                >
                  Yes
                </Button>
                <Button
                  mode={answers[currentQuestionIndex] === 'No' ? 'contained' : 'outlined'}
                  onPress={() => handleAnswer('No')}
                  style={styles.yesNoButton}
                  icon="close"
                >
                  No
                </Button>
              </View>
            )}

            {question.type === 'text-input' && question.id !== 3 && question.id !== 7 && (
              <TextInput
                label="Your Answer"
                value={answers[currentQuestionIndex] || ''}
                onChangeText={(text) => handleAnswer(text)}
                mode="outlined"
                style={styles.textInput}
                placeholder="Type your answer here..."
              />
            )}

            {(question.id === 3 || question.id === 7) && (
              <View style={styles.displayContainer}>
                <Surface style={styles.displayBox} elevation={3}>
                  <Text variant="headlineMedium" style={styles.displayText}>
                    {question.id === 3 ? randomDigits : wordToRemember}
                  </Text>
                </Surface>
                <Text variant="bodyMedium" style={styles.displayInstructions}>
                  Please memorize this and click Next to continue
                </Text>
              </View>
            )}

            <Chip
              icon="star"
              style={styles.pointsChip}
              textStyle={styles.pointsChipText}
              mode="outlined"
            >
              {question.points} points
            </Chip>
          </Card.Content>
        </Card>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
            disabled={!answers[currentQuestionIndex] && question.id !== 3 && question.id !== 7}
            icon="arrow-right"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Complete Test' : 'Next'}
          </Button>
        </View>
      </View>
    );
  };

  const renderResults = () => {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((totalScore / totalPoints) * 100);
    
    return (
      <View style={styles.resultsContainer}>
        <Card style={styles.resultsCard} mode="outlined">
          <Card.Content>
            <View style={styles.resultsHeader}>
              <MaterialIcon source="trophy" size={48} color="#FFD700" />
              <Text variant="headlineMedium" style={styles.resultsTitle}>
                Test Complete!
              </Text>
            </View>

            <Divider style={styles.resultsDivider} />

            <View style={styles.scoreContainer}>
              <Text variant="headlineLarge" style={styles.scoreText}>
                {totalScore} / {totalPoints}
              </Text>
              <Text variant="titleMedium" style={styles.percentageText}>
                {percentage}%
              </Text>
            </View>

            <Surface style={styles.performanceIndicator} elevation={2}>
              <ProgressBar 
                progress={percentage / 100} 
                color={
                  percentage >= 80 ? '#4CAF50' :
                  percentage >= 60 ? '#FF9800' : '#F44336'
                }
                style={styles.performanceBar}
              />
              <Text variant="bodyMedium" style={styles.performanceText}>
                {percentage >= 80 ? 'Excellent Performance' :
                 percentage >= 60 ? 'Good Performance' : 'Needs Improvement'}
              </Text>
            </Surface>

            <View style={styles.detailsContainer}>
              <Text variant="titleSmall" style={styles.detailsTitle}>
                Test Summary
              </Text>
              <Text variant="bodyMedium" style={styles.detailsText}>
                Patient: {patientName}
              </Text>
              <Text variant="bodyMedium" style={styles.detailsText}>
                Date: {new Date().toLocaleDateString()}
              </Text>
              <Text variant="bodyMedium" style={styles.detailsText}>
                Questions: {questions.length}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.resultsActions}>
          <Button
            mode="outlined"
            onPress={resetTest}
            style={styles.actionButton}
            icon="refresh"
          >
            Retake Test
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
            icon="check"
          >
            Save Results
          </Button>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={styles.header} elevation={4}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerText}>
              <Text variant="titleLarge" style={styles.headerTitle}>
                Memory Assessment
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                {patientName}
              </Text>
            </View>
            <MaterialIcon source="brain" size={28} color="white" />
          </View>
        </LinearGradient>
      </Surface>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderQuestion()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderRadius: 0,
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  questionContainer: {
    flex: 1,
  },
  progressContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  questionCard: {
    marginBottom: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionText: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '500',
  },
  questionDivider: {
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  optionItem: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  radioOption: {
    paddingVertical: 8,
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  yesNoButton: {
    flex: 1,
  },
  textInput: {
    marginBottom: 16,
  },
  displayContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  displayBox: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  displayText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  displayInstructions: {
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  pointsChip: {
    alignSelf: 'flex-end',
  },
  pointsChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  navigationContainer: {
    marginTop: 20,
  },
  nextButton: {
    borderRadius: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCard: {
    marginBottom: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsDivider: {
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  percentageText: {
    opacity: 0.7,
  },
  performanceIndicator: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  performanceBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  performanceText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 8,
  },
  detailsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  detailsText: {
    marginBottom: 4,
    opacity: 0.8,
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
