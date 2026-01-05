from flask import Flask, jsonify, Response, request, make_response
from flask_cors import CORS
import threading
import cv2
import mediapipe as mp
import numpy as np
from collections import deque
import time
import webbrowser # Opens the Desktop App
import pyautogui  # Presses keys (Enter, Alt+F4)
import urllib.parse # Formats the message safely
from datetime import datetime
import io
import csv

app = Flask(__name__)
CORS(app)

# --- 1. CONFIGURATION ---
# ⚠️ Leave empty to start. User adds number in UI.
ADMIN_NUMBER = "" 

# --- SENSITIVITY SETTINGS ---
FPS = 15
WINDOW_SECONDS = 1.0   
BUFFER_SIZE = int(FPS * WINDOW_SECONDS)

MIN_OSCILLATIONS = 0.75  
MIN_UPPER_AMP = 6        
CONFIRMATION_FRAMES = 15 
ALERT_HOLD_FRAMES = 45  

# --- 2. GLOBAL VARIABLES ---
latest_data = {
    "status": "Running",
    "seizure_detected": False,
    "debug_shakes": 0.0,
    "debug_energy": 0.0
}
emergency_contact = {"number": ADMIN_NUMBER}

# 📝 HISTORY LOG (For Reports)
history_log = []

output_frame = None
lock = threading.Lock()

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

UPPER_BODY_IDS = [mp_pose.PoseLandmark.NOSE, mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.RIGHT_SHOULDER]
joint_buffers = {kp: deque(maxlen=BUFFER_SIZE) for kp in UPPER_BODY_IDS}

# --- 3. HELPER FUNCTIONS ---

