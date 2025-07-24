# DemCare IP Camera Server

This directory contains the IP camera server that turns your laptop's camera into a network camera stream that can be accessed by the DemCare mobile app.

## 🚀 Quick Start

### Windows
1. Double-click `start_camera_server.bat`
2. The script will automatically:
   - Check for Python installation
   - Create a virtual environment
   - Install required dependencies
   - Start the camera server

### Manual Setup

1. **Install Python 3.7+** from https://python.org

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the server**:
   ```bash
   python ip_camera_server.py
   ```

## 📱 Usage in DemCare App

1. Start the camera server using the steps above
2. Note the IP address shown in the terminal (e.g., `http://192.168.1.100:5000/video`)
3. Open the DemCare mobile app
4. Navigate to the Camera tab
5. Enter the IP address in the format: `192.168.1.100:5000/video`
6. Tap "Connect to Camera"

## 🛠️ Configuration Options

```bash
python ip_camera_server.py --help
```

Available options:
- `--camera 0` - Camera index (0 for default camera)
- `--width 1280` - Frame width in pixels
- `--height 720` - Frame height in pixels
- `--fps 30` - Frames per second
- `--port 5000` - Server port
- `--host 0.0.0.0` - Server host (0.0.0.0 allows external access)

## 📊 API Endpoints

- `GET /video` - MJPEG video stream
- `GET /api/status` - Camera status information
- `GET /api/snapshot` - Single frame capture
- `GET /` - Web interface for testing

## 🔧 Troubleshooting

### Camera Not Found
- Ensure no other applications are using the camera
- Try different camera indices (0, 1, 2, etc.)
- Check camera permissions

### Network Issues
- Ensure both devices are on the same network
- Check firewall settings (allow port 5000)
- Use the correct IP address (not 127.0.0.1)

### Performance Issues
- Reduce resolution: `--width 640 --height 480`
- Lower frame rate: `--fps 15`
- Close other applications using the camera

## 📋 Requirements

- Python 3.7+
- OpenCV (opencv-python)
- Flask
- Flask-CORS
- NumPy
- Webcam/laptop camera

## 🔒 Security Notes

- This server is intended for local network use
- Do not expose to the internet without proper security measures
- Consider using HTTPS in production environments
