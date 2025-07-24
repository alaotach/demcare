#!/usr/bin/env python3
"""
IP Camera Server using OpenCV and Flask
Creates an HTTP MJPEG stream from laptop's camera
"""

import cv2
import threading
import time
from flask import Flask, Response, render_template_string, jsonify, request
from flask_cors import CORS
import argparse
import socket

app = Flask(__name__)
CORS(app)

class IPCameraServer:
    def __init__(self, camera_index=0, width=640, height=480, fps=30):
        self.camera_index = camera_index
        self.width = width
        self.height = height
        self.fps = fps
        self.camera = None
        self.frame = None
        self.lock = threading.Lock()
        self.running = False
        
    def initialize_camera(self):
        try:
            self.camera = cv2.VideoCapture(self.camera_index)
            if not self.camera.isOpened():
                raise Exception(f"Cannot open camera {self.camera_index}")
            
            # Set camera properties
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            self.camera.set(cv2.CAP_PROP_FPS, self.fps)
            
            print(f"Camera initialized: {self.width}x{self.height} @ {self.fps}fps")
            return True
        except Exception as e:
            print(f"Error initializing camera: {e}")
            return False
    
    def capture_frames(self):
        while self.running:
            if self.camera is None:
                break
                
            ret, frame = self.camera.read()
            if ret:
                # Add timestamp to frame
                timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                cv2.putText(frame, f"DemCare Camera - {timestamp}", 
                           (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                # Add patient info overlay (placeholder)
                cv2.putText(frame, "Patient Monitoring Active", 
                           (10, self.height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                
                with self.lock:
                    self.frame = frame.copy()
            
            time.sleep(1/self.fps)
    
    def get_frame(self):
        """Get the current frame"""
        with self.lock:
            if self.frame is not None:
                return self.frame.copy()
        return None
    
    def start(self):
        """Start the camera capture"""
        if self.initialize_camera():
            self.running = True
            self.capture_thread = threading.Thread(target=self.capture_frames)
            self.capture_thread.daemon = True
            self.capture_thread.start()
            return True
        return False
    
    def stop(self):
        """Stop the camera capture"""
        self.running = False
        if hasattr(self, 'capture_thread'):
            self.capture_thread.join()
        if self.camera:
            self.camera.release()

# Global camera instance
camera_server = IPCameraServer()

def generate_frames():
    """Generate MJPEG frames for streaming"""
    while True:
        frame = camera_server.get_frame()
        if frame is not None:
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.033)  # ~30 FPS

@app.route('/')
def index():
    """Serve a simple web interface"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>DemCare IP Camera</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; background: #f0f0f0; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .camera-feed { border: 2px solid #6200ee; border-radius: 8px; max-width: 100%; }
            .status { background: #e8f5e8; padding: 10px; border-radius: 5px; margin: 20px 0; }
            h1 { color: #6200ee; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏥 DemCare IP Camera Server</h1>
            <div class="status">
                <strong>Status:</strong> Camera Active | <strong>Stream URL:</strong> http://{{ host }}/video
            </div>
            <img src="/video" class="camera-feed" alt="Camera Feed">
            <p>Use the stream URL above in your DemCare mobile app</p>
        </div>
    </body>
    </html>
    """
    host = request.host
    return render_template_string(html, host=host)

@app.route('/video')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/mobile')
def mobile_view():
    """Mobile-friendly HTML page with video stream"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>DemCare Camera Stream</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                background: #000; 
                font-family: Arial, sans-serif;
                overflow: hidden;
            }
            .container { 
                width: 100vw; 
                height: 100vh; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                position: relative;
            }
            .video-stream { 
                max-width: 100%; 
                max-height: 100%; 
                width: auto; 
                height: auto;
                object-fit: contain;
            }
            .status-overlay {
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
            }
            .connection-indicator {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 12px;
                height: 12px;
                background: #4CAF50;
                border-radius: 50%;
                z-index: 1000;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            .loading {
                color: white;
                text-align: center;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status-overlay">🏥 DemCare Live Feed</div>
            <div class="connection-indicator"></div>
            <img src="/video" class="video-stream" alt="Camera Feed" 
                 onload="hideLoading()" 
                 onerror="showError()">
            <div id="loading" class="loading">
                <div>📹 Connecting to camera...</div>
            </div>
        </div>
        
        <script>
            function hideLoading() {
                document.getElementById('loading').style.display = 'none';
            }
            
            function showError() {
                document.getElementById('loading').innerHTML = '❌ Camera connection failed';
            }
            
            // Auto-refresh on connection loss
            setTimeout(function() {
                const img = document.querySelector('.video-stream');
                if (!img.complete || img.naturalWidth === 0) {
                    location.reload();
                }
            }, 5000);
        </script>
    </body>
    </html>
    """
    return render_template_string(html)

@app.route('/api/status')
def status():
    """API endpoint for camera status"""
    return jsonify({
        'status': 'active' if camera_server.running else 'inactive',
        'resolution': f"{camera_server.width}x{camera_server.height}",
        'fps': camera_server.fps,
        'timestamp': time.strftime("%Y-%m-%d %H:%M:%S")
    })

@app.route('/api/snapshot')
def snapshot():
    """API endpoint for single frame capture"""
    frame = camera_server.get_frame()
    if frame is not None:
        ret, buffer = cv2.imencode('.jpg', frame)
        if ret:
            return Response(buffer.tobytes(), mimetype='image/jpeg')
    return "No frame available", 404

def get_local_ip():
    """Get the local IP address"""
    try:
        # Connect to a remote address to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='DemCare IP Camera Server')
    parser.add_argument('--camera', type=int, default=0, help='Camera index (default: 0)')
    parser.add_argument('--width', type=int, default=640, help='Frame width (default: 640)')
    parser.add_argument('--height', type=int, default=480, help='Frame height (default: 480)')
    parser.add_argument('--fps', type=int, default=30, help='Frames per second (default: 30)')
    parser.add_argument('--port', type=int, default=5000, help='Server port (default: 5000)')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Server host (default: 0.0.0.0)')
    
    args = parser.parse_args()
    
    # Initialize camera server
    camera_server = IPCameraServer(args.camera, args.width, args.height, args.fps)
    
    if camera_server.start():
        local_ip = get_local_ip()
        print("=" * 60)
        print("🏥 DemCare IP Camera Server Started")
        print("=" * 60)
        print(f"📱 Mobile App URL: http://{local_ip}:{args.port}/mobile")
        print(f"🎥 Direct Stream: http://{local_ip}:{args.port}/video")
        print(f"🌐 Web Interface: http://{local_ip}:{args.port}")
        print(f"📊 Status API: http://{local_ip}:{args.port}/api/status")
        print(f"📸 Snapshot API: http://{local_ip}:{args.port}/api/snapshot")
        print("=" * 60)
        print("💡 Use the Mobile App URL in your DemCare app")
        print("🛑 Press Ctrl+C to stop the server")
        print("=" * 60)
        
        try:
            app.run(host=args.host, port=args.port, debug=False, threaded=True)
        except KeyboardInterrupt:
            print("\n🛑 Shutting down camera server...")
        finally:
            camera_server.stop()
            print("✅ Camera server stopped")
    else:
        print("❌ Failed to start camera server")
