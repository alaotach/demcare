# 🎥 DemCare IP Camera Setup Guide

This guide will help you set up your laptop camera as an IP camera for the DemCare mobile app.

## 📋 Quick Setup

### Step 1: Install Python
1. Download Python 3.7+ from [python.org](https://python.org)
2. During installation, make sure to check "Add Python to PATH"
3. Verify installation by opening Command Prompt and typing: `python --version`

### Step 2: Start Camera Server
1. Navigate to the `camera_server` folder in your DemCare project
2. Double-click `start_camera_server.bat` (Windows)
3. The script will automatically:
   - Create a virtual environment
   - Install required packages (OpenCV, Flask, etc.)
   - Start the camera server

### Step 3: Connect from Mobile App
1. Open the DemCare mobile app
2. Go to the "Camera" tab
3. Enter the IP address shown in the terminal (e.g., `192.168.1.100:5000/video`)
4. Tap "Connect to Camera"

## 🔧 Manual Setup (Alternative)

If the batch script doesn't work, follow these manual steps:

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
python ip_camera_server.py
```

## ⚙️ Configuration Options

You can customize the camera server with command-line arguments:

```bash
python ip_camera_server.py --help
```

Common options:
- `--width 1280 --height 720` - Set resolution
- `--fps 30` - Set frame rate
- `--port 5000` - Change server port
- `--camera 0` - Select camera (0 for default, 1 for external)

Example:
```bash
python ip_camera_server.py --width 1920 --height 1080 --fps 15 --port 8080
```

## 📱 Mobile App Usage

### Auto-Detection
The app automatically scans for DemCare camera servers on your network. If detected, it will show a notification and pre-fill the IP address.

### Manual Connection
1. Format: `IP:PORT/path`
2. Example: `192.168.1.100:5000/video`
3. Make sure both devices are on the same WiFi network

### Camera Presets
The app includes quick presets for common camera configurations:
- DemCare Camera Server (Port 5000)
- Standard IP Camera (Port 8080)
- RTSP Camera (Port 554)

## 🔍 Troubleshooting

### Camera Not Found
- **Issue**: "Camera not found" error
- **Solutions**:
  - Close other apps using the camera (Zoom, Skype, etc.)
  - Try different camera index: `--camera 1` or `--camera 2`
  - Check camera permissions in system settings

### Connection Failed
- **Issue**: Mobile app can't connect
- **Solutions**:
  - Ensure both devices are on the same WiFi network
  - Check firewall settings (allow port 5000)
  - Use the correct IP address (not 127.0.0.1 or localhost)
  - Verify the camera server is running

### Poor Performance
- **Issue**: Slow or choppy video
- **Solutions**:
  - Reduce resolution: `--width 640 --height 480`
  - Lower frame rate: `--fps 15`
  - Close unnecessary applications
  - Use a wired network connection if possible

### Network Issues
- **Issue**: Can't find the IP address
- **Solutions**:
  - Check your IP: `ipconfig` (Windows) or `ifconfig` (macOS/Linux)
  - Use router admin panel to find device IP
  - Try common IP ranges: 192.168.1.x, 192.168.0.x, 10.0.0.x

## 🌐 Web Interface

The camera server includes a web interface for testing:
1. Open browser
2. Go to `http://YOUR_IP:5000`
3. View live camera feed
4. Check server status

## 🔒 Security Notes

⚠️ **Important Security Information**:
- This server is designed for local network use only
- Do not expose to the internet without proper security
- Use only on trusted networks
- Consider using HTTPS in production environments

## 📊 API Endpoints

The camera server provides several API endpoints:

- `GET /video` - MJPEG video stream
- `GET /api/status` - Camera status (JSON)
- `GET /api/snapshot` - Single frame capture
- `GET /` - Web interface

Example status response:
```json
{
  "status": "active",
  "resolution": "1280x720",
  "fps": 30,
  "timestamp": "2025-07-24 10:30:45"
}
```

## 💡 Tips for Best Results

1. **Good Lighting**: Ensure adequate lighting for clear video
2. **Stable Position**: Mount or position laptop securely
3. **Network**: Use 5GHz WiFi for better performance
4. **Power**: Keep laptop plugged in during monitoring
5. **Background**: Minimize background applications

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review terminal output for error messages
3. Ensure all requirements are met
4. Contact support with specific error details

## 📝 Example Workflow

### First Time Setup:
1. Install Python ✅
2. Run `start_camera_server.bat` ✅
3. Note the IP address (e.g., 192.168.1.100:5000) ✅
4. Open DemCare mobile app ✅
5. Enter IP in Camera tab ✅
6. Start monitoring! 🎉

### Daily Use:
1. Run `start_camera_server.bat`
2. Open mobile app
3. Camera should auto-connect if IP is saved
4. Begin patient monitoring

The camera server is now ready for use with your DemCare mobile application!
