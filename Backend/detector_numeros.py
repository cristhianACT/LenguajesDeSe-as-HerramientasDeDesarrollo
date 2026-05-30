def get_distance(p1, p2):
    import math
    return math.hypot(p2[1] - p1[1], p2[2] - p1[2])

def detect_number(lm_list, fingers):
    """
    Módulo para la detección de números (0-10) en lenguaje de señas.
    """
    if not lm_list:
        return "Ninguno"
        
    total = sum(fingers)
    
    if total == 0: return "0"
    if total == 5: return "5"
    
    if fingers == [0, 1, 0, 0, 0]: return "1"
    if fingers == [0, 1, 1, 0, 0]: return "2"
    if fingers == [1, 1, 1, 0, 0] or fingers == [0, 1, 1, 1, 0]: return "3"
    if fingers == [0, 1, 1, 1, 1]: return "4"
    if fingers == [1, 0, 0, 0, 0]: return "10"
    
    thumb_tip = lm_list[4]
    d_index = get_distance(thumb_tip, lm_list[8])
    d_middle = get_distance(thumb_tip, lm_list[12])
    d_ring = get_distance(thumb_tip, lm_list[16])
    d_pinky = get_distance(thumb_tip, lm_list[20])
    
    touch_threshold = 40 
    
    if d_pinky < touch_threshold and fingers[1]==1 and fingers[2]==1 and fingers[3]==1:
        return "6"
    if d_ring < touch_threshold and fingers[1]==1 and fingers[2]==1 and fingers[4]==1:
        return "7"
    if d_middle < touch_threshold and fingers[1]==1 and fingers[3]==1 and fingers[4]==1:
        return "8"
    if d_index < touch_threshold and fingers[2]==1 and fingers[3]==1 and fingers[4]==1:
        return "9"
        
    if total == 1: return "1"
    if total == 2: return "2"
    if total == 3: return "3"
    if total == 4: return "4"
    
    return "Detectando número..."
