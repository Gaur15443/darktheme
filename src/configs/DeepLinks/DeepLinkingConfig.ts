export const linking = {
  prefixes: ['https://invite.imeuswe.in', 'imeuswe://', 'https://imeuswe.app'],
  config: {
    screens: {
      // Root URL handler - maps to BottomTabs
      '': 'BottomTabs',

      // Existing deep links
      ViewStory: 'story/:id',
      CallAnswer: 'CallAnswer/:encodedData',
      ChatScreen: 'ChatScreen',

      // iMeUsWe Ancestry - Main navigation tabs
      BottomTabs: {
        screens: {
          Home: 'Home',
          WhatsOnBell: 'WhatsOnBell',
          Trees: 'Trees',
          Stories: 'Stories',
          Profile: 'Profile',
        },
      },

      // Community Screens
      CommunitiesScreenTab: 'CommunitiesScreenTab',
      CreateDiscussions: 'CreateDiscussions',
      CreatePoll: 'CreatePoll',
      CommunityDetails: 'CommunityDetails/:encryptedId',

      // Profile & Settings Screens
      Feedback: 'Feedback',
      Faq: 'Faq',
      AboutUs: 'AboutUs',
      Privacy: 'Privacy',
      AccountDna: 'AccountDna',
      ImeusweSearch: 'ImeusweSearch',

      // Auth Screens
      Login: 'Login',
      SignUp: 'SignUp',

      // iMeUsWe Astrology - Astrology screens
      AstroBottomTabs: {
        screens: {
          // Direct paths for astrology screens
          AstroHome: 'astrohome',
          Horoscope: 'horoscope',
          Reports: 'reports',
          Panchang: 'panchang',
          Consultation: 'consultation',
        },
      },

      // Handle path parameter format for deep linking
      MatchMaking: 'matchmaking',
      AstroOrderHistory: 'astroorderhistory',
      WalletHistory: 'wallethistory',
    },
  },
};
export type RootStackParamList = {
  // Existing screens
  ViewStory: { id: string };
  CallAnswer: { encodedData: string };
  ChatScreen: {
    readOnly?: boolean;
    chatRoomId?: string;
    userId?: string;
    astrologerName?: string;
    astrologerProfilePic?: string;
  };
  AstroProfile: {
    astroId: string;
  };

  // iMeUsWe Ancestry - Main navigation tabs
  BottomTabs: undefined;
  Home: undefined;
  WhatsOnBell: undefined;
  Trees: undefined;
  Stories: undefined;
  Profile: undefined;

  // Community Screens
  CommunitiesScreenTab: undefined;
  CreateDiscussions: undefined;
  CreatePoll: undefined;
  CommunityDetails: { encryptedId: string };

  // Profile & Settings Screens
  Feedback: undefined;
  Faq: undefined;
  AboutUs: undefined;
  Privacy: undefined;
  AccountDna: undefined;
  ImeusweSearch: undefined;

  // Auth Screens
  Login: undefined;
  SignUp: undefined;

  // iMeUsWe Astrology - Astrology screens
  AstroBottomTabs: undefined;
  AstroHome: { path?: string };
  Horoscope: { path?: string };
  Reports: { path?: string };
  MatchMaking: { path?: string };
  Panchang: { path?: string };
  Consultation: { path?: string };
  AstroOrderHistory: { path?: string };
  WalletHistory: { path?: string };
};
