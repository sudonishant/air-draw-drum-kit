// English Web Speech Synthesis Service (Feature 11)
class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private englishVoice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoice();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoice();
      }
    }
  }

  private loadVoice(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.englishVoice = 
      voices.find(v => v.lang.startsWith('en-US')) ||
      voices.find(v => v.lang.startsWith('en-GB')) ||
      voices.find(v => v.lang.startsWith('en-IN')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0] || null;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public toggle(): boolean {
    this.setEnabled(!this.isEnabled);
    return this.isEnabled;
  }

  public speak(text: string, force: boolean = false): void {
    if (!this.isEnabled || !this.synth) return;

    const now = Date.now();
    if (!force && text === this.lastSpokenText && now - this.lastSpokenTime < 3000) {
      return;
    }

    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    try {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.englishVoice) {
        utterance.voice = this.englishVoice;
      }
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      this.synth.speak(utterance);
    } catch {
      // Ignore speech playback errors
    }
  }

  public speakCorrectGuess(itemName: string): void {
    const praises = [
      `Awesome! That is a ${itemName}! Exactly right!`,
      `Brilliant! You drew a fantastic ${itemName}!`,
      `Incredible! AI recognized it as ${itemName}!`,
      `Great job! Young PM Shri School scientist!`
    ];
    const picked = praises[Math.floor(Math.random() * praises.length)];
    this.speak(picked, true);
  }

  public speakNewRound(promptName: string): void {
    this.speak(`New round! Draw ${promptName} in the air!`, true);
  }

  public speakTimeWarning(): void {
    this.speak(`Hurry up, only five seconds remaining!`);
  }

  public speakWelcome(): void {
    this.speak(`Welcome to PM Shri School Air Drawing and AI Recognition workshop! Point your finger in the air to draw!`, true);
  }

  public speakTeamWin(teamName: string): void {
    this.speak(`Congratulations! ${teamName} won the match with flying colors! Round of applause!`, true);
  }
}

export const speechService = new SpeechService();
