import cv2
import numpy as np
import io
from typing import List, Tuple

def detect_lots_in_image(image_bytes: bytes) -> List[Tuple[float, float]]:
    """
    Usa OpenCV para detectar formatos retangulares em uma planta humanizada.
    Retorna uma lista de coordenadas (x, y) normalizadas (0-100).
    """
    # Converter bytes para imagem OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return []

    height, width = img.shape[:2]
    
    # Processamento de imagem
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Detecção de bordas
    # Ajuste adaptativo pode ser melhor, mas usaremos Canny básico com threshold adaptativo
    edged = cv2.Canny(blurred, 50, 150)
    
    # Dilatação para fechar gaps nas bordas dos lotes
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(edged, kernel, iterations=1)
    
    # Encontrar contornos
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    detected_centers = []
    
    # Área mínima e máxima para ser considerado um lote (proporcional à imagem)
    min_area = (width * height) * 0.0001 # 0.01% da imagem
    max_area = (width * height) * 0.05   # 5% da imagem

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if min_area < area < max_area:
            # Aproximar o polígono
            peri = cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, 0.04 * peri, True)
            
            # Se tiver 4 lados, é bem provável que seja um lote
            # Mas vamos aceitar formas convexas entre 3 e 8 lados para ser flexível
            if 3 <= len(approx) <= 8:
                # Calcular o centro
                M = cv2.moments(cnt)
                if M["m00"] != 0:
                    cX = int(M["m10"] / M["m00"])
                    cY = int(M["m01"] / M["m00"])
                    
                    # Normalizar (0-100)
                    norm_x = (cX / width) * 100
                    norm_y = (cY / height) * 100
                    detected_centers.append((norm_x, norm_y))

    return detected_centers
