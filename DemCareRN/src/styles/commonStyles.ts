import { StyleSheet } from 'react-native';

export const commonHeaderStyles = StyleSheet.create({
  headerSurface: {
    borderRadius: 0,
    elevation: 4,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 60, // Standard top padding for status bar + header
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  backButton: {
    margin: 0,
  },
});

export const commonCardStyles = StyleSheet.create({
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 3,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
});

export const commonLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginHorizontal: 16,
  },
});
