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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SubscriptionTier, SubscriptionFeature } from '../types';

export default function SubscriptionScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);

  const features: SubscriptionFeature[] = [
    { name: 'Patient Monitoring', free: true, premium: true, enterprise: true },
    { name: 'Up to 5 Patients', free: true, premium: false, enterprise: false },
    { name: 'Up to 50 Patients', free: false, premium: true, enterprise: false },
    { name: 'Unlimited Patients', free: false, premium: false, enterprise: true },
    { name: 'Advanced Analytics', free: false, premium: true, enterprise: true },
    { name: 'Priority Support', free: false, premium: true, enterprise: true },
    { name: 'API Access', free: false, premium: false, enterprise: true },
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
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              iconColor="#FFFFFF"
              size={20}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            <MaterialCommunityIcons name="crown" size={24} color="#FFFFFF" />
            <View style={styles.headerText}>
              <Text variant="titleLarge" style={styles.headerTitle}>
                Choose Your Plan
              </Text>
              <Text variant="bodySmall" style={styles.headerSubtitle}>
                Select the plan that fits your needs
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Surface>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {renderHeader()}

        <SegmentedButtons
          value={selectedTier}
          onValueChange={(value) => setSelectedTier(value as SubscriptionTier)}
          buttons={tierOptions}
          style={styles.segmentedButtons}
        />

        {/* Current Plan Card */}
        <Card style={styles.planCard}>
          <Card.Content style={styles.planContent}>
            <Text variant="headlineSmall" style={styles.planTitle}>
              {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}
            </Text>
            <View style={styles.priceContainer}>
              <Text variant="headlineMedium" style={styles.price}>
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

        {/* Features List */}
        <Card style={styles.featuresCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.featuresTitle}>
              What's Included
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
                      : theme.colors.outline,
                    fontSize: 14,
                  }}
                  style={styles.listItem}
                />
                {index < features.length - 1 && <Divider />}
              </View>
            ))}
          </Card.Content>
        </Card>

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
    elevation: 4,
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 2,
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
    padding: 20,
  },
  planTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  period: {
    opacity: 0.7,
    marginTop: 2,
  },
  upgradeButton: {
    paddingHorizontal: 20,
  },
  featuresCard: {
    margin: 20,
    marginTop: 10,
    elevation: 2,
  },
  featuresTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  listItem: {
    paddingVertical: 8,
  },
  bottomPadding: {
    height: 20,
  },
});
