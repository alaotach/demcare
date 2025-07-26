import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Surface,
  useTheme,
  Button,
  Chip,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import IconFallback from '../../components/IconFallback';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  type: 'patient' | 'analytics' | 'financial' | 'compliance';
  onPress: () => void;
}

export default function ReportsScreen({ navigation }: Props) {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<'all' | 'patient' | 'analytics' | 'financial' | 'compliance'>('all');

  const reportCards: ReportCard[] = [
    {
      id: '1',
      title: 'Patient Summary Report',
      description: 'Comprehensive overview of all patients with vital signs trends',
      icon: 'account-multiple',
      color: '#4CAF50',
      type: 'patient',
      onPress: () => console.log('Generate Patient Summary Report'),
    },
    {
      id: '2',
      title: 'Vital Signs Analytics',
      description: 'Detailed analysis of heart rate, SpO₂, and other vital metrics',
      icon: 'heart-pulse',
      color: '#E91E63',
      type: 'analytics',
      onPress: () => console.log('Generate Vital Signs Report'),
    },
    {
      id: '3',
      title: 'Alert History Report',
      description: 'Historical data of all patient alerts and emergency incidents',
      icon: 'alert-circle',
      color: '#FF5722',
      type: 'patient',
      onPress: () => console.log('Generate Alert History Report'),
    },
    {
      id: '4',
      title: 'Monthly Patient Activity',
      description: 'Step count, movement patterns, and activity trends',
      icon: 'walk',
      color: '#2196F3',
      type: 'analytics',
      onPress: () => console.log('Generate Activity Report'),
    },
    {
      id: '5',
      title: 'Medication Adherence',
      description: 'Track medication compliance and scheduling patterns',
      icon: 'pill',
      color: '#9C27B0',
      type: 'patient',
      onPress: () => console.log('Generate Medication Report'),
    },
    {
      id: '6',
      title: 'System Performance',
      description: 'Device connectivity, data transmission, and system health',
      icon: 'monitor-dashboard',
      color: '#607D8B',
      type: 'compliance',
      onPress: () => console.log('Generate System Report'),
    },
  ];

  const filteredReports = reportCards.filter(report => 
    selectedType === 'all' || report.type === selectedType
  );

  const renderHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              textColor="#FFFFFF"
              style={styles.backButton}
              labelStyle={{ fontSize: 16 }}
            >
              <IconFallback name="arrow-left" size={20} color="#FFFFFF" />
            </Button>
            <View style={styles.headerTextContainer}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Reports & Analytics
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                Generate comprehensive patient reports
              </Text>
            </View>
            <Surface style={styles.headerIconContainer} elevation={3}>
              <IconFallback name="chart-line" size={24} color="#FFFFFF" />
            </Surface>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Surface>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'all', label: 'All Reports', count: reportCards.length },
          { key: 'patient', label: 'Patient Reports', count: reportCards.filter(r => r.type === 'patient').length },
          { key: 'analytics', label: 'Analytics', count: reportCards.filter(r => r.type === 'analytics').length },
          { key: 'financial', label: 'Financial', count: reportCards.filter(r => r.type === 'financial').length },
          { key: 'compliance', label: 'Compliance', count: reportCards.filter(r => r.type === 'compliance').length },
        ].map((filter) => (
          <Chip
            key={filter.key}
            selected={selectedType === filter.key}
            onPress={() => setSelectedType(filter.key as any)}
            style={[
              styles.filterChip,
              selectedType === filter.key && { backgroundColor: theme.colors.primary }
            ]}
            textStyle={{
              color: selectedType === filter.key ? '#FFFFFF' : theme.colors.onSurface,
              fontWeight: '600'
            }}
          >
            {filter.label} ({filter.count})
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderReportCard = (report: ReportCard) => (
    <Card key={report.id} style={styles.reportCard} elevation={4}>
      <Card.Content style={styles.reportCardContent}>
        <View style={styles.reportCardHeader}>
          <Surface 
            style={[styles.reportIcon, { backgroundColor: report.color }]} 
            elevation={2}
          >
            <IconFallback name={report.icon as any} size={24} color="#FFFFFF" />
          </Surface>
          <View style={styles.reportTextContainer}>
            <Text variant="titleMedium" style={styles.reportTitle}>
              {report.title}
            </Text>
            <Text variant="bodySmall" style={styles.reportDescription}>
              {report.description}
            </Text>
          </View>
        </View>
        <Divider style={styles.reportDivider} />
        <View style={styles.reportActions}>
          <Button
            mode="contained"
            onPress={report.onPress}
            style={[styles.generateButton, { backgroundColor: report.color }]}
            labelStyle={styles.generateButtonText}
          >
            Generate Report
          </Button>
          <Button
            mode="outlined"
            onPress={() => console.log('Schedule report:', report.title)}
            style={styles.scheduleButton}
            textColor={report.color}
          >
            Schedule
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Quick Statistics
      </Text>
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { backgroundColor: '#E3F2FD' }]} elevation={3}>
          <Card.Content style={styles.statContent}>
            <IconFallback name="file-chart" size={24} color="#1976D2" />
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#1976D2' }]}>
              24
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Reports Generated</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#E8F5E8' }]} elevation={3}>
          <Card.Content style={styles.statContent}>
            <IconFallback name="download" size={24} color="#388E3C" />
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#388E3C' }]}>
              18
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Downloads</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#FFF3E0' }]} elevation={3}>
          <Card.Content style={styles.statContent}>
            <IconFallback name="clock-outline" size={24} color="#F57C00" />
            <Text variant="headlineSmall" style={[styles.statNumber, { color: '#F57C00' }]}>
              3
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Scheduled</Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView}>
        {renderQuickStats()}
        {renderFilters()}
        
        <View style={styles.reportsContainer}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Available Reports ({filteredReports.length})
          </Text>
          
          {filteredReports.map(renderReportCard)}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSurface: {
    borderRadius: 0,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  quickStatsContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    marginRight: 12,
    marginBottom: 8,
  },
  reportsContainer: {
    paddingHorizontal: 20,
  },
  reportCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  reportCardContent: {
    padding: 20,
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportTextContainer: {
    flex: 1,
  },
  reportTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reportDescription: {
    opacity: 0.8,
    lineHeight: 20,
  },
  reportDivider: {
    marginBottom: 16,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  generateButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scheduleButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
