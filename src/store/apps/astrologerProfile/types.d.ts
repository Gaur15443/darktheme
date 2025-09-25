export interface AstrologerProfileResponse {
  success: boolean;
  message: string;
  astroProfile: AstroProfile;
  userProfile: UserProfile;
  images: ProfileImages;
}

export interface ProfileImages {
  profileImgUrl: string;
  bankFileUrl: string;
  pancardFileUrl: string;
  aadharCardFileUrl: string;
}

export interface AstroProfile {
  _id: string;
  userId: string;
  skills: string;
  language: string[];
  commissionPercentage: number;
  imeusweCommissionPercentage: number;
  liveStatus: string;
  isActive: boolean;
  isShow: boolean;
  isFirstRequestType: boolean;
  isFirstRequestStatus: string;
  isCompleteProfile: boolean;
  isLogin: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  alternateEmail: string;
  alternateMobile: string;
  astrologerSpecialty: string;
  bestSkills: string;
  bio: string;
  displayName: string;
  prefix: string;
  gstNumber: string;
  yearsOfExp: number;

  permanentAddress: Address;
  currentAddress: Address;
  bankDetails: BankDetails;
  panrCard: PanCard;
  aadharCard: AadharCard;
  rates: Rates;
}

export interface Address {
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
}

export interface BankDetails {
  accountHolderName: string;
  IFSCcode: string;
  bankFileMediaId: string;
}

export interface PanCard {
  panHolderName: string;
  panNumber: string;
  pancardMediaId: string;
}

export interface AadharCard {
  aadharName: string;
  aadharNumber: string;
  aadharCardFileMediaId: string;
}

export interface Rates {
  STIndia: number;
  STOutsideIndia: number;
  India: number | null;
  OutsideIndia: number | null;
}

export interface UserProfile {
  _id: string;
  cognitousername: string;
  smsCount: number;
  email: string;
  password: string;
  countryCode: number;
  mobileNo: number;
  isAroundDOB: boolean;
  isAroundDOD: boolean;
  updateaIStoryCountDate: string | null;
  treeIdin: any[];
  parents: any[];
  children: any[];
  husbands: any[];
  wifes: any[];
  siblings: any[];
  linkedGroup: any[];
  isClone: boolean;
  userRoles: string[];
  isDeleted: boolean;
  isActiveStatus: boolean;
  updatedSmsCountDate: string;
  aIStoryCount: number;
  marriageDetails: any[];
  workDetails: any[];
  sociallinks: any[];
  other: any[];
  cLink: any[];
  createdAt: string;
  updatedAt: string;
  emailVerification: string;
  emailVerified: boolean;
  mobileVerification: string;
  otpExpiry: string;
  mobileVerified: boolean;
  astrologyOnboardingComplete: boolean;

  deviceInfo: DeviceInfo;
  groupType: GroupType;
  personalDetails: PersonalDetails;
  location: Location;
  birthDetails: BirthDetails;
  medicalDetails: MedicalDetails;
  moreInfo: MoreInfo;
  educationDetails: EducationDetails;
}

export interface DeviceInfo {
  appVersion: string;
  platForm: string;
  osVersion: string;
  model: string;
  operatingSystem: string;
  deviceToken: string;
}

export interface GroupType {
  groupType1: string;
  groupType2: number;
}

export interface PersonalDetails {
  name: string;
  middlename: string;
  lastname: string;
  nickname: string | null;
  showNickname: boolean;
  gender: string | null;
  relationStatus: string | null;
  profilepic: string | null;
  livingStatus: string | null;
}

export interface Location {
  currentLocationObject: {
    city: string | null;
    stateRegion: string | null;
    country: string | null;
  };
  currentlocation: string | null;
  previous_locations: any[];
  placeOfBirth: string | null;
  placeOfDeath: string | null;
}

export interface BirthDetails {
  dob: string | null;
  dod: string | null;
  dobMediaIds: any[];
  dodMediaIds: any[];
}

export interface MedicalDetails {
  chronic_condition: any[];
  allergies: any[];
  illnesses: any[];
  preExistingConditions: any[];
}

export interface MoreInfo {
  community: string | null;
  subcommunity: string | null;
  religion: string | null;
  motherTounge: string | null;
  gothra: string | null;
  deity: string | null;
  priestName: string | null;
  ancestorVillage: string | null;
}

export interface EducationDetails {
  college: any[];
  school: any[];
}

interface AstrologerProfileState {
  astrologerProfileDetails: AstrologerProfileResponse;
}
