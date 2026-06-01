def get_distance(p1, p2):
    import math
    return math.hypot(p2[1] - p1[1], p2[2] - p1[2])

def detect_letter(lm_list, fingers):
    """
    Módulo del Abecedario (A-Z) para la detección de lenguaje de señas.
    Utiliza heurísticas basadas en la posición de los dedos.
    """
    if not lm_list:
        return "Ninguno"
        
    thumb_tip = lm_list[4]
    index_tip = lm_list[8]
    middle_tip = lm_list[12]
    
    # A: Puño cerrado, pulgar al costado
    if fingers == [1, 0, 0, 0, 0] or fingers == [0, 0, 0, 0, 0]:
        return "A"
    
    # B: Mano abierta, pulgar doblado
    if fingers == [0, 1, 1, 1, 1]:
        return "B"
        
    # C: Dedos curvados en C
    if fingers == [1, 1, 1, 1, 1] and 20 < get_distance(thumb_tip, index_tip) < 80:
        return "C"
        
    # D: Solo dedo índice arriba, pulgar tocando los otros
    if fingers == [0, 1, 0, 0, 0] and get_distance(thumb_tip, middle_tip) < 50:
        return "D"
            
    # E: Dedos recogidos hacia la palma
    if fingers == [0, 0, 0, 0, 0] and get_distance(thumb_tip, index_tip) < 40:
        return "E"
        
    # F: Índice y pulgar tocándose, 3 dedos restantes arriba
    if fingers == [0, 0, 1, 1, 1] and get_distance(thumb_tip, index_tip) < 40:
        return "F"
        
    # I: Solo el dedo meñique arriba
    if fingers == [0, 0, 0, 0, 1]:
        return "I"
        
    # L: Pulgar e índice formando una L
    if fingers == [1, 1, 0, 0, 0]:
        return "L"
        
    # U: Índice y medio arriba juntos
    if fingers == [0, 1, 1, 0, 0] and get_distance(index_tip, middle_tip) < 30:
        return "U"
        
    # V: Índice y medio arriba separados
    if fingers == [0, 1, 1, 0, 0] and get_distance(index_tip, middle_tip) >= 30:
        return "V"
        
    # W: Índice, medio y anular arriba
    if fingers == [0, 1, 1, 1, 0]:
        return "W"
        
    # Y: Pulgar y meñique estirados
    if fingers == [1, 0, 0, 0, 1]:
        return "Y"
        
    return "Detectando letra..."
