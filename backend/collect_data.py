import cv2
import numpy as np
import mediapipe as mp
from mediapipe.python.solutions import pose as mp_pose
from collections import deque

# ---------------- CAMERA ----------------
# If the camera doesn't open, change 0 to 1
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("ERROR: Webcam not accessible.")
    exit()

# ---------------- MEDIAPIPE ----------------
pose = mp_pose.Pose(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# ---------------- PARAMETERS ----------------
FPS = 15
WINDOW_SECONDS = 2   # Look at the last 2 seconds of data
BUFFER_SIZE = FPS * WINDOW_SECONDS

# Upper body (Arms + Head)
UPPER_BODY_IDS = [
    mp_pose.PoseLandmark.NOSE,
    mp_pose.PoseLandmark.LEFT_SHOULDER,
    mp_pose.PoseLandmark.RIGHT_SHOULDER,
    mp_pose.PoseLandmark.LEFT_WRIST,
    mp_pose.PoseLandmark.RIGHT_WRIST
]

# Lower body (Hips)
LOWER_BODY_IDS = [
    mp_pose.PoseLandmark.LEFT_HIP,
    mp_pose.PoseLandmark.RIGHT_HIP
]

ALL_IDS = UPPER_BODY_IDS + LOWER_BODY_IDS

# --- SENSITIVITY SETTINGS ---
# Oscillations: How many "shakes" back and forth in 2 seconds?
MIN_OSCILLATIONS = 3 
# Amplitude: How big are the movements (pixels)?
MIN_UPPER_AMP = 15  
MIN_FULL_AMP = 10   

# Alert settings
ALERT_HOLD_FRAMES = 45 # Keep alert on screen for 3 seconds
seizure_active = False
alert_timer = 0

# ---------------- STATE BUFFERS ----------------
# We store the X-position of every body part
joint_buffers = {kp: deque(maxlen=BUFFER_SIZE) for kp in ALL_IDS}

# Variables for display
avg_osc = 0
avg_amp = 0
status_text = "MONITORING"
status_color = (0, 255, 0) # Green

print("System Active. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Resize for faster processing
    frame = cv2.resize(frame, (640, 480))
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process Pose
    result = pose.process(rgb)

    # 1. Update Buffers
    if result.pose_landmarks:
        for kp in ALL_IDS:
            lm = result.pose_landmarks.landmark[kp]
            x_pixel = int(lm.x * w)
            y_pixel = int(lm.y * h)
            
            # Store the data
            joint_buffers[kp].append(x_pixel)
            
            # Draw visual skeleton
            cv2.circle(frame, (x_pixel, y_pixel), 5, (0, 255, 255), -1)

    # 2. Analyze Data (Only if buffer is full)
    # We check the first keypoint to see if we have enough data yet
    if len(joint_buffers[UPPER_BODY_IDS[0]]) == BUFFER_SIZE:
        
        upper_oscs = []
        upper_amps = []
        
        # Analyze Upper Body
        for kp in UPPER_BODY_IDS:
            data = np.array(joint_buffers[kp])
            
            # Center the data around 0
            data = data - np.mean(data)
            
            # Calculate Amplitude (Spread of movement)
            amp = np.max(data) - np.min(data)
            upper_amps.append(amp)
            
            # Calculate Oscillations (Zero Crossings)
            # This counts how many times you changed direction
            zero_crossings = np.where(np.diff(np.sign(data)))[0]
            osc_count = len(zero_crossings) // 2
            upper_oscs.append(osc_count)

        # Average the metrics
        avg_osc = np.mean(upper_oscs)
        avg_amp = np.mean(upper_amps)

        # 3. Decision Logic
        is_seizing = False

        # Condition A: Violent Upper Body Shaking
        if avg_osc >= MIN_OSCILLATIONS and avg_amp >= MIN_UPPER_AMP:
            is_seizing = True
            
        # Trigger Alert
        if is_seizing:
            seizure_active = True
            alert_timer = ALERT_HOLD_FRAMES
        
    # 4. Handle Alert Timer (Keeps the red text on screen for a few seconds)
    if seizure_active:
        status_text = "WARNING: SEIZURE DETECTED"
        status_color = (0, 0, 255) # Red
        if alert_timer > 0:
            alert_timer -= 1
        else:
            seizure_active = False
    else:
        status_text = "MONITORING"
        status_color = (0, 255, 0) # Green

    # 5. Draw UI
    # Status Box
    cv2.rectangle(frame, (0, 0), (640, 40), (50, 50, 50), -1)
    cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)

    # Debug Values (So you can see what the camera sees)
    cv2.putText(frame, f"Shakes: {avg_osc:.1f} (Req: {MIN_OSCILLATIONS})", (10, 420), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
    cv2.putText(frame, f"Energy: {avg_amp:.1f} (Req: {MIN_UPPER_AMP})", (10, 450), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)

    cv2.imshow("Seizure Detector", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()