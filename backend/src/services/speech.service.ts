import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { getSpeechConfig } from '../config/azure';
import { ErrorResponse } from '../types';
import { AudioSettings } from '../types';

export class SpeechService {
  private config: sdk.SpeechConfig;

  constructor() {
    const { key, region } = getSpeechConfig();
    this.config = sdk.SpeechConfig.fromSubscription(key, region);
    this.config.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
  }

  async textToSpeech(
    text: string,
    settings: AudioSettings
  ): Promise<Buffer> {
    try {
      // Configure voice settings
      this.config.speechSynthesisVoiceName = this.getVoiceName(
        settings.language,
        settings.voice
      );
      this.config.speechSynthesisPitch = settings.pitch.toString();
      this.config.speechSynthesisRate = settings.speed.toString();

      // Create synthesizer
      const synthesizer = new sdk.SpeechSynthesizer(this.config);

      // Convert text to speech
      const result = await new Promise<sdk.SpeechSynthesisResult>(
        (resolve, reject) => {
          synthesizer.speakTextAsync(
            text,
            (result) => {
              if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                resolve(result);
              } else {
                reject(
                  new Error(
                    `Speech synthesis failed: ${result.errorDetails}`
                  )
                );
              }
            },
            (error) => {
              reject(error);
            }
          );
        }
      );

      // Convert audio data to buffer
      const audioData = result.audioData;
      return Buffer.from(audioData);

    } catch (error) {
      throw new ErrorResponse({
        code: 'SPEECH_SYNTHESIS_ERROR',
        message: 'Failed to convert text to speech',
        details: error,
      });
    }
  }

  private getVoiceName(language: string, voice: string): string {
    const voices: { [key: string]: { [key: string]: string } } = {
      en: {
        male: 'en-US-GuyNeural',
        female: 'en-US-AriaNeural',
      },
      ru: {
        male: 'ru-RU-DmitryNeural',
        female: 'ru-RU-SvetlanaNeural',
      },
    };

    const defaultVoice = language === 'ru' ? 'ru-RU-SvetlanaNeural' : 'en-US-AriaNeural';
    return voices[language]?.[voice] || defaultVoice;
  }

  async getAvailableVoices(language?: string): Promise<{
    language: string;
    voices: { id: string; gender: string; name: string }[];
  }[]> {
    try {
      const synthesizer = new sdk.SpeechSynthesizer(this.config);
      const result = await synthesizer.getVoicesAsync();

      const voices = result.voices
        .filter((voice) => !language || voice.locale.startsWith(language))
        .map((voice) => ({
          language: voice.locale,
          voices: [
            {
              id: voice.shortName,
              gender: voice.gender,
              name: voice.displayName,
            },
          ],
        }));

      return voices;
    } catch (error) {
      throw new ErrorResponse({
        code: 'SPEECH_VOICES_ERROR',
        message: 'Failed to get available voices',
        details: error,
      });
    }
  }

  async validateText(text: string): Promise<{
    isValid: boolean;
    errors?: string[];
  }> {
    try {
      const synthesizer = new sdk.SpeechSynthesizer(this.config);
      const result = await synthesizer.speakTextAsync(text);

      return {
        isValid: result.reason === sdk.ResultReason.SynthesizingAudioCompleted,
        errors:
          result.reason !== sdk.ResultReason.SynthesizingAudioCompleted
            ? [result.errorDetails]
            : undefined,
      };
    } catch (error) {
      throw new ErrorResponse({
        code: 'SPEECH_VALIDATION_ERROR',
        message: 'Failed to validate text',
        details: error,
      });
    }
  }
} 