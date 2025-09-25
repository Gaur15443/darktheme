#import "AudioSessionManager.h"
#import <AVFoundation/AVFoundation.h>

@implementation AudioSessionManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setupAudioSession:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSError *error = nil;

    [session setCategory:AVAudioSessionCategoryPlayAndRecord
             withOptions:AVAudioSessionCategoryOptionAllowBluetooth | AVAudioSessionCategoryOptionAllowBluetoothA2DP
                   error:&error];
    if (error) {
      reject(@"audio_error", @"Failed to set category", error);
      return;
    }

    [session setMode:AVAudioSessionModeVoiceChat error:&error];
    if (error) {
      reject(@"audio_error", @"Failed to set mode", error);
      return;
    }

    [session setActive:YES error:&error];
    if (error) {
      reject(@"audio_error", @"Failed to activate session", error);
      return;
    }

    resolve(@(YES));
  }
  @catch (NSException *exception) {
    reject(@"audio_exception", exception.reason, nil);
  }
}

RCT_EXPORT_METHOD(resetAudioSession:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSError *error = nil;

    [session setActive:NO error:&error];
    if (error) {
      reject(@"audio_error", @"Failed to deactivate session", error);
      return;
    }

    [session setCategory:AVAudioSessionCategoryPlayback error:&error];
    if (error) {
      reject(@"audio_error", @"Failed to reset category", error);
      return;
    }

    resolve(@(YES));
  }
  @catch (NSException *exception) {
    reject(@"audio_exception", exception.reason, nil);
  }
}

RCT_EXPORT_METHOD(enableSpeaker:(BOOL)enable
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSError *error = nil;

    if (enable) {
      [session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:&error];
    } else {
      [session overrideOutputAudioPort:AVAudioSessionPortOverrideNone error:&error];
    }

    if (error) {
      reject(@"audio_error", @"Failed to toggle speaker", error);
      return;
    }

    resolve(enable ? @"Speaker enabled" : @"Speaker disabled");
  }
  @catch (NSException *exception) {
    reject(@"audio_exception", exception.reason, nil);
  }
}

RCT_EXPORT_METHOD(routeToBluetooth:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSError *error = nil;
    BOOL routed = NO;

    // Look for Bluetooth input
    for (AVAudioSessionPortDescription *input in [session availableInputs]) {
      if ([input.portType isEqualToString:AVAudioSessionPortBluetoothHFP]) {
        [session setPreferredInput:input error:&error];
        if (!error) {
          routed = YES;
          break;
        }
      }
    }

    if (routed) {
      resolve(@"Audio routed to Bluetooth");
    } else {
      resolve(@"No Bluetooth device found");
    }
  }
  @catch (NSException *exception) {
    reject(@"audio_exception", exception.reason, nil);
  }
}

@end
