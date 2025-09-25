import {IRtcEngine} from 'react-native-agora';

class AgoraEngine {
  private static instance: AgoraEngine;
  private ref?: IRtcEngine;

  private constructor() {}

  static getInstance(): AgoraEngine {
    if (!AgoraEngine.instance) {
      AgoraEngine.instance = new AgoraEngine();
    }
    return AgoraEngine.instance;
  }

  setRef(engineRef: IRtcEngine) {
    this.ref = engineRef;
  }

  getRef(): IRtcEngine | undefined {
    return this.ref;
  }
}

export default AgoraEngine;
