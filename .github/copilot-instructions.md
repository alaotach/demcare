# DemCare - Patient Monitoring System

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
DemCare is an Expo React Native application for patient monitoring with Firebase backend. The app serves doctors, caregivers, and family members to monitor patients' vital signs in real-time.

## Architecture Guidelines
- Use TypeScript for type safety
- Implement Firebase for authentication and real-time data
- Use Zustand for state management
- Follow React Native Paper design system
- Implement role-based access control (Doctor, Caregiver, Family Member, Physician)
- Use React Navigation for routing

## Key Features
- Authentication with role-based access
- Doctor dashboard with patient management
- Real-time vital signs monitoring (Heart Rate, SpO₂, Respiratory Rate, Step Count)
- Live camera feed integration
- QR/MAC address scanning for device pairing
- Subscription management (Free, Premium, Enterprise)
- Dark/Light mode support
- Push notifications for alerts

## File Structure
- `/src/components/` - Reusable UI components
- `/src/screens/` - Screen components for navigation
- `/src/services/` - Firebase and external service integrations
- `/src/store/` - Zustand state management
- `/src/types/` - TypeScript type definitions

## Code Standards
- Use functional components with hooks
- Implement proper error handling
- Follow accessibility guidelines
- Use async/await for asynchronous operations
- Implement proper loading states
- Add comprehensive error boundaries
