class DatabaseService {
  static getAuthHeaders() {
    const token = AuthService.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Texts CRUD
  static async saveText(textData) {
    if (AuthService.isAuthenticated()) {
      try {
        const response = await fetch(`${API_BASE}/texts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          body: JSON.stringify(textData)
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Server save failed, using local storage');
      }
    }
    
    // Fallback to localStorage
    const texts = this.getTextsLocal();
    const newText = { ...textData, id: Date.now() };
    texts.push(newText);
    localStorage.setItem('texts', JSON.stringify(texts));
    return newText;
  }

  static async getTexts() {
    if (AuthService.isAuthenticated()) {
      try {
        const response = await fetch(`${API_BASE}/texts`, {
          headers: this.getAuthHeaders()
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Server fetch failed, using local storage');
      }
    }
    
    // Fallback to localStorage
    return this.getTextsLocal();
  }

  static getTextsLocal() {
    return JSON.parse(localStorage.getItem('texts') || '[]');
  }

  // Flashcards CRUD
  static async saveFlashcard(flashcardData) {
    if (AuthService.isAuthenticated()) {
      try {
        const response = await fetch(`${API_BASE}/flashcards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          body: JSON.stringify(flashcardData)
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Server save failed, using local storage');
      }
    }
    
    // Fallback to localStorage
    const flashcards = this.getFlashcardsLocal();
    const newFlashcard = { ...flashcardData, id: Date.now() };
    flashcards.push(newFlashcard);
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    return newFlashcard;
  }

  static async getFlashcards() {
    if (AuthService.isAuthenticated()) {
      try {
        const response = await fetch(`${API_BASE}/flashcards`, {
          headers: this.getAuthHeaders()
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Server fetch failed, using local storage');
      }
    }
    
    return this.getFlashcardsLocal();
  }

  static getFlashcardsLocal() {
    return JSON.parse(localStorage.getItem('flashcards') || '[]');
  }
}