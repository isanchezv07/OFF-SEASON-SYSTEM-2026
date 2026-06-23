import cv2 
import json
import numpy as np

cap = cv2.VideoCapture(0)

selected_color = None
tolerance = 20
sample_size = 10

# Valores suavizados
smooth_x, smooth_y = None, None
alpha = 0.5  # factor de suavizado

# Puntuación
score = 0
last_tick = cv2.getTickCount()

# Definir cuadros más grandes
score_box = ((50, 50), (250, 250))   # cuadro verde a la izquierda
reset_box = ((550, 50), (750, 250))  # cuadro rojo a la derecha

def pick_color(event, x, y, flags, param):
    global selected_color
    if event == cv2.EVENT_LBUTTONDOWN:
        frame = param.copy()
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        h, w, _ = hsv.shape
        x1, x2 = max(0, x - sample_size), min(w, x + sample_size)
        y1, y2 = max(0, y - sample_size), min(h, y + sample_size)
        roi = hsv[y1:y2, x1:x2]
        selected_color = np.mean(roi.reshape(-1, 3), axis=0).astype(int)
        print(f"Color promedio seleccionado (HSV): {selected_color}")

cv2.namedWindow("Frame")
cv2.namedWindow("Info")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    info_text = []

    if selected_color is not None:
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        lower = np.array([
            max(0, int(selected_color[0]) - tolerance),
            max(50, int(selected_color[1]) - 50),
            max(50, int(selected_color[2]) - 50)
        ], dtype=np.uint8)
        upper = np.array([
            min(179, int(selected_color[0]) + tolerance),
            min(255, int(selected_color[1]) + 50),
            min(255, int(selected_color[2]) + 50)
        ], dtype=np.uint8)

        mask = cv2.inRange(hsv, lower, upper)
        mask = cv2.medianBlur(mask, 3)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        object_detected = False

        if contours:
            c = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(c)
            if area > 500:
                (x, y), radius = cv2.minEnclosingCircle(c)
                if smooth_x is None:
                    smooth_x, smooth_y = x, y
                else:
                    smooth_x = alpha * x + (1 - alpha) * smooth_x
                    smooth_y = alpha * y + (1 - alpha) * smooth_y

                cv2.circle(frame, (int(smooth_x), int(smooth_y)), int(radius), (0, 255, 0), 2)
                object_detected = True

        # Dibujar cuadros
        cv2.rectangle(frame, score_box[0], score_box[1], (0, 255, 0), 3)
        cv2.putText(frame, "SCORE", (score_box[0][0], score_box[0][1]-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.rectangle(frame, reset_box[0], reset_box[1], (0, 0, 255), 3)
        cv2.putText(frame, "RESET", (reset_box[0][0], reset_box[0][1]-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # Control de puntaje
        if object_detected:
            current_tick = cv2.getTickCount()
            elapsed_time = (current_tick - last_tick) / cv2.getTickFrequency()

            # Dentro del cuadro de puntaje
            if score_box[0][0] <= smooth_x <= score_box[1][0] and score_box[0][1] <= smooth_y <= score_box[1][1]:
                if elapsed_time >= 1.0:
                    score += 1
                    last_tick = current_tick

            # Dentro del cuadro de reset
            if reset_box[0][0] <= smooth_x <= reset_box[1][0] and reset_box[0][1] <= smooth_y <= reset_box[1][1]:
                score = 0
                last_tick = current_tick

        # Info
        if smooth_x is not None and smooth_y is not None:
            info_text.append(f"Color HSV: {selected_color}")
            info_text.append(f"Position: ({int(smooth_x)}, {int(smooth_y)})")
            info_text.append(f"Score: {score}")
            datos = [{"score": score}]
            with open("detection_score.json", "w", encoding="utf-8") as archivo:
                json.dump(datos, archivo, ensure_ascii=False, indent=4)

        cv2.imshow("Mask", mask)

    # Ventana de info
    info_img = np.zeros((150, 400, 3), dtype=np.uint8)
    for i, line in enumerate(info_text):
        cv2.putText(info_img, line, (10, 30 + i*40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    cv2.imshow("Info", info_img)
    cv2.imshow("Frame", frame)
    cv2.setMouseCallback("Frame", pick_color, frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()