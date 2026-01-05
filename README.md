SeizureGuard

A real-time pose-based seizure detection web application built using computer vision, machine learning, and modern web technologies.
The system analyzes human body movements from video streams to identify abnormal motion patterns associated with seizures.

This project was developed as part of a hackathon with a focus on future applications of AI in healthcare monitoring.

Features

- Real-time video-based monitoring

- Human pose detection using landmarks (no facial recognition)

- Motion analysis using pose dynamics

- Lightweight & fast (no heavy deep learning models like YOLO)

- Web-based UI (easy to deploy and use)

- Modular and scalable architecture



Tech Stack

Frontend

React + TypeScript

Vite (fast development & build tool)

Tailwind CSS (utility-first styling)

ShadCN/UI components

Computer Vision & ML (Backend / Logic)

Python

OpenCV

MediaPipe (pose estimation)

NumPy

Scikit-learn (classification logic)


 How the Detection Works (High Level)

1.Video Input
Webcam or uploaded video is captured frame-by-frame.

2.Pose Estimation
MediaPipe extracts key body landmarks (head, shoulders, arms, legs).

3.Feature Extraction

Sudden velocity changes

Repetitive abnormal movements

Pose instability over time

4.Classification Logic
A lightweight ML classifier evaluates motion patterns to determine seizure probability.

5.Alert System
If a threshold is crossed → seizure warning is triggered on the UI.


Prerequisites

Node.js (v18+ recommended)

Python 3.9+

Webcam (for live detection)

OpenCV

mediapipe

numpy

scikit-learn


Python Dependencies
opencv 
mediapipe 
numpy 
scikit-learn



Localhost Deployment
1.Clone / Open Project Directory Using :
cd "proj/hackathon fr"
2.Install Frontend Dependencies using:
npm install
3.Start Frontend Development Server using:
npm run dev
4.Open this URL in your browser.
Local: http://localhost:8080/



