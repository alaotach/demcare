import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinates } from '../types';

export interface BeaconStatus {
  [patientName: string]: 'IN_RANGE' | 'OUT_OF_RANGE' | 'UNKNOWN';
}

export interface PatientLocation {
  id: string;
  name: string;
  rfidMac: string;
  status: 'IN_RANGE' | 'OUT_OF_RANGE' | 'UNKNOWN';
  lastSeen: string;
  currentRoom?: string;
  coordinates?: Coordinates;
  batteryLevel?: number;
  signalStrength?: number;
  zone?: string;
  lastMovement?: string;
}

export class BeaconService {
  private static readonly DEFAULT_SERVER_IP = '192.168.61.162';
  private static readonly SERVER_PORT = '5000';

  /**
   * Get the current server IP from storage or return default
   */
  static async getServerIp(): Promise<string> {
    try {
      const storedIp = await AsyncStorage.getItem('beacon_server_ip');
      return storedIp || this.DEFAULT_SERVER_IP;
    } catch (error) {
      console.error('Error getting server IP:', error);
      return this.DEFAULT_SERVER_IP;
    }
  }

  /**
   * Set the server IP in storage
   */
  static async setServerIp(ip: string): Promise<void> {
    try {
      await AsyncStorage.setItem('beacon_server_ip', ip);
    } catch (error) {
      console.error('Error setting server IP:', error);
      throw error;
    }
  }

  /**
   * Fetch beacon status from Raspberry Pi server
   */
  static async fetchBeaconStatus(): Promise<BeaconStatus> {
    try {
      const serverIp = await this.getServerIp();
      const url = `http://${serverIp}:${this.SERVER_PORT}/get_status`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as BeaconStatus;
    } catch (error) {
      console.error('Error fetching beacon status:', error);
      throw error;
    }
  }

  /**
   * Get patient locations with beacon status
   */
  static async getPatientLocations(patients: any[]): Promise<PatientLocation[]> {
    try {
      const beaconStatus = await this.fetchBeaconStatus();
      
      return patients.map(patient => {
        const rfidMac = patient.rfidMac || patient.macAddress || '';
        let status: 'IN_RANGE' | 'OUT_OF_RANGE' | 'UNKNOWN' = 'UNKNOWN';
        
        // Check if this patient's RFID MAC is in the beacon data
        if (rfidMac && beaconStatus[patient.fullName || patient.name]) {
          status = beaconStatus[patient.fullName || patient.name];
        } else if (rfidMac) {
          // Check by MAC address directly
          const macStatus = Object.entries(beaconStatus).find(([key, _]) => 
            key.includes(rfidMac) || rfidMac.includes(key)
          );
          if (macStatus) {
            status = macStatus[1];
          } else {
            status = 'OUT_OF_RANGE';
          }
        }

        return {
          id: patient.id,
          name: patient.fullName || patient.name,
          rfidMac,
          status,
          lastSeen: status === 'IN_RANGE' ? new Date().toISOString() : patient.lastSeen || 'Unknown',
        };
      });
    } catch (error) {
      console.error('Error getting patient locations:', error);
      // Return patients with unknown status if beacon fetch fails
      return patients.map(patient => ({
        id: patient.id,
        name: patient.fullName || patient.name,
        rfidMac: patient.rfidMac || patient.macAddress || '',
        status: 'UNKNOWN' as const,
        lastSeen: patient.lastSeen || 'Unknown',
      }));
    }
  }

  /**
   * Start auto-refresh for beacon status
   */
  static startAutoRefresh(
    callback: (locations: PatientLocation[]) => void,
    patients: any[],
    intervalMs: number = 1000
  ): NodeJS.Timeout {
    const interval = setInterval(async () => {
      try {
        const locations = await this.getPatientLocations(patients);
        callback(locations);
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    }, intervalMs);

    return interval;
  }

  /**
   * Stop auto-refresh
   */
  static stopAutoRefresh(interval: NodeJS.Timeout): void {
    clearInterval(interval);
  }

  /**
   * Test connection to beacon server
   */
  static async testConnection(ip?: string): Promise<boolean> {
    try {
      const serverIp = ip || await this.getServerIp();
      const url = `http://${serverIp}:${this.SERVER_PORT}/get_status`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}