def log_event(event_type, details="", duration=0):
    """Adds an event to the history log with a timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = {
        "Timestamp": timestamp,
        "Event": event_type,
        "Details": details,
        "Duration (sec)": f"{duration:.1f}" if duration > 0 else "-"
    }
    history_log.append(entry)
    print(f"📝 Logged: {event_type} - {details}")

def send_whatsapp_alert():
    """Automates the WhatsApp Desktop App to send an alert."""
    contact = emergency_contact["number"]
    
    if not contact:
        print("ℹ️ No contact number set. Skipping alert.")
        return

    print(f"🚨 ALERTING: {contact}")
    
    try:
        # 1. Prepare Message
        message = "🚨 ALERT: Seizure detected by SeizureGuard System! Immediate attention required."
        encoded_msg = urllib.parse.quote(message)
        
        # 2. Open Desktop App
        url = f"whatsapp://send?phone={contact}&text={encoded_msg}"
        webbrowser.open(url)
        
        # 3. Wait for App Load
        time.sleep(6) 
        
        # 4. Send (Press Enter Twice)
        pyautogui.press('enter')
        time.sleep(1)
        pyautogui.press('enter')
        
        # 5. Wait & Close
        time.sleep(2)
        pyautogui.hotkey('alt', 'f4')
        print("✅ Alert Sent & App Closed.")
        
    except Exception as e:
        print(f"❌ Automation failed: {e}")

# --- 4. MAIN CAMERA LOOP ---
def camera_loop():
    global latest_data, output_frame, joint_buffers
    cap = cv2.VideoCapture(0)
    
    seizure_active = False
    alert_hold_timer = 0
    consecutive_shake_frames = 0
    alert_already_sent = False
    
    # Tracking variables for report
    seizure_start_time = 0
    max_intensity = 0.0

    print(f"--- SYSTEM READY ---")
    log_event("System Started", "Monitoring Initialized")

    while True:
        success, frame = cap.read()
        if not success: continue

        frame = cv2.resize(frame, (640, 480))
        h, w, _ = frame.shape
        frame = cv2.flip(frame, 1)
        imgRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(imgRGB)
        
        avg_osc = 0.0
        avg_amp = 0.0
        current_status = False

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
            
            for kp in UPPER_BODY_IDS:
                lm = results.pose_landmarks.landmark[kp]
                x_pixel = int(lm.x * w)
                joint_buffers[kp].append(x_pixel)

            if len(joint_buffers[UPPER_BODY_IDS[0]]) == BUFFER_SIZE:
                upper_oscs = []
                upper_amps = []
                
                for kp in UPPER_BODY_IDS:
                    data = np.array(joint_buffers[kp])
                    data = data - np.mean(data)
                    amp = np.max(data) - np.min(data)
                    upper_amps.append(amp)
                    zero_crossings = np.where(np.diff(np.sign(data)))[0]
                    upper_oscs.append(len(zero_crossings) // 2)
                
                avg_osc = float(np.mean(upper_oscs))
                avg_amp = float(np.mean(upper_amps))

                is_shaking_now = (avg_osc >= MIN_OSCILLATIONS and avg_amp >= MIN_UPPER_AMP)

                if is_shaking_now:
                    consecutive_shake_frames += 1
                else:
                    consecutive_shake_frames = max(0, consecutive_shake_frames - 2)

                if consecutive_shake_frames >= CONFIRMATION_FRAMES:
                    seizure_active = True
                    alert_hold_timer = ALERT_HOLD_FRAMES
                    consecutive_shake_frames = CONFIRMATION_FRAMES 
                    
                    # Track Max Intensity for Report
                    if avg_amp > max_intensity:
                        max_intensity = avg_amp

        if seizure_active:
            current_status = True
            
            # --- START OF SEIZURE EVENT ---
            if not alert_already_sent:
                seizure_start_time = time.time()
                log_event("⚠️ SEIZURE DETECTED", f"Initial Intensity: {avg_amp:.1f}")
                
                # Trigger WhatsApp in background
                threading.Thread(target=send_whatsapp_alert, daemon=True).start()
                
                alert_already_sent = True

            if alert_hold_timer > 0:
                alert_hold_timer -= 1
            else:
                # --- END OF SEIZURE EVENT ---
                seizure_active = False
                consecutive_shake_frames = 0 
                alert_already_sent = False 
                
                # Log completion
                duration = time.time() - seizure_start_time
                log_event("✅ Seizure Ended", f"Max Intensity: {max_intensity:.1f}", duration)
                max_intensity = 0.0 # Reset
        else:
            alert_already_sent = False

        latest_data["seizure_detected"] = current_status
        latest_data["debug_shakes"] = avg_osc
        latest_data["debug_energy"] = avg_amp

        # Visuals
        if current_status:
            cv2.rectangle(frame, (0,0), (w,h), (0,0,255), 20)
            cv2.putText(frame, "SEIZURE DETECTED!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
            
            msg = f"Alerting: {emergency_contact['number']}" if emergency_contact['number'] else "No Contact Set"
            cv2.putText(frame, msg, (50, 450), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        else:
            progress = min(consecutive_shake_frames / CONFIRMATION_FRAMES, 1.0)
            bar_width = int(200 * progress)
            cv2.rectangle(frame, (10, 380), (210, 400), (50, 50, 50), -1)
            
            bar_color = (0, 255, 0)
            if progress > 0.5: bar_color = (0, 255, 255)
            if progress > 0.8: bar_color = (0, 0, 255)
            
            cv2.rectangle(frame, (10, 380), (10 + bar_width, 400), bar_color, -1)
            cv2.putText(frame, f"Shakes: {avg_osc:.1f}", (10, 430), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        with lock:
            ret, encodedImg = cv2.imencode('.jpg', frame)
            if ret:
                output_frame = encodedImg.tobytes()

threading.Thread(target=camera_loop, daemon=True).start()

# --- 5. API ROUTES ---

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(latest_data)

@app.route('/video_feed')
def video_feed():
    def generate():
        while True:
            with lock:
                if output_frame is None: continue
                yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + output_frame + b'\r\n')
            time.sleep(0.03)
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/set_contact', methods=['POST'])
def set_contact():
    data = request.json
    number = data.get("number", "")
    
    if number and not number.startswith("+"): 
        number = "+" + number 
        
    emergency_contact["number"] = number
    print(f"Emergency contact updated to: {emergency_contact['number']}")
    return jsonify({"success": True})

# 🆕 REPORT GENERATION ROUTE
@app.route('/api/get_report', methods=['GET'])
def get_report():
    # Create CSV in memory
    si = io.StringIO()
    cw = csv.writer(si)
    
    # Write Header
    cw.writerow(["Timestamp", "Event Type", "Details", "Duration (sec)"])
    
    # Write Data
    for entry in history_log:
        cw.writerow([entry["Timestamp"], entry["Event"], entry["Details"], entry["Duration (sec)"]])
        
    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=NeuroGuard_Report.csv"
    output.headers["Content-type"] = "text/csv"
    return output

if __name__ == '__main__':
    # Run with Python 3.10 if needed (py -3.10 server.py)
    app.run(port=5000, debug=True, use_reloader=False)