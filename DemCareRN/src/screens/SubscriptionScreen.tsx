import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  useTheme,
  SegmentedButtons,
  List,
  Divider,
  Surface,
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'react-native-paper';
import { SubscriptionTier, SubscriptionFeature } from '../types';

export default function SubscriptionScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);

  const features: SubscriptionFeature[] = [
    { name: 'Basic Patient Monitoring', free: true, premium: true, enterprise: true },
    { name: 'Up to 5 Patients', free: true, premium: false, enterprise: false },
    { name: 'Up to 50 Patients', free: false, premium: true, enterprise: false },
    { name: 'Unlimited Patients', free: false, premium: false, enterprise: true },
    { name: 'Real-time Alerts', free: true, premium: true, enterprise: true },
    { name: 'Basic Vitals Charts', free: true, premium: true, enterprise: true },
    { name: 'Advanced Analytics', free: false, premium: true, enterprise: true },
    { name: 'Historical Data (7 days)', free: true, premium: false, enterprise: false },
    { name: 'Historical Data (90 days)', free: false, premium: true, enterprise: false },
    { name: 'Historical Data (Unlimited)', free: false, premium: false, enterprise: true },
    { name: 'Email Support', free: true, premium: true, enterprise: true },
    { name: 'Priority Support', free: false, premium: true, enterprise: true },
    { name: '24/7 Phone Support', free: false, premium: false, enterprise: true },
    { name: 'API Access', free: false, premium: false, enterprise: true },
    { name: 'Custom Integrations', free: false, premium: false, enterprise: true },
    { name: 'Multi-location Support', free: false, premium: false, enterprise: true },
  ];

  const tierOptions = [
    { value: SubscriptionTier.FREE, label: 'Free' },
    { value: SubscriptionTier.PREMIUM, label: 'Premium' },
    { value: SubscriptionTier.ENTERPRISE, label: 'Enterprise' }
  ];

  const pricing = {
    [SubscriptionTier.FREE]: { price: '$0', period: 'forever' },
    [SubscriptionTier.PREMIUM]: { price: '$29', period: 'per month' },
    [SubscriptionTier.ENTERPRISE]: { price: '$99', period: 'per month' }
  };

  const getFeatureIcon = (tier: SubscriptionTier, feature: SubscriptionFeature) => {
    const hasFeature = feature[tier];
    return hasFeature ? 'check-circle' : 'close-circle';
  };

  const getFeatureColor = (tier: SubscriptionTier, feature: SubscriptionFeature) => {
    const hasFeature = feature[tier];
    return hasFeature ? theme.colors.primary : theme.colors.outline;
  };

  const handleUpgrade = () => {
    // TODO: Implement payment integration
    console.log(`Upgrading to ${selectedTier}`);
  };

  const renderHeader = () => (
    <Surface style={styles.headerSurface} elevation={4}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Icon source="crown" size={32} color="#FFFFFF" />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Choose Your Plan
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Select the plan that best fits your needs
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      <ScrollView style={styles.scrollView}>

        <SegmentedButtons
          value={selectedTier}
          onValueChange={(value) => setSelectedTier(value as SubscriptionTier)}
          buttons={tierOptions}
          style={styles.segmentedButtons}
        />

        {/* Current Plan Card */}
        <Card style={styles.planCard}>
          <Card.Content style={styles.planContent}>
            <Text variant="headlineMedium" style={styles.planTitle}>
              {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}
            </Text>
            <View style={styles.priceContainer}>
              <Text variant="headlineLarge" style={styles.price}>
                {pricing[selectedTier].price}
              </Text>
              <Text variant="bodyMedium" style={styles.period}>
                {pricing[selectedTier].period}
              </Text>
            </View>
            
            {selectedTier !== SubscriptionTier.FREE && (
              <Button
                mode="contained"
                onPress={handleUpgrade}
                style={styles.upgradeButton}
              >
                Upgrade Plan
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Features Comparison */}
        <Card style={styles.featuresCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.featuresTitle}>
              Plan Features
            </Text>
            
            {features.map((feature, index) => (
              <View key={index}>
                <List.Item
                  title={feature.name}
                  left={() => (
                    <List.Icon
                      icon={getFeatureIcon(selectedTier, feature)}
                      color={getFeatureColor(selectedTier, feature)}
                    />
                  )}
                  titleStyle={{
                    color: feature[selectedTier] 
                      ? theme.colors.onSurface 
                      : theme.colors.outline
                  }}
                />
                {index < features.length - 1 && <Divider />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Full Comparison Table */}
        <Card style={styles.comparisonCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.comparisonTitle}>
              Full Comparison
            </Text>
            
            <View style={styles.comparisonHeader}>
              <Text variant="titleMedium" style={styles.featureColumn}>
                Feature
              </Text>
              <Text variant="titleMedium" style={styles.tierColumn}>
                Free
              </Text>
              <Text variant="titleMedium" style={styles.tierColumn}>
                Premium
              </Text>
              <Text variant="titleMedium" style={styles.tierColumn}>
                Enterprise
              </Text>
            </View>
            <Divider style={styles.headerDivider} />
            
            {features.map((feature, index) => (
              <View key={index}>
                <View style={styles.comparisonRow}>
                  <Text variant="bodyMedium" style={styles.featureColumn}>
                    {feature.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.tierColumn}>
                    {feature.free ? '✓' : '✗'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.tierColumn}>
                    {feature.premium ? '✓' : '✗'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.tierColumn}>
                    {feature.enterprise ? '✓' : '✗'}
                  </Text>
                </View>
                <Divider />
              </View>
            ))}
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSurface: {
    elevation: 4,
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  backButton: {
    margin: 0,
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  segmentedButtons: {
    margin: 20,
  },
  planCard: {
    margin: 20,
    marginTop: 10,
    elevation: 4,
  },
  planContent: {
    alignItems: 'center',
    padding: 24,
  },
  planTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  period: {
    opacity: 0.7,
    marginTop: 4,
  },
  upgradeButton: {
    paddingHorizontal: 24,
  },
  featuresCard: {
    margin: 20,
    marginTop: 10,
    elevation: 2,
  },
  featuresTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  comparisonCard: {
    margin: 20,
    marginTop: 10,
    elevation: 2,
  },
  comparisonTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  comparisonHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  featureColumn: {
    flex: 2,
    textAlign: 'left',
  },
  tierColumn: {
    flex: 1,
    textAlign: 'center',
  },
  headerDivider: {
    marginBottom: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
