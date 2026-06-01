def detect_word(lm_list, fingers):
    """
    Módulo para la detección de palabras y frases comunes.
    """
    if not lm_list:
        return "Ninguno"
        
    total = sum(fingers)
    
    if total == 5: return "Hola"
    if total == 0: return "No"
    if total == 1 and fingers[0] == 1: return "Sí"
    if total == 2 and fingers[1] == 1 and fingers[2] == 1: return "Gracias"
    if total == 3: return "Ayuda"
    
    return "Detectando palabra..."
