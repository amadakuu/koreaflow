/**
 * Speech synthesis utility for Korean pronunciation
 */
export function speakKorean(text: string, rate: number = 0.9): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser environment');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Try to find a high quality Korean voice if available
  const voices = window.speechSynthesis.getVoices();
  const koreanVoice = voices.find(v => v.lang.includes('ko') || v.lang.includes('KR'));
  if (koreanVoice) {
    utterance.voice = koreanVoice;
  }

  window.speechSynthesis.speak(utterance);
}
