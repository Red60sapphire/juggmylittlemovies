export interface UserSettings {
  defaultServer: string;
  autoplayNext: boolean;
  subtitlePreference: string;
  accentColor: string;
  reduceMotion: boolean;
  watchPartyChatOpen: boolean;
  chatSound: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  defaultServer: "Auto",
  autoplayNext: true,
  subtitlePreference: "Off",
  accentColor: "Purple",
  reduceMotion: false,
  watchPartyChatOpen: true,
  chatSound: true,
};
