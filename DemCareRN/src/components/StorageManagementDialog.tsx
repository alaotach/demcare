import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ProgressBar,
  List,
  Dialog,
  Portal,
  IconButton,
  Surface,
  Chip,
} from 'react-native-paper';
import { Icon } from 'react-native-paper';

interface StorageCategory {
  id: string;
  name: string;
  icon: string;
  size: number; // in MB
  color: string;
  canClear: boolean;
  description: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function StorageManagementDialog({ visible, onClose }: Props) {
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [clearingCategory, setClearingCategory] = useState<string | null>(null);
  const [storageData, setStorageData] = useState<StorageCategory[]>([
    {
      id: 'patient_data',
      name: 'Patient Data',
      icon: 'account-multiple',
      size: 245.8,
      color: theme.colors.primary,
      canClear: false,
      description: 'Patient records, vital signs, and medical history',
    },
    {
      id: 'images_media',
      name: 'Images & Media',
      icon: 'image-multiple',
      size: 156.3,
      color: theme.colors.secondary,
      canClear: true,
      description: 'Photos, videos, and medical images',
    },
    {
      id: 'cache',
      name: 'App Cache',
      icon: 'cached',
      size: 89.2,
      color: theme.colors.tertiary,
      canClear: true,
      description: 'Temporary files and cached data',
    },
    {
      id: 'offline_data',
      name: 'Offline Data',
      icon: 'cloud-download',
      size: 67.5,
      color: theme.colors.outline,
      canClear: true,
      description: 'Downloaded data for offline access',
    },
    {
      id: 'logs',
      name: 'Application Logs',
      icon: 'file-document',
      size: 23.1,
      color: theme.colors.error,
      canClear: true,
      description: 'Debug logs and error reports',
    },
    {
      id: 'settings_backup',
      name: 'Settings & Backups',
      icon: 'backup-restore',
      size: 12.4,
      color: '#4CAF50',
      canClear: false,
      description: 'App settings and configuration backups',
    },
  ]);

  const totalUsed = storageData.reduce((sum, category) => sum + category.size, 0);
  const totalAvailable = 1024; // 1GB in MB
  const usagePercentage = (totalUsed / totalAvailable) * 100;

  useEffect(() => {
    // Simulate loading storage data
    const interval = setInterval(() => {
      setStorageData(prev => prev.map(category => ({
        ...category,
        size: Math.max(0, category.size + (Math.random() - 0.5) * 2), // Slight random changes
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const clearCategory = async (categoryId: string) => {
    const category = storageData.find(c => c.id === categoryId);
    if (!category) return;

    Alert.alert(
      'Clear Data',
      `Are you sure you want to clear ${category.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setClearingCategory(categoryId);
            setLoading(true);
            
            // Simulate clearing process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setStorageData(prev => prev.map(cat => 
              cat.id === categoryId 
                ? { ...cat, size: Math.max(1, cat.size * 0.1) } // Keep 10% as minimum
                : cat
            ));
            
            setClearingCategory(null);
            setLoading(false);
            
            Alert.alert('Success', `${category.name} has been cleared successfully.`);
          },
        },
      ]
    );
  };

  const optimizeStorage = async () => {
    setLoading(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setStorageData(prev => prev.map(category => 
      category.canClear 
        ? { ...category, size: category.size * 0.7 } // Reduce by 30%
        : category
    ));
    
    setLoading(false);
    Alert.alert('Storage Optimized', 'Your storage has been optimized successfully!');
  };

  const formatSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return theme.colors.error;
    if (percentage >= 75) return '#FF9800';
    if (percentage >= 50) return theme.colors.primary;
    return '#4CAF50';
  };

  const renderStorageOverview = () => (
    <Card style={styles.overviewCard}>
      <Card.Content>
        <View style={styles.overviewHeader}>
          <Icon source="harddisk" size={32} color={theme.colors.primary} />
          <View style={styles.overviewText}>
            <Text variant="headlineSmall" style={styles.overviewTitle}>
              Storage Usage
            </Text>
            <Text variant="bodyLarge" style={styles.overviewSubtitle}>
              {formatSize(totalUsed)} of {formatSize(totalAvailable)} used
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={usagePercentage / 100}
            color={getUsageColor(usagePercentage)}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={styles.progressText}>
            {usagePercentage.toFixed(1)}% used
          </Text>
        </View>
        
        <View style={styles.storageActions}>
          <Button
            mode="outlined"
            onPress={optimizeStorage}
            loading={loading}
            disabled={loading}
            icon="auto-fix"
            style={styles.actionButton}
          >
            Optimize
          </Button>
          <Button
            mode="contained"
            onPress={() => Alert.alert('Backup', 'Cloud backup feature will be available soon.')}
            icon="cloud-upload"
            style={styles.actionButton}
          >
            Backup
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStorageCategory = (category: StorageCategory) => {
    const percentage = (category.size / totalUsed) * 100;
    const isClearing = clearingCategory === category.id;
    
    return (
      <Card key={category.id} style={styles.categoryCard}>
        <Card.Content>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryLeft}>
              <Surface 
                style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]} 
                elevation={1}
              >
                <Icon source= 
                  source={category.icon} 
                  size={24} 
                  color={category.color} 
                />
              </Surface>
              <View style={styles.categoryInfo}>
                <View style={styles.categoryTitleRow}>
                  <Text variant="titleMedium" style={styles.categoryTitle}>
                    {category.name}
                  </Text>
                  <Chip style={styles.sizeChip}>
                    {formatSize(category.size)}
                  </Chip>
                </View>
                <Text variant="bodySmall" style={styles.categoryDescription}>
                  {category.description}
                </Text>
                <View style={styles.categoryProgress}>
                  <ProgressBar
                    progress={percentage / 100}
                    color={category.color}
                    style={styles.categoryProgressBar}
                  />
                  <Text variant="bodySmall" style={styles.categoryPercentage}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>
            
            {category.canClear && (
              <IconButton
                icon="delete-sweep"
                size={24}
                iconColor={theme.colors.error}
                onPress={() => clearCategory(category.id)}
                disabled={isClearing || loading}
                style={styles.clearButton}
              />
            )}
          </View>
          
          {isClearing && (
            <View style={styles.clearingIndicator}>
              <ProgressBar indeterminate color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.clearingText}>
                Clearing {category.name}...
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderStorageTips = () => (
    <Card style={styles.tipsCard}>
      <Card.Content>
        <View style={styles.tipsHeader}>
          <Icon source="lightbulb" size={24} color={theme.colors.secondary} />
          <Text variant="titleMedium" style={styles.tipsTitle}>
            Storage Tips
          </Text>
        </View>
        
        <List.Item
          title="Enable Auto-Cleanup"
          description="Automatically clear cache and old logs"
          left={(props) => <List.Icon {...props} icon="auto-fix" />}
          right={() => <Text style={styles.tipsBadge}>Recommended</Text>}
        />
        
        <List.Item
          title="Cloud Backup"
          description="Store patient data securely in the cloud"
          left={(props) => <List.Icon {...props} icon="cloud-upload" />}
          right={() => <Text style={styles.tipsBadge}>Premium</Text>}
        />
        
        <List.Item
          title="Compress Media"
          description="Reduce image and video file sizes"
          left={(props) => <List.Icon {...props} icon="file-image" />}
          right={() => <Text style={styles.tipsBadge}>Available</Text>}
        />
      </Card.Content>
    </Card>
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>Storage Management</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderStorageOverview()}
            
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Storage Breakdown
            </Text>
            
            {storageData
              .sort((a, b) => b.size - a.size)
              .map(renderStorageCategory)}
            
            {renderStorageTips()}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onClose}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '90%',
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  overviewCard: {
    marginBottom: 16,
    elevation: 3,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewText: {
    marginLeft: 16,
    flex: 1,
  },
  overviewTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewSubtitle: {
    opacity: 0.7,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  storageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 24,
  },
  categoryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  sizeChip: {
    height: 24,
    marginLeft: 8,
  },
  categoryDescription: {
    opacity: 0.7,
    marginBottom: 8,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  categoryPercentage: {
    minWidth: 40,
    textAlign: 'right',
    opacity: 0.7,
  },
  clearButton: {
    marginLeft: 8,
  },
  clearingIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  clearingText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  tipsCard: {
    marginTop: 16,
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginLeft: 12,
  },
  tipsBadge: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '600',
  },
});
