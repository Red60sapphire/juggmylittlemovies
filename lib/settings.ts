export interface UserSettings {
  defaultServer: string;
  autoplayNext: boolean;
  subtitlePreference: string;
  accentColor: string;
  reduceMotion: boolean;
  watchPartyChatOpen: boolean;
  chatSound: boolean;
  defaultTab: string;
  serverPriority: string[];
  mangaProvider: string;
  autoplayPreviews: boolean;
  autoplayOnCellular: boolean;
  dataSaverMode: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  defaultServer: "Auto",
  autoplayNext: true,
  subtitlePreference: "Off",
  accentColor: "Purple",
  reduceMotion: false,
  watchPartyChatOpen: true,
  chatSound: true,
  defaultTab: "Home",
  serverPriority: ["VidLink", "Embed.su", "MultiEmbed", "VidSrc", "AutoEmbed", "VidBinge", "2Embed", "VidSrc 2", "VidSrc 3", "VidKing", "API Player"],
  mangaProvider: "MangaDex",
  autoplayPreviews: true,
  autoplayOnCellular: false,
  dataSaverMode: false,
};
