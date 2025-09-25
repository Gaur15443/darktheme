import React, {useState, useEffect} from 'react';
import {View, Text, Animated, Easing, StyleSheet} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {Modal, Portal} from 'react-native-paper';
import Tick from './Tick';
import PropTypes from 'prop-types';

const CircleLoader = ({handler}) => {
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  function preventBackgroundClosing() {
    return undefined;
  }
  useEffect(() => {
    const countTo = 100;
    const duration = 2200;

    const animation = new Animated.Value(0);

    animation.addListener(({value}) => {
      setCounter(Math.floor(value));
    });

    Animated.timing(animation, {
      toValue: countTo,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setLoading(false);
    });

    return () => {
      animation.removeAllListeners();
    };
  }, []);

  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={preventBackgroundClosing}
        style={{
          backgroundColor: 'transparent ',
          display: 'flex',
          justifyContent: 'center',
          borderRadius: 6,
          alignItems: 'center',
          padding: 20,
          shadowColor: 'transparent',
        }}>
        <View style={styles.container}>
          <Svg height="124" width="124">
            <Circle
              cx="62"
              cy="62"
              r="58"
              stroke="#ECEFF4"
              strokeWidth="6"
              fill="none"
            />
            <Circle
              cx="62"
              cy="62"
              r="58"
              stroke="#0A76BE"
              strokeWidth="6"
              fill="none"
              strokeDasharray={[2 * Math.PI * 58, 2 * Math.PI * 58]}
              strokeDashoffset={((100 - counter) * (2 * Math.PI * 58)) / 100}
            />
            {!loading && <Tick handler={handler} />}
          </Svg>
          {loading && (
            <View>
              <Text style={styles.counter}>{counter}%</Text>
            </View>
          )}
        </View>
      </Modal>
    </Portal>
  );
};

CircleLoader.propTypes = {
  handler: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 30,
    position: 'relative',
  },
  counter: {
    position: 'relative',
    top: '50%',
    left: '50%',
    transform: [{translateX: -60}, {translateY: -100}],
    fontSize: 25,
    color: '#0A76BE',
  },
  checkmark: {
    position: 'relative',
    top: '50%',
    left: '50%',
    transform: [{translateX: -50}, {translateY: -60}],
  },
});

export default CircleLoader;
